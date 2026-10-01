"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, FormAlert, FormNote, FormStatus, PasswordField } from "@/components/ui/form";
import { planById } from "@/content/plans";
import { MEMBERSHIP } from "@/content/site";
import type { Plan } from "@/content/types";
import { emailProblem, MIN_PASSWORD, useAuth } from "@/lib/auth";
import { startMembershipCheckout } from "@/lib/checkout";
import { formatDate, formatPrice } from "@/lib/format";
import { accessEndsAt, hasMemberAccess, isLiveMembership, useMembership, type Membership } from "@/lib/user-data";
import { AuthShell, FormSkeleton } from "./AuthShell";
import { ACCOUNT_COPY, ACCOUNT_PHOTOS } from "./copy";
import { clearPendingPlan, safeNext, savePendingPlan } from "./pending-plan";
import { ResendConfirmation } from "./ResendConfirmation";
import { useFieldErrors } from "./use-field-errors";
import { useTabTitle } from "./use-tab-title";

type Phase = "form" | "sending" | "confirm" | "checkout" | "checkout-error";

const FIELDS = ["name", "email", "password"] as const;
const CONFIRM_TITLE = "Revisa tu correo.";

/**
 * /cuenta/crear[?plan=flare-mensual|flare-anual]
 * Registro → (confirmación por correo) → checkout de Recurrente para la prueba de 7 días.
 * Con sesión: activar la membresía (o volver, si ya tuvo una).
 */
export function SignUpView() {
  const params = useSearchParams();
  const plan = planById(params.get("plan") ?? "");
  const router = useRouter();
  const { status, mode, account, signUp, signOut } = useAuth();
  const { loading: membershipLoading, membership } = useMembership();
  // Ya con membresía vigente no tiene sentido abrir otro pago.
  const hasMembership = isLiveMembership(membership);
  // La prueba gratis es una por cuenta: si ya tuvo membresía (aunque la haya cancelado), paga desde hoy.
  const trial = membership === null;
  // Si llegó desde otra página (p. ej. el aviso de un evento), vuelve ahí al terminar.
  const next = safeNext(params.get("next"), "");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { errors, show, clear } = useFieldErrors(FIELDS);
  /** Error del servidor o del pago (no de un campo). */
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("form");

  const signInQuery = new URLSearchParams({ ...(plan ? { plan: plan.id } : {}), ...(next ? { next } : {}) }).toString();
  const signInHref = signInQuery ? `/cuenta/entrar?${signInQuery}` : "/cuenta/entrar";
  const shell = { photo: ACCOUNT_PHOTOS.signUp };
  const checkoutTitle = membership ? "Vuelve a The Flare Club." : "Tu cuenta está lista.";
  // La pestaña dice lo mismo que la página (F048): la metadata solo conoce el formulario. Con sesión
  // y sin un paso en curso, la pone SignedInState.
  useTabTitle(phase === "confirm" ? CONFIRM_TITLE : phase === "checkout" || phase === "checkout-error" ? checkoutTitle : null);

  /** Con sesión ya iniciada: si eligió plan, al checkout; si no, a Mi cuenta. */
  const continueWithSession = async () => {
    if (!plan) {
      router.replace(next || "/cuenta?bienvenida=1");
      return;
    }
    // Ya tuvo membresía: al volver, Mi cuenta dice que se reactivó (no "te damos la bienvenida").
    const arrival = membership ? "/cuenta?reactivada=1" : "/cuenta?bienvenida=1";
    setError(null);
    setPhase("checkout");
    const res = await startMembershipCheckout(plan.id);
    if (res.url) {
      // Si abandona el pago, Mi cuenta le ofrece retomarlo.
      savePendingPlan(plan.id);
      window.location.href = res.url;
      return;
    }
    if (res.demo) {
      clearPendingPlan();
      router.replace(arrival);
      return;
    }
    savePendingPlan(plan.id);
    setError(res.error ?? "No pudimos abrir el pago. Intenta de nuevo en un momento.");
    setPhase("checkout-error");
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (phase === "sending") return;
    setError(null);
    const invalid = show(e.currentTarget, {
      name: fullName.trim() ? undefined : "Escribe tu nombre.",
      email: emailProblem(email),
      password: password.length < MIN_PASSWORD ? `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.` : undefined,
    });
    if (invalid) return;
    setPhase("sending");
    const res = await signUp({ fullName, email, password });
    if (res.error) {
      setError(res.error);
      setPhase("form");
      return;
    }
    if (res.needsConfirmation) {
      if (plan) savePendingPlan(plan.id);
      setPhase("confirm");
      return;
    }
    await continueWithSession();
  };

  /* ---------- Revisa tu correo ---------- */
  if (phase === "confirm") {
    return (
      <AuthShell
        {...shell}
        title={CONFIRM_TITLE}
        description={
          <p>
            Te enviamos un enlace a <strong className="font-medium text-ink">{email.trim()}</strong> para activar tu cuenta.
          </p>
        }
      >
        <div className="border-t border-ink pt-6">
          <p className="font-display text-display-md">
            {plan ? `Al confirmarla vuelves aquí y sigues con tu plan ${plan.name}.` : "Al confirmarla vuelves aquí con tu sesión iniciada."}
          </p>
          <ul className="mt-6 divide-y divide-line border-y border-line text-body-sm text-ink-muted">
            <li className="py-3">
              ¿No te llegó? Revisa promociones o spam; a veces tarda un par de minutos.
              <ResendConfirmation email={email} initialWait={60} />
            </li>
            <li className="py-3">
              ¿Te equivocaste de correo?{" "}
              <button type="button" onClick={() => setPhase("form")} className="link text-ink">
                Vuelve a intentarlo
              </button>
            </li>
          </ul>
          <ButtonLink href={signInHref} variant="outline" size="lg" className="mt-8 w-full sm:w-auto">
            Ya la confirmé: entrar
          </ButtonLink>
        </div>
      </AuthShell>
    );
  }

  /* ---------- Preparando el pago / error del pago ---------- */
  if (phase === "checkout" || phase === "checkout-error") {
    return (
      <AuthShell
        {...shell}
        title={checkoutTitle}
        description={plan ? <PlanLine plan={plan} trial={trial} /> : undefined}
      >
        {phase === "checkout" ? (
          <div className="border-t border-ink pt-6">
            <FormStatus>{trial ? "Preparando tu prueba gratis…" : "Preparando el pago…"}</FormStatus>
          </div>
        ) : (
          <div className="space-y-6 border-t border-ink pt-6">
            <FormAlert>{error}</FormAlert>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/cuenta" size="lg">
                Ir a Mi cuenta
              </ButtonLink>
              <Button type="button" variant="outline" size="lg" onClick={continueWithSession}>
                Intentar de nuevo
              </Button>
            </div>
          </div>
        )}
      </AuthShell>
    );
  }

  /* ---------- Leyendo la sesión (y, con sesión, la membresía) ---------- */
  if (status === "loading" || (status === "signed-in" && phase === "form" && membershipLoading)) {
    return (
      <AuthShell {...shell} title={ACCOUNT_COPY.signUp.title} description={plan ? ACCOUNT_COPY.signUp.withPlan : ACCOUNT_COPY.signUp.description}>
        <FormSkeleton fields={3} />
      </AuthShell>
    );
  }

  /* ---------- Ya tiene sesión ---------- */
  if (status === "signed-in" && phase === "form") {
    return <SignedInState plan={plan} membership={membership} hasMembership={hasMembership} trial={trial} email={account?.email} onContinue={continueWithSession} onSignOut={() => void signOut()} />;
  }

  /* ---------- Formulario ---------- */
  const sending = phase === "sending";
  return (
    <AuthShell {...shell} title={ACCOUNT_COPY.signUp.title} description={plan ? ACCOUNT_COPY.signUp.withPlan : ACCOUNT_COPY.signUp.description}>
      {plan && <PlanSummary plan={plan} trial={trial} className="mb-8" />}

      <form onSubmit={onSubmit} noValidate className="space-y-7">
        <Field
          label="Tu nombre"
          name="name"
          autoComplete="name"
          autoCapitalize="words"
          required
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            clear("name");
          }}
          error={errors.name}
        />
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
        <PasswordField
          label="Contraseña"
          name="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clear("password");
          }}
          error={errors.password}
          hint={`Mínimo ${MIN_PASSWORD} caracteres.`}
        />

        <div className="space-y-4 pt-1">
          <FormAlert>{error}</FormAlert>
          <Button type="submit" size="lg" pending={sending} className="w-full sm:w-auto">
            {sending ? "Creando tu cuenta…" : plan ? "Crear cuenta y continuar" : "Crear cuenta"}
          </Button>
          {mode === "demo" && <FormNote>{ACCOUNT_COPY.demoAuth}</FormNote>}
        </div>
      </form>

      <p className="rule-soft mt-10 pt-6 text-body-sm text-ink-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href={signInHref} className="link text-ink">
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}

/**
 * Llegó a "Crear cuenta" con la sesión ya iniciada (A051). Según su membresía:
 * - vigente: ya la tiene, no hay nada que pagar;
 * - la tuvo y la canceló: "Vuelve a The Flare Club." (sin prueba: se cobra desde hoy);
 * - nunca tuvo: "Activa tu membresía." con el plan elegido o el link a los planes.
 */
function SignedInState({
  plan,
  membership,
  hasMembership,
  trial,
  email,
  onContinue,
  onSignOut,
}: {
  plan: Plan | undefined;
  membership: Membership | null;
  hasMembership: boolean;
  trial: boolean;
  email: string | undefined;
  onContinue: () => void;
  onSignOut: () => void;
}) {
  const shell = { photo: ACCOUNT_PHOTOS.signUp };
  const signedInAs = email ? `Estás dentro como ${email}.` : undefined;

  let title: string;
  let description: string | undefined;
  if (hasMembership) {
    title = "Ya tienes tu membresía.";
    description = signedInAs;
  } else if (membership) {
    const end = accessEndsAt(membership);
    title = "Vuelve a The Flare Club.";
    description =
      end && hasMemberAccess(membership) ? `Tienes acceso hasta el ${formatDate(end, { weekday: undefined })}.` : signedInAs;
  } else {
    title = "Activa tu membresía.";
    description = plan ? signedInAs : MEMBERSHIP.trialLine;
  }
  useTabTitle(title);

  const offerPlan = plan && !hasMembership;

  return (
    <AuthShell {...shell} title={title} description={description ? <p className="[overflow-wrap:anywhere]">{description}</p> : undefined}>
      {/* PlanSummary ya trae sus filetes: sin un segundo filete arriba */}
      <div className={`space-y-6 ${offerPlan ? "" : "border-t border-ink pt-6"}`}>
        {offerPlan && <PlanSummary plan={plan} trial={trial} />}
        {hasMembership && <p className="text-body-sm text-ink-muted">Tu membresía sigue vigente, así que no necesitas elegir otro plan.</p>}
        <div className="flex flex-col gap-3 sm:flex-row">
          {offerPlan ? (
            <Button type="button" size="lg" onClick={onContinue}>
              Continuar con {plan.name}
            </Button>
          ) : hasMembership ? (
            <ButtonLink href="/cuenta" size="lg">
              Ir a Mi cuenta
            </ButtonLink>
          ) : (
            <>
              <ButtonLink href="/membresia" size="lg">
                Ver planes
              </ButtonLink>
              <ButtonLink href="/cuenta" variant="outline" size="lg">
                Ir a Mi cuenta
              </ButtonLink>
            </>
          )}
        </div>
        <p className="text-sm text-ink-muted">
          ¿No eres tú?{" "}
          <button type="button" onClick={onSignOut} className="link text-ink">
            Cerrar sesión
          </button>
        </p>
      </div>
    </AuthShell>
  );
}

/** Cobro sin prueba (cuenta que ya tuvo membresía): se cobra desde hoy. */
const chargeLine = (plan: Plan) =>
  `Se cobra ${formatPrice(plan.price ?? 0, plan.currency)} ${plan.period === "año" ? "al año" : "al mes"} desde hoy hasta que decidas cancelarla.`;

function PlanLine({ plan, trial }: { plan: Plan; trial: boolean }) {
  return (
    <p>
      {plan.name} · {formatPrice(plan.price ?? 0, plan.currency)} / {plan.period}. {trial ? MEMBERSHIP.trialLine : chargeLine(plan)}
    </p>
  );
}

/**
 * Resumen del plan elegido en /membresia. El precio es el dato clave: va en el acento, en accent-ink
 * porque en el celular display-md mide 22 px (accent solo alcanza 3:1 desde 24 px).
 */
function PlanSummary({ plan, trial, className = "" }: { plan: Plan; trial: boolean; className?: string }) {
  return (
    <div className={`border-y border-line py-4 ${className}`}>
      {/* items-end: el precio queda en la línea del nombre del plan, no en la de "Tu plan" */}
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <p className="text-sm text-ink-muted">Tu plan</p>
          <p className="mt-1 font-display text-display-md">{plan.name}</p>
        </div>
        <p className="shrink-0 text-right">
          <span className="font-display text-display-md text-accent-ink">{formatPrice(plan.price ?? 0, plan.currency)}</span>
          <span className="text-sm text-ink-muted"> / {plan.period}</span>
        </p>
      </div>
      <p className="mt-3 text-sm text-ink">{trial ? MEMBERSHIP.trialLine : chargeLine(plan)}</p>
      {trial && plan.finePrint && <p className="mt-1 text-caption leading-relaxed text-ink-muted">{plan.finePrint}</p>}
      <Link href="/membresia" className="link-action text-ink-muted hover:text-ink">
        Cambiar plan
      </Link>
    </div>
  );
}
