import type { ComponentProps, ReactNode } from "react";

/**
 * Clases del chip, para cuando no es un <button> propio. Mismo alto en todos lados (44 px: cómodo con el
 * celular en el piso) y borde con 3:1 de contraste sin seleccionar. Seleccionado va en tinta, no en el
 * acento: con varios filtros activos el terracota dejaría de marcar la acción principal (D2-C).
 * Todo por rol (ink, line-input, press): dentro de .on-dark se invierte solo.
 */
export function chipClass(active: boolean, className = ""): string {
  const state = active
    ? "border-ink bg-ink text-on-ink active:border-ink-muted active:bg-ink-muted"
    : "border-line-input bg-transparent text-ink hover:border-ink active:border-ink active:bg-press";
  return `inline-flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-control border px-3.5 text-sm font-medium leading-tight transition-colors disabled:pointer-events-none disabled:opacity-(--opacity-disabled) ${state} ${className}`.trim();
}

/**
 * Filtro o selector de opción. Por defecto es un interruptor (aria-pressed = active). Con
 * `toggle={false}` solo toma el aspecto: para un botón que abre algo (pasar aria-expanded).
 */
export function Chip({
  active = false,
  toggle = true,
  className = "",
  children,
  type = "button",
  ...rest
}: { active?: boolean; toggle?: boolean; className?: string; children: ReactNode } & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button type={type} aria-pressed={toggle ? active : undefined} {...rest} className={chipClass(active, className)}>
      {children}
    </button>
  );
}
