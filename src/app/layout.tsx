import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileTabs } from "@/components/layout/MobileTabs";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "The Flare Club — Pilates, Barre, meditación y bienestar",
    template: "%s · The Flare Club",
  },
  description:
    "Plataforma de bienestar on-demand: clases de Pilates Mat y Barre, meditaciones, cursos, charlas con expertos, workbooks, podcast y eventos. Vuelve a ti.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "The Flare Club",
    description: "Movimiento, calma y comunidad para volver a ti.",
    images: ["/images/fundadoras-mariana-sofi-estudio.jpg"],
    locale: "es_GT",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5eee7",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${cormorant.variable} ${jost.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="pb-safe flex-1">{children}</main>
        <SiteFooter />
        <MobileTabs />
      </body>
    </html>
  );
}
