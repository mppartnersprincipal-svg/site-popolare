"use client";

import { Snowflake } from "lucide-react";
import { CATEGORIES, itemsByCategory } from "@/data/menu";
import { LP_FROZEN } from "@/data/lp";
import { track } from "@/lib/tracking";
import { selectCatalogTab } from "./LpCatalog";

/** A linha de congelados: o que é, como cuidar em casa e as 5 categorias do cardápio (atalho para a aba). */
export function LpFrozen() {
  const goTo = (id: (typeof CATEGORIES)[number]["id"]) => {
    track("click_cta", { local: "lp-congelados", categoria: id });
    selectCatalogTab(id);
  };

  return (
    <section data-section="lp-congelados" aria-labelledby="lp-congelados-titulo" className="bg-farinha py-16 md:py-24">
      <div className="container-popolare">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <p className="eyebrow text-primaria">I surgelati Popolare</p>
            <h2 id="lp-congelados-titulo" className="mt-4 text-[clamp(2rem,1.2rem+3vw,3.8rem)] leading-[1.05]">
              <span className="font-display uppercase tracking-[0.03em]">Congelados </span>
              <span className="italiano text-primaria">de verdade, feitos à mão</span>
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-tinta-suave">{LP_FROZEN.intro}</p>
            <ul className="mt-8 space-y-4">
              {LP_FROZEN.care.map((c) => (
                <li key={c.title} className="flex gap-4">
                  <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-primaria/10 text-primaria">
                    <Snowflake className="size-5" strokeWidth={1.8} />
                  </span>
                  <div>
                    <h3 className="italiano text-xl leading-tight text-tinta">{c.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-tinta-suave">{c.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-2">
            {CATEGORIES.map((c, i) => {
              const count = itemsByCategory(c.id).length;
              const isWide = i === CATEGORIES.length - 1;
              return (
                <li key={c.id} className={isWide ? "sm:col-span-2" : ""}>
                  <button
                    type="button"
                    onClick={() => goTo(c.id)}
                    className="group flex h-full w-full flex-col items-start rounded-[1.5rem] bg-creme p-6 text-left transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgba(89,14,19,0.6)]"
                  >
                    <span className="eyebrow text-[0.62rem] text-madeira-escura">{c.unit}</span>
                    <span className="italiano mt-2 text-[1.7rem] leading-[1.05] text-tinta">{c.nameIt}</span>
                    <span className="text-sm font-medium text-tinta-suave">{c.namePt}</span>
                    <span className="mt-3 flex-1 text-sm leading-relaxed text-tinta-suave">{c.description}</span>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primaria">
                      Ver {count} {count === 1 ? "item" : "itens"}
                      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
