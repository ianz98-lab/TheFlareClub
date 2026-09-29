import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[60vh] flex-col justify-center py-20">
      <p className="label text-cocoa">Error 404</p>
      <h1 className="mt-3 font-display text-6xl leading-none sm:text-8xl">Página no encontrada</h1>
      <p className="mt-5 max-w-sm text-cocoa">El enlace puede haber cambiado o ya no existe.</p>
      <ButtonLink href="/" variant="outline" className="mt-8 self-start">
        Ir al inicio
      </ButtonLink>
    </section>
  );
}
