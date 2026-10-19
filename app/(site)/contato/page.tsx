import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { Locations } from "@/components/sections/Locations";
import { Faq } from "@/components/sections/Faq";

export const metadata: Metadata = pageMetadata({
  title: "Lojas e contato em Goiânia",
  description: "Endereços, telefones, WhatsApp e horários das lojas Popolare em Goiânia: Rua 88, 402, Setor Sul, e Rua das Orquídeas, 1864, Eldorado.",
  path: "/contato",
});

export default function ContatoPage() {
  return (
    <div className="pt-16 md:pt-20">
      <JsonLd data={breadcrumbSchema([{ name: "Lojas e contato", path: "/contato" }])} />
      <Locations headingLevel="h1" />
      <Faq />
    </div>
  );
}
