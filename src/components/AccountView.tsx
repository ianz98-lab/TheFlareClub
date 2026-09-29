"use client";

import Link from "next/link";
import { KEYS, useLocal, type ProgressMap } from "@/lib/local-store";
import { useFavorites } from "@/components/FavoriteButton";
import { ButtonLink } from "@/components/ui/Button";
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
 * Fase 2: auth de Supabase, tablas favorites / watch_progress / subscriptions, portal de Recurrente.
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
      <section className="container-x pt-10 sm:pt-16">
        <p className="label text-cocoa">Mi cuenta</p>
        <h1 className="mt-3 font-display text-5xl leading-[0.98] sm:text-7xl">Hola, Flare.</h1>
        <p className="mt-3 text-[14px] text-cocoa">tu@email.com · Vista demo, sin sesión iniciada</p>
        <dl className="mt-10 grid border-t border-espresso sm:grid-cols-3">
          {[
            ["Plan", "Flare Mensual"],
            ["Estado", "Prueba gratis"],
            ["Próximo cobro", "5 oct 2026"],
          ].map(([k, v]) => (
            <div key={k} className="rule-soft py-4 first:border-0 sm:border-0 sm:pr-6">
              <dt className="label text-cocoa">{k}</dt>
              <dd className="mt-1 font-display text-2xl">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-2 flex gap-6 border-t border-espresso/15 pt-4">
          <ButtonLink href="/membresia" variant="text">Cambiar plan</ButtonLink>
          <ButtonLink href="#" variant="text">Administrar membresía</ButtonLink>
        </div>
      </section>

      <section className="container-x mt-16 sm:mt-24">
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

      <section className="container-x mt-16 sm:mt-24">
        <SectionHeading title="Clases favoritas" />
        {favClasses.length ? <Row>{favClasses.map((c) => <ClassCard key={c.id} c={c} size="row" />)}</Row> : <Empty text="Toca el corazón en una clase para guardarla." href="/movement" cta="Explorar clases" />}
      </section>

      <section className="container-x mt-16 sm:mt-24">
        <SectionHeading title="Meditaciones favoritas" />
        {favMeds.length ? <Row>{favMeds.map((m) => <MeditationCard key={m.id} m={m} size="row" />)}</Row> : <Empty text="Guarda meditaciones para tenerlas a la mano." href="/meditaciones" cta="Ver meditaciones" />}
      </section>

      {favTalks.length > 0 && (
        <section className="container-x mt-16 sm:mt-24">
          <SectionHeading title="Charlas guardadas" />
          <Row cols="lg:grid-cols-3">{favTalks.map((t) => <TalkCard key={t.id} t={t} size="row" />)}</Row>
        </section>
      )}

      <section className="container-x mt-16 sm:mt-24">
        <SectionHeading title="Mis cursos" description="Tu progreso se guarda automáticamente." href="/cursos" />
        <Row cols="lg:grid-cols-3">{courses.map((c) => <CourseCard key={c.id} c={c} size="row" />)}</Row>
      </section>

      <section className="container-x mt-16 sm:mt-24">
        <SectionHeading title="Workbooks" href="/workbooks" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{memberWbs.map((w) => <WorkbookCard key={w.id} w={w} />)}</div>
      </section>
    </>
  );
}

function Empty({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-baseline sm:justify-between">
      <p className="text-[15px] text-cocoa">{text}</p>
      <Link href={href} className="label link">
        {cta}
      </Link>
    </div>
  );
}
