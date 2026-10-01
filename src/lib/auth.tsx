"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthError, EmailOtpType, SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabase, siteUrl, supabaseEnabled } from "./supabase";
import { readLocal, writeLocal } from "./local-store";
import { reportError } from "./report";

/**
 * Cuentas de usuaria.
 * - Con Supabase configurado: auth real (correo + contraseña, confirmación por correo,
 *   recuperación de contraseña). Perfil en `public.profiles` (ver supabase/migrations/0002).
 *   Los enlaces de los correos traen `token_hash` (plantillas en docs/06) y se verifican aquí:
 *   sirven en cualquier navegador o dispositivo, no solo en el que los pidió.
 * - Sin Supabase (prototipo en GitHub Pages): "modo demo". Las cuentas (una por correo) viven
 *   solo en este navegador para poder revisar el flujo y el portal. Nunca se guarda la contraseña.
 *   En demo todo se decide sin esperar (supabase-js ni siquiera se descarga, ver supabase.ts).
 */

export interface Account {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

export type AuthStatus = "loading" | "signed-out" | "signed-in";
export type AuthMode = "supabase" | "demo";
export type AuthResult = { error?: string };

interface AuthContextValue {
  status: AuthStatus;
  mode: AuthMode;
  account: Account | null;
  /** true cuando la usuaria llegó desde el correo de "recuperar contraseña" */
  recovering: boolean;
  signUp(input: { fullName: string; email: string; password: string }): Promise<AuthResult & { needsConfirmation?: boolean }>;
  /** `needsConfirmation`: la cuenta existe pero aún no confirma su correo (ofrecer reenviarlo). */
  signIn(input: { email: string; password: string }): Promise<AuthResult & { needsConfirmation?: boolean }>;
  signOut(): Promise<void>;
  sendPasswordReset(email: string): Promise<AuthResult>;
  /** Vuelve a enviar el correo para activar la cuenta. */
  resendConfirmation(email: string): Promise<AuthResult>;
  updatePassword(password: string): Promise<AuthResult>;
  updateName(fullName: string): Promise<AuthResult>;
}

export const MIN_PASSWORD = 8;

const AuthContext = createContext<AuthContextValue | null>(null);

function toAccount(u: User): Account {
  const meta = (u.user_metadata ?? {}) as { full_name?: string };
  return { id: u.id, email: u.email ?? "", fullName: meta.full_name ?? "", createdAt: u.created_at };
}

/** Revisa el correo antes de enviarlo. Devuelve el mensaje para la usuaria, o undefined si está bien. */
export function emailProblem(email: string): string | undefined {
  const e = email.trim();
  if (!e) return "Escribe tu correo.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return "Ese correo no parece válido. Revísalo.";
  return undefined;
}

const UNCONFIRMED = "Aún no confirmas tu correo. Abre el enlace que te enviamos para activar tu cuenta.";

/** Mensajes de Supabase → español claro. */
export function authErrorMessage(err: AuthError | Error | null | undefined): string | undefined {
  if (!err) return undefined;
  const m = err.message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (m.includes("already registered") || m.includes("already been registered")) return "Ya existe una cuenta con ese correo. Entra con tu contraseña.";
  if (m.includes("email not confirmed")) return UNCONFIRMED;
  if (m.includes("password should be") || m.includes("weak password")) return `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`;
  const wait = /after (\d+) seconds?/.exec(m);
  if (wait) return `Por seguridad, espera ${wait[1]} segundos y vuelve a intentarlo.`;
  if (m.includes("rate limit") || m.includes("for security purposes")) return "Hicimos demasiados intentos seguidos. Espera unos minutos y vuelve a intentarlo.";
  if (m.includes("invalid email") || m.includes("unable to validate email")) return "Ese correo no parece válido. Revísalo.";
  if (m.includes("expired")) return "Este enlace ya no funciona. Pide uno nuevo.";
  if (m.includes("same password") || m.includes("different from the old")) return "Elige una contraseña distinta a la anterior.";
  if (m.includes("failed to fetch") || m.includes("network")) return "No pudimos conectarnos. Revisa tu internet e intenta de nuevo.";
  return "Algo salió mal. Intenta de nuevo en un momento.";
}

/* ---------------- modo demo: cuentas de este navegador ---------------- */

/** { [correo]: Account } */
const DEMO_ACCOUNTS = "tfc:demo-accounts";
/** Correo de la cuenta demo con la sesión abierta (o null). */
const DEMO_CURRENT = "tfc:demo-current";
/** Versión anterior: una sola cuenta demo por navegador. */
const LEGACY_ACCOUNT = "tfc:demo-account";
const LEGACY_SESSION = "tfc:demo-session";

type DemoAccounts = Record<string, Account>;
const NO_ACCOUNTS: DemoAccounts = {};

function demoAccounts(): DemoAccounts {
  const map = readLocal<DemoAccounts>(DEMO_ACCOUNTS, NO_ACCOUNTS);
  const legacy = readLocal<Account | null>(LEGACY_ACCOUNT, null);
  if (!legacy) return map;
  // Migra la cuenta de la versión anterior (y su sesión) al mapa por correo.
  const next = map[legacy.email] ? map : { ...map, [legacy.email]: legacy };
  writeLocal(DEMO_ACCOUNTS, next);
  if (readLocal<boolean>(LEGACY_SESSION, false) && !readLocal<string | null>(DEMO_CURRENT, null)) writeLocal(DEMO_CURRENT, legacy.email);
  writeLocal(LEGACY_ACCOUNT, null);
  writeLocal(LEGACY_SESSION, false);
  return next;
}

function demoSession(): Account | null {
  const accounts = demoAccounts();
  const email = readLocal<string | null>(DEMO_CURRENT, null);
  return email ? (accounts[email] ?? null) : null;
}

/** Solo modo demo: id de la cuenta con la sesión abierta en este navegador (lo usa user-data). */
export function demoSessionId(): string | null {
  return supabaseEnabled ? null : (demoSession()?.id ?? null);
}

/* ---------------- enlaces de los correos ---------------- */

const LINK_TYPES: EmailOtpType[] = ["signup", "email", "recovery", "invite", "magiclink", "email_change"];
type LinkResult = { type: EmailOtpType; ok: boolean } | null;
let emailLink: Promise<LinkResult> | null = null;

/**
 * Cambia la URL sin navegar. `sync`: con estado `null`, Next copia su estado interno y actualiza
 * useSearchParams (solo cuando ya parcheó history, es decir, después de la hidratación).
 */
function rewriteUrl(edit: (url: URL) => void, sync: boolean) {
  const url = new URL(window.location.href);
  edit(url);
  window.history.replaceState(sync ? null : window.history.state, "", url.toString());
}

/**
 * Enlace del correo (activar cuenta / recuperar contraseña) con `?token_hash=…&type=…`: se verifica
 * una sola vez por carga (aunque el efecto corra dos veces) y se quita de la URL para que no se
 * reintente al recargar. Al terminar deja una marca para Mi cuenta: `?correo=confirmado` o
 * `?enlace=vencido` (también si Supabase devolvió `error_code` en la URL).
 * El flujo anterior (`?code=`, solo en el mismo navegador) lo sigue resolviendo supabase-js.
 */
function verifyEmailLink(sb: SupabaseClient): Promise<LinkResult> {
  if (emailLink) return emailLink;
  const url = new URL(window.location.href);
  const hash = new URLSearchParams(url.hash.slice(1));
  const tokenHash = url.searchParams.get("token_hash");
  const rawType = url.searchParams.get("type");
  const failed = url.searchParams.has("error_code") || hash.has("error_code");
  if (!tokenHash && !failed) return (emailLink = Promise.resolve(null));

  // Ya mismo fuera de la URL (un token no debe quedar en el historial ni reintentarse al recargar).
  const clean = (u: URL) => {
    if (tokenHash) ["token_hash", "type"].forEach((k) => u.searchParams.delete(k));
    ["error", "error_code", "error_description"].forEach((k) => u.searchParams.delete(k));
    if (hash.has("error_code")) u.hash = "";
  };
  rewriteUrl(clean, false);

  const type = LINK_TYPES.find((t) => t === rawType);
  emailLink = (async (): Promise<LinkResult> => {
    if (!tokenHash || !type) return { type: type ?? "email", ok: false };
    await sb.auth.initialize();
    const { error } = await sb.auth.verifyOtp({ token_hash: tokenHash, type }).catch((e: Error) => ({ error: e }));
    return { type, ok: !error };
  })().then((link) => {
    rewriteUrl((u) => {
      clean(u);
      if (link && !link.ok) u.searchParams.set("enlace", "vencido");
      else if (link && link.type !== "recovery") u.searchParams.set("correo", "confirmado");
    }, true);
    return link;
  });
  return emailLink;
}

/* ---------------- proveedor ---------------- */

export function AuthProvider({ children }: { children: ReactNode }) {
  const mode: AuthMode = supabaseEnabled ? "supabase" : "demo";
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [account, setAccount] = useState<Account | null>(null);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    if (!supabaseEnabled) {
      const acc = demoSession();
      // Estado inicial leído del navegador: solo existe en el cliente.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAccount(acc);
      setStatus(acc ? "signed-in" : "signed-out");
      return;
    }
    let alive = true;
    let unsubscribe: (() => void) | undefined;
    void getSupabase()
      .then(async (sb) => {
        if (!alive || !sb) return;
        // Mientras se verifica el enlace del correo no se decide nada: así no aparece "sin sesión" un instante.
        let settled = false;
        const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
          if (event === "PASSWORD_RECOVERY") setRecovering(true);
          if (!settled) return;
          setAccount(session ? toAccount(session.user) : null);
          setStatus(session ? "signed-in" : "signed-out");
        });
        unsubscribe = () => sub.subscription.unsubscribe();
        const link = await verifyEmailLink(sb);
        const { data } = await sb.auth.getSession();
        if (!alive) return;
        settled = true;
        if (link?.ok && link.type === "recovery" && data.session) setRecovering(true);
        setAccount(data.session ? toAccount(data.session.user) : null);
        setStatus(data.session ? "signed-in" : "signed-out");
      })
      .catch((err: unknown) => {
        // Sin red no se pudo cargar el cliente: se trata como sin sesión (no se queda en "cargando").
        reportError("auth", err);
        if (alive) setStatus("signed-out");
      });
    return () => {
      alive = false;
      unsubscribe?.();
    };
  }, []);

  const signUp = useCallback<AuthContextValue["signUp"]>(async ({ fullName, email, password }) => {
    const problem = emailProblem(email);
    if (problem) return { error: problem };
    if (password.length < MIN_PASSWORD) return { error: `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.` };
    const sb = await getSupabase();
    if (!sb) {
      const address = email.trim().toLowerCase();
      const accounts = demoAccounts();
      if (accounts[address]) return { error: "Ya existe una cuenta con ese correo en este navegador. Entra con tu contraseña." };
      const acc: Account = {
        id: `demo-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        email: address,
        fullName: fullName.trim(),
        createdAt: new Date().toISOString(),
      };
      writeLocal(DEMO_ACCOUNTS, { ...accounts, [address]: acc });
      writeLocal(DEMO_CURRENT, address);
      setAccount(acc);
      setStatus("signed-in");
      return {};
    }
    const { data, error } = await sb.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() }, emailRedirectTo: siteUrl("/cuenta/") },
    });
    if (error) return { error: authErrorMessage(error) };
    // Con confirmación de correo activa, Supabase no revela si el correo ya existía: devuelve un usuario sin identidades.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return { error: "Ya existe una cuenta con ese correo. Entra con tu contraseña." };
    }
    return { needsConfirmation: !data.session };
  }, []);

  const signIn = useCallback<AuthContextValue["signIn"]>(async ({ email, password }) => {
    const problem = emailProblem(email);
    if (problem) return { error: problem };
    const sb = await getSupabase();
    if (!sb) {
      // Demo: la contraseña no se guarda ni se verifica (lo dice el aviso del formulario).
      const acc = demoAccounts()[email.trim().toLowerCase()];
      if (!acc) return { error: "No encontramos esa cuenta en este navegador (modo demo). Crea una cuenta." };
      writeLocal(DEMO_CURRENT, acc.email);
      setAccount(acc);
      setStatus("signed-in");
      return {};
    }
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    if (error?.message.toLowerCase().includes("email not confirmed")) return { error: UNCONFIRMED, needsConfirmation: true };
    return { error: authErrorMessage(error) };
  }, []);

  const signOut = useCallback(async () => {
    const sb = await getSupabase();
    // Solo en este dispositivo: cerrar sesión en un iPad compartido no la saca de su celular.
    if (sb) await sb.auth.signOut({ scope: "local" });
    else writeLocal<string | null>(DEMO_CURRENT, null);
    setAccount(null);
    setStatus("signed-out");
    setRecovering(false);
  }, []);

  const sendPasswordReset = useCallback(async (email: string): Promise<AuthResult> => {
    const problem = emailProblem(email);
    if (problem) return { error: problem };
    const sb = await getSupabase();
    if (!sb) return { error: "En el modo demo no enviamos correos." };
    const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: siteUrl("/cuenta/nueva-contrasena/") });
    return { error: authErrorMessage(error) };
  }, []);

  const resendConfirmation = useCallback(async (email: string): Promise<AuthResult> => {
    const problem = emailProblem(email);
    if (problem) return { error: problem };
    const sb = await getSupabase();
    if (!sb) return { error: "En el modo demo no enviamos correos." };
    const { error } = await sb.auth.resend({ type: "signup", email: email.trim(), options: { emailRedirectTo: siteUrl("/cuenta/") } });
    return { error: authErrorMessage(error) };
  }, []);

  const updatePassword = useCallback(async (password: string): Promise<AuthResult> => {
    if (password.length < MIN_PASSWORD) return { error: `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.` };
    const sb = await getSupabase();
    if (!sb) return { error: "En el modo demo la contraseña no se guarda." };
    const { error } = await sb.auth.updateUser({ password });
    if (!error) setRecovering(false);
    return { error: authErrorMessage(error) };
  }, []);

  const updateName = useCallback(async (fullName: string): Promise<AuthResult> => {
    const name = fullName.trim();
    const sb = await getSupabase();
    if (!sb) {
      const acc = demoSession();
      if (acc) {
        const next = { ...acc, fullName: name };
        writeLocal(DEMO_ACCOUNTS, { ...demoAccounts(), [acc.email]: next });
        setAccount(next);
      }
      return {};
    }
    const { data, error } = await sb.auth.updateUser({ data: { full_name: name } });
    if (error) return { error: authErrorMessage(error) };
    if (data.user) {
      await sb.from("profiles").update({ full_name: name, updated_at: new Date().toISOString() }).eq("id", data.user.id);
      setAccount(toAccount(data.user));
    }
    return {};
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, mode, account, recovering, signUp, signIn, signOut, sendPasswordReset, resendConfirmation, updatePassword, updateName }),
    [status, mode, account, recovering, signUp, signIn, signOut, sendPasswordReset, resendConfirmation, updatePassword, updateName],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
