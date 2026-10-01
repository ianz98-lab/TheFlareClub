"use client";

import { ButtonLink } from "@/components/ui/Button";
import { MEMBERSHIP } from "@/content/site";
import { useMembership, type Membership } from "@/lib/user-data";

/**
 * ¿La membresía da acceso hoy? Prueba, activa o con pago pendiente, sí. Cancelada conserva el
 * acceso hasta el final del periodo pagado (o de la prueba). `incomplete` = checkout sin terminar.
 */
function hasAccess(m: Membership | null): boolean {
  if (!m || m.status === "incomplete") return false;
  if (m.status !== "canceled") return true;
  const end = m.currentPeriodEnd ?? m.trialEndsAt;
  return Boolean(end && Date.parse(end) > Date.now());
}

/**
 * Invitación a la membresía en el detalle de una clase o meditación de socias. A quien ya tiene
 * membresía no se le vende la prueba; mientras se sabe (sesión y membresía cargando) no se muestra nada.
 */
export function MemberUpsell({ noun, className = "" }: { noun: "clase" | "meditación"; className?: string }) {
  const { loading, membership } = useMembership();
  if (loading || hasAccess(membership)) return null;
  return (
    <div className={`rule pt-5 ${className}`}>
      <p className="text-body-sm leading-relaxed text-ink-muted">Esta {noun} es parte de la membresía. Empieza con 7 días gratis y accede a toda la biblioteca.</p>
      <ButtonLink href="/membresia" className="mt-4 w-full sm:w-auto">
        {MEMBERSHIP.cta}
      </ButtonLink>
    </div>
  );
}
