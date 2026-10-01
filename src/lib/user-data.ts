"use client";

import { useEffect, useState } from "react";
import { demoSessionId, useAuth, type AuthMode } from "./auth";
import { KEYS, readLocal, useLocal, writeLocal, type ProgressMap } from "./local-store";
import { reportError } from "./report";
import { getSupabase, supabaseEnabled } from "./supabase";

/**
 * Actividad de la usuaria: favoritos, historial ("empezado" / "ya lo vi"), rutinas, membresía y compras.
 *
 * El navegador es la caché reactiva (useSyncExternalStore en local-store). Con sesión de
 * Supabase, cada cambio se replica al momento en `favorites` y `watch_history`, y al cargar la
 * página lo remoto manda (así lo que se quitó en otro dispositivo no reaparece).
 *
 * Claves de contenido: `${tipo}:${id}` → "class:cls-10-min-pilates-abs", "meditation:med-...",
 * "talk:talk-...", "lesson:<curso>:<lección>". Compras: "course:<slug>", "event:<slug>".
 */

type Entry = ProgressMap[string];

const EMPTY_FAVS: string[] = [];
const EMPTY_PROGRESS: ProgressMap = {};
const EMPTY_PURCHASES: Purchase[] = [];

/** id de la usuaria con sesión de Supabase; null = solo local */
let remoteUser: string | null = null;

/* ---------------- de quién es la caché local ---------------- */

/**
 * La caché lleva la marca de la cuenta a la que pertenece (`tfc:owner`), para que en un
 * dispositivo compartido lo de una usuaria nunca se muestre ni se suba a la cuenta de otra:
 * - Sin sesión y con dueña → se guarda aparte lo que no vive en Supabase y se limpia todo.
 * - Con sesión de otra cuenta → igual, y se recupera lo que esta cuenta tenía guardado aparte.
 * - Con sesión y caché anónima (lo que hizo sin cuenta) → se suma a su cuenta.
 * En modo demo "guardar aparte" es todo (favoritos, historial, rutinas, membresía y compras):
 * cada cuenta demo tiene lo suyo. Con Supabase solo las rutinas; lo demás está en la base.
 */
const OWNER = "tfc:owner";
const stashKey = (uid: string) => `tfc:stash:${uid}`;

/** Mismas claves que ROUTINE_KEYS (src/lib/routine.ts): no se importa para no cargar el catálogo en todas las páginas. */
const ROUTINES = "tfc:routines";
const ROUTINE_LAST = "tfc:routine-last";
const ROUTINE_CURRENT = "tfc:routine-current";
/** Plan elegido antes de crear la cuenta (ver src/components/account/pending-plan.ts). */
export const PENDING_PLAN_KEY = "tfc:pending-plan";
const DEMO_PLAN = "tfc:demo-plan";
const DEMO_PURCHASES = "tfc:demo-purchases";
/** Cuándo volvió de pagar en Recurrente (ver noteCheckoutReturn). */
const PAID_AT = "tfc:paid-at";

/** Valor vacío de cada clave personal: lo que queda al limpiar. */
const PERSONAL: Record<string, unknown> = {
  [KEYS.favorites]: EMPTY_FAVS,
  [KEYS.progress]: EMPTY_PROGRESS,
  [ROUTINES]: [],
  [ROUTINE_LAST]: null,
  [ROUTINE_CURRENT]: null,
  [PENDING_PLAN_KEY]: null,
  [DEMO_PLAN]: null,
  [DEMO_PURCHASES]: EMPTY_PURCHASES,
  [PAID_AT]: null,
};

const stashed = (mode: AuthMode): string[] =>
  mode === "demo" ? [KEYS.favorites, KEYS.progress, ROUTINES, ROUTINE_LAST, ROUTINE_CURRENT, DEMO_PLAN, DEMO_PURCHASES] : [ROUTINES, ROUTINE_LAST, ROUTINE_CURRENT];

const sameValue = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function dropLocal(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {}
}

function clearPersonal() {
  for (const [key, empty] of Object.entries(PERSONAL)) {
    if (!sameValue(readLocal(key, empty), empty)) writeLocal(key, empty);
  }
}

/** Suma lo que hizo sin sesión (`local`) a lo que su cuenta tenía guardado (`saved`). */
function mergeValue(key: string, local: unknown, saved: unknown): unknown {
  switch (key) {
    case KEYS.favorites:
      return [...new Set([...((saved as string[]) ?? []), ...((local as string[]) ?? [])])];
    case KEYS.progress: {
      const out: ProgressMap = { ...((saved as ProgressMap) ?? {}) };
      for (const [k, v] of Object.entries((local as ProgressMap) ?? {})) {
        const s = out[k];
        out[k] = s && s.at > v.at ? { ...s, done: s.done ?? v.done } : { ...v, done: v.done ?? s?.done };
      }
      return out;
    }
    case ROUTINES:
    case DEMO_PURCHASES: {
      const id = (x: { id?: string; itemKey?: string }) => x.id ?? x.itemKey;
      const mine = (local as { id?: string; itemKey?: string }[]) ?? [];
      const rest = ((saved as typeof mine) ?? []).filter((s) => !mine.some((l) => id(l) === id(s)));
      return key === ROUTINES ? [...mine, ...rest].slice(0, 12) : [...mine, ...rest];
    }
    case DEMO_PLAN:
      return saved ?? local;
    default:
      return local ?? saved;
  }
}

type OwnerChange = "same" | "adopted" | "switched";

/** Deja la caché local con los datos de `uid` (null = nadie con sesión). Es síncrono. */
function alignOwner(uid: string | null, mode: AuthMode): OwnerChange {
  const owner = readLocal<string | null>(OWNER, null);
  if (owner === uid) return "same";
  if (owner) {
    const snap: Record<string, unknown> = {};
    for (const key of stashed(mode)) snap[key] = readLocal(key, PERSONAL[key]);
    writeLocal(stashKey(owner), snap);
    clearPersonal();
  }
  if (uid) {
    const snap = readLocal<Record<string, unknown> | null>(stashKey(uid), null);
    if (snap) {
      for (const key of stashed(mode)) {
        if (key in snap) writeLocal(key, owner ? snap[key] : mergeValue(key, readLocal(key, PERSONAL[key]), snap[key]));
      }
      dropLocal(stashKey(uid));
    }
  }
  writeLocal(OWNER, uid);
  return owner ? "switched" : "adopted";
}

/** Modo demo: antes de escribir, la caché debe ser de la cuenta con sesión (justo al crearla aún no corrió UserDataSync). */
function ensureDemoOwner() {
  if (!supabaseEnabled) alignOwner(demoSessionId(), "demo");
}

/* ---------------- cambios hechos mientras se lee la base ---------------- */

type Edit = { kind: "fav"; key: string; on: boolean } | { kind: "progress"; key: string; entry: Entry | null };
let syncing: string | null = null;
const editsDuringSync: Edit[] = [];

function applyLocal(edit: Edit) {
  if (edit.kind === "fav") {
    const list = readLocal<string[]>(KEYS.favorites, EMPTY_FAVS);
    if (list.includes(edit.key) !== edit.on) writeLocal(KEYS.favorites, edit.on ? [...list, edit.key] : list.filter((k) => k !== edit.key));
    return;
  }
  const map = { ...readLocal<ProgressMap>(KEYS.progress, EMPTY_PROGRESS) };
  if (edit.entry) map[edit.key] = edit.entry;
  else delete map[edit.key];
  writeLocal(KEYS.progress, map);
}

function localEdit(edit: Edit) {
  applyLocal(edit);
  if (syncing) editsDuringSync.push(edit);
}

/* ---------------- favoritos ---------------- */

export function useFavorites(): string[] {
  return useLocal<string[]>(KEYS.favorites, EMPTY_FAVS);
}

export function toggleFavorite(itemKey: string) {
  ensureDemoOwner();
  const on = !readLocal<string[]>(KEYS.favorites, EMPTY_FAVS).includes(itemKey);
  localEdit({ kind: "fav", key: itemKey, on });
  const uid = remoteUser;
  if (!uid) return;
  void getSupabase()
    .then(async (sb) => {
      if (!sb) return;
      const { error } = on
        ? await sb.from("favorites").upsert({ user_id: uid, item_key: itemKey }, { onConflict: "user_id,item_key", ignoreDuplicates: true })
        : await sb.from("favorites").delete().eq("user_id", uid).eq("item_key", itemKey);
      if (error) reportError("favoritos", error);
    })
    .catch((err: unknown) => reportError("favoritos", err));
}

/* ---------------- historial ---------------- */

export function useHistory(): ProgressMap {
  return useLocal<ProgressMap>(KEYS.progress, EMPTY_PROGRESS);
}

const historyRow = (user_id: string, item_key: string, e: Entry) => ({
  user_id,
  item_key,
  pct: Math.round(e.pct),
  updated_at: new Date(e.at).toISOString(),
  completed_at: e.done ? new Date(e.done).toISOString() : null,
});

/** Guarda (o borra, con null) una entrada del historial aquí y en Supabase. */
function commitProgress(itemKey: string, entry: Entry | null) {
  localEdit({ kind: "progress", key: itemKey, entry });
  const uid = remoteUser;
  if (!uid) return;
  void getSupabase()
    .then(async (sb) => {
      if (!sb) return;
      const { error } = entry
        ? await sb.from("watch_history").upsert(historyRow(uid, itemKey, entry), { onConflict: "user_id,item_key" })
        : await sb.from("watch_history").delete().eq("user_id", uid).eq("item_key", itemKey);
      if (error) reportError("historial", error);
    })
    .catch((err: unknown) => reportError("historial", err));
}

/** Se llama al darle play: la clase pasa a "Continuar viendo". */
export function markStarted(itemKey: string) {
  ensureDemoOwner();
  const prev = readLocal<ProgressMap>(KEYS.progress, EMPTY_PROGRESS)[itemKey];
  commitProgress(itemKey, { at: Date.now(), pct: Math.max(prev?.pct ?? 0, 10), done: prev?.done });
}

/**
 * "Ya la vi": al terminar el video o con el botón manual. `done=false` la desmarca y la deja como
 * si no la hubiera visto (sin inventar un avance ni pasarla a "Continuar viendo").
 */
export function markCompleted(itemKey: string, done = true) {
  ensureDemoOwner();
  const now = Date.now();
  commitProgress(itemKey, done ? { at: now, pct: 100, done: now } : null);
}

export const isCompleted = (map: ProgressMap, itemKey: string) => Boolean(map[itemKey]?.done);

/* ---------------- membresía y compras ---------------- */

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "incomplete";

export interface Membership {
  planId: string;
  status: SubscriptionStatus;
  trialEndsAt?: string;
  currentPeriodEnd?: string;
  /** Cancelada, pero con acceso hasta `currentPeriodEnd` (si la base lo marca así en vez de `canceled`). */
  cancelAtPeriodEnd?: boolean;
}

export interface Purchase {
  /** "course:<slug>" | "event:<slug>" | "workbook:<slug>" */
  itemKey: string;
  createdAt: string;
}

const LIVE: SubscriptionStatus[] = ["trialing", "active", "past_due"];

/** Membresía vigente que se renueva: en prueba, activa o con pago pendiente (y sin cancelar). */
export function isLiveMembership(m: Membership | null | undefined): boolean {
  return Boolean(m && LIVE.includes(m.status) && !m.cancelAtPeriodEnd);
}

/** Hasta cuándo conserva el acceso una membresía cancelada. */
export function accessEndsAt(m: Membership): string | undefined {
  return m.currentPeriodEnd ?? m.trialEndsAt;
}

/** Tiene acceso al contenido de socias: vigente, o cancelada pero dentro del periodo que ya tenía. */
export function hasMemberAccess(m: Membership | null | undefined): boolean {
  if (!m) return false;
  if (LIVE.includes(m.status)) return true;
  const end = m.status === "canceled" ? accessEndsAt(m) : undefined;
  return Boolean(end && Date.parse(end) > Date.now());
}

/** Solo modo demo: simula que la usuaria empezó la prueba gratis de un plan. */
export function startDemoTrial(planId: string) {
  ensureDemoOwner();
  // Una sola prueba por cuenta (como crear-checkout): si ya tuvo membresía, queda activa desde hoy.
  if (readLocal<Membership | null>(DEMO_PLAN, null)) {
    const months = planId === "flare-anual" ? 12 : 1;
    const end = new Date();
    end.setMonth(end.getMonth() + months);
    writeLocal<Membership>(DEMO_PLAN, { planId, status: "active", currentPeriodEnd: end.toISOString() });
    return;
  }
  const trialEndsAt = new Date(Date.now() + 7 * 864e5).toISOString();
  writeLocal<Membership>(DEMO_PLAN, { planId, status: "trialing", trialEndsAt });
}

/**
 * Solo modo demo y con sesión: simula la compra de un curso o una entrada ("course:<slug>",
 * "event:<slug>") para ver cómo aparece en Mi cuenta. Con Supabase no hace nada.
 */
export function simulateDemoPurchase(itemKey: string): void {
  if (supabaseEnabled || !demoSessionId()) return;
  ensureDemoOwner();
  const list = readLocal<Purchase[]>(DEMO_PURCHASES, EMPTY_PURCHASES);
  if (list.some((p) => p.itemKey === itemKey)) return;
  writeLocal<Purchase[]>(DEMO_PURCHASES, [{ itemKey, createdAt: new Date().toISOString() }, ...list]);
}

/** Solo modo demo: cancela la membresía; conserva el acceso hasta el fin de la prueba o del periodo. */
export function cancelDemoMembership(): { ok?: boolean; currentPeriodEnd?: string; error?: string } {
  ensureDemoOwner();
  const m = readLocal<Membership | null>(DEMO_PLAN, null);
  if (!m || !isLiveMembership(m)) return { error: "No tienes una membresía activa para cancelar." };
  const currentPeriodEnd = (m.status === "trialing" ? m.trialEndsAt : m.currentPeriodEnd) ?? new Date().toISOString();
  writeLocal<Membership>(DEMO_PLAN, { ...m, status: "canceled", currentPeriodEnd });
  return { ok: true, currentPeriodEnd };
}

const MEMBERSHIP_EVENT = "tfc:membership";

/** Vuelve a leer la membresía de la base (p. ej. después de cancelarla). */
export function refreshMembership() {
  window.dispatchEvent(new Event(MEMBERSHIP_EVENT));
}

/** Por cuánto tiempo, después de pagar, se espera al webhook antes de dejar de insistir. */
const CONFIRM_WINDOW = 15 * 60e3;
const recentlyPaid = (at: number | null): at is number => at !== null && Date.now() - at < CONFIRM_WINDOW;

/**
 * Volvió de pagar en Recurrente (?pago=ok). El webhook puede tardar: mientras tanto Mi cuenta
 * muestra "Confirmando tu pago…" y no ofrece otro pago (se evita una segunda suscripción).
 */
export function noteCheckoutReturn() {
  writeLocal<number | null>(PAID_AT, Date.now());
  if (readLocal<string | null>(PENDING_PLAN_KEY, null) !== null) writeLocal<string | null>(PENDING_PLAN_KEY, null);
}

interface SubscriptionRow {
  plan_slug: string;
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancel_at_period_end?: boolean | null;
}

const toMembership = (r: SubscriptionRow): Membership => ({
  planId: r.plan_slug,
  status: r.status,
  trialEndsAt: r.trial_ends_at ?? undefined,
  currentPeriodEnd: r.current_period_end ?? undefined,
  cancelAtPeriodEnd: r.cancel_at_period_end === true || undefined,
});

/**
 * `confirming`: volvió de pagar hace poco y la membresía aún no llega (el webhook tarda unos segundos).
 */
export function useMembership(): { loading: boolean; membership: Membership | null; purchases: Purchase[]; confirming: boolean } {
  const { status, mode, account } = useAuth();
  const demoPlan = useLocal<Membership | null>(DEMO_PLAN, null);
  const demoPurchases = useLocal<Purchase[]>(DEMO_PURCHASES, EMPTY_PURCHASES);
  const paidAt = useLocal<number | null>(PAID_AT, null);
  const [remote, setRemote] = useState<{ uid: string; membership: Membership | null; purchases: Purchase[] } | null>(null);
  const [tick, setTick] = useState(0);
  const uid = account?.id ?? null;

  useEffect(() => {
    const again = () => setTick((n) => n + 1);
    window.addEventListener(MEMBERSHIP_EVENT, again);
    return () => window.removeEventListener(MEMBERSHIP_EVENT, again);
  }, []);

  useEffect(() => {
    if (mode !== "supabase" || !uid) return;
    let alive = true;
    let retry: ReturnType<typeof setTimeout> | undefined;
    const again = (ms: number) => {
      retry = setTimeout(() => setTick((n) => n + 1), ms);
    };
    const load = async () => {
      const sb = await getSupabase();
      if (!sb || !alive) return;
      const [s, p] = await Promise.all([
        // `*`: incluye `cancel_at_period_end` si la base ya tiene esa columna.
        sb.from("subscriptions").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(1),
        sb.from("purchases").select("item_key,created_at").eq("user_id", uid).order("created_at", { ascending: false }),
      ]);
      if (!alive) return;
      // Sin red o con un error del servidor NO se asume "sin membresía": se conserva lo anterior
      // (o se sigue cargando) y se reintenta, para no ofrecerle la prueba a una socia vigente.
      if (s.error || p.error) {
        reportError("membresía", s.error ?? p.error);
        again(5000);
        return;
      }
      const row = s.data?.[0] as SubscriptionRow | undefined;
      const membership = row ? toMembership(row) : null;
      setRemote({ uid, membership, purchases: (p.data ?? []).map((r) => ({ itemKey: r.item_key, createdAt: r.created_at })) });
      const at = readLocal<number | null>(PAID_AT, null);
      if (at === null) return;
      // Llegó la membresía (o ya pasó demasiado tiempo): dejar de esperar.
      if ((membership && LIVE.includes(membership.status)) || !recentlyPaid(at)) {
        writeLocal<number | null>(PAID_AT, null);
        return;
      }
      // Sigue sin llegar: preguntar cada 5 s los primeros 2 minutos y luego cada 20 s.
      again(Date.now() - at < 2 * 60e3 ? 5000 : 20000);
    };
    load().catch((err: unknown) => {
      // No cargó el cliente (sin red): igual que un error del servidor, se reintenta.
      reportError("membresía", err);
      if (alive) again(5000);
    });
    return () => {
      alive = false;
      if (retry) clearTimeout(retry);
    };
  }, [mode, uid, tick, paidAt]);

  if (status !== "signed-in") return { loading: status === "loading", membership: null, purchases: EMPTY_PURCHASES, confirming: false };
  if (mode === "demo") return { loading: false, membership: demoPlan, purchases: demoPurchases, confirming: false };
  const fresh = remote && remote.uid === uid ? remote : null;
  const membership = fresh?.membership ?? null;
  const arrived = Boolean(membership && LIVE.includes(membership.status));
  return { loading: !fresh, membership, purchases: fresh?.purchases ?? EMPTY_PURCHASES, confirming: recentlyPaid(paidAt) && !arrived };
}

/* ---------------- sincronización con Supabase ---------------- */

/**
 * Trae favoritos e historial de su cuenta y los deja en la caché. Lo remoto manda; solo si la
 * caché era anónima (`adopt`), lo que hizo sin sesión en este navegador se sube a su cuenta.
 */
async function syncRemote(uid: string, adopt: boolean) {
  // Desde ya: lo que toque mientras carga el cliente y se lee la base también se reaplica al final.
  syncing = uid;
  editsDuringSync.length = 0;
  try {
    const sb = await getSupabase();
    if (!sb || remoteUser !== uid) return;
    const [favRes, histRes] = await Promise.all([
      sb.from("favorites").select("item_key").eq("user_id", uid),
      sb.from("watch_history").select("item_key,pct,updated_at,completed_at").eq("user_id", uid),
    ]);
    if (remoteUser !== uid) return;
    if (favRes.error || histRes.error) {
      reportError("sync", favRes.error ?? histRes.error);
      return;
    }

    const favs = favRes.data.map((r) => r.item_key as string);
    const hist: ProgressMap = {};
    for (const r of histRes.data) {
      hist[r.item_key] = { at: Date.parse(r.updated_at), pct: r.pct, done: r.completed_at ? Date.parse(r.completed_at) : undefined };
    }

    if (adopt) {
      const newFavs = readLocal<string[]>(KEYS.favorites, EMPTY_FAVS).filter((k) => !favs.includes(k));
      if (newFavs.length) {
        await sb.from("favorites").upsert(newFavs.map((item_key) => ({ user_id: uid, item_key })), { onConflict: "user_id,item_key", ignoreDuplicates: true });
        favs.push(...newFavs);
      }
      const toPush: [string, Entry][] = [];
      for (const [k, v] of Object.entries(readLocal<ProgressMap>(KEYS.progress, EMPTY_PROGRESS))) {
        const r = hist[k];
        if (r && r.at >= v.at && (r.done || !v.done)) continue;
        const entry = { at: Math.max(v.at, r?.at ?? 0), pct: Math.max(v.pct, r?.pct ?? 0), done: v.done ?? r?.done };
        hist[k] = entry;
        toPush.push([k, entry]);
      }
      if (toPush.length) await sb.from("watch_history").upsert(toPush.map(([k, e]) => historyRow(uid, k, e)), { onConflict: "user_id,item_key" });
      if (remoteUser !== uid) return;
    }

    writeLocal(KEYS.favorites, favs);
    writeLocal(KEYS.progress, hist);
    // Lo que tocó mientras se leía la base (ya se envió): queda encima.
    for (const edit of editsDuringSync) applyLocal(edit);
  } finally {
    if (syncing === uid) syncing = null;
    editsDuringSync.length = 0;
  }
}

/** Montado una vez en el layout (dentro de AuthProvider). */
export function UserDataSync() {
  const { status, mode, account } = useAuth();
  const uid = status === "signed-in" ? (account?.id ?? null) : null;

  useEffect(() => {
    if (status === "loading") return;
    const change = alignOwner(uid, mode);
    if (mode !== "supabase") return;
    remoteUser = uid;
    if (uid) void syncRemote(uid, change === "adopted").catch((err: unknown) => reportError("sync", err));
  }, [status, mode, uid]);

  return null;
}
