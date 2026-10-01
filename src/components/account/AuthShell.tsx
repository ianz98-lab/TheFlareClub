import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import type { Photo } from "@/content/types";

/**
 * Marco de las pantallas de acceso (entrar, crear cuenta, recuperar contraseña).
 * Móvil: título y formulario enseguida sobre la superficie neutra, sin foto (que el botón quede a
 * la vista). Desde md: la foto a sangre ocupa la mitad izquierda y pone el calor (D2-C: sin bloques
 * de color); el formulario va a la derecha. Sin "use client": sirve también como fallback de Suspense.
 * Sin kicker sobre el título: el header ya dice "Mi cuenta" y el título dice qué hacer.
 */
export function AuthShell({
  title,
  description,
  photo,
  back,
  children,
}: {
  title: string;
  description?: ReactNode;
  photo: Photo;
  /** Enlace para volver, arriba del título (ej. { href: "/cuenta", label: "Mi cuenta" }) */
  back?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <div className="md:grid md:min-h-[calc(100svh-var(--header-h))] md:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-surface-alt md:block">
        {/* Sin precarga: la foto solo existe desde md y, precargada, el celular la bajaría sin mostrarla */}
        <Image
          src={photo.src}
          alt={photo.alt ?? ""}
          fill
          sizes="(min-width: 768px) 50vw, 1px"
          fetchPriority="high"
          className="object-cover"
          style={photo.focal ? { objectPosition: photo.focal } : undefined}
        />
      </div>

      <div className="flex flex-col">
        <header>
          <div className="container-x pb-8 pt-8 md:mx-0 md:max-w-xl md:px-12 md:pb-8 md:pt-16 lg:px-16 lg:pt-24">
            {back && (
              <Link href={back.href} className="link-action -ml-1 mb-3 px-1 text-ink-muted hover:text-ink md:mb-6">
                <Icon name="arrow-left" size={16} />
                <span>
                  <span className="sr-only">Volver a </span>
                  {back.label}
                </span>
              </Link>
            )}
            <h1 className="font-display text-display-xl">{title}</h1>
            {description && <div className="mt-4 max-w-md text-body-sm leading-relaxed text-ink-muted sm:text-base">{description}</div>}
          </div>
        </header>
        <div className="container-x pb-16 md:mx-0 md:max-w-xl md:px-12 lg:px-16">{children}</div>
      </div>
    </div>
  );
}

/** Esqueleto del formulario mientras se lee la URL / la sesión. */
export function FormSkeleton({ fields = 2 }: { fields?: number }) {
  return (
    <div aria-busy="true" className="space-y-7">
      <span className="sr-only">Cargando…</span>
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-3 w-24 bg-surface-alt motion-safe:animate-pulse" />
          <div className="h-10 border-b border-line" />
        </div>
      ))}
      <div className="h-13 w-full rounded-control bg-surface-alt motion-safe:animate-pulse sm:w-48" />
    </div>
  );
}
