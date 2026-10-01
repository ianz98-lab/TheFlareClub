"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, FormAlert, FormNote, PasswordField } from "@/components/ui/form";
import { planById } from "@/content/plans";
import { emailProblem, useAuth } from "@/lib/auth";
import { AuthShell, FormSkeleton } from "./AuthShell";
import { ACCOUNT_COPY, ACCOUNT_PHOTOS } from "./copy";
import { safeNext, savePendingPlan } from "./pending-plan";
import { ResendConfirmation } from "./ResendConfirmation";
import { useFieldErrors } from "./use-field-errors";

const FIELDS = ["email", "password"] as const;

/**
 * /cuenta/entrar[?next=/ruta][&plan=id][&salida=1]
 * Al entrar va a `next` (solo rutas internas) o a Mi cuenta. Si venía con plan, Mi cuenta
 * le ofrece continuar con él. `salida=1`: acaba de cerrar sesión (se lo confirmamos).
 */
export function SignInView() {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const plan = planById(params.get("plan") ?? "");
  const justSignedOut = params.get("salida") === "1";
  const router = useRouter();
  const { status, mode, signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { errors, show, clear } = useFieldErrors(FIELDS);
  /** Error del servidor (credenciales, red): va arriba del botón. */
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  /** Correo que aún no se confirma: se ofrece reenviar el enlace. */
  const [unconfirmed, setUnconfirmed] = useState<string | null>(null);

  // Con sesión (recién iniciada o de antes) no hay nada que hacer aquí.
  useEffect(() => {
    if (status !== "signed-in") return;
    if (plan) savePendingPlan(plan.id);
    router.replace(next);
  }, [status, plan, next, router]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;
    setError(null);
    setUnconfirmed(null);
    const invalid = show(e.currentTarget, {
      email: emailProblem(email),
      password: password ? undefined : "Escribe tu contraseña.",
    });
    if (invalid) return;
    setSending(true);
    const res = await signIn({ email, password });
    if (res.error) {
      setError(res.error);
      if (res.needsConfirmation) setUnconfirmed(email);
      setSending(false);
    }
    // Si entró, el efecto de arriba la lleva a su destino.
  };

  const rawNext = params.get("next");
  const signUpQuery = new URLSearchParams({ ...(plan ? { plan: plan.id } : {}), ...(rawNext ? { next: safeNext(rawNext) } : {}) }).toString();
  const signUpHref = signUpQuery ? `/cuenta/crear?${signUpQuery}` : "/cuenta/crear";

  return (
    <AuthShell
      photo={ACCOUNT_PHOTOS.signIn}
      title={ACCOUNT_COPY.signIn.title}
      description={justSignedOut ? ACCOUNT_COPY.signIn.signedOut : ACCOUNT_COPY.signIn.description}
    >
      {status !== "signed-out" ? (
        <FormSkeleton />
      ) : (
        <>
          <form onSubmit={onSubmit} noValidate className="space-y-7">
            <Field
              label="Correo"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clear("email");
              }}
              error={errors.email}
            />
            <div>
              <PasswordField
                label="Contraseña"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clear("password");
                }}
                error={errors.password}
              />
              <Link href="/cuenta/recuperar" className="link-action mt-1 text-ink-muted hover:text-ink">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <div className="space-y-4">
              <FormAlert>{error}</FormAlert>
              {unconfirmed && <ResendConfirmation email={unconfirmed} />}
              <Button type="submit" size="lg" pending={sending} className="w-full sm:w-auto">
                {sending ? "Entrando…" : "Entrar"}
              </Button>
              {mode === "demo" && <FormNote>{ACCOUNT_COPY.demoAuth}</FormNote>}
            </div>
          </form>

          <div className="rule-soft mt-10 pt-6">
            <p className="text-body-sm text-ink-muted">¿Aún no tienes cuenta?</p>
            <ButtonLink href={signUpHref} variant="outline" size="lg" className="mt-3 w-full sm:w-auto">
              Crear cuenta
            </ButtonLink>
          </div>
        </>
      )}
    </AuthShell>
  );
}
