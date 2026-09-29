"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const field =
  "h-12 w-full rounded-2xl border border-sand bg-white/70 px-4 text-[15px] outline-none transition-colors placeholder:text-cocoa/50 focus:border-espresso";

/**
 * Formulario de cotización corporativa. Hoy guarda en memoria y muestra confirmación;
 * en Fase 2 hace POST a /api/corporate-leads (tabla corporate_leads + email).
 */
export function CorporateForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl bg-sage-soft p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cream text-sage"><Icon name="check" size={28} /></span>
        <h3 className="mt-4 font-display text-3xl">Recibido</h3>
        <p className="mt-2 max-w-sm text-cocoa">Gracias. Te escribimos en menos de 48 horas con una propuesta.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-3xl bg-white/60 p-5 ring-1 ring-sand/60 sm:grid-cols-2 sm:p-6">
      <input name="nombre" required placeholder="Nombre" className={field} autoComplete="name" />
      <input name="empresa" required placeholder="Empresa" className={field} autoComplete="organization" />
      <input name="puesto" placeholder="Puesto" className={field} autoComplete="organization-title" />
      <input name="email" type="email" required placeholder="Email" className={field} autoComplete="email" />
      <input name="telefono" type="tel" placeholder="Teléfono" className={field} autoComplete="tel" />
      <input name="colaboradores" type="number" min={1} placeholder="Nº aprox. de colaboradores" className={field} />
      <select name="tipo" required className={field} defaultValue="">
        <option value="" disabled>Tipo de experiencia</option>
        <option>Clase de Pilates o Barre</option>
        <option>Meditación guiada</option>
        <option>Journaling / Vision Boards</option>
        <option>Charla con experta</option>
        <option>Evento especial</option>
        <option>Programa anual de bienestar</option>
        <option>Membresías para el equipo</option>
      </select>
      <input name="fecha" type="date" className={field} aria-label="Fecha aproximada" />
      <textarea name="mensaje" rows={4} placeholder="Mensaje / información adicional" className={`${field} h-auto py-3 sm:col-span-2`} />
      <div className="sm:col-span-2">
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Enviando..." : "Enviar solicitud"}
        </Button>
        <p className="mt-2 text-center text-xs text-cocoa/80">Sin compromiso. Solo usamos tus datos para responderte.</p>
      </div>
    </form>
  );
}
