import Image from "next/image";
import Link from "next/link";
import type { Course } from "@/content/types";
import { courseStats } from "@/content/courses";
import { instructorById } from "@/content/instructors";
import { Badge, AccessBadge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";

export function CourseCard({ c, size = "grid" }: { c: Course; size?: "grid" | "row" }) {
  const s = courseStats(c);
  const inst = instructorById(c.instructorId);
  return (
    <Link
      href={`/cursos/${c.slug}`}
      className={`group flex flex-col overflow-hidden rounded-3xl bg-white/60 shadow-card ring-1 ring-sand/50 transition-shadow hover:shadow-soft ${
        size === "row" ? "w-[280px] sm:w-[320px]" : "w-full"
      }`}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={c.cover}
          alt=""
          fill
          sizes="(min-width: 1024px) 400px, 90vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {c.featured && <Badge tone="sky">Destacado</Badge>}
          <AccessBadge access={c.access} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="eyebrow mb-1.5">Curso · {inst.name}</p>
        <h3 className="font-display text-[22px] leading-tight text-espresso">{c.title}</h3>
        <p className="clamp-2 mt-1.5 text-[14px] text-cocoa">{c.tagline}</p>
        <div className="mt-4 flex items-center justify-between text-[13px] text-cocoa">
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Icon name="book" size={15} /> {s.modules} módulos</span>
            <span className="flex items-center gap-1"><Icon name="clock" size={15} /> {s.minutes} min</span>
          </span>
          {c.access === "paid" && c.price && (
            <span className="font-medium text-espresso">{formatPrice(c.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
