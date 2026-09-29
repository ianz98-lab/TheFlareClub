import Image from "next/image";
import Link from "next/link";
import type { Course } from "@/content/types";
import { courseStats } from "@/content/courses";
import { instructorById } from "@/content/instructors";
import { AccessBadge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/format";

export function CourseCard({ c, size = "grid" }: { c: Course; size?: "grid" | "row" }) {
  const s = courseStats(c);
  const inst = instructorById(c.instructorId);
  return (
    <Link href={`/cursos/${c.slug}`} className={`group block ${size === "row" ? "w-[280px] sm:w-[320px] md:w-full" : "w-full"}`}>
      <div className="relative aspect-[16/11] overflow-hidden rounded-xs bg-cream-deep">
        <Image src={c.cover} alt="" fill sizes="(min-width: 1024px) 420px, 90vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
      </div>
      <div className="rule-soft mt-4 pt-3">
        <div className="flex items-center justify-between gap-3 text-cocoa">
          <p className="label">
            {s.modules} módulos · {s.minutes} min
          </p>
          {c.access === "paid" && c.price ? <span className="text-[13px]">{formatPrice(c.price)}</span> : <AccessBadge access={c.access} />}
        </div>
        <h3 className="mt-1.5 font-display text-2xl leading-[1.08]">{c.title}</h3>
        <p className="clamp-2 mt-1.5 text-[14px] text-cocoa">{c.tagline}</p>
        <p className="mt-2 text-[13px] text-cocoa">Con {inst.name}</p>
      </div>
    </Link>
  );
}
