import { COMING_SOON, coursesLive } from "@/content/site";

export interface NavItem {
  href: string;
  label: string;
  /** Nota pequeña junto al nombre (ej. "Próximamente") */
  note?: string;
}

/**
 * Menú principal (pedido de las fundadoras, 30-sep): cada sección es un tipo de contenido.
 * "Arma tu rutina" NO va aquí: es una herramienta dentro de Movement (/rutina).
 */
export const NAV: NavItem[] = [
  { href: "/", label: "Inicio" },
  { href: "/movement", label: "Movement" },
  { href: "/meditaciones", label: "Meditaciones" },
  { href: "/workbooks", label: "Workbooks" },
  { href: "/charlas", label: "Charlas" },
  { href: "/cursos", label: "Cursos", note: coursesLive() ? undefined : COMING_SOON },
  { href: "/podcast", label: "Podcast" },
  { href: "/eventos", label: "Eventos" },
  { href: "/corporativo", label: "Corporativo" },
  { href: "/sobre-nosotras", label: "Sobre nosotras" },
];

/**
 * Pestañas de la barra inferior móvil (máx. 5).
 * Excepción de nombre: "Meditar" y no "Meditaciones" como en el menú. A 320 px cada celda
 * mide unos 75 px y "Meditaciones" ocupa 87 px; partida en dos líneas desalinea la barra.
 */
export const MOBILE_TABS = [
  { href: "/", label: "Inicio", icon: "home" },
  { href: "/movement", label: "Movement", icon: "move" },
  { href: "/meditaciones", label: "Meditar", icon: "leaf" },
  { href: "/eventos", label: "Eventos", icon: "calendar" },
  { href: "/cuenta", label: "Mi cuenta", icon: "user" },
] as const;
