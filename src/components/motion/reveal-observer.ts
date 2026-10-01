import { DUR, EASE_OUT_CSS, RISE, STAGGER, ms, prefersReducedMotion } from "@/lib/motion";

/**
 * Motor de las entradas al hacer scroll (Reveal, RevealHeading, RevealImage, RevealList).
 *
 * El contenido es VISIBLE por defecto: en el HTML estático, sin JS y con "reducir movimiento"
 * todo se ve. Al hidratar, un IntersectionObserver compartido revisa cada elemento: si ya está
 * en pantalla (o arriba) se deja tal cual; solo lo que sigue más abajo se oculta (opacity 0,
 * fuera de la vista, así no parpadea) y entra con Web Animations cuando aparece. Las
 * animaciones no dejan estilos al terminar (ni transform ni filter que rompan un `fixed`).
 */

export type RevealKind = "rise" | "fade" | "heading" | "image";

/** Grupo de filas (RevealList): `step` en segundos entre las que entran juntas. */
export type RevealGroup = { step?: number };

interface Target {
  el: HTMLElement;
  kind: RevealKind;
  /** ms */
  delay: number;
  /** Elementos del mismo grupo que entran juntos van en cascada (filas de RevealList). */
  group: RevealGroup;
  /** Ya pasó por la primera revisión (al hidratar). */
  checked: boolean;
  hidden: boolean;
  /** opacity inline que tenía antes de ocultarlo (para devolvérsela). */
  prevOpacity: string;
  io: IntersectionObserver;
}

const targets = new Map<Element, Target>();
const observers = new Map<number, IntersectionObserver>();

/**
 * Un observer por `amount`: entra cuando su borde superior pasa el `amount` inferior de la
 * pantalla (0.15 = al 85 % de la altura). Con margen y no con umbral, así un bloque más alto
 * que la pantalla también entra.
 */
function observerFor(amount: number): IntersectionObserver {
  const key = Math.round(amount * 100);
  let io = observers.get(key);
  if (!io) {
    io = new IntersectionObserver(onEntries, { rootMargin: `0px 0px -${key}% 0px`, threshold: 0 });
    observers.set(key, io);
  }
  return io;
}

function onEntries(entries: IntersectionObserverEntry[]) {
  // Filas del mismo grupo que entran en el mismo cuadro: 40 ms entre una y otra.
  const inBatch = new Map<RevealGroup, number>();
  for (const entry of entries) {
    const t = targets.get(entry.target);
    if (!t) continue;
    if (!t.checked) {
      t.checked = true;
      const r = entry.boundingClientRect;
      // Solo se oculta lo que está por debajo de la pantalla (o a la derecha, en un carrusel).
      // Lo visible, lo de arriba y lo que está en display:none se queda como está.
      const below = r.top >= window.innerHeight || r.left >= window.innerWidth;
      if (!below || (r.width === 0 && r.height === 0) || entry.isIntersecting) {
        release(t);
        continue;
      }
      hide(t);
      continue;
    }
    if (!entry.isIntersecting) continue;
    const n = inBatch.get(t.group) ?? 0;
    inBatch.set(t.group, n + 1);
    play(t, Math.min(n * (t.group.step ?? STAGGER.step), STAGGER.max));
    release(t);
  }
}

function hide(t: Target) {
  t.prevOpacity = t.el.style.opacity;
  t.el.style.opacity = "0";
  t.hidden = true;
}

function show(t: Target) {
  if (!t.hidden) return;
  t.el.style.opacity = t.prevOpacity;
  t.hidden = false;
}

function release(t: Target) {
  t.io.unobserve(t.el);
  targets.delete(t.el);
}

const RISE_FRAMES = (distance: string): Keyframe[] => [
  { opacity: 0, transform: `translateY(${distance})` },
  { opacity: 1, transform: "none" },
];

/** `extra`: retraso de la cascada, en segundos. */
function play(t: Target, extra: number) {
  show(t);
  const el = t.el;
  if (typeof el.animate !== "function" || prefersReducedMotion()) return;
  const delay = t.delay + ms(extra);
  const base: KeyframeAnimationOptions = { delay, easing: EASE_OUT_CSS, fill: "backwards" };

  switch (t.kind) {
    case "fade":
      el.animate([{ opacity: 0 }, { opacity: 1 }], { ...base, duration: ms(DUR.base) });
      return;
    case "rise":
      el.animate(RISE_FRAMES(RISE.block), { ...base, duration: ms(DUR.slow) });
      return;
    case "heading": {
      // Cada hijo directo es una línea (<span className="block">…); si no hay, sube el bloque entero.
      const lines = el.children.length > 1 ? Array.from(el.children) : [el];
      lines.forEach((line, i) => line.animate(RISE_FRAMES(RISE.heading), { ...base, delay: delay + i * 60, duration: ms(DUR.slow) }));
      return;
    }
    case "image": {
      el.animate([{ clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0 0 0 0)" }], { ...base, duration: ms(DUR.media) });
      el.querySelector("img")?.animate([{ transform: "scale(1.06)" }, { transform: "none" }], { ...base, duration: ms(DUR.settle) });
      return;
    }
  }
}

/**
 * Registra un elemento. Devuelve la función para soltarlo (al desmontar). Sin efecto con
 * "reducir movimiento" o en navegadores sin IntersectionObserver: el contenido queda visible.
 */
export function observeReveal(
  el: HTMLElement,
  { kind = "rise", delay = 0, amount = 0.15, group }: { kind?: RevealKind; delay?: number; amount?: number; group?: RevealGroup } = {},
): () => void {
  if (typeof IntersectionObserver === "undefined" || prefersReducedMotion()) return () => {};
  listenPrint();
  const io = observerFor(amount);
  const t: Target = { el, kind, delay: ms(delay), group: group ?? {}, checked: false, hidden: false, prevOpacity: "", io };
  targets.set(el, t);
  io.observe(el);
  return () => {
    if (targets.get(el) !== t) return;
    show(t);
    release(t);
  };
}

/** Al imprimir (o guardar como PDF), todo lo que seguía oculto aparece. */
let printing = false;
function listenPrint() {
  if (printing) return;
  printing = true;
  window.addEventListener("beforeprint", () => {
    for (const t of Array.from(targets.values())) {
      show(t);
      release(t);
    }
  });
}
