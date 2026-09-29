import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileTabs } from "@/components/layout/MobileTabs";
import { SmoothScroll } from "@/components/motion/SmoothScroll";

const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "The Flare Club — Pilates, Barre, meditación y bienestar",
    template: "%s · The Flare Club",
  },
  description:
    "Plataforma de bienestar on-demand: clases de Pilates Mat y Barre, meditaciones, cursos, charlas con expertos, workbooks, podcast y eventos.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "The Flare Club",
    description: "Pilates Mat, Barre, meditación y comunidad.",
    images: ["/images/fundadoras-mariana-sofi-estudio.jpg"],
    locale: "es_GT",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f4ede5",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${serif.variable} ${sans.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <SmoothScroll />
        <SiteHeader />
        <main className="pb-safe flex-1">{children}</main>
        <SiteFooter />
        <MobileTabs />
      </body>
    </html>
  );
}
