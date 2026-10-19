import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { Press } from "@/components/sections/Press";
import { Story } from "@/components/sections/Story";

export const metadata: Metadata = pageMetadata({
  title: "Na mídia",
  description: "A Popolare Massas e Empório na imprensa: Pequenas Empresas & Grandes Negócios, Jornal O Goiás, Jornal Hora Extra e Giro Goiás.",
  path: "/midia",
});

export default function MidiaPage() {
  return (
    <div className="pt-16 md:pt-20">
      <JsonLd data={breadcrumbSchema([{ name: "Na mídia", path: "/midia" }])} />
      <Press headingLevel="h1" />
      <Story />
    </div>
  );
}
