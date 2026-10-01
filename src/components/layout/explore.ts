import { NAV, type NavItem } from "@/lib/nav";

/** Índice "Explora" del pie y de la 404: todas las secciones del menú (con Inicio) más Membresía y Mi cuenta. */
export const EXPLORE: NavItem[] = [
  ...NAV,
  { href: "/membresia", label: "Membresía" },
  { href: "/cuenta", label: "Mi cuenta" },
];
