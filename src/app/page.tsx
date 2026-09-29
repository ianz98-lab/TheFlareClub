import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Row } from "@/components/Row";
import { ClassCard } from "@/components/cards/ClassCard";
import { MeditationCard } from "@/components/cards/MeditationCard";
import { CourseCard } from "@/components/cards/CourseCard";
import { TalkCard } from "@/components/cards/TalkCard";
import { EventCard } from "@/components/cards/EventCard";
import { classes } from "@/content/classes";
import { meditations } from "@/content/meditations";
import { courses } from "@/content/courses";
import { talks } from "@/content/talks";
import { upcomingEvents } from "@/content/events";
import { latestEpisode, PODCAST } from "@/content/podcast";

const QUICK = [
  { href: "/movement", label: "Movement", note: "Pilates Mat, Barre, warm-ups, stretching" },
  { href: "/meditaciones", label: "Meditaciones", note: "Por momento del día o por cómo te sientes" },
  { href: "/cursos", label: "Cursos", note: "Programas con módulos y workbooks" },
  { href: "/charlas", label: "Charlas", note: "Expertas en nutrición, sueño, finanzas, relaciones" },
  { href: "/workbooks", label: "Workbooks", note: "Journaling, resets, vision board" },
];

const NEED = [
  { href: "/movement?duration=5", label: "Tengo 5 minutos" },
  { href: "/movement?duration=10", label: "Tengo 10 minutos" },
  { href: "/movement?duration=20", label: "Tengo 20 minutos" },
  { href: "/movement?duration=30,40", label: "Quiero una clase completa" },
  { href: "/movement?type=stretching", label: "Quiero estirarme" },
  { href: "/meditaciones", label: "Quiero meditar" },
];

export default function HomePage() {
  const newClasses = classes.filter((c) => c.isNew || c.featured).slice(0, 4);
  const featMed = meditations.filter((m) => m.featured).slice(0, 4);
  const featCourses = courses.slice(0, 3);
  const newTalks = talks.filter((t) => t.isNew || t.featured).slice(0, 3);
  const nextEvents = upcomingEvents().slice(0, 2);

  return (
    <>
      {/* Hero a sangre */}
      <section className="relative">
        <div className="relative aspect-[4/5] max-h-[70vh] sm:aspect-[16/10] lg:aspect-[21/9]">
          <Image src="/images/fundadoras-mariana-sofi-estudio.jpg" alt="Mariana y Sofi Wer en el estudio de The Flare Club" fill priority sizes="100vw" className="object-cover object-[center_30%]" />
        </div>
        <div className="container-x -mt-24 relative sm:-mt-32 lg:-mt-40">
          <div className="max-w-3xl bg-cream pt-6 pr-6 sm:pt-8 sm:pr-10">
            <h1 className="font-display text-[3.25rem] leading-[0.95] sm:text-7xl lg:text-8xl">
              Pilates, Barre y calma, a tu ritmo.
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-cocoa sm:text-base">
              Clases de Pilates Mat y Barre, meditaciones, cursos, charlas con expertas y eventos. En tu celular, cuando tú puedas, con una comunidad que te acompaña.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <ButtonLink href="/movement" size="lg">
                Explorar la plataforma
              </ButtonLink>
              <ButtonLink href="/membresia" variant="text">
                Prueba 7 días gratis
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* Índice de módulos */}
      <section className="container-x mt-16 sm:mt-24">
        <ol className="rule">
          {QUICK.map((q, i) => (
            <li key={q.href}>
              <Link href={q.href} className="group rule-soft flex items-baseline gap-4 py-4 sm:gap-8 sm:py-5">
                <span className="label w-6 text-cocoa">0{i + 1}</span>
                <span className="font-display text-3xl leading-none transition-colors group-hover:text-terracotta sm:text-5xl">{q.label}</span>
                <span className="ml-auto hidden text-[13px] text-cocoa sm:block">{q.note}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* ¿Qué necesitas hoy? */}
      <section className="mt-20 bg-sand-light py-14 sm:mt-28 sm:py-20">
        <div className="container-x grid gap-8 md:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="label text-cocoa">Empieza aquí</p>
            <h2 className="mt-3 font-display text-4xl leading-[1] sm:text-5xl">¿Qué necesitas hoy?</h2>
            <p className="mt-4 max-w-xs text-[15px] text-cocoa">Elige por tiempo o por cómo te sientes. Nosotras armamos el resto.</p>
          </div>
          <ul className="grid gap-x-8 sm:grid-cols-2">
            {NEED.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="group flex items-center justify-between border-b border-espresso/20 py-4 font-display text-2xl transition-colors hover:text-terracotta">
                  {n.label}
                  <span className="text-[13px] font-sans text-cocoa group-hover:text-terracotta">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-x mt-20 sm:mt-28">
        <SectionHeading eyebrow="Movement" title="Clases nuevas" href="/movement" />
        <Row>
          {newClasses.map((c) => (
            <ClassCard key={c.id} c={c} size="row" />
          ))}
        </Row>
      </section>

      <section className="container-x mt-20 sm:mt-28">
        <SectionHeading eyebrow="Meditaciones" title="Meditación de la semana" href="/meditaciones" />
        <Row>
          {featMed.map((m) => (
            <MeditationCard key={m.id} m={m} size="row" />
          ))}
        </Row>
      </section>

      <section className="container-x mt-20 sm:mt-28">
        <SectionHeading eyebrow="Cursos" title="Programas" href="/cursos" />
        <Row cols="lg:grid-cols-3">
          {featCourses.map((c) => (
            <CourseCard key={c.id} c={c} size="row" />
          ))}
        </Row>
      </section>

      <section className="container-x mt-20 sm:mt-28">
        <SectionHeading eyebrow="Charlas" title="Charlas nuevas" href="/charlas" />
        <Row cols="lg:grid-cols-3">
          {newTalks.map((t) => (
            <TalkCard key={t.id} t={t} size="row" />
          ))}
        </Row>
      </section>

      {/* Eventos + Podcast */}
      <section className="container-x mt-20 grid gap-14 sm:mt-28 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        <div>
          <SectionHeading eyebrow="Eventos" title="Próximos eventos" href="/eventos" />
          <div className="space-y-6">
            {nextEvents.map((e) => (
              <EventCard key={e.id} e={e} />
            ))}
          </div>
        </div>
        <div>
          <SectionHeading eyebrow="Podcast" title={PODCAST.title} href="/podcast" linkLabel="Episodios" />
          <a href={latestEpisode.spotifyUrl} target="_blank" rel="noreferrer" className="group block">
            <div className="relative aspect-square overflow-hidden rounded-xs bg-cream-deep">
              <Image src={PODCAST.cover} alt="" fill sizes="500px" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
            </div>
            <p className="label mt-4 text-cocoa">Último episodio · Ep. {latestEpisode.number}</p>
            <p className="mt-1 font-display text-2xl leading-tight">{latestEpisode.title}</p>
            <p className="label link mt-3 inline-block">Escuchar en Spotify</p>
          </a>
        </div>
      </section>

      {/* Nosotras */}
      <section className="mt-24 bg-rose-soft sm:mt-32">
        <div className="container-x grid gap-10 py-16 md:grid-cols-2 md:items-center lg:py-24">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xs md:order-2">
            <Image src="/images/coaches-mariana-sofi-retrato.jpg" alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <p className="label text-cocoa">Nosotras</p>
            <h2 className="mt-3 font-display text-4xl leading-[0.98] sm:text-6xl">Mariana y Sofi Wer</h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-cocoa sm:text-base">
              Coaches de Pilates Mat y Barre. Han dado clases, talleres y charlas en colegios, universidades, empresas y eventos, llevando el bienestar más allá del movimiento.
            </p>
            <div className="mt-8 flex flex-wrap gap-6">
              <ButtonLink href="/nosotras" variant="outline">
                Conócenos
              </ButtonLink>
              <ButtonLink href="/corporativo" variant="text">
                Flare for Companies
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
