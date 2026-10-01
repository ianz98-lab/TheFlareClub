"use client";

import { useId, useState, type ComponentProps, type ReactNode, type Ref } from "react";

/*
 * Campos de formulario de todo el sitio (cuenta, leads, corporativo). Una sola forma:
 * - Línea inferior en vez de caja, label visible siempre (sentence case, 14 px), 16 px en el campo
 *   para que iOS no haga zoom y 48 px de alto para el dedo.
 * - `hint` va entre el label y el campo (los requisitos se leen antes de escribir); `error` va justo
 *   debajo del campo. Los dos quedan en aria-describedby, y con `error` el campo queda aria-invalid.
 * - Al enviar con errores: enfocar el primer campo inválido (el lector lee label + error).
 * - Errores del servidor (no de un campo): <FormAlert>. Envío en curso: <Button pending>.
 * - Dentro de un contenedor .on-dark se adaptan solos al fondo espresso.
 */

/** Une ids para aria-describedby, ignorando los vacíos. */
function joinIds(...list: (string | false | null | undefined)[]) {
  return list.filter(Boolean).join(" ") || undefined;
}

const LABEL_BASE = "block text-sm font-medium";

/**
 * Control de línea inferior (para controles propios). Borde con 3:1 sobre cualquier fondo de la marca;
 * al enfocar o con error, la línea pasa a 2 px (sombra interior: no mueve el layout).
 * El foco siempre gana: lleva el anillo global de :focus-visible (sin outline-none), así un campo con
 * error enfocado se distingue de los demás con error; además su línea pasa a 3 px.
 */
export const controlClass =
  "block w-full rounded-none border-0 border-b border-line-input bg-transparent px-0 text-base text-ink transition-[border-color,box-shadow] duration-(--duration-fast) placeholder:text-ink-muted focus:border-ink focus:shadow-[inset_0_-1px_0_var(--color-ink)] aria-[invalid=true]:border-error aria-[invalid=true]:shadow-[inset_0_-1px_0_var(--color-error)] focus:aria-[invalid=true]:shadow-[inset_0_-2px_0_var(--color-error)] disabled:opacity-(--opacity-disabled)";

/** Error de un campo. Sin role="alert": se lee al enfocar el campo (aria-describedby). */
export function FieldError({ id, children, className = "" }: { id: string; children: ReactNode; className?: string }) {
  return (
    <p id={id} className={`mt-1.5 text-sm leading-snug text-error ${className}`}>
      {children}
    </p>
  );
}

function FieldShell({
  id,
  label,
  hint,
  error,
  invalid,
  className,
  children,
}: {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  invalid: boolean;
  className: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className={`${LABEL_BASE} ${invalid ? "text-error" : "text-ink-muted"}`}>
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm leading-snug text-ink-muted">
          {hint}
        </p>
      )}
      {children}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  );
}

type FieldOwn = {
  label: ReactNode;
  hint?: ReactNode;
  /** Mensaje bajo el campo; también lo marca inválido. */
  error?: ReactNode;
  /** Marca inválido sin mensaje propio (el motivo ya está en un FormAlert). */
  invalid?: boolean;
  /** Clases del contenedor (no del campo). */
  className?: string;
};

function useFieldA11y(
  { hint, error, invalid, id: idProp, describedBy }: { hint?: ReactNode; error?: ReactNode; invalid?: boolean; id?: string; describedBy?: string },
) {
  const auto = useId();
  const id = idProp ?? auto;
  const isInvalid = Boolean(error) || Boolean(invalid);
  return {
    id,
    isInvalid,
    aria: {
      "aria-invalid": isInvalid || undefined,
      "aria-describedby": joinIds(hint ? `${id}-hint` : null, error ? `${id}-error` : null, describedBy),
    },
  };
}

export type FieldProps = FieldOwn & Omit<ComponentProps<"input">, "className">;

export function Field({ label, hint, error, invalid, className = "", id: idProp, "aria-describedby": describedBy, ...rest }: FieldProps) {
  const { id, isInvalid, aria } = useFieldA11y({ hint, error, invalid, id: idProp, describedBy });
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} invalid={isInvalid} className={className}>
      <input {...rest} id={id} {...aria} className={`mt-1 h-12 ${controlClass}`} />
    </FieldShell>
  );
}

/** Contraseña con "Mostrar / Ocultar" en texto (sin icono de ojo). */
export function PasswordField({
  label,
  hint,
  error,
  invalid,
  className = "",
  id: idProp,
  "aria-describedby": describedBy,
  ...rest
}: FieldOwn & Omit<ComponentProps<"input">, "className" | "type">) {
  const { id, isInvalid, aria } = useFieldA11y({ hint, error, invalid, id: idProp, describedBy });
  const [visible, setVisible] = useState(false);
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} invalid={isInvalid} className={className}>
      <div className="relative">
        <input
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          {...rest}
          id={id}
          type={visible ? "text" : "password"}
          {...aria}
          className={`mt-1 h-12 pr-20 ${controlClass}`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-controls={id}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute bottom-0 right-0 flex h-12 min-w-11 items-center justify-end text-sm font-medium text-ink-muted transition-colors hover:text-ink active:text-ink"
        >
          {visible ? "Ocultar" : "Mostrar"}
        </button>
      </div>
    </FieldShell>
  );
}

export type TextAreaProps = FieldOwn &
  Omit<ComponentProps<"textarea">, "className"> & {
    /** Con maxLength: desde este largo se avisa cuánto falta (requiere `value`). */
    countFrom?: number;
  };

export function TextArea({
  label,
  hint,
  error,
  invalid,
  className = "",
  countFrom,
  id: idProp,
  "aria-describedby": describedBy,
  ...rest
}: TextAreaProps) {
  const { id, isInvalid, aria } = useFieldA11y({ hint, error, invalid, id: idProp, describedBy });
  const max = typeof rest.maxLength === "number" ? rest.maxLength : undefined;
  const length = typeof rest.value === "string" ? rest.value.length : 0;
  const showCount = max !== undefined && countFrom !== undefined && length >= countFrom;
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} invalid={isInvalid} className={className}>
      <textarea rows={5} {...rest} id={id} {...aria} className={`mt-1 min-h-32 resize-y py-3 leading-relaxed ${controlClass}`} />
      {showCount && (
        <p aria-live="polite" className="mt-1.5 text-sm text-ink-muted">
          {length >= max
            ? `Llegaste al máximo de ${max.toLocaleString("es-GT")} caracteres.`
            : `Te quedan ${(max - length).toLocaleString("es-GT")} caracteres.`}
        </p>
      )}
    </FieldShell>
  );
}

/** Error del formulario (servidor, red): se anuncia al aparecer y va justo arriba del botón. Sin banda lateral. */
export function FormAlert({ children, className = "" }: { children: ReactNode; className?: string }) {
  if (!children) return null;
  return (
    <p role="alert" className={`text-body-sm leading-snug text-error ${className}`}>
      {children}
    </p>
  );
}

/**
 * Confirmación discreta (guardado, enviado). Si reemplaza a lo que tenía el foco (p. ej. tras cancelar),
 * pasar `ref` y tabIndex={-1} y enfocarla.
 */
export function FormStatus({
  children,
  className = "",
  ref,
  tabIndex,
}: {
  children: ReactNode;
  className?: string;
  ref?: Ref<HTMLParagraphElement>;
  tabIndex?: number;
}) {
  return (
    <p ref={ref} tabIndex={tabIndex} role="status" className={`text-body-sm text-ink-muted ${className}`}>
      {children}
    </p>
  );
}

/**
 * Nota al pie de un formulario (modo demo, "Sin compromiso."): atenuada, con filete opcional. A 14 px y
 * no a 13: es parte de lo que la usuaria lee para decidir si envía.
 */
export function FormNote({ children, rule = false, className = "" }: { children: ReactNode; rule?: boolean; className?: string }) {
  return <p className={`text-sm leading-relaxed text-ink-muted ${rule ? "rule-soft pt-3" : ""} ${className}`}>{children}</p>;
}
