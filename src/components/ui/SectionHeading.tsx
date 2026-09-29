import Link from "next/link";

/** Cabecera de sección editorial: filete superior, título grande, enlace a la derecha. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "Ver todo",
  as: Tag = "h2",
  rule = true,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  as?: "h1" | "h2" | "h3";
  rule?: boolean;
}) {
  return (
    <div className={`mb-6 ${rule ? "rule pt-4" : ""}`}>
      <div className="flex items-baseline justify-between gap-6">
        <div className="min-w-0">
          {eyebrow && <p className="label mb-2 text-cocoa">{eyebrow}</p>}
          <Tag className={`font-display leading-[1.02] ${Tag === "h1" ? "text-5xl sm:text-6xl lg:text-7xl" : "text-3xl sm:text-4xl lg:text-[2.75rem]"}`}>
            {title}
          </Tag>
        </div>
        {href && (
          <Link href={href} className="label link hidden shrink-0 sm:inline-block">
            {linkLabel}
          </Link>
        )}
      </div>
      {description && <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-cocoa sm:text-base">{description}</p>}
    </div>
  );
}
