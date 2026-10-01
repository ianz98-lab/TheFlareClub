/**
 * Aviso de que un enlace abre otra pestaña (WCAG 3.2.5): flecha visible y texto solo para lector de
 * pantalla. Va dentro del <a>, al final. `arrow={false}` si el diseño ya muestra la flecha en otro lado.
 */
export function NewTabHint({ arrow = true }: { arrow?: boolean }) {
  return (
    <>
      {arrow && <span aria-hidden="true">↗</span>}
      <span className="sr-only"> (se abre en una pestaña nueva)</span>
    </>
  );
}
