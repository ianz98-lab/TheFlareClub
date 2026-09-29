import Image from "next/image";
import Link from "next/link";
import { NAV } from "@/lib/nav";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-espresso text-cream">
      <div className="container-x py-14 lg:py-20">
        <p className="font-display text-4xl leading-none sm:text-6xl lg:text-7xl">The Flare Club</p>
        <div className="mt-12 grid gap-10 border-t border-cream/15 pt-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="max-w-sm text-[15px] leading-relaxed text-cream/75">
              Pilates Mat, Barre, meditaciones, cursos, charlas y eventos. Una plataforma para cuidarte a tu ritmo, desde donde estés.
            </p>
            <Image src="/images/logo.png" alt="" width={1600} height={675} className="mt-8 h-8 w-auto brightness-0 invert" />
          </div>
          <div>
            <p className="label mb-4 text-cream/60">Explora</p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-[14px]">
              {NAV.filter((n) => n.href !== "/").map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="hover:text-terracotta-soft">
                    {n.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/membresia" className="hover:text-terracotta-soft">
                  Membresía
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="label mb-4 text-cream/60">Contacto</p>
            <ul className="space-y-2 text-[14px]">
              <li>
                <a href="mailto:hola@theflare.club" className="hover:text-terracotta-soft">
                  hola@theflare.club
                </a>
              </li>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-terracotta-soft">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://open.spotify.com/show/1Z2XxeY3c3GnjkjQ9XljRo" target="_blank" rel="noreferrer" className="hover:text-terracotta-soft">
                  Podcast en Spotify
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-cream/15 pt-6 text-[12px] text-cream/50 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} The Flare Club. Guatemala.</p>
          <p className="flex gap-5">
            <Link href="#">Términos</Link>
            <Link href="#">Privacidad</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
