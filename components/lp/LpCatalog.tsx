"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { CATEGORIES, findItem, itemsByCategory, type MenuCategoryId, type MenuItem } from "@/data/menu";
import { LP_PRODUCTS } from "@/data/lp";
import { prefersReducedMotion } from "@/lib/device";
import { track } from "@/lib/tracking";
import { LpProductCard } from "./LpProductCard";

type TabId = "mais-pedidos" | MenuCategoryId;

interface Tab {
  id: TabId;
  label: string;
  sub: string;
  description: string;
  items: readonly MenuItem[];
}

const FEATURED = LP_PRODUCTS.map((id) => findItem(id)).filter((i): i is MenuItem => Boolean(i));

const TABS: readonly Tab[] = [
  { id: "mais-pedidos", label: "Mais pedidos", sub: "os favoritos de Goiânia", description: "Os itens que mais saem no balcão e no WhatsApp.", items: FEATURED },
  ...CATEGORIES.map((c) => ({
    id: c.id,
    label: c.nameIt,
    sub: c.namePt.toLowerCase(),
    description: `${c.description} Embalagens de ${c.unit}.`,
    items: itemsByCategory(c.id),
  })),
];

/** Cardápio completo com abas por categoria e botão "Adicionar" em cada item. */
export function LpCatalog() {
  const [tabId, setTabId] = useState<TabId>("mais-pedidos");
  const tab = TABS.find((t) => t.id === tabId) ?? TABS[0];

  // A altura da seção muda com a aba; os reveals abaixo (GSAP, já carregado pelo layout) precisam remedir
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let isCancelled = false;
    void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      if (!isCancelled) ScrollTrigger.refresh();
    });
    return () => {
      isCancelled = true;
    };
  }, [tabId]);

  const choose = (id: TabId) => {
    setTabId(id);
    track("catalog_filter", { categoria: id, local: "lp-catalogo" });
  };

  // Padrão ARIA de abas: setas/Home/End movem entre abas
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const index = TABS.findIndex((t) => t.id === tabId);
    const next =
      e.key === "ArrowRight" ? (index + 1) % TABS.length
      : e.key === "ArrowLeft" ? (index - 1 + TABS.length) % TABS.length
      : e.key === "Home" ? 0
      : e.key === "End" ? TABS.length - 1
      : -1;
    if (next < 0) return;
    e.preventDefault();
    choose(TABS[next].id);
    document.getElementById(`lp-aba-${TABS[next].id}`)?.focus();
  };

  return (
    <section id="produtos" data-section="lp-catalogo" aria-labelledby="lp-catalogo-titulo" className="scroll-mt-20 py-16 md:py-24">
      <div className="container-popolare">
        <div className="max-w-3xl">
          <p className="eyebrow text-primaria">Il menù completo</p>
          <h2 id="lp-catalogo-titulo" className="mt-4 text-[clamp(2rem,1.2rem+3vw,3.8rem)] leading-[1.05]">
            <span className="font-display uppercase tracking-[0.03em]">Todo o cardápio </span>
            <span className="italiano text-primaria">para montar o seu pedido</span>
          </h2>
          <p className="mt-4 text-tinta-suave">
            Toque em “Adicionar” nos itens que quiser e ajuste as quantidades. Os preços não ficam no site: a loja confirma o valor e a disponibilidade no WhatsApp.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Categorias do cardápio"
          data-lenis-prevent
          className="-mx-[var(--gutter)] mt-8 flex gap-2 overflow-x-auto px-[var(--gutter)] pb-2 [scrollbar-width:none] md:mt-10"
        >
          {TABS.map((t) => {
            const isActive = t.id === tabId;
            return (
              <button
                key={t.id}
                role="tab"
                type="button"
                id={`lp-aba-${t.id}`}
                aria-selected={isActive}
                aria-controls="lp-catalogo-painel"
                tabIndex={isActive ? 0 : -1}
                onClick={() => choose(t.id)}
                onKeyDown={onTabKey}
                className={`shrink-0 rounded-full border px-4 py-2 text-left transition-colors duration-300 sm:px-5 sm:py-2.5 ${
                  isActive ? "border-primaria bg-primaria text-farinha" : "border-tinta/15 bg-farinha/70 text-tinta hover:border-primaria/50"
                }`}
              >
                <span className="italiano block text-lg leading-none sm:text-xl">
                  {t.label} <span className="font-sans text-[0.65rem] not-italic opacity-70">{t.items.length}</span>
                </span>
                <span className={`text-[0.68rem] ${isActive ? "text-farinha/75" : "text-tinta-suave"}`}>{t.sub}</span>
              </button>
            );
          })}
        </div>

        <div id="lp-catalogo-painel" role="tabpanel" aria-labelledby={`lp-aba-${tab.id}`} className="mt-6 md:mt-8">
          <p className="text-sm text-tinta-suave">{tab.description}</p>
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
            {tab.items.map((item, i) => (
              <li key={`${tab.id}-${item.id}`} className="animate-[surgir_0.6s_var(--ease-out-expo)_both]" style={{ animationDelay: `${Math.min(i, 11) * 45}ms` }}>
                <LpProductCard item={item} local="lp-catalogo" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
