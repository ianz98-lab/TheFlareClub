import { useEffect, useEffectEvent, type RefObject } from "react";

/*
 * Manejo de foco compartido para overlays (menú móvil, hoja de filtros, visor de fotos, diálogos):
 * - trapFocus: el Tab no sale del overlay.
 * - inertOutside: lo de atrás queda inerte (sin foco, clic ni lector de pantalla), así el lector no
 *   recorre el contenido tapado aunque el overlay no sea un <dialog>.
 * - useFocusTrap: las dos cosas más Esc, bloqueo de scroll y devolución del foco al cerrar.
 */

const FOCUSABLE = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "audio[controls]",
  "video[controls]",
  "summary",
  "[contenteditable]:not([contenteditable='false'])",
  "[tabindex]",
].join(",");

/** Lo que se alcanza con Tab dentro de `root`, en orden del documento (solo lo visible). */
export function getFocusable(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.tabIndex >= 0 && !el.closest("[inert]") && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden",
  );
}

type TabKeyEvent = Pick<KeyboardEvent, "key" | "shiftKey" | "preventDefault">;

/**
 * Mantiene el Tab dentro de `root`. Llamar desde un keydown (nativo o de React); ignora las otras
 * teclas. Devuelve true si movió el foco.
 */
export function trapFocus(ev: TabKeyEvent, root: HTMLElement | null): boolean {
  if (ev.key !== "Tab" || !root) return false;
  const items = getFocusable(root);
  if (!items.length) {
    // Nada enfocable adentro: el foco se queda donde está (en el propio overlay)
    ev.preventDefault();
    return true;
  }
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;

  const move = (el: HTMLElement) => {
    ev.preventDefault();
    el.focus();
    return true;
  };

  if (!(active instanceof HTMLElement) || !root.contains(active)) return move(ev.shiftKey ? last : first);
  if (items.includes(active)) {
    if (ev.shiftKey && active === first) return move(last);
    if (!ev.shiftKey && active === last) return move(first);
    return false;
  }
  // El foco está en algo no tabulable del overlay (el contenedor con tabIndex=-1, un título enfocado):
  // si no hay nada después (o antes, con Shift), da la vuelta.
  const follows = (el: HTMLElement) => Boolean(active.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
  if (!ev.shiftKey && !items.some(follows)) return move(first);
  if (ev.shiftKey && items.every(follows)) return move(last);
  return false;
}

// Nunca se vuelven inertes: no se ven ni se enfocan, o anuncian cambios (el anunciador de rutas de Next).
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "LINK", "TEMPLATE", "NOSCRIPT", "NEXT-ROUTE-ANNOUNCER"]);

/**
 * Deja inerte todo lo que está fuera de `root`: los hermanos de `root` y de cada ancestro hasta <body>.
 * `keep`: elementos que siguen activos aunque estén fuera (p. ej. el header con el botón que abre el
 * menú); se respeta todo el hermano que los contiene. Devuelve la función que lo deshace, y solo
 * deshace lo que cambió (lo que ya estaba inerte sigue así).
 */
export function inertOutside(root: HTMLElement, keep: ReadonlyArray<Element | null | undefined> = []): () => void {
  const kept = keep.filter((el): el is Element => Boolean(el));
  const changed: HTMLElement[] = [];
  let node: HTMLElement = root;
  while (node.parentElement && node !== document.body) {
    for (const sibling of Array.from(node.parentElement.children)) {
      if (sibling === node || !(sibling instanceof HTMLElement) || sibling.inert) continue;
      if (SKIP_TAGS.has(sibling.tagName) || sibling.hasAttribute("aria-live")) continue;
      if (kept.some((k) => sibling === k || sibling.contains(k))) continue;
      sibling.inert = true;
      changed.push(sibling);
    }
    node = node.parentElement;
  }
  return () => {
    for (const el of changed) el.inert = false;
  };
}

export interface FocusTrapOptions {
  /** Tab no sale del overlay (diálogos, hojas, visor). false para un menú que deja pasar al header. */
  trap?: boolean;
  /** El resto de la página queda inerte mientras está abierto. */
  inert?: boolean;
  /** Elementos de afuera que siguen activos (se leen al abrir). */
  keep?: () => ReadonlyArray<Element | null | undefined>;
  /**
   * A dónde va el foco al abrir. Por defecto: el contenedor si tiene tabIndex, si no lo primero
   * enfocable. Devolver null para no moverlo (p. ej. el foco se queda en el botón que abrió).
   */
  initialFocus?: () => HTMLElement | null;
  /** Al cerrar, el foco vuelve a donde estaba al abrir (si sigue en la página). */
  restoreFocus?: boolean;
  /** Bloquea el scroll de la página (compensando el ancho de la barra para que nada salte). */
  lockScroll?: boolean;
  onEscape?: () => void;
}

/**
 * Contención de foco para un overlay mientras `active` es true. `ref` apunta al contenedor del overlay
 * (que ya debe estar montado cuando `active` pasa a true).
 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean, options: FocusTrapOptions = {}) {
  const read = useEffectEvent(() => options);
  const escape = useEffectEvent(() => options.onEscape?.());

  useEffect(() => {
    const root = ref.current;
    if (!active || !root) return;
    const { trap = true, inert = true, keep, initialFocus, restoreFocus = true, lockScroll = false } = read();
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const release = inert ? inertOutside(root, keep?.() ?? []) : undefined;

    const target = initialFocus ? initialFocus() : root.hasAttribute("tabindex") ? root : (getFocusable(root)[0] ?? null);
    target?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        escape();
        return;
      }
      if (trap) trapFocus(e, root);
    };
    document.addEventListener("keydown", onKey);

    const body = document.body;
    const prev = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    if (lockScroll) {
      const gap = window.innerWidth - document.documentElement.clientWidth;
      body.style.overflow = "hidden";
      if (gap > 0) body.style.paddingRight = `${gap}px`;
    }

    return () => {
      document.removeEventListener("keydown", onKey);
      release?.();
      if (lockScroll) {
        body.style.overflow = prev.overflow;
        body.style.paddingRight = prev.paddingRight;
      }
      if (restoreFocus && previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [active, ref]);
}
