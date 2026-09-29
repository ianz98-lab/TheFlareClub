import Image from "next/image";
import Link from "next/link";
import { NAV } from "@/lib/nav";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-sand/60 bg-cream-deep/60">
      <div className="container-x grid gap-10 py-12 md:grid-cols-[1.3fr_1fr_1fr] lg:py-16">
        <div>
          <Image src="/images/logo.png" alt="The Flare Club" width={927} height={391} className="h-12 w-auto" />
          <p className="mt-4 max-w-sm text-[15px] text-cocoa">
            Movimiento, calma y comunidad para volver a ti. Pilates Mat, Barre, meditaciones,
            cursos, charlas y eventos, en tu celular y a tu ritmo.
          </p>
          <p className="mt-6 text-xs text-cocoa/70">
            © {new Date().getFullYear()} The Flare Club. Todos los derechos reservados.
          </p>
        </div>
        <div>
          <p className="eyebrow mb-3">Explora</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-[15px]">
            {NAV.filter((n) => n.href !== "/").map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-espresso hover:text-terracotta">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/membresia" className="text-espresso hover:text-terracotta">
                Membresía
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">Contacto</p>
          <ul className="space-y-2 text-[15px]">
            <li>
              <a href="mailto:hola@theflareclub.com" className="hover:text-terracotta">
                hola@theflareclub.com
              </a>
            </li>
            <li>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-terracotta">
                Instagram
              </a>
            </li>
            <li>
              <Link href="/corporativo" className="hover:text-terracotta">
                The Flare Club for Companies
              </Link>
            </li>
          </ul>
          <ul className="mt-6 flex gap-4 text-xs text-cocoa/70">
            <li><Link href="#">Términos</Link></li>
            <li><Link href="#">Privacidad</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
