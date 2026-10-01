import Image from "next/image";
import Link from "next/link";
import { FOOTER } from "@/content/site";
import { PODCAST } from "@/content/podcast";
import { CONTACT_EMAIL } from "@/components/account/copy";
import { NewTabHint } from "@/components/ui/NewTabHint";
import { EXPLORE } from "./explore";

/*
 * Pendientes de Ian (no se muestran hasta tenerlos): Términos y Aviso de privacidad (sin textos
 * legales todavía), el perfil de Instagram de la marca (sin handle confirmado) y el correo de
 * contacto: mientras el buzón no exista, CONTACT_EMAIL es null y la fila no se muestra (D5).
 */

/** Links del pie: 15 px y 44 px de alto (se tocan con el pulgar); si la nota no cabe, baja de línea. */
const LINK = "flex min-h-11 flex-wrap content-center items-baseline gap-x-2 text-body-sm transition-colors duration-(--duration-fast) hover:text-accent-soft active:text-accent-soft";
const HEADING = "mb-2 text-sm font-medium text-ink-muted";

export function SiteFooter() {
  // Sin correo, la columna solo tiene redes (hoy el podcast; luego Instagram)
  const contactTitle = CONTACT_EMAIL ? "Contacto" : "Síguenos";
  return (
    // on-dark: foco, filetes y texto atenuado en crema. En móvil la barra de pestañas tapa el final: su alto queda como margen.
    <footer className="on-dark mt-24 bg-espresso pb-[calc(var(--tabbar-space)+var(--bottom-bar-h))]">
      <div className="container-x py-14 lg:py-20">
        {/* Nivel H2 (display-lg): en display-xl competía con el H1 de cada página. Texto claro sobre oscuro:
            un poco más de interlínea que el token */}
        <p className="max-w-3xl text-balance font-display text-display-lg leading-[1.12]">
          {FOOTER.title}
        </p>
        {/* Tablet: el texto a todo el ancho y debajo Explora | Contacto (en tres columnas el párrafo
            quedaba en ~200 px). Desde lg, las tres columnas. */}
        <div className="mt-12 grid gap-10 border-t border-line pt-10 md:grid-cols-[1.4fr_0.8fr] md:gap-12 lg:grid-cols-[1.4fr_1fr_0.8fr]">
          <div className="md:col-span-2 lg:col-span-1">
            <div className="max-w-md space-y-4 text-body-sm leading-relaxed text-ink-muted">
              {FOOTER.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            {/* El logo en una sola tinta surface (scripts/marca/iconos.py), no un filtro invert */}
            <Image
              src="/images/logo-on-dark.png"
              alt="The Flare Club"
              width={480}
              height={210}
              sizes="84px"
              className="mt-8 h-9 w-auto"
            />
          </div>
          {/* Repite destinos del menú y de la barra inferior: sin precarga (no compite con la página) */}
          <nav aria-labelledby="pie-explora">
            <h2 id="pie-explora" className={HEADING}>
              Explora
            </h2>
            {/* Dos columnas; una sola si cada una no llega a 7rem (320 px con la letra del navegador al 200 %:
                lado a lado, "Meditaciones" se montaba sobre "Workbooks") */}
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(max(7rem,calc((100%_-_1.5rem)/2)),1fr))] gap-x-6">
              {EXPLORE.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} prefetch={false} className={LINK}>
                    {n.label}
                    {/* El espacio separa las palabras para el lector de pantalla */}
                    {n.note && <span className="text-xs text-accent-soft">{" "}{n.note}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className={HEADING}>{contactTitle}</h2>
            <ul>
              {CONTACT_EMAIL && (
                <li>
                  {/* Un correo no tiene dónde partirse: en la columna angosta de tablet se corta donde haga falta */}
                  <a href={`mailto:${CONTACT_EMAIL}`} className={`${LINK} wrap-anywhere`}>
                    {CONTACT_EMAIL}
                  </a>
                </li>
              )}
              <li>
                <a href={PODCAST.spotifyShowUrl} target="_blank" rel="noopener noreferrer" className={LINK}>
                  {/* Un solo bloque y espacio duro: la flecha nunca queda sola en otra línea */}
                  <span>
                    Podcast en Spotify{" "}
                    <NewTabHint />
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className="rule-soft mt-12 pt-6 text-caption text-ink-muted">
          © {new Date().getFullYear()} The Flare Club. Guatemala.
        </p>
      </div>
    </footer>
  );
}
