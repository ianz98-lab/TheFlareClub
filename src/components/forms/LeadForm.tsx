"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field, FieldError, FormNote } from "@/components/ui/form";
import { LEAD_DEMO, LEAD_LIMITS, emailError, leadsLive, submitLead, type LeadKind } from "@/lib/leads";

/**
 * Formulario de un solo campo (correo) para listas de espera y avisos.
 * Móvil primero: en celular el botón va debajo y ocupa todo el ancho.
 * `className` va sobre el <form> y sobre el mensaje final (margen superior).
 * Sin placeholder: la etiqueta ya dice qué va, y un ejemplo gris se leía como un valor ya escrito.
 * Sobre espresso no necesita nada: dentro de un .on-dark, campo, error, nota y foco se adaptan solos.
 * Sin Supabase (prototipo) no se envía nada y se dice: nota bajo el botón y, al terminar, debajo del gracias.
 */
export function LeadForm({
  kind,
  source,
  cta,
  done,
  label = "Tu correo",
  className = "",
}: {
  kind: LeadKind;
  source?: string;
  cta: string;
  done: string;
  label?: string;
  className?: string;
}) {
  const uid = useId();
  const inputId = `${uid}-email`;
  const errorId = `${uid}-error`;
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  // El envío terminó en modo demo: no llegó a ningún lado.
  const [demo, setDemo] = useState(false);
  // `n` cambia en cada intento fallido: el aviso se vuelve a montar y el lector de pantalla lo repite.
  const [error, setError] = useState<{ text: string; n: number } | null>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sending = state === "sending";

  // El formulario desaparece al enviar: el foco pasa al mensaje de confirmación (si no, cae en <body>).
  useEffect(() => {
    if (state === "sent") doneRef.current?.focus();
  }, [state]);

  const fail = (text: string) => setError((prev) => ({ text, n: (prev?.n ?? 0) + 1 }));

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;
    const invalid = emailError(email);
    if (invalid) {
      fail(invalid);
      inputRef.current?.focus();
      return;
    }
    setError(null);
    setState("sending");
    const website = new FormData(e.currentTarget).get("website");
    const res = await submitLead({ kind, email, source, website: typeof website === "string" ? website : undefined });
    if (res.error) {
      fail(res.error);
      setState("idle");
      return;
    }
    setDemo(Boolean(res.demo));
    setState("sent");
  };

  if (state === "sent") {
    return (
      <div ref={doneRef} tabIndex={-1} role="status" className={`outline-none ${className}`}>
        <p className="font-display text-display-md">{done}</p>
        {demo && <FormNote className="mt-3">{LEAD_DEMO.sent}</FormNote>}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} aria-busy={sending} className={`relative flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end ${className}`} noValidate>
      <Field
        ref={inputRef}
        id={inputId}
        label={label}
        type="email"
        name="email"
        required
        maxLength={LEAD_LIMITS.email}
        autoComplete="email"
        inputMode="email"
        autoCapitalize="none"
        spellCheck={false}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (error) setError(null);
        }}
        // El error va fuera del campo (abajo de la fila con el botón al lado); queda ligado igual.
        invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="min-w-0 flex-1 sm:min-w-[13rem]"
      />

      {/* En el celular el aviso va pegado al campo; con el botón al lado, pasa a su propia línea. */}
      {error && (
        <div key={error.n} role="alert" className="-mt-1.5 sm:order-last sm:basis-full">
          <FieldError id={errorId}>{error.text}</FieldError>
        </div>
      )}

      {/* Trampa para bots: fuera de la vista, del tabulador y del lector de pantalla. */}
      <div aria-hidden="true" className="sr-only">
        <label>
          Sitio web
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      {/* pending y no disabled: un botón deshabilitado pierde el foco y, si falla el envío, el teclado queda sin lugar. */}
      <Button type="submit" size="lg" pending={sending} className="w-full shrink-0 sm:w-auto">
        {sending ? "Enviando…" : cta}
      </Button>

      {!leadsLive && <FormNote className="sm:order-last sm:basis-full">{LEAD_DEMO.notice}</FormNote>}
    </form>
  );
}
