"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { simulateDemoPurchase, useMembership } from "@/lib/user-data";
import { TICKET_COPY } from "./copy";

/* ---------------- ¿El evento ya terminó? ---------------- */

// Revisa cada minuto: una página que quedó abierta también cambia a la hora del evento.
function subscribeMinute(onChange: () => void) {
  const id = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(id);
}
const hasEnded = (endMs: number) => Date.now() >= endMs;
const asBuilt = () => false;

/**
 * Muestra `children` mientras el evento no termine y `after` cuando ya terminó.
 * El sitio se genera por adelantado (export estático): una página construida antes del evento
 * lo seguiría ofreciendo a la venta, así que el navegador lo vuelve a revisar con su reloj.
 * En el servidor y al hidratar vale lo generado, así no hay desajustes de hidratación.
 */
export function UntilEventEnds({ endMs, children, after = null }: { endMs: number; children: ReactNode; after?: ReactNode }) {
  const ended = useSyncExternalStore(subscribeMinute, () => hasEnded(endMs), asBuilt);
  return ended ? after : children;
}

/* ---------------- Pagar con el correo de la cuenta ---------------- */

function PayWith({ email }: { email: string }) {
  return (
    <>
      Paga con <span className="text-ink wrap-anywhere">{email}</span> para que tu entrada aparezca en Mi cuenta.
    </>
  );
}

/** Línea corta bajo "Comprar entrada" en las tarjetas (su botón lleva directo a Recurrente). */
export function TicketHint({ className = "" }: { className?: string }) {
  const { status, account } = useAuth();
  return (
    <p className={`text-sm leading-snug text-ink-muted ${className}`}>
      {TICKET_COPY.newTab} {status === "signed-in" && account ? <PayWith email={account.email} /> : TICKET_COPY.noAccount}
    </p>
  );
}

/**
 * Bajo "Comprar entrada" en el detalle. Sin sesión aclara que no hace falta cuenta; con sesión
 * muestra el correo con el que debe pagar (y avisa si ya tiene su entrada).
 * En modo demo (sin Supabase) un botón simula la compra para poder revisar "Mis eventos".
 */
export function TicketNote({ slug, className = "" }: { slug: string; className?: string }) {
  const { status, mode, account } = useAuth();
  const { purchases } = useMembership();
  const [simulated, setSimulated] = useState(false);
  const accountLink = useRef<HTMLAnchorElement>(null);

  const itemKey = `event:${slug}`;
  const owned = simulated || purchases.some((p) => p.itemKey === itemKey);

  // El botón de simular desaparece al usarlo: el foco pasa al link de Mi cuenta.
  useEffect(() => {
    if (simulated) accountLink.current?.focus();
  }, [simulated]);

  const text = `text-sm leading-snug text-ink-muted ${className}`;

  if (status !== "signed-in" || !account) {
    return (
      <p className={text}>
        {TICKET_COPY.noAccount} {TICKET_COPY.sameEmail}
      </p>
    );
  }

  return (
    <div className={text}>
      <p>
        <PayWith email={account.email} />
      </p>
      <div aria-live="polite">
        {owned ? (
          <p className="mt-2">
            Ya tienes tu entrada.{" "}
            {/* Dentro del párrafo: 44 px táctiles con padding que no agranda el interlineado */}
            <Link ref={accountLink} href="/cuenta#eventos" className="link -my-3 inline-block py-3 text-ink">
              Verla en Mi cuenta
            </Link>
          </p>
        ) : (
          mode === "demo" && (
            <button
              type="button"
              onClick={() => {
                simulateDemoPurchase(itemKey);
                setSimulated(true);
              }}
              className="link-action mt-1 text-ink-muted hover:text-ink"
            >
              Simular compra (modo demo)
            </button>
          )
        )}
      </div>
    </div>
  );
}
