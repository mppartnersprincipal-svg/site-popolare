"use client";

import Link from "next/link";
import { useEffect, useState, type KeyboardEvent } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CATEGORIES, featuredItems, MENU, type MenuCategoryId } from "@/data/menu";
import { track } from "@/lib/tracking";
import { ProductCard } from "@/components/ui/ProductCard";

type TabId = "destaques" | MenuCategoryId;

const MAX_ITEMS = 8;

const TABS: readonly { id: TabId; label: string; sub: string }[] = [
  { id: "destaques", label: "Destaques", sub: "os favoritos da casa" },
  ...CATEGORIES.map((c) => ({ id: c.id, label: c.nameIt, sub: c.namePt.toLowerCase() })),
];

function itemsFor(tab: TabId) {
  if (tab === "destaques") return featuredItems().slice(0, MAX_ITEMS);
  return MENU.filter((i) => i.category === tab && i.image).slice(0, MAX_ITEMS);
}

export function Catalog() {
  const [tab, setTab] = useState<TabId>("destaques");
  const items = itemsFor(tab);

  // A altura da seção muda conforme a aba; pins/reveals abaixo precisam remedir
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [tab]);

  const choose = (id: TabId) => {
    setTab(id);
    track("catalog_filter", { categoria: id });
  };

  // Padrão ARIA de abas: setas/Home/End movem entre abas
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const index = TABS.findIndex((t) => t.id === tab);
    const next =
      e.key === "ArrowRight" ? (index + 1) % TABS.length
      : e.key === "ArrowLeft" ? (index - 1 + TABS.length) % TABS.length
      : e.key === "Home" ? 0
      : e.key === "End" ? TABS.length - 1
      : -1;
    if (next < 0) return;
    e.preventDefault();
    choose(TABS[next].id);
    document.getElementById(`aba-${TABS[next].id}`)?.focus();
  };

  return (
    <section id="catalogo" data-section="catalogo" aria-labelledby="catalogo-titulo" className="section-space relative">
      <div className="container-popolare">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p data-reveal className="eyebrow text-primaria">
              Il catalogo
            </p>
            <h2 id="catalogo-titulo" data-reveal className="mt-4 text-[length:var(--text-display)] leading-[1.02]">
              <span className="font-display uppercase tracking-[0.03em]">Escolha, </span>
              <span className="italiano text-primaria">leve ao forno.</span>
            </h2>
          </div>
          <Link
            href="/cardapio"
            data-track="click_cta"
            data-track-local="catalogo"
            className="eyebrow self-start rounded-full border border-primaria/30 px-5 py-3 text-primaria transition-colors hover:bg-primaria hover:text-farinha md:self-auto"
          >
            Cardápio completo →
          </Link>
        </div>

        <div
          role="tablist"
          aria-label="Categorias do catálogo"
          data-lenis-prevent
          className="-mx-[var(--gutter)] mt-10 flex gap-2 overflow-x-auto px-[var(--gutter)] pb-2 [scrollbar-width:none]"
        >
          {TABS.map((t) => {
            const isActive = t.id === tab;
            return (
              <button
                key={t.id}
                role="tab"
                type="button"
                id={`aba-${t.id}`}
                aria-selected={isActive}
                aria-controls="catalogo-painel"
                tabIndex={isActive ? 0 : -1}
                onClick={() => choose(t.id)}
                onKeyDown={onTabKey}
                className={`shrink-0 rounded-full border px-5 py-2.5 text-left transition-colors duration-300 ${
                  isActive ? "border-primaria bg-primaria text-farinha" : "border-tinta/15 bg-farinha/60 text-tinta hover:border-primaria/50"
                }`}
              >
                <span className="italiano block text-xl leading-none">{t.label}</span>
                <span className={`text-[0.7rem] ${isActive ? "text-farinha/75" : "text-tinta-suave"}`}>{t.sub}</span>
              </button>
            );
          })}
        </div>

        <div id="catalogo-painel" role="tabpanel" aria-labelledby={`aba-${tab}`} className="mt-10">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item, i) => (
              <li key={`${tab}-${item.id}`} className="animate-[surgir_0.7s_var(--ease-out-expo)_both]" style={{ animationDelay: `${i * 60}ms` }}>
                <ProductCard item={item} origem="home-catalogo" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
