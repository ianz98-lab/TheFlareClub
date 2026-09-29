"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { NAV } from "@/lib/nav";
import { Icon } from "@/components/ui/Icon";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 120 && !open);
    setSolid(y > 24);
  });

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--header-h",
      hidden ? "0px" : "",
    );
  }, [hidden]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.header
        animate={{ y: hidden && !open ? "-100%" : "0%" }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={`sticky top-0 z-40 transition-[background-color,box-shadow] duration-300 ${solid || open ? "bg-cream/90 shadow-[0_1px_0_rgba(47,40,35,0.08)] backdrop-blur-md" : "bg-cream"}`}
      >
        <div className="container-x flex h-16 items-center justify-between gap-6 lg:h-20">
          <Link
            href="/"
            aria-label="The Flare Club, inicio"
            className="shrink-0"
          >
            <Image
              src="/images/logo.png"
              alt="The Flare Club"
              width={1600}
              height={675}
              priority
              className="h-8 w-auto lg:h-10"
            />
          </Link>

          <nav
            className="hidden items-center gap-7 lg:flex"
            aria-label="Principal"
          >
            {NAV.filter((n) => n.href !== "/").map((n) => {
              const active =
                pathname === n.href || pathname.startsWith(n.href + "/");
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className="label group relative py-2 text-espresso"
                >
                  {n.label}
                  <span
                    className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-terracotta transition-transform duration-300 ${active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/rutina"
              className="label hidden rounded-md bg-espresso px-4 py-2.5 text-cream transition-colors hover:bg-terracotta sm:block"
            >
              Arma tu rutina
            </Link>
            <Link
              href="/cuenta"
              className="label hidden hover:text-terracotta md:block"
            >
              Mi cuenta
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
      </motion.header>

      {/* Menú móvil: fuera del header animado (un transform rompería el position: fixed) */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-16 bottom-0 z-[45] bg-cream lg:hidden"
          >
            <nav
              className="container-x flex h-full flex-col overflow-y-auto pt-2"
              aria-label="Menú móvil"
            >
              {NAV.map((n, i) => (
                <motion.div
                  key={n.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.04 * i,
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <Link
                    href={n.href}
                    className={`rule-soft flex items-center justify-between py-4 font-display text-3xl ${pathname === n.href ? "text-terracotta" : ""}`}
                  >
                    {n.label}
                  </Link>
                </motion.div>
              ))}
              <div className="rule-soft mt-auto grid grid-cols-2 gap-3 py-6 pb-24">
                <Link
                  href="/cuenta"
                  className="label rounded-md border border-espresso py-3.5 text-center"
                >
                  Mi cuenta
                </Link>
                <Link
                  href="/rutina"
                  className="label rounded-md bg-espresso py-3.5 text-center text-cream"
                >
                  Arma tu rutina
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
