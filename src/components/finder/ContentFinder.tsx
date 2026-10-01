"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, useDragControls } from "motion/react";
import * as m from "motion/react-m";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { LayoutMotion } from "@/components/motion/MotionProvider";
import { useFocusTrap } from "@/lib/focus";
import { DUR, EASE_OUT, SPRING, prefersReducedMotion } from "@/lib/motion";
import { useBarHeight } from "./use-bar-height";
import { replaceUrlSearch, useUrlSearch } from "./use-url-search";

export interface FinderOption {
  value: string;
  label: string;
}
export interface FinderFacet<T> {
  key: string;
  label: string;
  options: FinderOption[];
  /** true = varias opciones a la vez (OR) */
  multi?: boolean;
  match: (item: T, values: string[]) => boolean;
}
export interface FinderTab<T> {
  value: string;
  label: string;
  match?: (item: T) => boolean;
}
export interface FinderSort<T> {
  value: string;
  label: string;
  cmp: (a: T, b: T) => number;
}

export interface ContentFinderProps<T> {
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  tabs?: FinderTab<T>[];
  tabParam?: string;
  facets: FinderFacet<T>[];
  search?: (item: T, q: string) => boolean;
  searchPlaceholder?: string;
  sorts?: FinderSort<T>[];
  pageSize?: number;
  noun?: [string, string];
  emptyText?: string;
  gridClass?: string;
  /**
   * Título de la grilla solo para lector de pantalla (las tarjetas son h3 y necesitan un h2 encima).
   * null si la página ya pone un h2 justo arriba del buscador.
   */
  resultsHeading?: string | null;
}

/** Filtros agrupados: cada grupo se anuncia con su nombre ("Duración", "Enfoque"). */
function FacetRows<T>({ facets, selected, onToggle, inSheet = false }: { facets: FinderFacet<T>[]; selected: Record<string, string[]>; onToggle: (f: FinderFacet<T>, value: string) => void; inSheet?: boolean }) {
  const uid = useId();
  return (
    <div className={inSheet ? "space-y-6" : "flex flex-wrap items-start gap-x-8 gap-y-3"}>
      {facets.map((f) => {
        const labelId = `${uid}-${f.key}`;
        return (
          <div key={f.key} role="group" aria-labelledby={labelId} className={inSheet ? "" : "flex min-w-0 items-center gap-3"}>
            <p id={labelId} className={`text-sm font-medium text-ink-muted ${inSheet ? "mb-3" : "shrink-0"}`}>
              {f.label}
            </p>
            <div className={`flex gap-2 ${inSheet ? "flex-wrap" : "scroll-row"}`}>
              {f.options.map((o) => (
                <Chip key={o.value} active={selected[f.key].includes(o.value)} onClick={() => onToggle(f, o.value)}>
                  {o.label}
                </Chip>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const list = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

/**
 * Buscador de biblioteca: barra fija con tabs + búsqueda, filtros y orden debajo,
 * una sola grilla de resultados (sin secciones apiladas) y "cargar más".
 * El estado vive en la URL para poder compartir y volver atrás. El HTML estático trae el catálogo
 * completo, sin filtros (use-url-search.ts): los de la URL se aplican al hidratar, sin animar.
 */
export function ContentFinder<T>({
  items,
  getKey,
  renderItem,
  tabs,
  tabParam = "tab",
  facets,
  search,
  searchPlaceholder = "Buscar",
  sorts,
  pageSize = 12,
  noun = ["resultado", "resultados"],
  emptyText = "No hay resultados con esa combinación. Prueba quitando un filtro.",
  gridClass = "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  resultsHeading = "Resultados",
}: ContentFinderProps<T>) {
  const urlSearch = useUrlSearch();
  const sp = useMemo(() => new URLSearchParams(urlSearch), [urlSearch]);
  const [sheet, setSheet] = useState(false);
  const [limit, setLimit] = useState(pageSize);
  /**
   * La usuaria ya tocó el buscador: desde ahí los cambios se animan. Lo que llega de la URL antes (al
   * cargar, al venir de un atajo de Inicio o al volver) se aplica de una.
   */
  const [animated, setAnimated] = useState(false);
  const sheetId = useId();
  const sheetTitleId = useId();
  const barRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLButtonElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const tabRow = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  const tab = sp.get(tabParam) ?? "";
  const sort = sp.get("sort") ?? sorts?.[0]?.value ?? "";
  const query = sp.get("q") ?? "";
  const selected = useMemo(() => Object.fromEntries(facets.map((f) => [f.key, list(sp.get(f.key))])), [facets, sp]);
  const activeCount = Object.values(selected).reduce((a, v) => a + v.length, 0);

  // El campo de búsqueda se escribe antes que la URL (que cambia con retardo); si la búsqueda de la URL
  // cambia por otro lado (al cargar, al volver, "Quitar filtros y búsqueda"), el campo la sigue.
  const [q, setQ] = useState(query);
  const [urlQuery, setUrlQuery] = useState(query);
  if (urlQuery !== query) {
    setUrlQuery(query);
    setQ(query);
  }

  // La barra fija se suma al scroll-padding: lo que recibe foco no queda debajo de ella
  useBarHeight(barRef, "--subheader-h");

  // Hoja de filtros: Tab no sale de ella, el fondo queda inerte y sin scroll, Esc cierra y el
  // foco vuelve al botón "Filtros". El fondo oscuro sigue activo para cerrarla con un toque.
  useFocusTrap(sheetRef, sheet, { lockScroll: true, onEscape: () => setSheet(false), keep: () => [backdropRef.current] });

  /** Cambia filtros en la URL. Parte de la URL actual (no de este render): la búsqueda con retardo no pisa un filtro recién tocado. */
  const setParams = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(window.location.search);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setAnimated(true);
    setLimit(pageSize);
    replaceUrlSearch(next);
  };

  const noFacets = () => Object.fromEntries(facets.map((f) => [f.key, undefined]));

  const toggleFacet = (f: FinderFacet<T>, value: string) => {
    const cur = selected[f.key];
    const next = cur.includes(value) ? cur.filter((v) => v !== value) : f.multi ? [...cur, value] : [value];
    setParams({ [f.key]: next.join(",") || undefined });
  };

  /** Limpia desde un botón que desaparece al limpiar: el foco pasa al contador (que se lee). */
  const clearFrom = (patch: Record<string, string | undefined>) => {
    setParams(patch);
    countRef.current?.focus();
  };

  // La pestaña activa siempre a la vista: en móvil no caben las cinco y quien llega con
  // ?type=stretching (o toca una del final) debe ver cuál está elegida. Solo desplaza la fila: de una si
  // viene de la URL, suave si la tocó.
  useEffect(() => {
    const row = tabRow.current;
    const el = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!row || !el) return;
    const r = row.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    const delta = b.left + b.width / 2 - (r.left + r.width / 2);
    const smooth = animated && !prefersReducedMotion();
    if (Math.abs(delta) > 1) row.scrollBy({ left: delta, behavior: smooth ? "smooth" : "auto" });
  }, [tab, animated]);

  // Búsqueda con pequeño retardo
  useEffect(() => {
    const t = setTimeout(() => {
      if ((new URLSearchParams(window.location.search).get("q") ?? "") !== q) setParams({ q: q || undefined });
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const results = useMemo(() => {
    const currentTab = tabs?.find((t) => t.value === tab);
    let out = items.filter((it) => {
      if (currentTab?.match && !currentTab.match(it)) return false;
      for (const f of facets) {
        const vals = selected[f.key];
        if (vals.length && !f.match(it, vals)) return false;
      }
      if (query && search && !search(it, query)) return false;
      return true;
    });
    const s = sorts?.find((x) => x.value === sort);
    if (s) out = [...out].sort(s.cmp);
    return out;
  }, [items, tabs, tab, facets, selected, query, search, sorts, sort]);

  const visible = results.slice(0, limit);
  const countText = `${results.length} ${results.length === 1 ? noun[0] : noun[1]}`;

  const searchField = (mobile: boolean) => (
    // El campo no dibuja su propio foco: el anillo va en todo el recuadro (con el ícono)
    <label
      className={`items-center gap-2 rounded-control border border-line-input px-3 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus ${mobile ? "mb-6 flex h-12" : "hidden h-11 w-64 lg:flex"}`}
    >
      <Icon name="search" size={16} className="shrink-0 text-ink-muted" />
      {/* 16 px: iOS no hace zoom al escribir */}
      <input
        type="search"
        value={q}
        onChange={(e) => {
          setAnimated(true);
          setQ(e.target.value);
        }}
        placeholder={searchPlaceholder}
        aria-label={searchPlaceholder}
        enterKeyHint="search"
        className="w-full min-w-0 bg-transparent text-base text-ink outline-none placeholder:text-ink-muted"
      />
    </label>
  );

  return (
    <LayoutMotion>
      <LayoutGroup>
        {/* ---------- Barra fija (fondo sólido, filete abajo): solo pestañas y búsqueda, ~69 px ---------- */}
        <div ref={barRef} className="sticky-under-header sticky z-(--z-sticky) border-b border-line bg-surface">
          <div className="container-x">
            <div className="flex items-center gap-3 py-3">
              {tabs && (
                // En móvil la fila va de borde a borde: la última pestaña queda cortada y se nota que sigue
                <div ref={tabRow} className="scroll-row -mx-(--gutter) flex-1 snap-none gap-1 px-2 sm:-mx-3 sm:gap-4 sm:px-0">
                  {tabs.map((t) => {
                    const active = t.value === tab;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setParams({ [tabParam]: t.value || undefined })}
                        aria-pressed={active}
                        className={`relative flex min-h-11 shrink-0 items-center px-3 text-body-sm transition-colors active:text-ink ${active ? "text-ink" : "text-ink-muted hover:text-ink"}`}
                      >
                        {t.label}
                        {active && <m.span layoutId="finder-tab" aria-hidden="true" className="absolute inset-x-3 -bottom-px h-0.5 bg-accent" transition={SPRING.snappy} />}
                      </button>
                    );
                  })}
                </div>
              )}
              {search && searchField(false)}
            </div>
          </div>
        </div>

        {/* ---------- Filtros desde lg: en flujo, bajo la barra (fijos tapaban un tercio de la pantalla en una tablet acostada) ---------- */}
        <div className="container-x hidden lg:block">
          <div className="border-b border-line py-4">
            <FacetRows facets={facets} selected={selected} onToggle={toggleFacet} />
          </div>
        </div>

        {/* ---------- Meta: contador, limpiar, filtros (móvil) y orden ---------- */}
        <div className="container-x flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-4 text-sm text-ink-muted">
          <span className="inline-flex flex-wrap items-center gap-x-4">
            <span ref={countRef} tabIndex={-1} aria-live="polite" className="focus:outline-none">
              {countText}
            </span>
            {activeCount > 0 && (
              <button type="button" onClick={() => clearFrom(noFacets())} className="link-action -my-3 text-ink">
                Limpiar filtros
              </button>
            )}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {/* Fuera de la fila de pestañas para que estas tengan todo el ancho en móvil */}
            <Chip toggle={false} active={activeCount > 0} onClick={() => setSheet(true)} aria-haspopup="dialog" aria-expanded={sheet} aria-controls={sheetId} className="lg:hidden">
              Filtros{activeCount ? ` · ${activeCount}` : ""}
            </Chip>
            {sorts && (
              <label className="flex items-center gap-2">
                <span className="sr-only sm:not-sr-only">Orden</span>
                {/* 16 px: iOS no hace zoom al abrir el selector */}
                <select value={sort} onChange={(e) => setParams({ sort: e.target.value })} className="h-11 rounded-control border border-line-input bg-surface px-2 text-base text-ink">
                  {sorts.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </div>

        {/* ---------- Resultados ---------- */}
        <div className="container-x pb-16">
          {resultsHeading && <h2 className="sr-only">{resultsHeading}</h2>}
          {visible.length ? (
            <m.div layout={animated} className={`grid gap-x-4 gap-y-8 sm:gap-x-6 ${gridClass}`}>
              {/* initial={false}: lo que ya está al cargar no se anima (llega visible); solo lo que entra al filtrar */}
              <AnimatePresence initial={false} mode="popLayout">
                {visible.map((it) => (
                  <m.div
                    key={getKey(it)}
                    layout={animated}
                    initial={animated ? { opacity: 0 } : false}
                    animate={{ opacity: 1 }}
                    exit={animated ? { opacity: 0 } : undefined}
                    transition={{ duration: DUR.base, ease: EASE_OUT }}
                  >
                    {renderItem(it)}
                  </m.div>
                ))}
              </AnimatePresence>
            </m.div>
          ) : (
            <div className="rule-soft pt-5">
              <p className="text-body-sm text-ink-muted">{emptyText}</p>
              {(activeCount > 0 || query) && (
                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    clearFrom({ ...noFacets(), q: undefined });
                  }}
                  className="link-action mt-1 text-ink"
                >
                  {query ? "Quitar filtros y búsqueda" : "Quitar filtros"}
                </button>
              )}
            </div>
          )}
          {results.length > limit && (
            <div className="mt-10 flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setAnimated(true);
                  setLimit((l) => l + pageSize);
                }}
              >
                Cargar más ({results.length - limit})
              </Button>
            </div>
          )}
        </div>

        {/* ---------- Hoja de filtros (móvil) ---------- */}
        <AnimatePresence>
          {sheet && (
            <>
              <m.button
                key="fondo"
                ref={backdropRef}
                type="button"
                tabIndex={-1}
                aria-label="Cerrar filtros"
                onClick={() => setSheet(false)}
                className="fixed inset-0 z-(--z-sheet) bg-scrim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DUR.fast }}
              />
              <m.div
                key="hoja"
                ref={sheetRef}
                id={sheetId}
                role="dialog"
                aria-modal="true"
                aria-labelledby={sheetTitleId}
                tabIndex={-1}
                data-lenis-prevent
                className="fixed inset-x-0 bottom-0 z-(--z-sheet) flex max-h-[85dvh] flex-col rounded-t-control bg-surface outline-none"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={SPRING.sheet}
                // Se arrastra solo desde el tirador: así el contenido de la hoja conserva su scroll táctil
                drag="y"
                dragControls={dragControls}
                dragListener={false}
                dragConstraints={{ top: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => info.offset.y > 80 && setSheet(false)}
              >
                {/* Tirador: filete recto (arrastrarlo hacia abajo cierra la hoja) */}
                <div aria-hidden="true" onPointerDown={(e) => dragControls.start(e)} className="flex shrink-0 cursor-grab touch-none justify-center pb-2 pt-4 active:cursor-grabbing">
                  <span className="h-px w-12 bg-line-strong" />
                </div>
                <div className="flex shrink-0 items-center justify-between gap-4 px-(--gutter) pb-3">
                  <h2 id={sheetTitleId} className="font-display text-display-md">
                    Filtros
                  </h2>
                  {/* Al cerrar, el foco vuelve a "Filtros" (useFocusTrap) */}
                  <button
                    type="button"
                    onClick={() => setSheet(false)}
                    aria-label="Cerrar filtros"
                    className="-mr-2.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-control text-ink transition-colors hover:bg-hover active:bg-press"
                  >
                    <Icon name="close" size={20} />
                  </button>
                </div>
                {/* Solo esto se desplaza: el título y las acciones quedan siempre a la vista */}
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-(--gutter) pb-6 pt-1">
                  {search && searchField(true)}
                  <FacetRows inSheet facets={facets} selected={selected} onToggle={toggleFacet} />
                </div>
                <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-line px-(--gutter) pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
                  <Button variant="outline" size="lg" wrap onClick={() => setParams(noFacets())}>
                    Limpiar
                  </Button>
                  <Button size="lg" wrap onClick={() => setSheet(false)}>
                    Ver {countText}
                  </Button>
                </div>
              </m.div>
            </>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </LayoutMotion>
  );
}
