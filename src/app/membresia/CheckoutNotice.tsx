"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

/**
 * Aviso discreto cuando la persona vuelve de Recurrente sin pagar (`?pago=cancelado`,
 * lo pone `startMembershipCheckout` en src/lib/checkout.ts). Va dentro de <Suspense>.
 */
export function CheckoutNotice() {
  const params = useSearchParams();
  const [closed, setClosed] = useState(false);
  if (closed || params.get("pago") !== "cancelado") return null;

  const close = () => {
    setClosed(true);
    // Quita el parámetro para que el aviso no vuelva a salir al recargar.
    window.history.replaceState(window.history.state, "", window.location.pathname);
  };

  return (
    // El único bloque con fondo propio de la página: es un aviso y debe separarse del resto
    <div role="status" className="border-b border-line bg-surface-alt">
      <div className="container-x flex items-center justify-between gap-4 py-2">
        <p className="py-2 text-sm leading-snug text-ink">
          No completaste el pago, así que no se hizo ningún cobro. Tu cuenta sigue lista: elige tu plan cuando quieras.
        </p>
        <button
          type="button"
          onClick={close}
          aria-label="Cerrar aviso"
          className="-mr-3 inline-flex size-11 shrink-0 items-center justify-center text-ink-muted transition-colors hover:text-ink active:text-ink"
        >
          <Icon name="close" size={18} />
        </button>
      </div>
    </div>
  );
}
