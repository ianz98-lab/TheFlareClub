"use client";

import { useCallback, useState } from "react";
import { flushSync } from "react-dom";

type Errors<K extends string> = Partial<Record<K, string | undefined>>;

/**
 * Errores por campo de los formularios de cuenta (A023): cada mensaje va bajo su campo (prop `error`
 * de <Field>) y, al enviar con errores, el foco pasa al primero inválido en el orden del formulario.
 * Los campos se buscan por `name`, así que `order` usa los mismos nombres que los inputs.
 * Los errores del servidor (no de un campo) van aparte, en <FormAlert>.
 */
export function useFieldErrors<K extends string>(order: readonly K[]) {
  const [errors, setErrors] = useState<Errors<K>>({});

  /** Pinta los errores y enfoca el primer campo inválido. Devuelve true si hubo alguno. */
  const show = (form: HTMLFormElement, found: Errors<K>): boolean => {
    // flushSync: el mensaje ya está en el DOM (y en aria-describedby) cuando el campo recibe el foco,
    // así el lector de pantalla lee label + error de una vez.
    flushSync(() => setErrors(found));
    const first = order.find((k) => found[k]);
    if (!first) return false;
    const el = form.elements.namedItem(first);
    if (el instanceof HTMLElement) el.focus();
    return true;
  };

  /** El error de un campo se quita en cuanto la persona lo corrige. */
  const clear = useCallback((k: K) => setErrors((prev) => (prev[k] ? { ...prev, [k]: undefined } : prev)), []);

  return { errors, show, clear };
}
