"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOBILE_TABS } from "@/lib/nav";
import { Icon } from "@/components/ui/Icon";

/** Barra inferior tipo app: siempre a la mano mientras entrenas. */
export function MobileTabs() {
  const pathname = usePathname();
  // Ocultar en el player para dar pantalla completa
  if (/^\/(movement|meditaciones|charlas)\/[^/]+$/.test(pathname)) return null;

  return (
    <nav
      aria-label="Navegación rápida"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-sand/60 bg-cream/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {MOBILE_TABS.map((t) => {
          const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-[60px] flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                  active ? "text-terracotta" : "text-cocoa"
                }`}
              >
                <span
                  className={`flex h-7 w-11 items-center justify-center rounded-full transition-colors ${
                    active ? "bg-terracotta/10" : ""
                  }`}
                >
                  <Icon name={t.icon} size={21} />
                </span>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
