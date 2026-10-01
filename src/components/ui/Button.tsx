import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { buttonClass, type ButtonClassOptions } from "./button-class";
import { NewTabHint } from "./NewTabHint";

/*
 * Botones de la marca. Un solo punto de entrada:
 * - <Button>: acciones (<button>; cliente, con `pending` para envíos).
 * - <ButtonLink>: navegación interna (next/link).
 * - <ButtonAnchor>: <a> común para enlaces externos (`external`) y descargas.
 * - buttonClass(): las mismas clases para cualquier otro elemento.
 * Este archivo no lleva "use client": ButtonLink y ButtonAnchor funcionan en componentes de servidor.
 */
export { Button, type ButtonProps } from "./ButtonElement";
export { buttonClass, type ButtonClassOptions, type ButtonSize, type ButtonVariant } from "./button-class";

type Common = Omit<ButtonClassOptions, "className"> & { className?: string; children: ReactNode };

export function ButtonLink({ variant, size, wrap, className = "", children, ...rest }: Common & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link {...rest} className={buttonClass({ variant, size, wrap, className })}>
      {children}
    </Link>
  );
}

/**
 * <a> con forma de botón. `external` abre en una pestaña nueva con rel seguro y lo avisa (flecha visible
 * y texto para lector de pantalla). Para descargas, pasar `download`.
 */
export function ButtonAnchor({
  variant,
  size,
  wrap,
  external = false,
  className = "",
  children,
  ...rest
}: Common & { external?: boolean } & Omit<ComponentProps<"a">, "className" | "children">) {
  const newTab = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <a {...newTab} {...rest} className={buttonClass({ variant, size, wrap, className })}>
      {children}
      {external && <NewTabHint />}
    </a>
  );
}
