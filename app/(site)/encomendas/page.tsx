import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { OrderForm } from "@/components/sections/OrderForm";
import { HowToCook } from "@/components/sections/HowToCook";

export const metadata: Metadata = pageMetadata({
  title: "Encomendas no seu refratário",
  description: "Encomende massas artesanais para almoços e eventos. Montamos no seu refratário, com 2 dias úteis de antecedência. Setor Sul e Eldorado.",
  path: "/encomendas",
});

export default function EncomendasPage() {
  return (
    <div className="pt-16 md:pt-20">
      <JsonLd data={breadcrumbSchema([{ name: "Encomendas", path: "/encomendas" }])} />
      <OrderForm headingLevel="h1" />
      <HowToCook />
    </div>
  );
}
