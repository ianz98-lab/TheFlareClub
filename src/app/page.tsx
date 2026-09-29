import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Row } from "@/components/Row";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { HeroFade, Parallax } from "@/components/motion/Parallax";
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
import { PRESETS, totalMinutes } from "@/lib/routine";

const QUICK = [
  { href: "/movement", label: "Movement", note: "Pilates Mat, Barre, warm-ups, stretching" },
  { href: "/rutina", label: "Rutinas", note: "Arma tu sesión y corre sola de principio a fin" },
  { href: "/meditaciones", label: "Meditaciones", note: "Por momento del día o por cómo te sientes" },
  { href: "/cursos", label: "Cursos", note: "Programas con módulos y workbooks" },
  { href: "/charlas", label: "Charlas", note: "Expertas en nutrición, sueño, finanzas, relaciones" },
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
      {/* Hero a sangre con parallax */}
      <section className="relative">
        <Parallax className="aspect-[4/5] max-h-[72vh] sm:aspect-[16/10] lg:aspect-[21/9]" strength={10}>
          <Image src="/images/fundadoras-mariana-sofi-estudio.jpg" alt="Mariana y Sofi Wer en el estudio de The Flare Club" fill priority sizes="100vw" className="object-cover object-[center_30%]" />
        </Parallax>
        <div className="container-x relative -mt-24 sm:-mt-32 lg:-mt-40">
          <HeroFade className="max-w-3xl rounded-tr-2xl bg-cream pt-6 pr-6 sm:pt-8 sm:pr-10">
            <Stagger step={0.12}>
              <StaggerItem>
                <h1 className="font-display text-[3.25rem] leading-[0.95] sm:text-7xl lg:text-8xl">Pilates, Barre y calma, a tu ritmo.</h1>
              </StaggerItem>
              <StaggerItem>
                <p className="mt-6 max-w-md text-[15px] leading-relaxed text-cocoa sm:text-base">Clases de Pilates Mat y Barre, meditaciones, cursos, charlas con expertas y eventos. En tu celular, cuando tú puedas, con una comunidad que te acompaña.</p>
              </StaggerItem>
              <StaggerItem>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <ButtonLink href="/rutina" size="lg">
                    Arma tu rutina
                  </ButtonLink>
                  <ButtonLink href="/movement" variant="outline" size="lg">
                    Explorar clases
                  </ButtonLink>
                </div>
              </StaggerItem>
            </Stagger>
          </HeroFade>
        </div>
      </section>

      {/* Índice de módulos */}
      <section className="container-x mt-16 sm:mt-24">
        <Stagger className="rule" step={0.06}>
          {QUICK.map((q, i) => (
            <StaggerItem key={q.href}>
              <Link href={q.href} className="group rule-soft flex items-baseline gap-4 py-4 sm:gap-8 sm:py-5">
                <span className="label w-6 text-cocoa">0{i + 1}</span>
                <span className="font-display text-3xl leading-none transition-colors duration-300 group-hover:text-terracotta sm:text-5xl">{q.label}</span>
                <span className="ml-auto hidden text-[13px] text-cocoa sm:block">{q.note}</span>
                <span className="text-cocoa opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 sm:ml-4">→</span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Rutinas rápidas */}
      <section className="mt-20 bg-sand-light py-14 sm:mt-28 sm:py-20">
        <div className="container-x">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="label text-cocoa">Nuevo</p>
                <h2 className="mt-3 font-display text-4xl leading-[1] sm:text-5xl">Tu rutina, de corrido.</h2>
                <p className="mt-4 max-w-md text-[15px] text-cocoa">Elige calentamiento, clase y stretch una sola vez. Los videos corren seguidos y al final te dejamos algo para la mente.</p>
              </div>
              <ButtonLink href="/rutina" variant="outline">
                Armar la mía
              </ButtonLink>
            </div>
          </Reveal>
          <Stagger className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" step={0.08}>
            {PRESETS.map((p) => (
              <StaggerItem key={p.id}>
                <Link href="/rutina" className="group block rounded-lg border border-espresso/12 bg-cream p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-espresso/40">
                  <p className="label text-terracotta">{totalMinutes(p)} min</p>
                  <p className="mt-2 font-display text-2xl leading-tight">{p.name}</p>
                  <p className="mt-1 text-[13px] text-cocoa">{p.blurb}</p>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ¿Qué necesitas hoy? */}
      <section className="container-x mt-20 grid gap-8 sm:mt-28 md:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <p className="label text-cocoa">Empieza aquí</p>
          <h2 className="mt-3 font-display text-4xl leading-[1] sm:text-5xl">¿Qué necesitas hoy?</h2>
          <p className="mt-4 max-w-xs text-[15px] text-cocoa">Elige por tiempo o por cómo te sientes. Nosotras armamos el resto.</p>
        </Reveal>
        <Stagger className="grid gap-x-8 sm:grid-cols-2" step={0.05}>
          {NEED.map((n) => (
            <StaggerItem key={n.href}>
              <Link href={n.href} className="group flex items-center justify-between border-b border-espresso/15 py-4 font-display text-2xl transition-colors hover:text-terracotta">
                {n.label}
                <span className="text-[13px] font-sans text-cocoa transition-transform duration-300 group-hover:translate-x-1 group-hover:text-terracotta">→</span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="container-x mt-20 sm:mt-28">
        <Reveal>
          <SectionHeading eyebrow="Movement" title="Clases nuevas" href="/movement" />
        </Reveal>
        <Stagger>
          <Row>
            {newClasses.map((c) => (
              <StaggerItem key={c.id}>
                <ClassCard c={c} size="row" />
              </StaggerItem>
            ))}
          </Row>
        </Stagger>
      </section>

      <section className="container-x mt-20 sm:mt-28">
        <Reveal>
          <SectionHeading eyebrow="Meditaciones" title="Meditación de la semana" href="/meditaciones" />
        </Reveal>
        <Stagger>
          <Row>
            {featMed.map((m) => (
              <StaggerItem key={m.id}>
                <MeditationCard m={m} size="row" />
              </StaggerItem>
            ))}
          </Row>
        </Stagger>
      </section>

      <section className="container-x mt-20 sm:mt-28">
        <Reveal>
          <SectionHeading eyebrow="Cursos" title="Programas" href="/cursos" />
        </Reveal>
        <Stagger>
          <Row cols="lg:grid-cols-3">
            {featCourses.map((c) => (
              <StaggerItem key={c.id}>
                <CourseCard c={c} size="row" />
              </StaggerItem>
            ))}
          </Row>
        </Stagger>
      </section>

      <section className="container-x mt-20 sm:mt-28">
        <Reveal>
          <SectionHeading eyebrow="Charlas" title="Charlas nuevas" href="/charlas" />
        </Reveal>
        <Stagger>
          <Row cols="lg:grid-cols-3">
            {newTalks.map((t) => (
              <StaggerItem key={t.id}>
                <TalkCard t={t} size="row" />
              </StaggerItem>
            ))}
          </Row>
        </Stagger>
      </section>

      {/* Eventos + Podcast */}
      <section className="container-x mt-20 grid gap-14 sm:mt-28 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        <Reveal>
          <SectionHeading eyebrow="Eventos" title="Próximos eventos" href="/eventos" />
          <div className="space-y-6">
            {nextEvents.map((e) => (
              <EventCard key={e.id} e={e} />
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <SectionHeading eyebrow="Podcast" title={PODCAST.title} href="/podcast" linkLabel="Episodios" />
          <a href={latestEpisode.spotifyUrl} target="_blank" rel="noreferrer" className="group block">
            <div className="card-media relative aspect-square overflow-hidden rounded-md bg-cream-deep">
              <Image src={PODCAST.cover} alt="" fill sizes="500px" className="object-cover" />
            </div>
            <p className="label mt-4 text-cocoa">Último episodio · Ep. {latestEpisode.number}</p>
            <p className="mt-1 font-display text-2xl leading-tight">{latestEpisode.title}</p>
            <p className="label link mt-3 inline-block">Escuchar en Spotify</p>
          </a>
        </Reveal>
      </section>

      {/* Nosotras */}
      <section className="mt-24 bg-rose-soft sm:mt-32">
        <div className="container-x grid gap-10 py-16 md:grid-cols-2 md:items-center lg:py-24">
          <Parallax className="aspect-[4/5] rounded-lg md:order-2" strength={8}>
            <Image src="/images/coaches-mariana-sofi-retrato.jpg" alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </Parallax>
          <Reveal>
            <p className="label text-cocoa">Nosotras</p>
            <h2 className="mt-3 font-display text-4xl leading-[0.98] sm:text-6xl">Mariana y Sofi Wer</h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-cocoa sm:text-base">Coaches de Pilates Mat y Barre. Han dado clases, talleres y charlas en colegios, universidades, empresas y eventos, llevando el bienestar más allá del movimiento.</p>
            <div className="mt-8 flex flex-wrap gap-6">
              <ButtonLink href="/nosotras" variant="outline">
                Conócenos
              </ButtonLink>
              <ButtonLink href="/corporativo" variant="text">
                Flare for Companies
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
