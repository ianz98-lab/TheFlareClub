import Image from "next/image";
import type { ReactNode } from "react";

type Tone = "sand" | "rose" | "sage" | "sky";
const bg: Record<Tone, string> = {
  sand: "bg-sand-light",
  rose: "bg-rose-soft",
  sage: "bg-sage-soft",
  sky: "bg-sky-soft",
};

/** Cabecera de sección con color de módulo y foto opcional. */
export function PageHero({
  eyebrow,
  title,
  description,
  tone = "sand",
  image,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  tone?: Tone;
  image?: string;
  children?: ReactNode;
}) {
  return (
    <section className={`relative overflow-hidden ${bg[tone]}`}>
      <div className="container-x relative z-10 grid items-center gap-6 py-10 sm:py-14 md:grid-cols-[1.1fr_0.9fr] md:py-16 lg:py-20">
        <div className="max-w-xl">
          <p className="eyebrow mb-3">{eyebrow}</p>
          <h1 className="font-display text-4xl leading-[1.02] text-espresso sm:text-5xl lg:text-6xl">{title}</h1>
          {description && <p className="mt-4 text-[15px] text-cocoa sm:text-lg">{description}</p>}
          {children && <div className="mt-6">{children}</div>}
        </div>
        {image && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-soft md:aspect-[5/4]">
            <Image src={image} alt="" fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" priority />
          </div>
        )}
      </div>
    </section>
  );
}
