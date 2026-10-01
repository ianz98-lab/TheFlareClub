"use client";

import { useState, type FormEvent } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { FormAlert, PasswordField } from "@/components/ui/form";
import { MIN_PASSWORD, useAuth } from "@/lib/auth";
import { AuthShell, FormSkeleton } from "./AuthShell";
import { ACCOUNT_COPY, ACCOUNT_PHOTOS } from "./copy";
import { useFieldErrors } from "./use-field-errors";

const FIELDS = ["new-password", "confirm-password"] as const;

/**
 * /cuenta/nueva-contrasena
 * Llega desde el correo de "recuperar contraseña" (AuthProvider verifica el `token_hash` del enlace,
 * abre la sesión y marca `recovering`; sirve en cualquier navegador) o desde Ajustes en Mi cuenta.
 * Sin sesión: llegó sin enlace, o el enlace ya se usó o venció.
 */
export function NewPasswordView() {
  const { status, mode, recovering, updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const { errors, show, clear } = useFieldErrors(FIELDS);
  /** Error del servidor (no de un campo). */
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  const photo = ACCOUNT_PHOTOS.password;
  const title = recovering ? ACCOUNT_COPY.newPassword.title : ACCOUNT_COPY.newPassword.changeTitle;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === "sending") return;
    setError(null);
    const tooShort = password.length < MIN_PASSWORD;
    const invalid = show(e.currentTarget, {
      "new-password": tooShort ? `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.` : undefined,
      // Que coincidan solo importa cuando la primera ya cumple el mínimo.
      "confirm-password": !tooShort && password !== confirm ? "Las contraseñas no coinciden." : undefined,
    });
    if (invalid) return;
    setState("sending");
    const res = await updatePassword(password);
    if (res.error) {
      setError(res.error);
      setState("idle");
      return;
    }
    setState("done");
  };

  if (state === "done") {
    return (
      <AuthShell photo={photo} title="Contraseña actualizada." description="La próxima vez que entres, usa tu contraseña nueva.">
        <div className="border-t border-ink pt-6">
          <ButtonLink href="/cuenta" size="lg" className="w-full sm:w-auto">
            Ir a Mi cuenta
          </ButtonLink>
        </div>
      </AuthShell>
    );
  }

  if (status === "loading") {
    return (
      <AuthShell photo={photo} title={ACCOUNT_COPY.newPassword.title}>
        <FormSkeleton />
      </AuthShell>
    );
  }

  if (mode === "demo") {
    return (
      <AuthShell photo={photo} title={ACCOUNT_COPY.newPassword.changeTitle} description={ACCOUNT_COPY.demoPassword}>
        <div className="border-t border-ink pt-6">
          <ButtonLink href="/cuenta" variant="outline" size="lg" className="w-full sm:w-auto">
            Ir a Mi cuenta
          </ButtonLink>
        </div>
      </AuthShell>
    );
  }

  if (status === "signed-out") {
    return (
      <AuthShell
        photo={photo}
        title="Este enlace ya no funciona."
        description="Para crear una contraseña nueva necesitas el enlace que te enviamos por correo. Cada enlace sirve una sola vez y vence después de un rato: pide uno nuevo y ábrelo en cuanto te llegue."
      >
        <div className="flex flex-col gap-3 border-t border-ink pt-6 sm:flex-row">
          <ButtonLink href="/cuenta/recuperar" size="lg">
            Pedir un enlace nuevo
          </ButtonLink>
          <ButtonLink href="/cuenta/entrar" variant="outline" size="lg">
            Entrar
          </ButtonLink>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell photo={photo} back={recovering ? undefined : { href: "/cuenta", label: "Mi cuenta" }} title={title}>
      <form onSubmit={onSubmit} noValidate className="space-y-7">
        <PasswordField
          label="Contraseña nueva"
          name="new-password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clear("new-password");
          }}
          error={errors["new-password"]}
          hint={`Mínimo ${MIN_PASSWORD} caracteres.`}
        />
        <PasswordField
          label="Confirma tu contraseña"
          name="confirm-password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD}
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            clear("confirm-password");
          }}
          error={errors["confirm-password"]}
        />
        <div className="space-y-4">
          <FormAlert>{error}</FormAlert>
          <Button type="submit" size="lg" pending={state === "sending"} className="w-full sm:w-auto">
            {state === "sending" ? "Guardando…" : "Guardar contraseña"}
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
