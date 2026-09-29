export interface NavItem {
  href: string;
  label: string;
  short?: string;
  /** color de módulo (docs/04-marca.md) */
  tone: "sand" | "rose" | "sage" | "sky";
}

export const NAV: NavItem[] = [
  { href: "/", label: "Inicio", tone: "sand" },
  { href: "/movement", label: "Movement", tone: "rose" },
  { href: "/meditaciones", label: "Meditaciones", short: "Meditar", tone: "sage" },
  { href: "/cursos", label: "Cursos", tone: "sky" },
  { href: "/charlas", label: "Charlas", tone: "sand" },
  { href: "/workbooks", label: "Workbooks", tone: "rose" },
  { href: "/podcast", label: "Podcast", tone: "sage" },
  { href: "/eventos", label: "Eventos", tone: "sky" },
  { href: "/corporativo", label: "Corporativo", tone: "sand" },
  { href: "/nosotras", label: "Nosotras", tone: "rose" },
];

/** Pestañas de la barra inferior móvil (máx. 5) */
export const MOBILE_TABS = [
  { href: "/", label: "Inicio", icon: "home" },
  { href: "/movement", label: "Movement", icon: "move" },
  { href: "/meditaciones", label: "Meditar", icon: "leaf" },
  { href: "/cursos", label: "Cursos", icon: "book" },
  { href: "/cuenta", label: "Yo", icon: "user" },
] as const;

export const TONE_BG: Record<NavItem["tone"], string> = {
  sand: "bg-sand-light",
  rose: "bg-rose-soft",
  sage: "bg-sage-soft",
  sky: "bg-sky-soft",
};
