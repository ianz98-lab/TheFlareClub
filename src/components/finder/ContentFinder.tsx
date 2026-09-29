"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";

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
}

const chip = (active: boolean) =>
  `h-9 shrink-0 rounded-md border px-3.5 text-[13px] transition-colors ${active ? "border-espresso bg-espresso text-cream" : "border-espresso/15 bg-cream text-espresso hover:border-espresso/50"}`;

function FacetRows<T>({ facets, selected, onToggle, inSheet = false }: { facets: FinderFacet<T>[]; selected: Record<string, string[]>; onToggle: (f: FinderFacet<T>, value: string) => void; inSheet?: boolean }) {
  return (
    <div className={inSheet ? "space-y-6" : "flex flex-wrap items-start gap-x-8 gap-y-3"}>
      {facets.map((f) => (
        <div key={f.key} className={inSheet ? "" : "flex items-center gap-3"}>
          <p className={`label text-cocoa ${inSheet ? "mb-3" : "shrink-0"}`}>{f.label}</p>
          <div className={`flex gap-2 ${inSheet ? "flex-wrap" : "scroll-row"}`}>
            {f.options.map((o) => (
              <button key={o.value} type="button" onClick={() => onToggle(f, o.value)} aria-pressed={selected[f.key].includes(o.value)} className={chip(selected[f.key].includes(o.value))}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const list = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

/**
 * Buscador de biblioteca: barra fija con tabs + filtros + búsqueda + orden,
 * una sola grilla de resultados (sin secciones apiladas) y "cargar más".
 * El estado vive en la URL para poder compartir y volver atrás.
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
}: ContentFinderProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const [sheet, setSheet] = useState(false);
  const [limit, setLimit] = useState(pageSize);
  const [q, setQ] = useState(sp.get("q") ?? "");

  const tab = sp.get(tabParam) ?? "";
  const sort = sp.get("sort") ?? sorts?.[0]?.value ?? "";
  const selected = useMemo(() => Object.fromEntries(facets.map((f) => [f.key, list(sp.get(f.key))])), [facets, sp]);
  const activeCount = Object.values(selected).reduce((a, v) => a + v.length, 0);

  const setParams = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    const s = next.toString();
    start(() => router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false }));
    setLimit(pageSize);
  };

  const toggleFacet = (f: FinderFacet<T>, value: string) => {
    const cur = selected[f.key];
    const next = cur.includes(value) ? cur.filter((v) => v !== value) : f.multi ? [...cur, value] : [value];
    setParams({ [f.key]: next.join(",") || undefined });
  };

  // Búsqueda con pequeño retardo
  useEffect(() => {
    const t = setTimeout(() => {
      if ((sp.get("q") ?? "") !== q) setParams({ q: q || undefined });
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
      const query = sp.get("q") ?? "";
      if (query && search && !search(it, query)) return false;
      return true;
    });
    const s = sorts?.find((x) => x.value === sort);
    if (s) out = [...out].sort(s.cmp);
    return out;
  }, [items, tabs, tab, facets, selected, sp, search, sorts, sort]);

  const visible = results.slice(0, limit);

  return (
    <LayoutGroup>
      {/* ---------- Barra fija ---------- */}
      <div className="sticky-under-header sticky z-30 bg-cream/92 backdrop-blur-md">
        <div className="container-x">
          <div className="flex items-center gap-3 py-3">
            {tabs && (
              <div className="scroll-row -mx-1 flex-1 px-1">
                {tabs.map((t) => {
                  const active = t.value === tab;
                  return (
                    <button key={t.value} type="button" onClick={() => setParams({ [tabParam]: t.value || undefined })} className="relative shrink-0 px-3 py-2 text-[15px] transition-colors">
                      <span className={active ? "text-espresso" : "text-cocoa hover:text-espresso"}>{t.label}</span>
                      {active && <motion.span layoutId="finder-tab" className="absolute inset-x-3 -bottom-px h-[2px] bg-terracotta" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                    </button>
                  );
                })}
              </div>
            )}
            {search && (
              <label className="hidden h-10 w-64 items-center gap-2 rounded-md border border-espresso/15 px-3 lg:flex">
                <Icon name="search" size={16} className="text-cocoa" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPlaceholder} className="w-full bg-transparent text-[14px] outline-none placeholder:text-cocoa/60" />
              </label>
            )}
            <button type="button" onClick={() => setSheet(true)} className={`flex h-10 shrink-0 items-center gap-2 rounded-md border px-3.5 text-[13px] lg:hidden ${activeCount ? "border-espresso bg-espresso text-cream" : "border-espresso/15"}`}>
              <Icon name="filter" size={15} /> Filtros{activeCount ? ` · ${activeCount}` : ""}
            </button>
          </div>
          <div className="hidden border-t border-espresso/10 py-3 lg:block">
            <FacetRows facets={facets} selected={selected} onToggle={toggleFacet} />
          </div>
        </div>
      </div>

      {/* ---------- Meta: contador, orden, limpiar ---------- */}
      <div className="container-x flex items-center justify-between gap-4 py-4 text-[13px] text-cocoa">
        <span className={pending ? "opacity-50" : ""}>
          {results.length} {results.length === 1 ? noun[0] : noun[1]}
          {activeCount > 0 && (
            <button type="button" onClick={() => setParams(Object.fromEntries(facets.map((f) => [f.key, undefined])))} className="link ml-3 text-terracotta">
              Limpiar filtros
            </button>
          )}
        </span>
        {sorts && (
          <label className="flex items-center gap-2">
            <span className="label hidden sm:inline">Orden</span>
            <select value={sort} onChange={(e) => setParams({ sort: e.target.value })} className="h-8 rounded-md border border-espresso/15 bg-cream px-2 text-[13px]">
              {sorts.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* ---------- Resultados ---------- */}
      <div className="container-x pb-16">
        {visible.length ? (
          <motion.div layout className={`grid gap-x-4 gap-y-8 sm:gap-x-6 ${gridClass}`}>
            <AnimatePresence mode="popLayout">
              {visible.map((it) => (
                <motion.div key={getKey(it)} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
                  {renderItem(it)}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <p className="rounded-md bg-cream-deep p-6 text-[15px] text-cocoa">{emptyText}</p>
        )}
        {results.length > limit && (
          <div className="mt-10 flex justify-center">
            <button type="button" onClick={() => setLimit((l) => l + pageSize)} className="label rounded-md border border-espresso px-6 py-3.5 transition-colors hover:bg-espresso hover:text-cream">
              Cargar más ({results.length - limit})
            </button>
          </div>
        )}
      </div>

      {/* ---------- Hoja de filtros (móvil) ---------- */}
      <AnimatePresence>
        {sheet && (
          <>
            <motion.button type="button" aria-label="Cerrar filtros" onClick={() => setSheet(false)} className="fixed inset-0 z-50 bg-espresso/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-cream px-5 pb-8 pt-4"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => info.offset.y > 80 && setSheet(false)}
            >
              <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-espresso/20" />
              {search && (
                <label className="mb-6 flex h-11 items-center gap-2 rounded-md border border-espresso/15 px-3">
                  <Icon name="search" size={16} className="text-cocoa" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPlaceholder} className="w-full bg-transparent text-[15px] outline-none placeholder:text-cocoa/60" />
                </label>
              )}
              <FacetRows inSheet facets={facets} selected={selected} onToggle={toggleFacet} />
              <div className="mt-8 grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setParams(Object.fromEntries(facets.map((f) => [f.key, undefined])))} className="label rounded-md border border-espresso py-3.5">
                  Limpiar
                </button>
                <button type="button" onClick={() => setSheet(false)} className="label rounded-md bg-espresso py-3.5 text-cream">
                  Ver {results.length} {results.length === 1 ? noun[0] : noun[1]}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}
