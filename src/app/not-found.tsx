import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow mb-3">404</p>
      <h1 className="font-display text-5xl">Esto no está aquí</h1>
      <p className="mt-3 max-w-sm text-cocoa">Quizá el enlace cambió. Respira y vuelve al inicio.</p>
      <ButtonLink href="/" className="mt-8">Volver al inicio</ButtonLink>
    </section>
  );
}
