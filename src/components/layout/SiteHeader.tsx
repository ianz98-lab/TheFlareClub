"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV } from "@/lib/nav";
import { Icon } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? "bg-cream/85 shadow-[0_1px_0_0_rgba(58,49,43,0.06)] backdrop-blur-md" : "bg-cream"
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        <Link href="/" className="flex items-center" aria-label="The Flare Club, inicio">
          <Image
            src="/images/logo.png"
            alt="The Flare Club"
            width={927}
            height={391}
            priority
            className="h-10 w-auto lg:h-12"
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {NAV.filter((n) => n.href !== "/").map((n) => {
            const active = pathname === n.href || pathname.startsWith(n.href + "/");
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-full px-3 py-2 text-[14px] transition-colors ${
                  active ? "bg-cream-deep font-medium text-espresso" : "text-cocoa hover:text-espresso"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden md:block">
            <ButtonLink href="/cuenta" variant="ghost" size="sm">
              <Icon name="user" size={18} /> Mi cuenta
            </ButtonLink>
          </span>
          <ButtonLink href="/membresia" variant="terracotta" size="sm">
            Únete
          </ButtonLink>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            className="flex h-10 w-10 items-center justify-center rounded-full text-espresso hover:bg-cream-deep lg:hidden"
          >
            <Icon name={open ? "close" : "menu"} size={22} />
          </button>
        </div>
      </div>

      {/* Menú móvil a pantalla completa */}
      <div
        className={`fixed inset-x-0 top-16 bottom-0 z-40 bg-cream transition-opacity duration-200 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
      >
        <nav className="container-x flex h-full flex-col gap-1 overflow-y-auto py-4" aria-label="Menú móvil">
          {NAV.map((n, i) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                style={{ animationDelay: `${i * 30}ms` }}
                className={`rise flex items-center justify-between rounded-2xl px-4 py-3.5 font-display text-2xl ${
                  active ? "bg-cream-deep" : ""
                }`}
              >
                {n.label}
                <Icon name="arrow" size={18} className="text-terracotta" />
              </Link>
            );
          })}
          <div className="mt-auto flex gap-2 pb-24 pt-6">
            <ButtonLink href="/cuenta" variant="secondary" className="flex-1">
              Mi cuenta
            </ButtonLink>
            <ButtonLink href="/membresia" variant="terracotta" className="flex-1">
              Únete al club
            </ButtonLink>
          </div>
        </nav>
      </div>
    </header>
  );
}
