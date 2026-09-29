"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";

const field = "h-12 w-full border-0 border-b border-espresso/30 bg-transparent px-0 text-[15px] outline-none transition-colors placeholder:text-cocoa/60 focus:border-espresso";

/**
 * Formulario de cotización corporativa. Hoy muestra confirmación;
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
      <div className="border-t border-espresso pt-6">
        <h3 className="font-display text-4xl">Recibido.</h3>
        <p className="mt-3 max-w-sm text-cocoa">Gracias. Te escribimos en menos de 48 horas con una propuesta.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
      <input name="nombre" required placeholder="Nombre" className={field} autoComplete="name" />
      <input name="empresa" required placeholder="Empresa" className={field} autoComplete="organization" />
      <input name="puesto" placeholder="Puesto" className={field} autoComplete="organization-title" />
      <input name="email" type="email" required placeholder="Email" className={field} autoComplete="email" />
      <input name="telefono" type="tel" placeholder="Teléfono" className={field} autoComplete="tel" />
      <input name="colaboradores" type="number" min={1} placeholder="Nº aprox. de colaboradores" className={field} />
      <select name="tipo" required className={field} defaultValue="">
        <option value="" disabled>
          Tipo de experiencia
        </option>
        <option>Clase de Pilates o Barre</option>
        <option>Meditación guiada</option>
        <option>Journaling / Vision Boards</option>
        <option>Charla con experta</option>
        <option>Evento especial</option>
        <option>Programa anual de bienestar</option>
        <option>Membresías para el equipo</option>
      </select>
      <input name="fecha" type="date" className={field} aria-label="Fecha aproximada" />
      <textarea name="mensaje" rows={3} placeholder="Mensaje / información adicional" className={`${field} h-auto resize-none py-3 sm:col-span-2`} />
      <div className="mt-2 sm:col-span-2">
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? "Enviando..." : "Enviar solicitud"}
        </Button>
        <p className="mt-3 text-[12px] text-cocoa">Sin compromiso. Solo usamos tus datos para responderte.</p>
      </div>
    </form>
  );
}
