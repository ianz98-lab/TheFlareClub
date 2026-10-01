"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ComponentProps } from "react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { NAV } from "@/lib/nav";
import { useAuth } from "@/lib/auth";
import { useMembership } from "@/lib/user-data";
import { useFocusTrap } from "@/lib/focus";
import { DUR, EASE_OUT, SPRING, STAGGER } from "@/lib/motion";
import { MEMBERSHIP } from "@/content/site";
import { Icon } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";

/** Rutas que viven dentro de una sección del menú (Arma tu rutina es parte de Movement). */
const ALIASES: Record<string, string[]> = { "/movement": ["/rutina"] };

/** Con 9 secciones el menú completo solo cabe desde xl (1280 px); debajo, hamburguesa. */
const DESKTOP_QUERY = "(min-width: 1280px)";

/**
 * "Inicio" entra al menú de escritorio solo desde 1360 px, donde cabe sin apretar
 * (entre 1280 y 1359 px el logo lleva a Inicio).
 */
const HOME_FITS = "max-[1360px]:hidden";

/**
 * Texto de la barra y de los accesos: 14 px en minúscula (las versalitas de .label quedan para la
 * meta). Además deja lugar para "Empezar gratis" junto al menú completo a 1280 px.
 */
const NAV_TEXT = "text-sm font-medium text-ink";

/** El CTA de MEMBERSHIP ("Empezar 7 días gratis") en corto: el largo no cabe junto al menú. */
const JOIN_LABEL = "Empezar gratis";

/** Bajo este scroll el header siempre se ve. */
const HIDE_AFTER = 120;
/** Recorrido mínimo para cambiar de estado: un temblor del dedo no lo hace parpadear. */
const SCROLL_SLACK = 6;

const LINE = "shadow-[0_1px_0_var(--color-line)]";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return [href, ...(ALIASES[href] ?? [])].some(
    (h) => pathname === h || pathname.startsWith(h + "/"),
  );
}

/**
 * Link de la barra de escritorio: se precarga al pasar el mouse o enfocarlo, no al aparecer
 * (las 9 secciones a la vez competían con la carga de la página).
 */
function IntentLink(props: ComponentProps<typeof Link>) {
  const [intent, setIntent] = useState(false);
  return (
    <Link
      {...props}
      prefetch={intent ? null : false}
      onMouseEnter={() => setIntent(true)}
      onFocus={() => setIntent(true)}
    />
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { status } = useAuth();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    if (returnFocus) toggleRef.current?.focus();
  }, []);

  // Al bajar se esconde y al subir vuelve. No se esconde con el foco de teclado adentro (quedaría tapado).
  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const read = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      setSolid(y > 24);
      if (y <= HIDE_AFTER) {
        setHidden(false);
        last = y;
        return;
      }
      const delta = y - last;
      if (Math.abs(delta) < SCROLL_SLACK) return;
      last = y;
      const keyboardInside = Boolean(headerRef.current?.querySelector(":focus-visible"));
      setHidden(delta > 0 && !keyboardInside);
    };
    // La primera lectura también va en un cuadro aparte (la página puede cargar ya bajada)
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // El estado va como atributo en <html> (no como variable): solo recalculan el header y lo que
  // usa .sticky-under-header o la variante header-hidden:, con la misma transición.
  const hide = hidden && !open;
  useEffect(() => {
    document.documentElement.dataset.header = hide ? "hidden" : "shown";
  }, [hide]);
  useEffect(
    () => () => {
      delete document.documentElement.dataset.header;
    },
    [],
  );

  // Menú abierto: lo de atrás queda inerte (salvo el header, con el botón que lo cierra), sin
  // scroll de fondo y Esc lo cierra. El foco se queda en el botón: el menú sigue en el orden del Tab.
  useFocusTrap(menuRef, open, {
    trap: false,
    keep: () => [headerRef.current],
    initialFocus: () => null,
    lockScroll: true,
    onEscape: () => close(true),
  });

  // Si la pantalla crece a desktop con el menú abierto, se cierra solo.
  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onWide = () => {
      if (mq.matches) close();
    };
    mq.addEventListener("change", onWide);
    return () => mq.removeEventListener("change", onWide);
  }, [open, close]);

  const signedIn = status === "signed-in";
  // Mientras se sabe si hay sesión, los accesos ocupan su lugar pero no se ven (sin parpadeo).
  const pending = status === "loading" ? "invisible" : "";

  return (
    <>
      <header
        ref={headerRef}
        // Si el foco de teclado entra con el header escondido, vuelve a verse
        onFocus={() => setHidden(false)}
        // Fondo liso (sin vidrio esmerilado); al bajar aparece un filete de 1 px, que se va con el header
        // cuando se oculta (si no, la sombra quedaba asomada arriba). Con el celular acostado y un video
        // corriendo se quita, para que el player use todo el alto.
        className={[
          "sticky top-0 z-(--z-header) bg-surface",
          "transition-[translate,box-shadow] duration-(--duration-base) ease-out-quint motion-reduce:transition-none",
          "header-hidden:-translate-y-full header-hidden:shadow-none",
          solid || open ? LINE : "",
          open ? "" : "landscape-short:playing:hidden",
        ].join(" ")}
      >
        {/* gap mínimo menor en el celular: con la letra al 200 % el logo y el menú no caben con 3rem entre ellos */}
        <div className="container-x flex h-(--header-h) items-center justify-between gap-4 sm:gap-6">
          <Link
            href="/"
            aria-label="The Flare Club, inicio"
            className="flex min-h-11 shrink-0 items-center"
          >
            {/* Tamaño real del archivo (480×210, 10 KB) y ancho mostrado: el navegador baja lo justo */}
            <Image
              src="/images/logo.png"
              alt="The Flare Club"
              width={480}
              height={210}
              sizes="(min-width: 1024px) 92px, 74px"
              loading="eager"
              className="h-8 w-auto lg:h-10"
            />
          </Link>

          {/* "Próximamente" de Cursos no va aquí: está en el menú móvil, en el pie y en la página */}
          <nav
            className="hidden items-center gap-x-[clamp(1rem,1.6vw,2rem)] xl:flex"
            aria-label="Principal"
          >
            {NAV.map((n) => {
              const active = isActive(pathname, n.href);
              return (
                <IntentLink
                  key={n.href}
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative whitespace-nowrap py-2 ${NAV_TEXT} ${n.href === "/" ? HOME_FITS : ""}`}
                >
                  {n.label}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-accent transition-transform duration-(--duration-base) ease-out-quint motion-reduce:transition-none ${active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
                  />
                </IntentLink>
              );
            })}
          </nav>

          <div className={`flex items-center gap-4 ${pending}`}>
            {signedIn ? (
              <Link
                href="/cuenta"
                aria-current={isActive(pathname, "/cuenta") ? "page" : undefined}
                className={`hidden min-h-11 items-center ${NAV_TEXT} hover:text-accent-ink md:inline-flex`}
              >
                Mi cuenta
              </Link>
            ) : (
              <>
                <Link
                  href="/cuenta/entrar"
                  className={`hidden min-h-11 items-center ${NAV_TEXT} hover:text-accent-ink md:inline-flex`}
                >
                  Entrar
                </Link>
                {/* En contorno: el header sale en todas las páginas y el terracota queda para la acción
                    principal de cada una (D2-C). max-sm:hidden (no "hidden"): el botón ya trae inline-flex y ganaría */}
                <ButtonLink href="/membresia" variant="outline" size="sm" className="max-sm:hidden">
                  {JOIN_LABEL}
                </ButtonLink>
              </>
            )}
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls={open ? "menu-movil" : undefined}
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              className="visible -mr-2 flex h-11 w-11 items-center justify-center text-ink xl:hidden"
            >
              <Icon name={open ? "close" : "menu"} size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Menú móvil: fuera del header (un transform en el header rompería el position: fixed) */}
      <AnimatePresence>
        {open && (
          <m.div
            key="menu"
            ref={menuRef}
            id="menu-movil"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.fast, ease: EASE_OUT }}
            className="fixed inset-x-0 top-(--header-h) bottom-0 z-(--z-menu) bg-surface xl:hidden"
          >
            <nav
              className="container-x flex h-full flex-col overflow-y-auto overscroll-contain"
              aria-label="Menú"
              data-lenis-prevent
            >
              <ul className="pt-1 pb-6">
                {NAV.map((n, i) => {
                  const active = isActive(pathname, n.href);
                  const delay = Math.min(i * STAGGER.step, STAGGER.max);
                  return (
                    <m.li
                      key={n.href}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        x: { ...SPRING.sheet, delay },
                        opacity: { duration: DUR.base, ease: EASE_OUT, delay },
                      }}
                      className="rule-soft first:border-t-0"
                    >
                      {/* text-display-lg nunca baja de 28 px: ahí el terracota del logo (accent) sí alcanza contraste */}
                      <Link
                        href={n.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`flex min-h-14 items-baseline gap-3 py-2.5 font-display text-display-lg transition-colors duration-(--duration-fast) active:text-accent ${active ? "text-accent" : ""}`}
                      >
                        {n.label}
                        {/* font-sans: la meta va en Hanken aunque el link sea Gloock */}
                        {n.note && (
                          <span className="label font-sans text-accent-ink">
                            {" "}
                            {n.note}
                          </span>
                        )}
                      </Link>
                    </m.li>
                  );
                })}
              </ul>
              <MenuAccount
                signedIn={signedIn}
                onNavigate={() => setOpen(false)}
              />
            </nav>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Accesos al pie del menú móvil. Se monta solo con el menú abierto, así la membresía
 * se consulta únicamente cuando hace falta (a una socia no se le ofrece la prueba gratis).
 */
function MenuAccount({
  signedIn,
  onNavigate,
}: {
  signedIn: boolean;
  /** Cierra el menú aunque el link sea la página actual */
  onNavigate: () => void;
}) {
  const { loading, membership } = useMembership();
  const offerTrial = !signedIn || (!loading && !membership);
  return (
    <div className="rule mt-auto grid gap-3 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
      {offerTrial && (
        <ButtonLink
          href="/membresia"
          onClick={onNavigate}
          size="lg"
          className="w-full"
        >
          {MEMBERSHIP.cta}
        </ButtonLink>
      )}
      <ButtonLink
        href={signedIn ? "/cuenta" : "/cuenta/entrar"}
        onClick={onNavigate}
        variant={offerTrial ? "outline" : "primary"}
        size="lg"
        className="w-full"
      >
        {signedIn ? "Mi cuenta" : "Entrar"}
      </ButtonLink>
    </div>
  );
}
