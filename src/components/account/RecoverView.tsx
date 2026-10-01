"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, FormAlert } from "@/components/ui/form";
import { emailProblem, useAuth } from "@/lib/auth";
import { AuthShell } from "./AuthShell";
import { ACCOUNT_COPY, ACCOUNT_PHOTOS } from "./copy";
import { useFieldErrors } from "./use-field-errors";

const FIELDS = ["email"] as const;

/** /cuenta/recuperar — pide el enlace para crear una contraseña nueva. */
export function RecoverView() {
  const { mode, sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const { errors, show, clear } = useFieldErrors(FIELDS);
  /** Error del servidor (no del campo). */
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === "sending") return;
    setError(null);
    if (show(e.currentTarget, { email: emailProblem(email) })) return;
    setState("sending");
    const res = await sendPasswordReset(email);
    if (res.error) {
      setError(res.error);
      setState("idle");
      return;
    }
    // Mismo mensaje exista o no la cuenta: no revelamos qué correos están registrados.
    setState("sent");
  };

  const back = { href: "/cuenta/entrar", label: "Entrar" };

  // Demo: no hay correos que mandar. Se explica de entrada en vez de fallar al enviar.
  if (mode === "demo") {
    return (
      <AuthShell photo={ACCOUNT_PHOTOS.password} back={back} title={ACCOUNT_COPY.recover.title} description={ACCOUNT_COPY.demoRecover}>
        <div className="border-t border-ink pt-6">
          <ButtonLink href="/cuenta/entrar" size="lg" className="w-full sm:w-auto">
            Entrar
          </ButtonLink>
        </div>
      </AuthShell>
    );
  }

  if (state === "sent") {
    return (
      <AuthShell photo={ACCOUNT_PHOTOS.password} back={back} title="Revisa tu correo." description={ACCOUNT_COPY.recover.sent}>
        <div className="border-t border-ink pt-6">
          <ul className="divide-y divide-line border-b border-line text-body-sm text-ink-muted">
            <li className="pb-3">El enlace sirve una sola vez y vence después de un rato: ábrelo en cuanto te llegue.</li>
            <li className="py-3">¿No te llegó? Revisa promociones o spam; a veces tarda un par de minutos.</li>
          </ul>
          <button type="button" onClick={() => setState("idle")} className="link-action mt-4">
            Enviar a otro correo
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell photo={ACCOUNT_PHOTOS.password} back={back} title={ACCOUNT_COPY.recover.title} description={ACCOUNT_COPY.recover.description}>
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
        <div className="space-y-4">
          <FormAlert>{error}</FormAlert>
          <Button type="submit" size="lg" pending={state === "sending"} className="w-full sm:w-auto">
            {state === "sending" ? "Enviando…" : "Enviar enlace"}
          </Button>
        </div>
      </form>
      <p className="rule-soft mt-10 pt-6 text-body-sm text-ink-muted">
        ¿Te acordaste?{" "}
        <Link href="/cuenta/entrar" className="link text-ink">
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}
