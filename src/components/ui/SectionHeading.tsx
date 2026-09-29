import Link from "next/link";
import { Icon } from "./Icon";

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "Ver todo",
  align = "left",
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div
      className={`mb-5 flex items-end justify-between gap-4 ${
        align === "center" ? "flex-col items-center text-center" : ""
      }`}
    >
      <div className={align === "center" ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <Tag
          className={`font-display text-espresso ${
            Tag === "h1" ? "text-4xl sm:text-5xl lg:text-6xl" : "text-[1.75rem] sm:text-4xl"
          } leading-[1.05]`}
        >
          {title}
        </Tag>
        {description && <p className="mt-2 text-[15px] text-cocoa sm:text-base">{description}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="hidden shrink-0 items-center gap-1 text-sm font-medium text-terracotta hover:underline sm:inline-flex"
        >
          {linkLabel} <Icon name="arrow" size={16} />
        </Link>
      )}
    </div>
  );
}
