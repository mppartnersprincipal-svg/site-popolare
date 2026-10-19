import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { BRAND } from "@/data/business";
import { PageHeader } from "@/components/layout/PageHeader";
import { Story } from "@/components/sections/Story";
import { Press } from "@/components/sections/Press";
import { Faq } from "@/components/sections/Faq";

export const metadata: Metadata = pageMetadata({
  title: "Nossa história",
  description: "Como a Popolare nasceu: Remo e Antonietta faziam massas artesanais em casa, em Goiânia. Hoje a filha, Carina, segue o sonho da família.",
  path: "/sobre-nos",
});

export default function SobreNosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Chi siamo"
        title="Nossa"
        accent="história."
        intro={`Uma família italiana, um pequeno cômodo de casa e a vontade de dividir o sabor da Itália com Goiânia. Desde ${BRAND.foundingYear}.`}
        path="/sobre-nos"
        crumb="Nossa história"
        image={{ key: "equipe/carina-prato", alt: "Carina Popolare, de dólmã marsala, mostrando um prato de massa recheada na cozinha" }}
      />
      <Story showMoreLink={false} />
      <Press />
      <Faq />
    </>
  );
}
