"use client";

import { Minus, Plus } from "lucide-react";
import type { MenuItem } from "@/data/menu";
import { cartStore, MAX_QTY, useCartQty } from "@/lib/cartStore";
import { track } from "@/lib/tracking";

interface AddToCartProps {
  item: MenuItem;
  /** Onde o botão está (data-track-local equivalente): lp-catalogo, lp-carrinho… */
  local: string;
  /** Versão menor para a lista do pedido */
  compact?: boolean;
}

/** "Adicionar" que vira um contador (− qtd +) assim que o item entra no pedido. */
export function AddToCart({ item, local, compact = false }: AddToCartProps) {
  const qty = useCartQty(item.id);

  const change = (next: number) => {
    cartStore.setQty(item.id, next);
    track(next > qty ? "add_to_cart" : "remove_from_cart", {
      produto: item.id,
      categoria: item.category,
      quantidade: Math.max(next, 0),
      local,
    });
  };

  const stepButton = `grid shrink-0 place-items-center rounded-full text-primaria transition-colors hover:bg-primaria hover:text-farinha disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-primaria ${
    compact ? "size-8" : "size-9"
  }`;

  if (qty === 0) {
    return (
      <button
        type="button"
        onClick={() => change(1)}
        aria-label={`Adicionar ${item.nameIt} ao pedido`}
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primaria font-semibold text-farinha transition-transform duration-300 hover:scale-105 hover:bg-vinho ${
          compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
        }`}
      >
        <Plus aria-hidden className="size-4" strokeWidth={2.5} />
        Adicionar
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label={`Quantidade de ${item.nameIt} no pedido`}
      className={`inline-flex shrink-0 items-center rounded-full border border-primaria bg-farinha ${compact ? "p-0.5" : "p-1"}`}
    >
      <button
        type="button"
        onClick={() => change(qty - 1)}
        aria-label={qty === 1 ? `Tirar ${item.nameIt} do pedido` : `Tirar um ${item.nameIt}`}
        className={stepButton}
      >
        <Minus aria-hidden className="size-4" strokeWidth={2.5} />
      </button>
      <output aria-live="polite" className={`min-w-[1.75rem] text-center font-display text-tinta ${compact ? "text-sm" : "text-base"}`}>
        {qty}
      </output>
      <button
        type="button"
        onClick={() => change(qty + 1)}
        disabled={qty >= MAX_QTY}
        aria-label={`Adicionar mais um ${item.nameIt}`}
        className={stepButton}
      >
        <Plus aria-hidden className="size-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}
