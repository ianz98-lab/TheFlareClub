"use client";

import { useEffect, useState } from "react";
import { FormAlert, FormStatus } from "@/components/ui/form";
import { useAuth } from "@/lib/auth";

/** Supabase no deja pedir otro correo antes de 60 s. */
const WAIT = 60;

/**
 * "Reenviar el correo" para activar la cuenta, con espera entre envíos.
 * `initialWait`: segundos antes del primer reenvío (tras crear la cuenta el correo acaba de salir).
 * Mientras espera o envía queda aria-disabled (no disabled): así no le quita el foco a quien lo usaba.
 */
export function ResendConfirmation({ email, initialWait = 0 }: { email: string; initialWait?: number }) {
  const { resendConfirmation } = useAuth();
  const [wait, setWait] = useState(initialWait);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const blocked = wait > 0 || state === "sending";

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const send = async () => {
    if (blocked) return;
    setError(null);
    setState("sending");
    const res = await resendConfirmation(email);
    if (res.error) {
      setError(res.error);
      setState("idle");
      return;
    }
    setState("sent");
    setWait(WAIT);
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={send}
        aria-disabled={blocked || undefined}
        className="link-action text-ink aria-disabled:cursor-default aria-disabled:text-ink-muted aria-disabled:no-underline"
      >
        {state === "sending" ? "Enviando…" : wait > 0 ? <span className="tabular-nums">Reenviar el correo en {wait} s</span> : "Reenviar el correo"}
      </button>
      {state === "sent" && (
        <FormStatus>
          Te lo enviamos de nuevo a <span className="text-ink [overflow-wrap:anywhere]">{email.trim()}</span>.
        </FormStatus>
      )}
      <FormAlert>{error}</FormAlert>
    </div>
  );
}
