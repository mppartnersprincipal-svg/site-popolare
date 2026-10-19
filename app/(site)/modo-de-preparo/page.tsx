import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { HowToCook } from "@/components/sections/HowToCook";
import { Catalog } from "@/components/sections/Catalog";

export const metadata: Metadata = pageMetadata({
  title: "Modo de preparo",
  description: "Como assar sfogliatti, canelones e lasanhas direto do congelador e como cozinhar fettuccine, ravióli, cappelletti e nhoque da Popolare.",
  path: "/modo-de-preparo",
});

export default function ModoDePreparoPage() {
  return (
    <div className="pt-16 md:pt-20">
      <JsonLd data={breadcrumbSchema([{ name: "Modo de preparo", path: "/modo-de-preparo" }])} />
      <HowToCook headingLevel="h1" />
      <Catalog />
    </div>
  );
}
