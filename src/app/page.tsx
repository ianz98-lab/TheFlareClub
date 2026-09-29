import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
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

const QUICK: { href: string; label: string; icon: IconName; tone: string }[] = [
  { href: "/movement", label: "Movement", icon: "move", tone: "bg-rose-soft" },
  { href: "/meditaciones", label: "Meditaciones", icon: "leaf", tone: "bg-sage-soft" },
  { href: "/cursos", label: "Cursos", icon: "book", tone: "bg-sky-soft" },
  { href: "/charlas", label: "Charlas", icon: "mic", tone: "bg-sand-light" },
  { href: "/workbooks", label: "Workbooks", icon: "file", tone: "bg-rose-soft" },
];

const NEED = [
  { href: "/movement?duration=5", label: "Tengo 5 minutos", hint: "Una zona, sin excusas" },
  { href: "/movement?duration=10", label: "Tengo 10 minutos", hint: "Abs, legs o arms" },
  { href: "/movement?duration=20", label: "Tengo 20 minutos", hint: "Upper, lower o full body" },
  { href: "/movement?duration=30,40", label: "Quiero una clase completa", hint: "30 o 40 min" },
  { href: "/movement?type=stretching", label: "Quiero estirarme", hint: "5 o 10 min" },
  { href: "/meditaciones", label: "Quiero meditar", hint: "Por momento o sensación" },
];

export default function HomePage() {
  const newClasses = classes.filter((c) => c.isNew || c.featured).slice(0, 6);
  const featMed = meditations.filter((m) => m.featured).slice(0, 4);
  const featCourses = courses.slice(0, 3);
  const newTalks = talks.filter((t) => t.isNew || t.featured).slice(0, 3);
  const nextEvents = upcomingEvents().slice(0, 2);

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="grain relative overflow-hidden bg-cream">
        <div className="container-x grid gap-8 pt-6 pb-10 sm:pt-10 md:grid-cols-[1fr_1.05fr] md:items-center md:gap-10 md:py-14 lg:gap-12 lg:py-16">
          <div className="order-2 md:order-1">
            <p className="eyebrow rise mb-3">Pilates · Barre · Meditación · Comunidad</p>
            <h1 className="rise rise-1 font-display text-[2.75rem] leading-[0.98] text-espresso sm:text-6xl lg:text-7xl">
              Volver a ti,
              <br />
              <em className="text-terracotta">a tu ritmo.</em>
            </h1>
            <p className="rise rise-2 mt-5 max-w-md text-[15px] text-cocoa sm:text-lg">
              Clases de Pilates Mat y Barre, meditaciones, cursos, charlas con expertas y
              eventos. Todo en tu celular, cuando tú puedas.
            </p>
            <div className="rise rise-3 mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/movement" variant="primary" size="lg">
                Explorar la plataforma <Icon name="arrow" size={18} />
              </ButtonLink>
              <ButtonLink href="/membresia" variant="secondary" size="lg">
                7 días gratis
              </ButtonLink>
            </div>
            <p className="mt-4 text-xs text-cocoa/80">Sin permanencia. Cancela cuando quieras.</p>
          </div>
          <div className="order-1 md:order-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-soft sm:aspect-[5/4] md:aspect-[4/5]">
              <Image
                src="/images/fundadoras-mariana-sofi-estudio.jpg"
                alt="Mariana y Sofi Wer, fundadoras de The Flare Club, en el estudio"
                fill
                priority
                sizes="(min-width: 1024px) 640px, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl bg-cream/90 px-4 py-3 backdrop-blur">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-terracotta">Fundadoras</p>
                  <p className="font-display text-xl leading-none">Mariana & Sofi Wer</p>
                </div>
                <Link href="/nosotras" className="text-sm font-medium text-espresso hover:text-terracotta">
                  Conócenos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- ACCESOS RÁPIDOS ---------- */}
      <section className="container-x -mt-2 pb-4">
        <div className="scroll-row -mx-4 px-4 sm:mx-0 sm:px-0 md:grid md:grid-cols-5">
          {QUICK.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className={`flex min-w-[132px] items-center gap-3 rounded-2xl ${q.tone} px-4 py-3.5 transition-transform hover:-translate-y-0.5`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/80 text-espresso">
                <Icon name={q.icon} size={18} />
              </span>
              <span className="font-medium">{q.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- ¿QUÉ NECESITAS HOY? ---------- */}
      <section className="container-x py-10 sm:py-14">
        <SectionHeading eyebrow="Empieza aquí" title="¿Qué necesitas hoy?" description="Elige por tiempo o por cómo te sientes. Nosotras armamos el resto." />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {NEED.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="group flex flex-col justify-between rounded-2xl bg-white/60 p-4 ring-1 ring-sand/60 transition-all hover:-translate-y-0.5 hover:shadow-card sm:p-5"
            >
              <span className="font-display text-xl leading-tight sm:text-2xl">{n.label}</span>
              <span className="mt-4 flex items-center justify-between text-[13px] text-cocoa">
                {n.hint}
                <Icon name="arrow" size={16} className="text-terracotta transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- CLASES NUEVAS ---------- */}
      <section className="container-x py-6 sm:py-8">
        <SectionHeading eyebrow="Movement" title="Clases nuevas y destacadas" href="/movement" />
        <Row>
          {newClasses.map((c) => (
            <ClassCard key={c.id} c={c} size="row" />
          ))}
        </Row>
      </section>

      {/* ---------- MEDITACIONES ---------- */}
      <section className="mt-6 bg-sage-soft/60 py-10 sm:py-14">
        <div className="container-x">
          <SectionHeading eyebrow="Meditaciones" title="Meditación de la semana" description="Cinco a veinte minutos para calmar la mente y volver al presente." href="/meditaciones" />
          <Row>
            {featMed.map((m) => (
              <MeditationCard key={m.id} m={m} size="row" />
            ))}
          </Row>
        </div>
      </section>

      {/* ---------- CURSOS ---------- */}
      <section className="container-x py-10 sm:py-14">
        <SectionHeading eyebrow="Cursos" title="Programas para ir más profundo" href="/cursos" />
        <Row cols="lg:grid-cols-3">
          {featCourses.map((c) => (
            <CourseCard key={c.id} c={c} size="row" />
          ))}
        </Row>
      </section>

      {/* ---------- CHARLAS ---------- */}
      <section className="container-x py-6 sm:py-8">
        <SectionHeading eyebrow="Charlas" title="Charlas nuevas con expertas" href="/charlas" />
        <Row cols="lg:grid-cols-3">
          {newTalks.map((t) => (
            <TalkCard key={t.id} t={t} size="row" />
          ))}
        </Row>
      </section>

      {/* ---------- EVENTOS + PODCAST ---------- */}
      <section className="container-x grid gap-8 py-10 sm:py-14 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <SectionHeading eyebrow="Eventos" title="Próximos eventos" href="/eventos" />
          <div className="space-y-4">
            {nextEvents.map((e) => (
              <EventCard key={e.id} e={e} />
            ))}
          </div>
        </div>
        <div>
          <SectionHeading eyebrow="Podcast" title={PODCAST.title} href="/podcast" linkLabel="Todos los episodios" />
          <a
            href={latestEpisode.spotifyUrl}
            target="_blank"
            rel="noreferrer"
            className="group relative block overflow-hidden rounded-3xl bg-espresso text-cream shadow-soft"
          >
            <Image src={PODCAST.cover} alt="" fill sizes="500px" className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-[1.03]" />
            <div className="relative p-6 sm:p-8">
              <p className="text-[11px] uppercase tracking-[0.18em] text-cream/80">Último episodio · Ep. {latestEpisode.number}</p>
              <p className="mt-2 font-display text-3xl leading-tight">{latestEpisode.title}</p>
              <p className="clamp-2 mt-2 text-sm text-cream/85">{latestEpisode.description}</p>
              <span className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-cream px-5 text-sm font-medium text-espresso">
                <Icon name="spotify" size={18} className="text-[#1DB954]" /> Escuchar en Spotify
              </span>
            </div>
          </a>
        </div>
      </section>

      {/* ---------- SOBRE ---------- */}
      <section className="container-x pb-6">
        <div className="relative overflow-hidden rounded-3xl bg-rose-soft px-6 py-12 text-center sm:px-12 sm:py-16">
          <p className="eyebrow mb-3">The Flare Club</p>
          <h2 className="mx-auto max-w-2xl font-display text-3xl leading-tight sm:text-5xl">
            Una comunidad de mujeres que eligen cuidarse sin exigirse.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] text-cocoa sm:text-base">
            Nacimos en un estudio con ventanales en Guatemala y hoy entrenamos, meditamos y
            conversamos contigo desde donde estés.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/nosotras" variant="primary">Conoce a Mariana y Sofi</ButtonLink>
            <ButtonLink href="/corporativo" variant="light">Flare for Companies</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
