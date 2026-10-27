"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { CATEGORIES, findItem, itemsByCategory, type MenuCategoryId, type MenuItem } from "@/data/menu";
import { LP_PRODUCTS } from "@/data/lp";
import { prefersReducedMotion } from "@/lib/device";
import { track } from "@/lib/tracking";
import { getLenis } from "@/components/experience/SmoothScroll";
import { LpProductCard } from "./LpProductCard";

const HEADER_HEIGHT = 80;
/** Deixa um evento de scroll nativo pendente (ex.: salto anterior) ser processado antes de animar */
const SCROLL_SETTLE_MS = 60;

/** Rola até o cardápio pelo Lenis (o scrollIntoView nativo é ignorado enquanto o smooth scroll está ativo). */
export function scrollToProducts(): void {
  window.setTimeout(() => {
    const el = document.getElementById("produtos");
    if (!el) return;
    const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(top);
    else window.scrollTo({ top, behavior: "smooth" });
  }, SCROLL_SETTLE_MS);
}

type TabId = "destaque" | "mais-pedidos" | MenuCategoryId;

interface Tab {
  id: TabId;
  label: string;
  sub: string;
  description: string;
  items: readonly MenuItem[];
}

function resolveItems(ids: readonly string[]): MenuItem[] {
  return ids.map((id) => findItem(id)).filter((i): i is MenuItem => Boolean(i));
}

const BASE_TABS: readonly Tab[] = [
  { id: "mais-pedidos", label: "Mais pedidos", sub: "os favoritos de Goiânia", description: "Os itens que mais saem no balcão e no WhatsApp.", items: resolveItems(LP_PRODUCTS) },
  ...CATEGORIES.map((c) => ({
    id: c.id,
    label: c.nameIt,
    sub: c.namePt.toLowerCase(),
    description: `${c.description} Embalagens de ${c.unit}.`,
    items: itemsByCategory(c.id),
  })),
];

/** Aba própria da LP por produto (data/lpGrupos.ts): primeira e aberta */
export interface CatalogHighlight {
  label: string;
  sub: string;
  description: string;
  /** ids de data/menu.ts, na ordem */
  produtos: readonly string[];
}

interface LpCatalogProps {
  highlight?: CatalogHighlight;
  /** Prefixo do data-track-local da página (lp, lp-lasanha…) */
  rastreio: string;
}

const SELECT_EVENT = "lp:categoria";

/** Outras seções (ex.: Congelados) abrem uma aba do cardápio e rolam até ela. */
export function selectCatalogTab(id: TabId): void {
  window.dispatchEvent(new CustomEvent<TabId>(SELECT_EVENT, { detail: id }));
}

/** Cardápio completo com abas por categoria e botão "Adicionar" em cada item. */
export function LpCatalog({ highlight, rastreio }: LpCatalogProps) {
  const tabs = useMemo<readonly Tab[]>(
    () => (highlight ? [{ id: "destaque", label: highlight.label, sub: highlight.sub, description: highlight.description, items: resolveItems(highlight.produtos) }, ...BASE_TABS] : BASE_TABS),
    [highlight]
  );
  const local = `${rastreio}-catalogo`;
  const [tabId, setTabId] = useState<TabId>(tabs[0].id);
  const tab = tabs.find((t) => t.id === tabId) ?? tabs[0];
  const currentTab = useRef<TabId>(tabId);
  const shouldScrollAfterRefresh = useRef(false);

  useEffect(() => {
    currentTab.current = tabId;
  }, [tabId]);

  useEffect(() => {
    const onSelect = (e: Event) => {
      const id = (e as CustomEvent<TabId>).detail;
      if (!tabs.some((t) => t.id === id)) return;
      if (id === currentTab.current) {
        scrollToProducts();
        return;
      }
      // Rola só depois do ScrollTrigger.refresh() da troca de aba: o refresh restaura a posição
      // e, se a animação do Lenis já estivesse correndo, ela seria interrompida no meio
      shouldScrollAfterRefresh.current = true;
      setTabId(id);
    };
    window.addEventListener(SELECT_EVENT, onSelect);
    return () => window.removeEventListener(SELECT_EVENT, onSelect);
  }, [tabs]);

  // A altura da seção muda com a aba; os reveals abaixo (GSAP, já carregado pelo layout) precisam remedir
  useEffect(() => {
    let isCancelled = false;
    const afterRefresh = () => {
      if (isCancelled || !shouldScrollAfterRefresh.current) return;
      shouldScrollAfterRefresh.current = false;
      scrollToProducts();
    };
    if (prefersReducedMotion()) {
      afterRefresh();
      return;
    }
    void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      if (isCancelled) return;
      ScrollTrigger.refresh();
      afterRefresh();
    });
    return () => {
      isCancelled = true;
    };
  }, [tabId]);

  const choose = (id: TabId) => {
    setTabId(id);
    track("catalog_filter", { categoria: id, local });
  };

  // Padrão ARIA de abas: setas/Home/End movem entre abas
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const index = tabs.findIndex((t) => t.id === tabId);
    const next =
      e.key === "ArrowRight" ? (index + 1) % tabs.length
      : e.key === "ArrowLeft" ? (index - 1 + tabs.length) % tabs.length
      : e.key === "Home" ? 0
      : e.key === "End" ? tabs.length - 1
      : -1;
    if (next < 0) return;
    e.preventDefault();
    choose(tabs[next].id);
    document.getElementById(`lp-aba-${tabs[next].id}`)?.focus();
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
          {tabs.map((t) => {
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
                <LpProductCard item={item} local={local} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
