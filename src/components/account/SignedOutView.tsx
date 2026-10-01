import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MEMBERSHIP } from "@/content/site";
import { ACCOUNT_COPY, ACCOUNT_PHOTOS } from "./copy";

/**
 * Para qué sirve tener cuenta. Sin numeración: no es una secuencia. Los cursos no se mencionan
 * mientras sigan "Próximamente" (al abrir, sumar "Tus cursos" si hace falta).
 */
const BENEFITS = [
  { title: "Guarda tus favoritos", text: "Toca el corazón en una clase o una meditación y la encuentras en Mi cuenta." },
  { title: "Retoma donde te quedaste", text: "Continuar viendo recuerda lo que empezaste." },
  { title: "Mira lo que ya hiciste", text: "Las clases y los videos que terminaste, con su fecha." },
  { title: "Tus rutinas, listas para repetir", text: "Guarda las que armas y vuelve a empezarlas cuando quieras." },
];

/**
 * Mi cuenta sin sesión: entrar o crear cuenta, y para qué sirve tener una.
 * `justConfirmed`: volvió del enlace de confirmación sin sesión. `expiredLink`: el enlace del correo ya no sirve.
 */
export function SignedOutView({ justConfirmed = false, expiredLink = false }: { justConfirmed?: boolean; expiredLink?: boolean }) {
  const description = expiredLink
    ? "Ese enlace ya no funciona: cada enlace sirve una sola vez y vence después de un rato. Si ya confirmaste tu cuenta, entra con tu correo y tu contraseña; si no, al entrar te ofrecemos reenviar el correo."
    : justConfirmed
      ? "Si acabas de confirmar tu correo, entra con tu correo y tu contraseña para empezar."
      : ACCOUNT_COPY.portal.description;
  return (
    <>
      <PageHero title={ACCOUNT_COPY.portal.title} description={description} image={ACCOUNT_PHOTOS.signedOut}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/cuenta/entrar" size="lg">
            Entrar
          </ButtonLink>
          <ButtonLink href="/cuenta/crear" variant="outline" size="lg">
            Crear cuenta
          </ButtonLink>
        </div>
      </PageHero>

      <section className="container-x mt-14 sm:mt-20">
        <SectionHeading title="Con tu cuenta" />
        <ul className="grid gap-x-10 sm:grid-cols-2">
          {BENEFITS.map((b) => (
            <li key={b.title} className="border-b border-line py-6">
              <h3 className="font-display text-display-md">{b.title}</h3>
              <p className="mt-2 max-w-sm text-body-sm leading-relaxed text-ink-muted">{b.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-body-sm text-ink-muted">
          ¿Aún no tienes membresía? {MEMBERSHIP.trialLine}{" "}
          <Link href="/membresia" className="link text-ink">
            Ver planes
          </Link>
        </p>
      </section>
    </>
  );
}

/** Esqueleto sobrio mientras se lee la sesión (misma forma que el portal: saludo, índice y una sección). */
export function AccountSkeleton() {
  return (
    <div aria-busy="true">
      <span className="sr-only">Cargando tu cuenta…</span>
      {/* Mismos espacios que el saludo del portal (AccountView), para que nada salte al cargar */}
      <section>
        <div className="container-x pb-10 pt-10 md:pb-12 md:pt-14 lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end lg:gap-16 lg:pb-14 lg:pt-16 xl:grid-cols-[minmax(0,1fr)_26rem]">
          <div className="space-y-4">
            <div className="h-10 w-3/4 max-w-xl bg-surface-alt motion-safe:animate-pulse sm:h-16" />
            <div className="h-4 w-48 bg-surface-alt" />
            <div className="h-4 w-64 max-w-full bg-surface-alt" />
          </div>
          <div className="hidden aspect-[4/3] rounded-media bg-surface-alt lg:block" />
        </div>
      </section>
      <div className="h-12 border-b border-line" />
      <div className="container-x mt-16 space-y-4 sm:mt-24">
        <div className="h-px bg-line-strong" />
        <div className="h-9 w-1/3 bg-surface-alt motion-safe:animate-pulse" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`aspect-[3/2] rounded-media bg-surface-alt ${i > 1 ? "hidden md:block" : ""}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
