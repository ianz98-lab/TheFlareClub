import Image from "next/image";
import type { ReactNode } from "react";

type Tone = "sand" | "rose" | "sage" | "sky";
const bg: Record<Tone, string> = {
  sand: "bg-sand-light",
  rose: "bg-rose-soft",
  sage: "bg-sage-soft",
  sky: "bg-sky-soft",
};

/** Cabecera de sección: bloque de color con título grande y foto a sangre a la derecha. */
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
    <section className={`${bg[tone]} md:grid md:grid-cols-2`}>
      <div className="container-x flex flex-col justify-end py-10 md:py-16 md:pr-10 lg:py-24">
        <p className="label text-cocoa">{eyebrow}</p>
        <h1 className="mt-3 font-display text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">{title}</h1>
        {description && <p className="mt-5 max-w-md text-[15px] leading-relaxed text-cocoa sm:text-base">{description}</p>}
        {children && <div className="mt-7">{children}</div>}
      </div>
      {image && (
        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[420px]">
          <Image src={image} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" priority />
        </div>
      )}
    </section>
  );
}
