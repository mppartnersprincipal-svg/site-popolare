import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope, Marcellus } from "next/font/google";
import { BRAND, SITE_URL } from "@/data/business";
import "./globals.css";

const marcellus = Marcellus({ variable: "--font-marcellus", weight: "400", subsets: ["latin"], display: "swap" });
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["500", "600"],
  style: ["italic"],
  subsets: ["latin"],
  display: "swap",
});
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });

const TITLE = "Popolare — Massas italianas artesanais em Goiânia";
const DESCRIPTION =
  "Massas artesanais feitas à mão por uma família italiana em Goiânia desde 1994: sfogliatti, lasanhas, canelones, molhos e tiramisù. Peça pelo WhatsApp.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: `%s | ${BRAND.shortName}` },
  description: DESCRIPTION,
  applicationName: BRAND.name,
  keywords: [
    "massas artesanais Goiânia",
    "massa caseira Goiânia",
    "lasanha congelada Goiânia",
    "empório italiano Goiânia",
    "sfogliatti",
    "canelone",
    "ravióli",
    "tiramisù",
    "Setor Sul",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: BRAND.name,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#9b1b20",
  width: "device-width",
  initialScale: 1,
};

// Roda antes da primeira pintura: marca JS ativo e pula a intro em visitas repetidas (sem flash).
const BOOT_SCRIPT = `(function(){var d=document.documentElement;d.classList.add('js');try{if(sessionStorage.getItem('popolare_intro')==='1'||matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('intro-vista')}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: o BOOT_SCRIPT adiciona classes ao <html> antes da hidratação
    <html lang="pt-BR" suppressHydrationWarning className={`${marcellus.variable} ${cormorant.variable} ${manrope.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body className="grao min-h-dvh">{children}</body>
    </html>
  );
}
