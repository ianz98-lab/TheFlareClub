"use client";

import { useEffect, useRef, type HTMLAttributes, type ReactNode, type Ref } from "react";
import { observeReveal, type RevealKind } from "./reveal-observer";

/*
 * Entradas al hacer scroll, sin librería de animación (ver reveal-observer.ts): el contenido
 * llega visible en el HTML y solo lo que empieza bajo el primer pantallazo entra animado.
 * Una primitiva por tipo de contenido; no envolver párrafos largos, biografías ni formularios.
 * Para lo que está en el primer pantallazo (hero) usar la clase CSS `.hero-in`, que corre
 * antes de hidratar.
 */

type Common = Omit<HTMLAttributes<HTMLElement>, "style" | "children"> & {
  children?: ReactNode;
  /** Segundos de espera antes de entrar. */
  delay?: number;
  /** Cuánto debe subir en la pantalla antes de entrar (0.15 = cuando su borde pasa el 85 % de la altura). */
  amount?: number;
};

function useReveal(kind: RevealKind, delay: number, amount: number) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    return el ? observeReveal(el, { kind, delay, amount }) : undefined;
  }, [kind, delay, amount]);
  return ref;
}

type BlockTag = "div" | "section" | "article" | "aside" | "header" | "footer" | "li" | "span" | "p" | "figure";

/** Bloques cortos (tarjetas, CTAs, una cita): suben 1rem y aparecen. `kind="fade"`: solo opacidad. */
export function Reveal({ as = "div", kind = "rise", delay = 0, amount = 0.15, children, ...rest }: Common & { as?: BlockTag; kind?: "rise" | "fade" }) {
  const ref = useReveal(kind, delay, amount);
  const Tag = as as "div";
  return (
    <Tag ref={ref as Ref<HTMLDivElement>} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * Titulares (h1/h2 principales): suben 0.4em por líneas. Cada hijo directo es una línea:
 * `<RevealHeading as="h2"><span className="block">Todo cambia</span><span className="block">…</span></RevealHeading>`.
 * Con texto corrido, sube el titular entero.
 */
export function RevealHeading({ as = "h2", delay = 0, amount = 0.15, children, ...rest }: Common & { as?: "h1" | "h2" | "h3" | "p" | "div" }) {
  const ref = useReveal("heading", delay, amount);
  const Tag = as as "h2";
  return (
    <Tag ref={ref as Ref<HTMLHeadingElement>} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * Fotos: cortina que sube (clip-path) y la imagen se asienta de 1.06 a 1. Envuelve el
 * contenedor de la foto (el que tiene `relative` y el tamaño), no la <Image> suelta.
 */
export function RevealImage({ as = "div", delay = 0, amount = 0.15, children, ...rest }: Common & { as?: "div" | "figure" | "span" }) {
  const ref = useReveal("image", delay, amount);
  const Tag = as as "div";
  return (
    <Tag ref={ref as Ref<HTMLDivElement>} {...rest}>
      {children}
    </Tag>
  );
}

type ListProps = Omit<Common, "delay"> & {
  as?: "div" | "ul" | "ol" | "section";
  /** Segundos entre filas que entran juntas (por defecto 0.04; el total nunca pasa de 0.25). */
  step?: number;
};

/**
 * Filas de una lista o grilla: cada hijo directo aparece (solo opacidad) cuando llega a la
 * pantalla; las que llegan juntas, con 40 ms entre una y otra (250 ms como máximo).
 * Se registran al montar: las filas que se agregan después (filtros) aparecen sin animación.
 */
export function RevealList({ as = "div", amount = 0.15, step, children, ...rest }: ListProps) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    const group = { step };
    const stops = Array.from(list.children).map((row) => observeReveal(row as HTMLElement, { kind: "fade", amount, group }));
    return () => stops.forEach((stop) => stop());
  }, [amount, step]);
  const Tag = as as "div";
  return (
    <Tag ref={ref as Ref<HTMLDivElement>} {...rest}>
      {children}
    </Tag>
  );
}
