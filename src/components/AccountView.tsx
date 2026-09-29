"use client";

import Link from "next/link";
import { KEYS, useLocal, type ProgressMap } from "@/lib/local-store";
import { useFavorites } from "@/components/FavoriteButton";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Row } from "@/components/Row";
import { ClassCard } from "@/components/cards/ClassCard";
import { MeditationCard } from "@/components/cards/MeditationCard";
import { TalkCard } from "@/components/cards/TalkCard";
import { CourseCard } from "@/components/cards/CourseCard";
import { classes } from "@/content/classes";
import { meditations } from "@/content/meditations";
import { talks } from "@/content/talks";
import { courses } from "@/content/courses";
import { workbooks } from "@/content/workbooks";
import { WorkbookCard } from "@/components/cards/WorkbookCard";

/**
 * Mi cuenta (vista demo). Lee favoritos y progreso del navegador.
 * Fase 2: auth de Supabase, tablas favorites / watch_progress / subscriptions, portal de Stripe.
 */
const EMPTY_PROGRESS: ProgressMap = {};

export function AccountView() {
  const favs = useFavorites();
  const progress = useLocal<ProgressMap>(KEYS.progress, EMPTY_PROGRESS);

  const continueItems = Object.entries(progress)
    .sort((a, b) => b[1].at - a[1].at)
    .map(([key]) => {
      const [type, id] = key.split(":");
      if (type === "class") return classes.find((c) => c.id === id) && { type, item: classes.find((c) => c.id === id)! };
      if (type === "meditation") return meditations.find((m) => m.id === id) && { type, item: meditations.find((m) => m.id === id)! };
      if (type === "talk") return talks.find((t) => t.id === id) && { type, item: talks.find((t) => t.id === id)! };
      return null;
    })
    .filter(Boolean)
    .slice(0, 6);

  const favClasses = classes.filter((c) => favs.includes(`class:${c.id}`));
  const favMeds = meditations.filter((m) => favs.includes(`meditation:${m.id}`));
  const favTalks = talks.filter((t) => favs.includes(`talk:${t.id}`));
  const memberWbs = workbooks.filter((w) => w.access !== "paid").slice(0, 4);

  return (
    <>
      <section className="bg-sage-soft/60">
        <div className="container-x flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cream font-display text-2xl text-espresso">F</span>
            <div>
              <p className="eyebrow">Mi cuenta</p>
              <h1 className="font-display text-3xl leading-tight sm:text-4xl">Hola, Flare</h1>
              <p className="text-sm text-cocoa">tu@email.com · Vista demo (sin sesión iniciada)</p>
            </div>
          </div>
          <div className="rounded-3xl bg-cream p-4 sm:min-w-[300px]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Membresía</p>
              <span className="rounded-full bg-terracotta/10 px-2.5 py-1 text-xs font-medium text-terracotta">Prueba gratis</span>
            </div>
            <p className="mt-1 text-sm text-cocoa">Plan: Flare Mensual · Próximo cobro: 5 oct 2026</p>
            <div className="mt-3 flex gap-2">
              <ButtonLink href="/membresia" size="sm" variant="primary">Cambiar plan</ButtonLink>
              <ButtonLink href="#" size="sm" variant="secondary">Administrar</ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x py-10">
        <SectionHeading eyebrow="Mi contenido" title="Continuar viendo" description="Retoma donde te quedaste." />
        {continueItems.length ? (
          <Row>
            {continueItems.map((x) =>
              x!.type === "class" ? (
                <ClassCard key={x!.item.id} c={x!.item as (typeof classes)[number]} size="row" />
              ) : x!.type === "meditation" ? (
                <MeditationCard key={x!.item.id} m={x!.item as (typeof meditations)[number]} size="row" />
              ) : (
                <TalkCard key={x!.item.id} t={x!.item as (typeof talks)[number]} size="row" />
              ),
            )}
          </Row>
        ) : (
          <Empty text="Aún no has empezado nada. Cuando reproduzcas una clase, aparecerá aquí." href="/movement" cta="Ir a Movement" />
        )}
      </section>

      <section className="container-x py-6">
        <SectionHeading title="Clases favoritas" />
        {favClasses.length ? <Row>{favClasses.map((c) => <ClassCard key={c.id} c={c} size="row" />)}</Row> : <Empty text="Toca el corazón en una clase para guardarla." href="/movement" cta="Explorar clases" />}
      </section>

      <section className="container-x py-6">
        <SectionHeading title="Meditaciones favoritas" />
        {favMeds.length ? <Row>{favMeds.map((m) => <MeditationCard key={m.id} m={m} size="row" />)}</Row> : <Empty text="Guarda meditaciones para tenerlas a la mano." href="/meditaciones" cta="Ver meditaciones" />}
      </section>

      {favTalks.length > 0 && (
        <section className="container-x py-6">
          <SectionHeading title="Charlas guardadas" />
          <Row cols="lg:grid-cols-3">{favTalks.map((t) => <TalkCard key={t.id} t={t} size="row" />)}</Row>
        </section>
      )}

      <section className="container-x py-6">
        <SectionHeading title="Mis cursos" description="Tu progreso se guarda automáticamente." href="/cursos" />
        <Row cols="lg:grid-cols-3">{courses.map((c) => <CourseCard key={c.id} c={c} size="row" />)}</Row>
      </section>

      <section className="container-x py-6 pb-16">
        <SectionHeading title="Workbooks" href="/workbooks" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{memberWbs.map((w) => <WorkbookCard key={w.id} w={w} />)}</div>
      </section>
    </>
  );
}

function Empty({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl bg-cream-deep p-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[15px] text-cocoa">{text}</p>
      <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-terracotta">
        {cta} <Icon name="arrow" size={15} />
      </Link>
    </div>
  );
}
