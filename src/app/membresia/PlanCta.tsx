"use client";

import { ButtonLink } from "@/components/ui/Button";
import { MEMBERSHIP } from "@/content/site";
import type { Plan } from "@/content/types";
import { useMembership } from "@/lib/user-data";

/**
 * Botón de cada plan. Sin membresía (o mientras carga): la prueba gratis, que lleva a crear la
 * cuenta con el plan elegido. Con una membresía vigente no tiene sentido abrir otra prueba:
 * se marca su plan y el botón lleva a Mi cuenta, donde se ve y se administra.
 */
export function PlanCta({ plan, describedBy }: { plan: Plan; describedBy?: string }) {
  const { membership } = useMembership();
  // Igual que en /cuenta/crear: una membresía cancelada ya no cuenta como vigente.
  const current = membership && membership.status !== "canceled" ? membership : null;
  // La prueba gratis es una por cuenta (misma regla que crear-checkout): quien ya tuvo membresía paga desde hoy.
  const trialUsed = membership !== null;

  if (current) {
    const mine = current.planId === plan.id;
    // La marca va después del botón (al lado desde sm) para que los botones de los dos planes sigan alineados.
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <ButtonLink
          href="/cuenta"
          variant="outline"
          size="lg"
          className="w-full sm:w-auto"
          aria-label={mine ? `Ir a Mi cuenta: ya tienes ${plan.name}` : "Ir a Mi cuenta: ya tienes una membresía"}
        >
          Ir a Mi cuenta
        </ButtonLink>
        {/* Estado activo: el acento */}
        {mine && <p className="label text-accent-ink">Tu plan actual</p>}
      </div>
    );
  }

  return (
    <ButtonLink
      href={`/cuenta/crear?plan=${plan.id}`}
      size="lg"
      className="w-full sm:w-auto"
      aria-label={trialUsed ? `Elegir ${plan.name}` : `${MEMBERSHIP.cta} con ${plan.name}`}
      aria-describedby={trialUsed ? undefined : describedBy}
    >
      {trialUsed ? `Elegir ${plan.name}` : MEMBERSHIP.cta}
    </ButtonLink>
  );
}
