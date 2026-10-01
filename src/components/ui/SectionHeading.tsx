import Link from "next/link";

/** Tamaño de la escala display por nivel: el H1 de página, el H2 de sección y el H3 de subsección. */
const SIZE = { xl: "text-display-xl", lg: "text-display-lg", md: "text-display-md" } as const;
const SIZE_BY_TAG = { h1: "xl", h2: "lg", h3: "md" } as const;

/**
 * Cabecera de sección editorial: filete superior, título grande, acción a la derecha.
 * `eyebrow` solo para los kickers que vienen del documento de las fundadoras (no agregar otros).
 * `size` baja (o sube) el título sin cambiar el nivel del encabezado: p. ej. "Sigue con" en una ficha,
 * que es un H2 pero debe quedar claramente por debajo del H1 de la página (H1/H2 ≥ 1.25).
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "Ver todo",
  as: Tag = "h2",
  size,
  rule = true,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  as?: "h1" | "h2" | "h3";
  size?: keyof typeof SIZE;
  rule?: boolean;
}) {
  return (
    <div className={`mb-6 ${rule ? "rule pt-4" : ""}`}>
      {/* Bajo 360 px (o con la letra agrandada) el link baja bajo el título: lado a lado, Gloock se partía a media palabra */}
      <div className="flex items-baseline justify-between gap-6 narrow:flex-col narrow:items-start narrow:gap-0">
        <div className="min-w-0">
          {eyebrow && <p className="label mb-2 text-ink-muted">{eyebrow}</p>}
          {/* Escala display por jerarquía (ya trae su interlínea y crece con el ancho) */}
          <Tag className={`font-display ${SIZE[size ?? SIZE_BY_TAG[Tag]]}`}>{title}</Tag>
        </div>
        {/* Visible también en móvil: nada importante solo en desktop. -my-3: los 44 px táctiles no agrandan la fila.
            "Ver todo" se repite en la página: el nombre accesible suma la sección. */}
        {href && (
          <Link
            href={href}
            aria-label={linkLabel === "Ver todo" ? `Ver todo: ${title}` : undefined}
            className="link-action -my-3 shrink-0 narrow:mt-0"
          >
            {linkLabel}
          </Link>
        )}
      </div>
      {description && <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-muted">{description}</p>}
    </div>
  );
}
