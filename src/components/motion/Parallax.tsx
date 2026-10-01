"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/*
 * Efectos ligados al scroll, sin librería de animación: un listener pasivo que solo escucha
 * mientras el elemento está en pantalla y escribe un transform por cuadro. Con "reducir
 * movimiento" no se registra nada (y `motion-reduce:` anula el transform por CSS desde el HTML).
 * Uso: solo en los heros de Inicio y Sobre nosotras (no en cada foto de cabecera).
 */

/** Llama a `update` en cada cuadro de scroll mientras `el` está en pantalla. */
function useScrollFrame(ref: RefObject<HTMLElement | null>, update: (rect: DOMRect) => void) {
  const updateRef = useRef(update);
  useEffect(() => {
    updateRef.current = update;
  });
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;
    let raf = 0;
    const frame = () => {
      raf = 0;
      updateRef.current(el.getBoundingClientRect());
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll, { passive: true });
        onScroll();
      } else {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ref]);
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Desplaza la foto más lento que el scroll (profundidad). `strength`: % de recorrido arriba y abajo. */
export function Parallax({ children, className = "", strength = 12 }: { children: ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useScrollFrame(ref, (r) => {
    // 0 cuando el borde superior asoma abajo; 1 cuando el inferior sale por arriba.
    const progress = clamp01((window.innerHeight - r.top) / (window.innerHeight + r.height));
    const y = -strength + 2 * strength * progress;
    if (inner.current) inner.current.style.transform = `translate3d(0, ${y.toFixed(2)}%, 0)`;
  });
  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <div ref={inner} className="absolute inset-x-0 motion-reduce:transform-none!" style={{ insetBlock: `-${strength + 2}%` }}>
        {children}
      </div>
    </div>
  );
}

/** Titular del hero que se desvanece y sube a medida que sale por arriba. */
export function HeroFade({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  // Desplazamiento aplicado: se descuenta al medir (el rect incluye el propio transform).
  const shift = useRef(0);
  useScrollFrame(ref, (r) => {
    const el = ref.current;
    if (!el) return;
    // 0 con el bloque arriba del todo; 1 cuando ya salió entero.
    const top = r.top - shift.current;
    const progress = r.height > 0 ? clamp01(-top / r.height) : 0;
    shift.current = -60 * progress;
    el.style.opacity = progress > 0 ? String(1 - clamp01(progress / 0.7)) : "";
    el.style.transform = progress > 0 ? `translate3d(0, ${shift.current.toFixed(1)}px, 0)` : "";
  });
  return (
    <div ref={ref} className={`motion-reduce:transform-none! ${className}`}>
      {children}
    </div>
  );
}
