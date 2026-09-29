"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOBILE_TABS } from "@/lib/nav";
import { Icon } from "@/components/ui/Icon";

/** Barra inferior en móvil. Se oculta en el player para dejar la pantalla limpia. */
export function MobileTabs() {
  const pathname = usePathname();
  if (/^\/(movement|meditaciones|charlas)\/[^/]+\/?$/.test(pathname)) return null;

  return (
    <nav aria-label="Navegación rápida" className="fixed inset-x-0 bottom-0 z-40 border-t border-espresso/10 bg-cream md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <ul className="grid grid-cols-5">
        {MOBILE_TABS.map((t) => {
          const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
          return (
            <li key={t.href}>
              <Link href={t.href} aria-current={active ? "page" : undefined} className={`flex h-14 flex-col items-center justify-center gap-1 text-[10px] uppercase tracking-[0.1em] ${active ? "text-terracotta" : "text-cocoa"}`}>
                <Icon name={t.icon} size={20} />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
