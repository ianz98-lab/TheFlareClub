import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { eventBySlug, events } from "@/content/events";
import { EVENT_CATEGORIES, labelOf } from "@/content/taxonomies";
import { formatDateLong, formatPrice, formatTime } from "@/lib/format";

export async function generateStaticParams() {
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/eventos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: eventBySlug(slug)?.title ?? "Evento" };
}

export default async function EventPage({ params }: PageProps<"/eventos/[slug]">) {
  const { slug } = await params;
  const e = eventBySlug(slug);
  if (!e) notFound();
  const isPast = e.status === "past";

  return (
    <>
      <section className="container-x pt-4 sm:pt-8">
        <Link href="/eventos" className="mb-3 inline-flex items-center gap-1 text-sm text-cocoa hover:text-espresso">
          <Icon name="arrow" size={16} className="rotate-180" /> Eventos
        </Link>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-soft sm:aspect-[16/10]">
            <Image src={e.image} alt="" fill priority sizes="(min-width: 1024px) 700px, 100vw" className="object-cover" />
          </div>
          <aside>
            <Badge tone={e.category === "night-editions" ? "rose" : "sky"}>{labelOf(EVENT_CATEGORIES, e.category)}</Badge>
            <h1 className="mt-3 font-display text-4xl leading-[1.02] sm:text-5xl">{e.title}</h1>
            <ul className="mt-5 space-y-2 text-[15px]">
              <li className="flex items-center gap-2"><Icon name="calendar" size={18} className="text-terracotta" /> {formatDateLong(e.startsAt)}</li>
              <li className="flex items-center gap-2"><Icon name="clock" size={18} className="text-terracotta" /> {formatTime(e.startsAt)}{e.endsAt ? ` a ${formatTime(e.endsAt)}` : ""}</li>
              <li className="flex items-center gap-2"><Icon name="pin" size={18} className="text-terracotta" /> {e.location}</li>
            </ul>
            <p className="mt-4 text-[15px] text-cocoa">{e.description}</p>
            {e.includes.length > 0 && (
              <div className="mt-5 rounded-2xl bg-cream-deep p-4">
                <p className="eyebrow mb-2">Qué incluye</p>
                <ul className="space-y-1 text-sm">
                  {e.includes.map((i) => (
                    <li key={i} className="flex items-center gap-2"><Icon name="check" size={15} className="text-sage" /> {i}</li>
                  ))}
                </ul>
              </div>
            )}
            {!isPast && (
              <div className="mt-6 flex items-center justify-between rounded-3xl bg-espresso p-4 text-cream">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-cream/70">Entrada</p>
                  <p className="font-display text-3xl">{formatPrice(e.price, e.currency)}</p>
                </div>
                <ButtonLink href={e.ticketUrl ?? "/membresia"} variant="terracotta" size="lg">
                  Comprar entrada
                </ButtonLink>
              </div>
            )}
          </aside>
        </div>
      </section>
      {isPast && e.gallery && (
        <section className="container-x py-12">
          <p className="eyebrow mb-3">Recap</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {e.gallery.map((g, i) => (
              <div key={i} className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                <Image src={g} alt="" fill sizes="(min-width: 640px) 33vw, 50vw" className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
