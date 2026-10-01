import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { THEME_COLOR } from "@/components/ui/tokens";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileTabs } from "@/components/layout/MobileTabs";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { AuthProvider } from "@/lib/auth";
import { UserDataSync } from "@/lib/user-data";
import { HOME } from "@/content/site";
import { DEFAULT_SHARE_PHOTO, SITE_NAME, SITE_URL, shareImage } from "@/lib/seo";

/*
 * Tipografía (decisión D1-A de Ian, 30-sep), alojada en el repo (src/fonts, licencia OFL en OFL.txt):
 * el sitio no depende de Google Fonts ni para compilar ni para cargar. Subconjunto latino: cubre
 * todo el español (á é í ó ú ñ ü ¿ ¡) y las marcas de los eventos (Lulë, Prüne…).
 */
/**
 * Display: Gloock solo tiene regular y no tiene itálica. Mientras carga, el respaldo es una serif con
 * las métricas ajustadas (Times New Roman), no Arial: el titular no salta de sans a serif.
 */
const display = localFont({
  variable: "--font-gloock",
  src: "../fonts/gloock-latin-400.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  fallback: ["Georgia", "serif"],
  adjustFontFallback: "Times New Roman",
});

/** Texto y UI: Hanken Grotesk variable (400–600 en uso). Se precarga: es el texto de todo el sitio. */
const sans = localFont({
  variable: "--font-hanken",
  src: "../fonts/hanken-grotesk-latin-wght.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

/**
 * Itálica real de Hanken, aparte y sin precarga: solo la usan dos frases (clase `italic-accent` en
 * globals.css). Así no compite con la foto LCP en las demás páginas; se descarga donde se pinta.
 */
const sansItalic = localFont({
  variable: "--font-hanken-italic",
  src: "../fonts/hanken-grotesk-latin-wght-italic.woff2",
  weight: "100 900",
  style: "italic",
  display: "swap",
  preload: false,
  fallback: ["system-ui", "sans-serif"],
});

/*
 * Íconos (la "F", decisión D4-B) en public/, generados con scripts/marca/iconos.py. Van declarados aquí y
 * no como archivos de src/app: con basePath (GitHub Pages) Next perdía el favicon.ico en Inicio. Como
 * `icons` no recibe el basePath solo, se antepone a mano (igual que en manifest.ts).
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const ICONS: Metadata["icons"] = {
  icon: [
    { url: `${BASE}/favicon.ico`, sizes: "16x16 32x32 48x48", type: "image/x-icon" },
    { url: `${BASE}/icon.png`, sizes: "512x512", type: "image/png" },
  ],
  apple: [{ url: `${BASE}/apple-icon.png`, sizes: "180x180", type: "image/png" }],
};

/** Propuesta de valor (texto del hero de Inicio): "Todo cambia cuando empiezas a elegirte." */
const DESCRIPTION = `${HOME.hero.title} ${HOME.hero.paragraphs[0]}`;

/** El prototipo público (GitHub Pages) no se indexa: tiene contenido de muestra y su dominio no es el final. */
const isPrototype = process.env.GITHUB_PAGES === "true";

/*
 * Valores por defecto. Cada página arma los suyos con `pageMetadata` (src/lib/seo.ts): canonical,
 * og:url y su propia vista previa. Aquí no va canonical ni og:url (se heredarían a todas).
 */
const shareDefault = shareImage(DEFAULT_SHARE_PHOTO, SITE_NAME);

export const metadata: Metadata = {
  title: {
    default: "The Flare Club — Movimiento, crecimiento y bienestar",
    template: `%s · ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  metadataBase: new URL(SITE_URL),
  icons: ICONS,
  robots: isPrototype ? { index: false, follow: false } : undefined,
  openGraph: {
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${HOME.hero.title}`,
    description: HOME.hero.paragraphs[0],
    images: [shareDefault],
    locale: "es_GT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${HOME.hero.title}`,
    description: HOME.hero.paragraphs[0],
    images: [shareDefault],
  },
};

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable} ${sansItalic.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        {/* Fuera de la vista hasta recibir foco (.skip-link en globals.css) */}
        <a href="#contenido" className="skip-link">
          Saltar al contenido
        </a>
        <AuthProvider>
          {/* Sincroniza favoritos, historial y membresía con la cuenta (una sola vez) */}
          <UserDataSync />
          {/* Solo con mouse o trackpad y fuera de las páginas con player (ver SmoothScroll) */}
          <SmoothScroll />
          {/* motion diferido (LazyMotion) y "reducir movimiento" del sistema en todo el sitio */}
          <MotionProvider>
            <SiteHeader />
            <main id="contenido" tabIndex={-1} className="flex-1 focus:outline-none">
              {children}
            </main>
            <SiteFooter />
            <MobileTabs />
          </MotionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
