import Link from "next/link";
import type { ReactNode } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CONTACT_EMAIL } from "./copy";

/**
 * Sección del portal con ancla (para el índice de arriba) y cabecera editorial. El espacio bajo el
 * header y el índice fijo al saltar a la sección lo pone el scroll-padding global.
 */
export function PortalSection({
  id,
  eyebrow,
  title,
  description,
  href,
  linkLabel,
  children,
}: {
  id: string;
  /** Solo kickers del documento de las fundadoras ("Empieza aquí") */
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="container-x mt-16 sm:mt-24">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} href={href} linkLabel={linkLabel} />
      {children}
    </section>
  );
}

/** Estado vacío corto y útil: qué hacer para que aquí aparezca algo. */
export function EmptyState({ text, links = [] }: { text: ReactNode; links?: { href: string; label: string }[] }) {
  return (
    <div className="flex flex-col items-start gap-2 border-b border-line pb-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
      <p className="max-w-xl text-body-sm leading-relaxed text-ink-muted">{text}</p>
      {links.length > 0 && (
        <div className="flex shrink-0 flex-wrap gap-x-6">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="link-action">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/** Sub-bloque dentro de una sección (ej. "Clases favoritas" dentro de Tus favoritos). */
export function SubHeading({ children, count, first = false }: { children: ReactNode; count?: number; first?: boolean }) {
  return (
    <h3 className={`mb-4 flex items-baseline gap-3 font-display text-display-md ${first ? "mt-2" : "mt-12"}`}>
      {children}
      {typeof count === "number" && count > 0 && <span className="shrink-0 font-sans text-sm tabular-nums text-ink-muted">{count}</span>}
    </h3>
  );
}

/**
 * Hay un canal donde escribirnos. Mientras no exista el buzón (CONTACT_EMAIL en null, decisión D5) las
 * frases que invitan a escribirnos no se muestran: sin canal, "escríbenos" deja a la socia sin salida.
 */
export const hasContact = CONTACT_EMAIL !== null;

/**
 * Cierre de una frase que invita a escribirnos: " a hola@…" con mailto. La frase entera va condicionada
 * a `hasContact`: {hasContact && <> Escríbenos<ContactTail />.</>}
 */
export function ContactTail() {
  if (!CONTACT_EMAIL) return null;
  return (
    <>
      {" a "}
      <a href={`mailto:${CONTACT_EMAIL}`} className="link text-ink [overflow-wrap:anywhere]">
        {CONTACT_EMAIL}
      </a>
    </>
  );
}
