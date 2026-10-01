"use client";

import { useId, useState } from "react";

/**
 * Marcas que nos han acompañado, como lista de texto en columnas (2 en celular, 4 en desktop).
 * En celular se ven las primeras `initial` y un botón despliega el resto, para que la lista no
 * ocupe dos pantallas; desde sm se ven todas.
 */
export function SponsorList({ names, initial = 18, className = "" }: { names: readonly string[]; initial?: number; className?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const collapsible = names.length > initial;

  return (
    <div className={className}>
      <ul id={id} className="grid grid-cols-2 gap-x-6 gap-y-2 text-body-sm leading-snug sm:grid-cols-3 sm:gap-y-2.5 sm:text-base lg:grid-cols-4">
        {names.map((name, i) => (
          <li key={name} className={collapsible && !open && i >= initial ? "max-sm:hidden" : undefined}>
            {name}
          </li>
        ))}
      </ul>
      {collapsible && (
        <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)} className="link-action mt-4 sm:hidden">
          {open ? "Ver menos" : `Ver las ${names.length} marcas`}
        </button>
      )}
    </div>
  );
}
