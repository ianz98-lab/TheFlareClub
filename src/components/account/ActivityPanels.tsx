"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState, type KeyboardEvent } from "react";
import { Row } from "@/components/Row";
import { ClassCard } from "@/components/cards/ClassCard";
import { MeditationCard } from "@/components/cards/MeditationCard";
import { TalkCard } from "@/components/cards/TalkCard";
import { formatDate } from "@/lib/format";
import type { ProgressMap } from "@/lib/local-store";
import { isResolved, resolveKey, type ResolvedItem } from "./content-index";
import { PortalSection, SubHeading } from "./portal-ui";

/*
 * Actividad en Mi cuenta. Las listas se calculan en el portal (AccountView), que decide qué secciones
 * mostrar: una sección vacía no se pinta ni aparece en el índice (A016).
 */

export type WatchedItem = ResolvedItem & { doneAt: number };

/** Empezadas y sin terminar, de la más reciente a la más antigua (máximo 8). */
export function continueItems(history: ProgressMap): ResolvedItem[] {
  return Object.entries(history)
    .filter(([key, v]) => !v.done && /^(class|meditation|talk):/.test(key))
    .sort((a, b) => b[1].at - a[1].at)
    .map(([key]) => resolveKey(key))
    .filter(isResolved)
    .slice(0, 8);
}

/** Terminadas, de la más reciente a la más antigua. */
export function watchedItems(history: ProgressMap): WatchedItem[] {
  return Object.entries(history)
    .filter(([, v]) => v.done)
    .sort((a, b) => (b[1].done ?? 0) - (a[1].done ?? 0))
    .map(([key, v]) => {
      const x = resolveKey(key);
      return x ? { ...x, doneAt: v.done ?? v.at } : null;
    })
    .filter((x): x is WatchedItem => x !== null);
}

/** Favoritos que todavía existen; lo último que guardó, primero. */
export function favoriteItems(favs: string[]): ResolvedItem[] {
  return [...favs].reverse().map(resolveKey).filter(isResolved);
}

/** Card según el tipo (las de Movement, Meditaciones y Charlas, con su corazón). */
function ItemCard({ x }: { x: ResolvedItem }) {
  if (x.kind === "class") return <ClassCard c={x.item} size="row" />;
  if (x.kind === "meditation") return <MeditationCard m={x.item} size="row" />;
  if (x.kind === "talk") return <TalkCard t={x.item} size="row" />;
  return null;
}

/* ---------------- Continuar viendo ---------------- */

export function ContinueWatching({ items }: { items: ResolvedItem[] }) {
  return (
    <PortalSection id="continuar" title="Continuar viendo" description="Retoma donde te quedaste.">
      <Row>
        {items.map((x) => (
          <ItemCard key={x.key} x={x} />
        ))}
      </Row>
    </PortalSection>
  );
}

/* ---------------- Lo que ya viste ---------------- */

type Tab = "clases" | "todo";
const PAGE = 8;

export function WatchedPanel({ items: all }: { items: WatchedItem[] }) {
  const onlyClasses = all.filter((x) => x.kind === "class");
  // Si todavía no termina ninguna clase, se abre en "Todos los videos" (no en una pestaña vacía).
  const [tab, setTab] = useState<Tab>(onlyClasses.length ? "clases" : "todo");
  const [expanded, setExpanded] = useState(false);
  const uid = useId();

  const list = tab === "clases" ? onlyClasses : all;
  const shown = expanded ? list : list.slice(0, PAGE);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "clases", label: "Clases", count: onlyClasses.length },
    { id: "todo", label: "Todos los videos", count: all.length },
  ];
  const select = (t: Tab) => {
    setTab(t);
    setExpanded(false);
  };
  // Flechas ← → entre pestañas (patrón ARIA de tabs)
  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next: Tab = tab === "clases" ? "todo" : "clases";
    select(next);
    document.getElementById(`${uid}-${next}`)?.focus();
  };

  return (
    <PortalSection id="vistas" title="Lo que ya viste" description="Las clases y los videos que terminaste, del más reciente al más antiguo.">
      <div role="tablist" aria-label="Qué mostrar" className="flex gap-8 border-b border-line">
        {tabs.map((t) => {
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              id={`${uid}-${t.id}`}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls={`${uid}-panel`}
              tabIndex={on ? 0 : -1}
              onClick={() => select(t.id)}
              onKeyDown={onKey}
              // Pestaña activa: tinta y filete en el acento, igual que la sección actual del índice
              className={`-mb-px inline-flex h-12 items-center gap-2 border-b-2 text-body-sm font-medium transition-colors ${
                on ? "border-accent text-ink" : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              {t.label}
              <span className="font-normal tabular-nums text-ink-muted">{t.count}</span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-${tab}`}>
        {list.length === 0 ? (
          <p className="border-b border-line py-6 text-body-sm text-ink-muted">
            Aún no terminas ninguna clase de Movement.{" "}
            <Link href="/movement" className="link text-ink">
              Elegir una clase
            </Link>
          </p>
        ) : (
          <ul>
            {shown.map((x) => (
              <li key={x.key} className="border-b border-line">
                {/* Bajo 360 px (o con la letra agrandada) la fila queda en texto: sin miniatura y con la fecha
                    bajo el título, para que el título en Gloock no se parta a media palabra */}
                <Link href={x.href} className="group flex min-h-16 items-center gap-4 py-3 narrow:flex-col narrow:items-start narrow:gap-1.5">
                  <div className="relative aspect-[4/3] w-16 shrink-0 overflow-hidden rounded-media bg-surface-alt narrow:hidden sm:w-20">
                    <Image src={x.thumb} alt="" fill sizes="80px" className="object-cover" style={x.focal ? { objectPosition: x.focal } : undefined} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="label truncate text-ink-muted">
                      {x.typeLabel} · {x.minutes} min
                    </p>
                    <p className="mt-1 font-display text-display-sm transition-colors group-hover:text-accent-ink">{x.title}</p>
                  </div>
                  <p className="shrink-0 text-right text-sm leading-tight text-ink-muted narrow:text-left">
                    Vista el <span className="block narrow:inline sm:inline">{formatDate(new Date(x.doneAt).toISOString(), { weekday: undefined })}</span>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {list.length > PAGE && (
          <button type="button" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded} className="link-action mt-2">
            {expanded ? "Ver menos" : `Ver más (${list.length - PAGE})`}
          </button>
        )}
      </div>
    </PortalSection>
  );
}

/* ---------------- Tus favoritos ---------------- */

export function FavoritesPanel({ items }: { items: ResolvedItem[] }) {
  // Solo los grupos que tienen algo: la sección entera ya se oculta si no hay favoritos.
  const groups = [
    { title: "Clases favoritas", list: items.filter((x) => x.kind === "class"), cols: undefined },
    { title: "Meditaciones favoritas", list: items.filter((x) => x.kind === "meditation"), cols: undefined },
    { title: "Charlas guardadas", list: items.filter((x) => x.kind === "talk"), cols: "lg:grid-cols-3" },
  ].filter((g) => g.list.length > 0);

  return (
    <PortalSection id="favoritos" title="Tus favoritos">
      {groups.map((g, i) => (
        <div key={g.title}>
          <SubHeading first={i === 0} count={g.list.length}>
            {g.title}
          </SubHeading>
          <Row cols={g.cols}>
            {g.list.map((x) => (
              <ItemCard key={x.key} x={x} />
            ))}
          </Row>
        </div>
      ))}
    </PortalSection>
  );
}
