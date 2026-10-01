import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { EXPLORE } from "@/components/layout/explore";
import { MovedRedirect } from "@/components/layout/MovedRedirect";
import { MEDITATION_PHOTOS } from "@/content/media";

// Componente de servidor para tener título propio (antes heredaba el de Inicio). La redirección
// de direcciones viejas corre aparte, en el navegador.
export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: false },
};

/** Una pausa en vez de un error: la foto vertical de meditación (solo desde lg; en el celular, directo a los links). */
const PHOTO = MEDITATION_PHOTOS[1];

export default function NotFound() {
  return (
    // minmax(0,1fr) también en una columna: con la letra al 200 % el título no ensancha la grilla
    <section className="container-x grid grid-cols-[minmax(0,1fr)] pt-12 pb-4 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16 lg:pt-20 xl:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] xl:gap-24">
      <MovedRedirect />
      <div>
        <h1 className="font-display text-display-xl">Página no encontrada</h1>
        <p className="mt-4 max-w-sm text-base leading-relaxed text-ink-muted sm:mt-5 sm:text-lead">
          El enlace puede haber cambiado o ya no existe.
        </p>
        {/* La única acción de la pantalla: en el acento */}
        <ButtonLink href="/" size="lg" className="mt-8 w-full sm:w-auto">
          Ir al inicio
        </ButtonLink>
        <nav aria-labelledby="explora-404" className="mt-14 max-w-xl sm:mt-16">
          <h2 id="explora-404" className="text-body-sm font-medium text-ink-muted">
            O explora
          </h2>
          <ul className="mt-3 border-t border-line">
            {EXPLORE.filter((n) => n.href !== "/").map((n) => (
              <li key={n.href} className="rule-soft first:border-t-0">
                <Link
                  href={n.href}
                  className="flex min-h-12 items-baseline gap-3 py-3 font-display text-display-md transition-colors duration-(--duration-fast) hover:text-accent-ink active:text-accent-ink"
                >
                  {n.label}
                  {/* font-sans: la meta va en Hanken aunque el link sea Gloock */}
                  {n.note && <span className="label font-sans text-accent-ink">{" "}{n.note}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {/* Decorativa. Acompaña el scroll de la lista sin quedar debajo del header (y sube con él cuando se
          oculta). Diferida (lazy): oculta en el celular, ni se descarga */}
      <div className="relative hidden aspect-[4/5] self-start overflow-hidden rounded-media bg-surface-alt lg:sticky-aside lg:block">
        <Image
          src={PHOTO.src}
          alt=""
          fill
          sizes="(min-width: 1280px) 30rem, 26rem"
          className="object-cover"
          style={{ objectPosition: PHOTO.focal }}
        />
      </div>
    </section>
  );
}
