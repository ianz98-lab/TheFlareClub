"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field, FormAlert, FormStatus } from "@/components/ui/form";
import { useAuth, type Account } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { PortalSection } from "./portal-ui";
import { useFieldErrors } from "./use-field-errors";

const FIELDS = ["name"] as const;

/** Ajustes: nombre, contraseña (solo con Supabase) y cerrar sesión. */
export function SettingsPanel({ account }: { account: Account }) {
  const { mode, updateName, signOut } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(account.fullName);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const { errors, show, clear } = useFieldErrors(FIELDS);
  /** Error del servidor (no del campo). */
  const [error, setError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);

  const changed = name.trim() !== account.fullName.trim();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === "saving" || !changed) return;
    setError(null);
    if (show(e.currentTarget, { name: name.trim() ? undefined : "Escribe tu nombre." })) return;
    setState("saving");
    const res = await updateName(name);
    if (res.error) {
      setError(res.error);
      setState("idle");
      return;
    }
    setState("saved");
  };

  // Tras cerrar sesión, a "Entrar" con la confirmación (?salida=1). Navegar deja la página arriba
  // (un scrollTo lo deshace el scroll suave).
  const onSignOut = async () => {
    if (leaving) return;
    setLeaving(true);
    await signOut();
    router.replace("/cuenta/entrar?salida=1");
  };

  return (
    <PortalSection id="ajustes" title="Ajustes">
      <div className="grid gap-12 md:grid-cols-2 md:gap-16">
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <Field
            label="Tu nombre"
            name="name"
            autoComplete="name"
            autoCapitalize="words"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setState("idle");
              clear("name");
            }}
            error={errors.name}
          />
          <FormAlert>{error}</FormAlert>
          {state === "saved" && <FormStatus>Listo, guardamos tu nombre.</FormStatus>}
          {/* Sin cambios no hay nada que guardar: se ve deshabilitado pero sigue en el orden del Tab */}
          <Button type="submit" variant="outline" pending={state === "saving"} aria-disabled={!changed || undefined} className="w-full sm:w-auto">
            {state === "saving" ? "Guardando…" : "Guardar nombre"}
          </Button>
        </form>

        <div>
          <dl className="@container rule-soft">
            <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-baseline gap-4 border-b border-line py-3.5 @max-[16rem]:grid-cols-[minmax(0,1fr)] @max-[16rem]:gap-1">
              <dt className="text-sm text-ink-muted">Correo</dt>
              <dd className="text-body-sm [overflow-wrap:anywhere]">{account.email}</dd>
            </div>
            {account.createdAt && (
              <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-baseline gap-4 border-b border-line py-3.5 @max-[16rem]:grid-cols-[minmax(0,1fr)] @max-[16rem]:gap-1">
                <dt className="text-sm text-ink-muted">Miembro desde</dt>
                <dd className="text-body-sm">{formatDate(account.createdAt, { weekday: undefined, year: "numeric" })}</dd>
              </div>
            )}
          </dl>
          <div className="mt-4 flex flex-col items-start">
            {mode === "supabase" && (
              <Link href="/cuenta/nueva-contrasena" className="link-action">
                Cambiar contraseña
              </Link>
            )}
            <button
              type="button"
              onClick={onSignOut}
              aria-disabled={leaving || undefined}
              className="link-action aria-disabled:cursor-default aria-disabled:opacity-(--opacity-disabled)"
            >
              {leaving ? "Cerrando sesión…" : "Cerrar sesión"}
            </button>
          </div>
        </div>
      </div>
    </PortalSection>
  );
}
