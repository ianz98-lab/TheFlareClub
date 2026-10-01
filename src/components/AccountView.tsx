"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FormNote } from "@/components/ui/form";
import { Icon } from "@/components/ui/Icon";
import { coursesLive } from "@/content/site";
import { workbooks } from "@/content/workbooks";
import { useAuth, type Account } from "@/lib/auth";
import { prefersReducedMotion } from "@/lib/motion";
import { isLiveMembership, noteCheckoutReturn, useFavorites, useHistory, useMembership, type Membership } from "@/lib/user-data";
import { ContinueWatching, continueItems, favoriteItems, FavoritesPanel, WatchedPanel, watchedItems } from "@/components/account/ActivityPanels";
import { ACCOUNT_COPY, ACCOUNT_PHOTOS } from "@/components/account/copy";
import { MembershipLine, MembershipPanel, nextCharge } from "@/components/account/MembershipPanel";
import { MyCourses, MyEvents, ownedCourses, ownedEvents } from "@/components/account/PurchasesPanels";
import { ContactTail, hasContact } from "@/components/account/portal-ui";
import { RoutinesPanel, useRoutineRows } from "@/components/account/RoutinesPanel";
import { SettingsPanel } from "@/components/account/SettingsPanel";
import { AccountSkeleton, SignedOutView } from "@/components/account/SignedOutView";
import { StartHere } from "@/components/account/StartHere";
import { WorkbooksPanel } from "@/components/account/WorkbooksPanel";
import { usePendingPlan } from "@/components/account/pending-plan";

/**
 * Mi cuenta. Todo corre en el cliente (export estático): la sesión viene de `useAuth`
 * (Supabase o modo demo) y la actividad de `user-data` (favoritos, historial, membresía, compras).
 * Parámetros: `?bienvenida=1` (recién registrada), `?reactivada=1` (volvió a activar su membresía),
 * `?pago=ok` (volvió de Recurrente), `?correo=confirmado` / `?enlace=vencido` (los deja AuthProvider
 * al verificar el enlace del correo) y `?code=…` (enlace de confirmación del flujo anterior de Supabase).
 */
export function AccountView() {
  const { status, account } = useAuth();
  const params = useSearchParams();

  if (status === "loading") return <AccountSkeleton />;
  if (status === "signed-out" || !account) {
    return <SignedOutView justConfirmed={params.has("code")} expiredLink={params.get("enlace") === "vencido"} />;
  }
  return <Portal account={account} />;
}

type SectionId = "empieza" | "continuar" | "rutinas" | "favoritos" | "cursos" | "eventos" | "vistas" | "workbooks" | "membresia" | "ajustes";

/** Nombre de cada sección en el índice (el mismo que su título). */
const SECTION_LABEL: Record<SectionId, string> = {
  empieza: "Empieza aquí",
  continuar: "Continuar viendo",
  rutinas: "Tus rutinas",
  favoritos: "Tus favoritos",
  cursos: "Tus cursos",
  eventos: "Tus eventos",
  vistas: "Lo que ya viste",
  workbooks: "Workbooks",
  membresia: "Tu membresía",
  ajustes: "Ajustes",
};

function Portal({ account }: { account: Account }) {
  const { mode } = useAuth();
  const params = useSearchParams();
  const backFromCheckout = params.get("pago") === "ok";
  // Se lee una vez: al cerrar el aviso se limpia la URL, pero el saludo no cambia de golpe.
  const [welcome] = useState(() => params.get("bienvenida") === "1");
  const { loading, membership, purchases, confirming } = useMembership();
  const history = useHistory();
  const favs = useFavorites();
  const routines = useRoutineRows();
  const first = account.fullName.trim().split(/\s+/)[0] ?? "";

  const continuing = continueItems(history);
  const watched = watchedItems(history);
  const favorites = favoriteItems(favs);
  // Mientras cargan las compras (Supabase) no se cuentan: lo común en una cuenta nueva es no tener.
  const known = loading ? [] : purchases;
  const courses = ownedCourses(known);
  const events = ownedEvents(known);
  // Cuenta nueva: en vez de cinco estados vacíos seguidos, "Empieza aquí" con lo que puede empezar ya.
  const isNew = !continuing.length && !watched.length && !favorites.length && !routines.length && !known.length;

  // Orden por uso: lo que retoma primero; membresía y ajustes al final. Lo vacío no se pinta (ni en el índice).
  const show: Record<SectionId, boolean> = {
    empieza: isNew,
    continuar: continuing.length > 0,
    rutinas: !isNew,
    favoritos: favorites.length > 0,
    // Los cursos siguen "Próximamente": la sección aparece si abren o si ya compró uno.
    cursos: coursesLive() || courses.length > 0,
    eventos: events.length > 0,
    vistas: watched.length > 0,
    workbooks: workbooks.length > 0,
    membresia: true,
    ajustes: true,
  };
  const sections = (Object.keys(SECTION_LABEL) as SectionId[]).filter((id) => show[id]);

  // Links a una sección (/cuenta#eventos): las secciones se pintan en el cliente, así que el
  // navegador no alcanza a bajar solo; se baja cuando ya están.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id || loading) return;
    const raf = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
    return () => cancelAnimationFrame(raf);
  }, [loading]);

  // Volvió de pagar: mientras llega la confirmación de Recurrente no se ofrece otro pago.
  useEffect(() => {
    if (backFromCheckout) noteCheckoutReturn();
  }, [backFromCheckout]);

  return (
    <>
      {/* Superficie neutra, sin banda de color (D2-C). En desktop, una foto al lado del saludo pone el
          calor; en el celular no se muestra, para que "Continuar viendo" quede cerca. */}
      <section>
        <div className="container-x pb-10 pt-10 md:pb-12 md:pt-14 lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end lg:gap-16 lg:pb-14 lg:pt-16 xl:grid-cols-[minmax(0,1fr)_26rem]">
          <div className="min-w-0">
            <Notice key={params.toString()} membership={membership} loading={loading} confirming={confirming} />
            <h1 className="max-w-4xl font-display text-display-xl">
              {welcome ? (first ? `Te damos la bienvenida, ${first}.` : "Te damos la bienvenida.") : first ? `Hola, ${first}.` : "Hola."}
            </h1>
            <p className="mt-3 text-body-sm text-ink-muted [overflow-wrap:anywhere]">{account.email}</p>
            <MembershipLine loading={loading} membership={membership} confirming={confirming} />
            {mode === "demo" && (
              <FormNote rule className="mt-6 max-w-md">
                {ACCOUNT_COPY.demo}
              </FormNote>
            )}
          </div>
          <div className="relative hidden aspect-[4/3] overflow-hidden rounded-media bg-surface-alt lg:block">
            {/* Decorativa. Sin precarga: solo existe desde lg y el celular no la descarga */}
            <Image
              src={ACCOUNT_PHOTOS.portal.src}
              alt=""
              fill
              sizes="(min-width: 1280px) 416px, 288px"
              fetchPriority="high"
              className="object-cover"
              style={ACCOUNT_PHOTOS.portal.focal ? { objectPosition: ACCOUNT_PHOTOS.portal.focal } : undefined}
            />
          </div>
        </div>
      </section>

      <SectionNav items={sections.map((id) => ({ id, label: SECTION_LABEL[id] }))} />

      {show.empieza && <StartHere />}
      {show.continuar && <ContinueWatching items={continuing} />}
      {show.rutinas && <RoutinesPanel rows={routines} />}
      {show.favoritos && <FavoritesPanel items={favorites} />}
      {show.cursos && <MyCourses courses={courses} />}
      {show.eventos && <MyEvents events={events} />}
      {show.vistas && <WatchedPanel items={watched} />}
      {show.workbooks && <WorkbooksPanel purchases={known} />}
      <MembershipPanel loading={loading} membership={membership} confirming={confirming} />
      <SettingsPanel account={account} />
    </>
  );
}

/**
 * Índice de secciones, fijo bajo el header (sube con él cuando el header se oculta), con la sección
 * visible marcada. Escribe su alto en --subheader-h para que los #anclas y el foco queden debajo.
 */
function SectionNav({ items }: { items: { id: string; label: string }[] }) {
  const navRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const ids = items.map((i) => i.id).join(" ");

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const root = document.documentElement.style;
    const ro = new ResizeObserver(() => root.setProperty("--subheader-h", `${nav.offsetHeight}px`));
    ro.observe(nav);
    return () => {
      ro.disconnect();
      root.setProperty("--subheader-h", "0px");
    };
  }, []);

  // Sección actual: la última cuyo inicio ya pasó un tercio de la pantalla (al fondo, la última).
  useEffect(() => {
    const els = ids
      .split(" ")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (!els.length) return;
    let raf = 0;
    const pick = () => {
      raf = 0;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      const line = window.innerHeight / 3;
      let current: string | null = null;
      for (const el of els) if (el.getBoundingClientRect().top <= line) current = el.id;
      setActive(atBottom && current ? els[els.length - 1].id : current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(pick);
    };
    pick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);

  // En el celular el índice es una fila con scroll: la sección actual siempre queda a la vista.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    // De vuelta arriba (ninguna sección actual): el índice vuelve a empezar por la primera
    if (!active) {
      list.scrollTo({ left: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
      return;
    }
    const link = list.querySelector<HTMLElement>(`a[href="#${active}"]`);
    if (!link) return;
    const box = list.getBoundingClientRect();
    const { left, right } = link.getBoundingClientRect();
    if (left >= box.left && right <= box.right) return;
    const pad = parseFloat(getComputedStyle(list).scrollPaddingLeft) || 0;
    list.scrollTo({ left: list.scrollLeft + left - box.left - pad, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [active]);

  return (
    <nav ref={navRef} aria-label="Secciones de tu cuenta" className="sticky-under-header sticky z-(--z-sticky) border-b border-line bg-surface">
      <ul ref={listRef} className="container-x scroll-row scroll-px-(--gutter) gap-7">
        {items.map((s) => {
          const on = s.id === active;
          return (
            <li key={s.id}>
              {/* La sección actual: tinta y subrayado en el acento (estado activo, la única marca de color del índice) */}
              <a
                href={`#${s.id}`}
                aria-current={on ? "true" : undefined}
                className={`inline-flex h-12 items-center whitespace-nowrap text-sm font-medium underline-offset-8 transition-colors duration-(--duration-fast) hover:text-ink ${
                  on ? "text-ink underline decoration-accent decoration-2" : "text-ink-muted"
                }`}
              >
                {s.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * Avisos de llegada: bienvenida, membresía reactivada, correo confirmado o pago en confirmación.
 * Solo el dato y, si hace falta, la acción: el saludo ya lo dice el título. Se pueden cerrar.
 */
function Notice({ membership, loading, confirming }: { membership: Membership | null; loading: boolean; confirming: boolean }) {
  const params = useSearchParams();
  const router = useRouter();
  const pending = usePendingPlan();
  const [closed, setClosed] = useState(false);

  const charge = membership ? nextCharge(membership) : null;
  const chargeText = charge ? `Próximo cobro: ${charge}.` : null;

  let title: string | null = null;
  let text: ReactNode = null;

  if (params.get("pago") === "ok") {
    const arrived = !loading && !confirming && isLiveMembership(membership);
    if (arrived) {
      title = "¡Listo! Tu membresía está activa.";
      text = chargeText;
    } else {
      title = "Estamos confirmando tu pago…";
      if (loading) text = null;
      else if (confirming) text = "Puede tardar unos segundos.";
      else
        text = (
          <>
            Está tardando más de lo normal.{" "}
            <button type="button" onClick={() => window.location.reload()} className="link text-ink">
              Actualiza la página
            </button>{" "}
            en unos minutos
            {hasContact && (
              <>
                {" "}o escríbenos
                <ContactTail />
              </>
            )}
            .
          </>
        );
    }
  } else if (params.get("reactivada") === "1") {
    title = "Tu membresía está activa de nuevo.";
    text = chargeText;
  } else if (params.get("bienvenida") === "1") {
    if (membership?.status === "trialing") {
      title = "Tu prueba gratis de 7 días ya empezó.";
      // La fecha ya está en la línea de la membresía, justo debajo del saludo.
      text = "Puedes cancelarla cuando quieras desde Tu membresía.";
    } else {
      title = "Tu cuenta ya quedó creada.";
    }
  } else if (params.has("code") || params.get("correo") === "confirmado") {
    title = "Tu correo quedó confirmado.";
    text = pending ? `Sigue con tu plan ${pending.name} en Tu membresía.` : "Ya puedes guardar favoritos y retomar tus clases.";
  }

  if (!title || closed) return null;

  return (
    <div role="status" className="mb-8 flex items-start justify-between gap-4 border-y border-line-strong py-4">
      {/* El aviso es UI (Hanken): el único título en Gloock de la cabecera es el saludo, justo debajo */}
      <div>
        <p className="text-base font-medium leading-snug sm:text-lead">{title}</p>
        {text && <p className="mt-1 text-body-sm text-ink-muted">{text}</p>}
      </div>
      <button
        type="button"
        onClick={() => {
          setClosed(true);
          router.replace("/cuenta", { scroll: false });
        }}
        aria-label="Cerrar aviso"
        className="-mr-2 -my-2.5 flex size-11 shrink-0 items-center justify-center text-ink-muted transition-colors hover:text-ink active:text-ink"
      >
        <Icon name="close" size={18} />
      </button>
    </div>
  );
}
