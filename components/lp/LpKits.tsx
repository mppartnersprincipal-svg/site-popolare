"use client";

import { Check, Plus } from "lucide-react";
import { findItem, type MenuItem } from "@/data/menu";
import { LP_KITS, type LpKit } from "@/data/lp";
import { cartStore, useCart } from "@/lib/cartStore";
import { track } from "@/lib/tracking";
import { Picture } from "@/components/ui/Picture";

function kitItems(kit: LpKit): MenuItem[] {
  return kit.items.map((id) => findItem(id)).filter((i): i is MenuItem => Boolean(i));
}

/** Sugestões prontas: combinações do cardápio que entram no pedido com um toque. */
export function LpKits() {
  const { lines } = useCart();
  const inCart = new Set(lines.map((l) => l.id));

  const addKit = (kit: LpKit) => {
    cartStore.addMany(kit.items);
    track("add_to_cart", { produto: kit.id, kit: true, quantidade: kit.items.length, local: "lp-kits" });
  };

  const viewCart = (kit: LpKit) => {
    track("view_cart", { local: "lp-kits", produto: kit.id });
    cartStore.open();
  };

  return (
    <section data-section="lp-kits" aria-labelledby="lp-kits-titulo" className="bg-vinho py-16 text-farinha md:py-24">
      <div className="container-popolare">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow text-dourado">Suggerimenti della casa</p>
            <h2 id="lp-kits-titulo" className="mt-4 text-[clamp(2rem,1.2rem+3vw,3.8rem)] leading-[1.05]">
              <span className="font-display uppercase tracking-[0.03em]">Não sabe por onde </span>
              <span className="italiano text-massa">começar?</span>
            </h2>
            <p className="mt-4 text-farinha/75">
              Combinações que a família monta para as ocasiões mais pedidas. Um toque coloca todos os itens no seu pedido; depois é só ajustar as quantidades.
            </p>
          </div>
          <p aria-hidden className="text-sm font-semibold text-massa sm:hidden">
            Deslize para ver mais →
          </p>
        </div>

        <ul className="-mx-[var(--gutter)] mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-4 [scrollbar-width:none] sm:mx-0 sm:mt-12 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
          {LP_KITS.map((kit) => {
            const items = kitItems(kit);
            const isInCart = items.length > 0 && items.every((i) => inCart.has(i.id));
            return (
              <li key={kit.id} className="w-[80%] shrink-0 snap-center sm:w-auto">
                <article className="flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-farinha text-tinta shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)]">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Picture image={kit.image} alt={kit.imageAlt} sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 80vw" className="block h-full w-full" imgClassName="h-full w-full object-cover" />
                    <p className="absolute bottom-3 left-3 rounded-full bg-farinha/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primaria backdrop-blur">
                      {items.length} itens
                    </p>
                  </div>
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <h3 className="italiano text-[1.7rem] leading-[1.05] text-tinta">{kit.name}</h3>
                    <p className="mt-1.5 text-sm text-tinta-suave">{kit.tagline}</p>
                    <ul className="mt-4 flex-1 space-y-1.5 text-sm">
                      {items.map((i) => (
                        <li key={i.id} className="flex items-baseline justify-between gap-3 border-b border-primaria/10 pb-1.5">
                          <span className="text-tinta">{i.namePt}</span>
                          <span className="shrink-0 text-xs text-tinta-suave">{i.size}</span>
                        </li>
                      ))}
                    </ul>
                    {isInCart ? (
                      <button
                        type="button"
                        onClick={() => viewCart(kit)}
                        className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-primaria px-5 py-3 text-sm font-semibold text-primaria transition-colors hover:bg-primaria hover:text-farinha"
                      >
                        <Check aria-hidden className="size-4" strokeWidth={2.5} />
                        No seu pedido · ver
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addKit(kit)}
                        className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-primaria px-5 py-3 text-sm font-semibold text-farinha transition-transform duration-300 hover:scale-[1.03] hover:bg-vinho"
                      >
                        <Plus aria-hidden className="size-4" strokeWidth={2.5} />
                        Adicionar os {items.length} itens
                      </button>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
