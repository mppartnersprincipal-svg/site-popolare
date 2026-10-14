import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { CATEGORIES, itemsByCategory } from "@/data/menu";
import { ORDER_RULES } from "@/data/business";
import { menuSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductCard } from "@/components/ui/ProductCard";

export const metadata: Metadata = pageMetadata({
  title: "Cardápio 2026",
  description: "Cardápio da Popolare: sfogliatti, canelones, rondelli, lasanhas, ravióli, cappelletti, nhoque, molhos e tiramisù, feitos à mão em Goiânia.",
  path: "/cardapio",
});

export default function CardapioPage() {
  return (
    <>
      <JsonLd data={menuSchema()} />
      <PageHeader
        eyebrow="Il menù · 2026"
        title="Cardápio"
        accent="della casa."
        intro={`Massas recheadas para assar, prontas para o forno, massas para cozinhar, molhos e sobremesa. ${ORDER_RULES.note}`}
        path="/cardapio"
        crumb="Cardápio"
        image={{ key: "produtos/sfogliatti-verde", alt: "Sfogliatti verde coberto com molho branco e damasco" }}
      />

      <nav aria-label="Categorias" className="sticky top-16 z-30 border-y border-primaria/10 bg-creme/90 backdrop-blur md:top-20">
        <ul data-lenis-prevent className="container-popolare flex gap-6 overflow-x-auto py-4 [scrollbar-width:none]">
          {CATEGORIES.map((c) => (
            <li key={c.id} className="shrink-0">
              <a href={`#${c.id}`} className="italiano text-xl text-tinta transition-colors hover:text-primaria">
                {c.nameIt}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {CATEGORIES.map((cat) => (
        <section key={cat.id} id={cat.id} aria-labelledby={`${cat.id}-titulo`} className="scroll-mt-36 py-16 md:py-24">
          <div className="container-popolare">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 id={`${cat.id}-titulo`} className="italiano text-[clamp(2.4rem,1.6rem+3vw,4.5rem)] leading-none text-primaria">
                  {cat.nameIt}
                </h2>
                <p className="mt-2 font-display text-sm uppercase tracking-[0.3em] text-tinta-suave">
                  {cat.namePt} · {cat.unit}
                </p>
              </div>
              <p className="max-w-md text-tinta-suave">{cat.description}</p>
            </div>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {itemsByCategory(cat.id).map((item) => (
                <li key={item.id}>
                  <ProductCard item={item} origem="cardapio" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}
    </>
  );
}
