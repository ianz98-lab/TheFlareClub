import Image from "next/image";
import type { ReactNode } from "react";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";

type Tone = "sand" | "rose" | "sage" | "sky";
const bg: Record<Tone, string> = {
  sand: "bg-sand-light",
  rose: "bg-rose-soft",
  sage: "bg-sage-soft",
  sky: "bg-sky-soft",
};

/**
 * Cabecera de sección: bloque de color con título y foto con parallax.
 * `compact` para páginas-buscador: menos alto, foto solo en desktop.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  tone = "sand",
  image,
  children,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  tone?: Tone;
  image?: string;
  children?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className={`${bg[tone]} md:grid md:grid-cols-2`}>
      <div className={`container-x flex flex-col justify-end ${compact ? "py-8 md:py-10 lg:py-12" : "py-10 md:py-12 lg:py-16"} md:pr-10`}>
        <Reveal>
          <p className="label text-cocoa">{eyebrow}</p>
          <h1 className={`mt-3 font-display leading-[0.98] ${compact ? "text-4xl sm:text-5xl lg:text-6xl" : "text-5xl sm:text-6xl lg:text-7xl"}`}>{title}</h1>
          {description && <p className="mt-4 max-w-md text-[15px] leading-relaxed text-cocoa sm:text-base">{description}</p>}
          {children && <div className="mt-6">{children}</div>}
        </Reveal>
      </div>
      {image && (
        <Parallax className={compact ? "hidden md:block md:min-h-[240px] md:max-h-[320px]" : "aspect-[3/2] md:aspect-auto md:min-h-[340px] md:max-h-[520px]"} strength={8}>
          <Image src={image} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" priority />
        </Parallax>
      )}
    </section>
  );
}
