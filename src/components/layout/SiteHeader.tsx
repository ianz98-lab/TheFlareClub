"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV } from "@/lib/nav";
import { Icon } from "@/components/ui/Icon";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-espresso/10 bg-cream">
      <div className="container-x flex h-16 items-center justify-between gap-6 lg:h-20">
        <Link href="/" aria-label="The Flare Club, inicio" className="shrink-0">
          <Image src="/images/logo.png" alt="The Flare Club" width={1600} height={675} priority className="h-8 w-auto lg:h-10" />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Principal">
          {NAV.filter((n) => n.href !== "/").map((n) => {
            const active = pathname === n.href || pathname.startsWith(n.href + "/");
            return (
              <Link key={n.href} href={n.href} className={`label py-2 transition-colors hover:text-terracotta ${active ? "text-terracotta" : "text-espresso"}`}>
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-5">
          <Link href="/cuenta" className="label hidden hover:text-terracotta md:block">
            Mi cuenta
          </Link>
          <Link href="/membresia" className="label hidden border border-espresso px-4 py-2.5 transition-colors hover:bg-espresso hover:text-cream sm:block">
            Únete
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            className="flex h-10 w-10 items-center justify-center text-espresso lg:hidden"
          >
            <Icon name={open ? "close" : "menu"} size={22} />
          </button>
        </div>
      </div>

      <div className={`fixed inset-x-0 top-16 bottom-0 z-40 bg-cream transition-opacity duration-200 lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} aria-hidden={!open}>
        <nav className="container-x flex h-full flex-col overflow-y-auto pt-2" aria-label="Menú móvil">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`rule-soft flex items-center justify-between py-4 font-display text-3xl ${pathname === n.href ? "text-terracotta" : ""}`}>
              {n.label}
            </Link>
          ))}
          <div className="rule-soft mt-auto grid grid-cols-2 gap-3 py-6 pb-24">
            <Link href="/cuenta" className="label border border-espresso py-3.5 text-center">
              Mi cuenta
            </Link>
            <Link href="/membresia" className="label bg-espresso py-3.5 text-center text-cream">
              Únete
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
