import Image from "next/image";
import { Icon } from "./Icon";

/** Círculo de play: md en las fichas (crece desde sm), lg en el player de rutina (baja con el celular acostado). */
const CIRCLE = {
  md: "h-16 w-16 sm:h-20 sm:w-20",
  lg: "h-20 w-20 landscape-short:h-16 landscape-short:w-16",
} as const;
const ICON_SIZE = { md: 26, lg: 28 } as const;

/**
 * Póster con el botón de play, común a VideoPlayer y RoutinePlayer: todo el póster es el botón y va
 * dentro del escenario del video (`relative overflow-hidden`).
 *
 * Foco: el escenario recorta lo que sale de él, así que el anillo global (por fuera) no se vería. Aquí
 * va por dentro: un marco de dos tintas (surface con un filo espresso, se lee sobre fotos claras y
 * oscuras) y el círculo crece como al pasar el mouse. En contraste forzado queda el borde del marco.
 * El póster es la foto LCP de la página: se precarga en prioridad alta.
 */
export function PlayOverlay({
  image,
  focal,
  sizes,
  label,
  onClick,
  size = "md",
  dim = false,
}: {
  image: string;
  /** object-position del póster (Video.thumbnailFocal) */
  focal?: string;
  sizes: string;
  /** Nombre accesible: "Reproducir {título}" */
  label: string;
  onClick: () => void;
  size?: keyof typeof CIRCLE;
  /** Atenúa la foto sobre el fondo espresso del escenario */
  dim?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="group absolute inset-0 h-full w-full">
      <Image
        src={image}
        alt=""
        fill
        sizes={sizes}
        preload
        fetchPriority="high"
        className={`object-cover ${dim ? "opacity-80" : ""}`}
        style={focal ? { objectPosition: focal } : undefined}
      />
      <span aria-hidden="true" className="pointer-events-none absolute inset-2 hidden rounded-media border-2 border-surface shadow-[0_0_0_2px_var(--color-espresso)] group-focus-visible:block" />
      <span
        className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-surface text-espresso transition-transform duration-(--duration-fast) ease-out-quint group-hover:scale-105 group-focus-visible:scale-105 group-active:scale-95 motion-reduce:transition-none ${CIRCLE[size]}`}
      >
        <Icon name="play" size={ICON_SIZE[size]} className="ml-1" />
      </span>
    </button>
  );
}
