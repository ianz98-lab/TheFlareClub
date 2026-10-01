"use client";

import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { buttonClass, type ButtonClassOptions } from "./button-class";

export type ButtonProps = Omit<ButtonClassOptions, "className"> & {
  /**
   * Envío o acción en curso: el botón se ve deshabilitado pero conserva el foco (aria-disabled en vez de
   * disabled, que lo tiraría a <body>) y no vuelve a disparar el clic ni el envío del formulario.
   */
  pending?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<"button">, "className" | "children">;

/**
 * <button> con el estilo de la marca. Importarlo desde "@/components/ui/Button".
 * `type` es "button" por defecto: un envío se pide explícito con type="submit".
 */
export function Button({ variant, size, wrap, pending = false, className = "", children, type = "button", onClick, ...rest }: ButtonProps) {
  const ariaDisabled = rest["aria-disabled"];
  const blocked = pending || ariaDisabled === true || ariaDisabled === "true";

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    // Cancelar el clic también cancela el envío implícito (Enter dentro de un campo)
    if (blocked) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <button
      {...rest}
      type={type}
      onClick={handleClick}
      aria-disabled={blocked || undefined}
      data-pending={pending || undefined}
      className={buttonClass({ variant, size, wrap, className })}
    >
      {children}
    </button>
  );
}
