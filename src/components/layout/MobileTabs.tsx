"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MOBILE_TABS } from "@/lib/nav";
import { Icon } from "@/components/ui/Icon";

/** Rutas que cuentan como parte de una pestaña (Arma tu rutina vive en Movement). */
const ALIASES: Record<string, string[]> = { "/movement": ["/rutina"] };

/** Campos que abren el teclado del celular. */
function opensKeyboard(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return true;
  return el instanceof HTMLInputElement && !["checkbox", "radio", "button", "submit", "reset", "range", "color", "file"].includes(el.type);
}

/**
 * Barra inferior en móvil. Se esconde solo mientras corre un video (los players ponen
 * data-playing en <html>: la barra sigue en la ficha antes de dar play y vuelve en "Bien hecho.")
 * y mientras se escribe (no estorba al teclado).
 */
export function MobileTabs() {
  const pathname = usePathname();
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const onIn = (e: FocusEvent) => setTyping(opensKeyboard(e.target));
    const onOut = (e: FocusEvent) => {
      // Pasar de un campo a otro no debe hacer parpadear la barra.
      if (!opensKeyboard(e.relatedTarget)) setTyping(false);
    };
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => {
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
    };
  }, []);

  return (
    <nav
      aria-label="Navegación rápida"
      inert={typing}
      className={`fixed inset-x-0 bottom-0 z-(--z-tabbar) border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] transition-transform duration-(--duration-fast) ease-out-quint motion-reduce:transition-none md:hidden playing:hidden ${typing ? "translate-y-full" : ""}`}
    >
      <ul className="grid grid-cols-5">
        {MOBILE_TABS.map((t) => {
          const active =
            t.href === "/"
              ? pathname === "/"
              : [t.href, ...(ALIASES[t.href] ?? [])].some((h) => pathname === h || pathname.startsWith(h + "/"));
          return (
            <li key={t.href} className="min-w-0">
              {/*
               * 12 px en minúscula ("Movement" mide 62 px y la celda 64 a 320 px). El tope en vw evita
               * que, con la letra del navegador agrandada, una palabra invada la pestaña vecina. Por si acaso
               * (otra fuente, otra etiqueta), la celda no crece (min-w-0) y la etiqueta se parte dentro de
               * ella en vez de empujar la barra: la barra nunca agrega scroll horizontal.
               * Pestaña actual: tinta (no atenuada) y una barra de 2 px en el acento arriba, como el subrayado
               * del header de escritorio. No solo el matiz: con daltonismo o al sol se distingue igual (WCAG 1.4.1).
               */}
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex h-(--tabbar-h) min-w-0 flex-col items-center justify-center gap-1 text-center text-[min(0.75rem,3.75vw)] leading-none font-medium tracking-[0.02em] active:text-ink ${
                  active ? "text-ink before:absolute before:inset-x-4 before:top-0 before:h-0.5 before:bg-accent" : "text-ink-muted"
                }`}
              >
                <Icon name={t.icon} size={20} className="shrink-0" />
                <span className="max-w-full wrap-break-word">{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
