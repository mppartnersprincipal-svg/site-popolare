import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/experience/SmoothScroll";
import { ScrollReveals } from "@/components/experience/ScrollReveals";
import { TrackingProvider } from "@/components/tracking/TrackingProvider";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, storeSchemas, websiteSchema } from "@/lib/schema";

/** Casca pública do site (o /painel tem a sua própria, sem GTM, Lenis nem cabeçalho). */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <JsonLd data={[organizationSchema(), websiteSchema(), ...storeSchemas()]} />
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primaria focus:px-5 focus:py-3 focus:text-farinha"
      >
        Pular para o conteúdo
      </a>
      <TrackingProvider />
      <SmoothScroll />
      <ScrollReveals />
      <Header />
      <main id="conteudo">{children}</main>
      <Footer />
    </>
  );
}
