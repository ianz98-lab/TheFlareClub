"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { FormAlert, FormStatus } from "@/components/ui/form";
import { planById } from "@/content/plans";
import { MEMBERSHIP } from "@/content/site";
import type { Plan } from "@/content/types";
import { cancelMembership, startMembershipCheckout } from "@/lib/checkout";
import { formatDate, formatPrice } from "@/lib/format";
import { accessEndsAt, isLiveMembership, type Membership } from "@/lib/user-data";
import { clearPendingPlan, usePendingPlan } from "./pending-plan";
import { ContactTail, hasContact, PortalSection } from "./portal-ui";

const day = (iso: string) => formatDate(iso, { weekday: undefined });
const dayYear = (iso: string) => formatDate(iso, { weekday: undefined, year: "numeric" });
const priceOf = (p: Plan) => `${formatPrice(p.price ?? 0, p.currency)} / ${p.period}`;
const isCanceled = (m: Membership) => m.status === "canceled" || Boolean(m.cancelAtPeriodEnd);
const inFuture = (iso: string | undefined) => Boolean(iso && Date.parse(iso) > Date.now());
const planName = (m: Membership) => planById(m.planId)?.name ?? m.planId;

function statusText(m: Membership): string {
  if (isCanceled(m)) {
    const end = accessEndsAt(m);
    return end && inFuture(end) ? `Cancelada · tienes acceso hasta el ${day(end)}` : "Cancelada";
  }
  switch (m.status) {
    case "trialing":
      return m.trialEndsAt ? `Prueba gratis hasta el ${day(m.trialEndsAt)}` : "Prueba gratis";
    case "active":
      return "Activa";
    default:
      return "Pago pendiente";
  }
}

/** "7 oct 2026 · USD 15": fecha y monto del próximo cobro, o null si no habrá otro (cancelada). */
export function nextCharge(m: Membership): string | null {
  if (isCanceled(m)) return null;
  const plan = planById(m.planId);
  const amount = plan ? ` · ${formatPrice(plan.price ?? 0, plan.currency)}` : "";
  if (m.status === "trialing" && m.trialEndsAt) return `${dayYear(m.trialEndsAt)}${amount}`;
  if (m.status === "active" && m.currentPeriodEnd) return `${dayYear(m.currentPeriodEnd)}${amount}`;
  return null;
}

/** Qué mostrar: la membresía, el plan que eligió antes de crear la cuenta, o nada. */
function useMembershipView(membership: Membership | null) {
  const pending = usePendingPlan();
  const live = isLiveMembership(membership);
  // Ya tiene membresía vigente: el plan pendiente sobra.
  useEffect(() => {
    if (live && pending) clearPendingPlan();
  }, [live, pending]);
  if (membership && (live || !pending)) return { kind: "membership" as const, membership };
  if (pending) return { kind: "pending" as const, plan: pending };
  return { kind: "none" as const };
}

type PanelProps = { loading: boolean; membership: Membership | null; confirming?: boolean };

/**
 * Resumen de una línea bajo el saludo de Mi cuenta: "Flare Mensual · Prueba gratis hasta el 7 oct ·
 * Administrar" (lleva a la sección completa, más abajo).
 */
export function MembershipLine({ loading, membership, confirming = false }: PanelProps) {
  const view = useMembershipView(membership);

  if (loading) {
    return (
      <div aria-hidden="true" className="mt-5 flex min-h-11 items-center">
        <div className="h-4 w-64 max-w-full bg-line motion-safe:animate-pulse" />
      </div>
    );
  }

  let text: string;
  // `key`: la acción que mueve a la persona (empezar o retomar el pago) va en el acento; "Administrar", en tinta.
  let action: { href: string; label: string; aria?: string; key?: boolean } | null = null;
  if (confirming) {
    text = "Confirmando tu pago…";
  } else if (view.kind === "membership") {
    text = `${planName(view.membership)} · ${statusText(view.membership)}`;
    action = { href: "#membresia", label: "Administrar", aria: "Administrar tu membresía" };
  } else if (view.kind === "pending") {
    text = `Tu plan ${view.plan.name} te espera`;
    action = { href: "#membresia", label: "Continuar", aria: `Continuar con ${view.plan.name} en Tu membresía`, key: true };
  } else {
    text = "Aún no tienes membresía";
    action = { href: "/membresia", label: MEMBERSHIP.cta, key: true };
  }
  const actionClass = `link-action ${action?.key ? "text-accent-ink hover:text-ink" : ""}`;

  // En el celular la acción va debajo del texto (un "·" al final de la línea quedaba colgando);
  // desde sm, en la misma línea con el punto como separador.
  return (
    <p className="mt-4 flex flex-col items-start text-body-sm sm:mt-5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2.5">
      <span>{text}</span>
      {action && (
        <>
          <span aria-hidden="true" className="hidden text-ink-muted sm:inline">
            ·
          </span>
          {action.href.startsWith("#") ? (
            <a href={action.href} aria-label={action.aria} className={actionClass}>
              {action.label}
            </a>
          ) : (
            <Link href={action.href} className={actionClass}>
              {action.label}
            </Link>
          )}
        </>
      )}
    </p>
  );
}

/**
 * Tu membresía: plan, estado en español, próximo cobro y cancelar; sin membresía, cómo empezar.
 * `confirming`: volvió de pagar y el webhook aún no la trae (no se ofrece otro pago mientras tanto).
 */
export function MembershipPanel({ loading, membership, confirming = false }: PanelProps) {
  // Al cancelar se muestra el nuevo estado de inmediato, sin esperar a releer la base.
  const [canceledUntil, setCanceledUntil] = useState<string | null>(null);
  const shown: Membership | null = membership && canceledUntil ? { ...membership, status: "canceled", currentPeriodEnd: canceledUntil } : membership;
  const view = useMembershipView(shown);

  return (
    <PortalSection id="membresia" title="Tu membresía">
      <div className="max-w-2xl">
        {loading ? (
          <div aria-busy="true" className="space-y-4">
            <span className="sr-only">Cargando tu membresía…</span>
            <div className="h-7 w-2/3 bg-line motion-safe:animate-pulse" />
            <div className="h-7 w-1/2 bg-line motion-safe:animate-pulse" />
          </div>
        ) : confirming ? (
          <div aria-busy="true">
            <p className="font-display text-display-md">Confirmando tu pago…</p>
            <p className="mt-2 text-body-sm leading-relaxed text-ink-muted">
              Tu membresía aparece aquí en cuanto Recurrente nos confirma el pago. Suele tardar unos segundos.
            </p>
          </div>
        ) : view.kind === "membership" ? (
          <Details m={view.membership} justCanceled={canceledUntil !== null} onCanceled={setCanceledUntil} />
        ) : view.kind === "pending" ? (
          <PendingPlan plan={view.plan} />
        ) : (
          <div>
            <p className="font-display text-display-md">Aún no tienes membresía.</p>
            <p className="mt-2 text-body-sm text-ink-muted">{MEMBERSHIP.trialLine}</p>
            <ButtonLink href="/membresia" size="lg" className="mt-6 w-full sm:w-auto">
              {MEMBERSHIP.cta}
            </ButtonLink>
          </div>
        )}
      </div>
    </PortalSection>
  );
}

function Details({ m, justCanceled, onCanceled }: { m: Membership; justCanceled: boolean; onCanceled: (end: string) => void }) {
  const canceled = isCanceled(m);
  const charge = nextCharge(m);
  // En prueba o activa, sin cancelar: el estado es el dato clave y va en el acento. "Pago pendiente"
  // también es vigente, pero es un problema: va en tinta, con el aviso de pago debajo.
  const live = (m.status === "trialing" || m.status === "active") && !canceled;
  const rows: { k: string; v: string; accent?: boolean }[] = [
    { k: "Estado", v: statusText(m), accent: live },
    ...(charge ? [{ k: "Próximo cobro", v: charge }] : []),
  ];
  const statusRef = useRef<HTMLParagraphElement>(null);

  // El botón que tenía el foco ("Sí, cancelar") desaparece: el foco pasa a la confirmación.
  useEffect(() => {
    if (justCanceled) statusRef.current?.focus();
  }, [justCanceled]);

  return (
    <>
      {/* El plan, como título del bloque; el estado y el cobro, como datos (Hanken, cifras tabulares) */}
      <p className="text-sm text-ink-muted">Tu plan</p>
      <p className="mt-1 font-display text-display-md">{planName(m)}</p>
      <dl className="@container mt-5 border-t border-line">
        {rows.map(({ k, v, accent }) => (
          <div key={k} className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-baseline gap-4 border-b border-line py-3.5 sm:grid-cols-[9rem_minmax(0,1fr)] @max-[16rem]:grid-cols-[minmax(0,1fr)] @max-[16rem]:gap-1">
            <dt className="text-sm text-ink-muted">{k}</dt>
            <dd className={`text-base font-medium tabular-nums ${accent ? "text-accent-ink" : ""}`}>{v}</dd>
          </div>
        ))}
      </dl>

      {(m.status === "past_due" || m.status === "incomplete") && !canceled && (
        <p className="mt-4 text-body-sm leading-relaxed text-error">
          No pudimos procesar tu último pago.
          {hasContact && (
            <>
              {" "}Escríbenos
              <ContactTail />.
            </>
          )}
        </p>
      )}

      {canceled ? (
        <div className="mt-6 space-y-4">
          {justCanceled && (
            <FormStatus ref={statusRef} tabIndex={-1} className="outline-none">
              Listo, cancelamos tu membresía. No se te hará ningún otro cobro.
            </FormStatus>
          )}
          <ButtonLink href="/membresia" size="lg" className="w-full sm:w-auto">
            Ver planes
          </ButtonLink>
        </div>
      ) : (
        <>
          {isLiveMembership(m) && <CancelMembership m={m} onCanceled={onCanceled} />}
          {/* Cambiar de plan se hace por correo: sin buzón (D5) la línea no se muestra */}
          {hasContact && (
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              ¿Quieres cambiar de plan? Escríbenos
              <ContactTail />.
            </p>
          )}
        </>
      )}
    </>
  );
}

/** "Cancelar membresía" con confirmación en el mismo lugar (sin modal: cómodo en el celular). */
function CancelMembership({ m, onCanceled }: { m: Membership; onCanceled: (end: string) => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();
  const titleRef = useRef<HTMLParagraphElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);

  const end = m.status === "trialing" ? m.trialEndsAt : m.currentPeriodEnd;
  const until = end ? `el ${day(end)}` : "el final de tu periodo";

  // Al abrir, el foco va a la pregunta; al cerrar, vuelve al botón.
  useEffect(() => {
    if (open) titleRef.current?.focus();
    else if (returnFocus.current) {
      returnFocus.current = false;
      triggerRef.current?.focus();
    }
  }, [open]);

  const close = () => {
    if (busy) return;
    returnFocus.current = true;
    setError(null);
    setOpen(false);
  };

  const confirm = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const res = await cancelMembership();
    setBusy(false);
    if (res.ok) {
      onCanceled(res.currentPeriodEnd ?? end ?? new Date().toISOString());
      return;
    }
    setError(res.error ?? "No pudimos cancelar tu membresía. Intenta de nuevo en unos minutos.");
  };

  if (!open) {
    return (
      <button ref={triggerRef} type="button" onClick={() => setOpen(true)} aria-expanded={false} className="link-action mt-4 text-ink-muted hover:text-ink">
        Cancelar membresía
      </button>
    );
  }

  return (
    <div role="group" aria-labelledby={titleId} className="mt-6 border-t border-ink pt-5">
      <p id={titleId} ref={titleRef} tabIndex={-1} className="font-display text-display-md outline-none">
        ¿Cancelar tu membresía?
      </p>
      <p className="mt-2 max-w-md text-body-sm leading-relaxed text-ink-muted">
        {m.status === "trialing"
          ? `No se te hará ningún cobro y conservas el acceso hasta ${until}.`
          : `No se renovará y conservas el acceso hasta ${until}.`}
      </p>
      <div className="mt-5 space-y-4">
        <FormAlert>
          {error && (
            <>
              {error}
              {hasContact && (
                <>
                  {" "}Si sigue sin funcionar, escríbenos
                  <ContactTail />.
                </>
              )}
            </>
          )}
        </FormAlert>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" size="lg" onClick={confirm} pending={busy}>
            {busy ? "Cancelando…" : "Sí, cancelar"}
          </Button>
          <Button size="lg" onClick={close} aria-disabled={busy || undefined}>
            No, mantenerla
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Eligió plan antes de crear la cuenta y aún no paga: retomarlo con un toque. */
function PendingPlan({ plan }: { plan: Plan }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const go = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const res = await startMembershipCheckout(plan.id);
    if (res.url) {
      window.location.href = res.url;
      return;
    }
    if (res.demo) clearPendingPlan();
    else setError(res.error ?? "No pudimos abrir el pago. Intenta de nuevo en un momento.");
    setBusy(false);
  };

  return (
    <div>
      <p className="font-display text-display-md">Tu plan te espera.</p>
      <p className="mt-2 text-body-sm text-ink-muted">
        {plan.name} · {priceOf(plan)}. {MEMBERSHIP.trialLine}
      </p>
      <div className="mt-6 space-y-4">
        <FormAlert>{error}</FormAlert>
        <Button size="lg" onClick={go} pending={busy} className="w-full sm:w-auto">
          {busy ? "Abriendo el pago…" : `Continuar con ${plan.name}`}
        </Button>
      </div>
      <p className="mt-3 flex flex-wrap gap-x-6">
        <Link href="/membresia" className="link-action text-ink-muted hover:text-ink">
          Ver planes
        </Link>
        <button type="button" onClick={clearPendingPlan} className="link-action text-ink-muted hover:text-ink">
          Ahora no
        </button>
      </p>
    </div>
  );
}
