"use client";

import { ShoppingBag } from "lucide-react";
import { cartStore, countItems, useCart } from "@/lib/cartStore";
import { track } from "@/lib/tracking";
import { WhatsAppFloat } from "@/components/lp/WhatsAppFloat";
import { CartDrawer } from "./CartDrawer";

/**
 * Rodapé flutuante da LP: WhatsApp direto sempre visível e, assim que há itens,
 * a pílula "Meu pedido" que abre a gaveta com a lista e o envio pelo WhatsApp.
 */
interface CartBarProps {
  /** Prefixo do data-track-local da página (lp, lp-lasanha…) */
  rastreio: string;
  /** Mensagem do botão do WhatsApp */
  message: string;
  /** 1ª linha da mensagem do pedido */
  pedidoIntro: string;
}

export function CartBar({ rastreio, message, pedidoIntro }: CartBarProps) {
  const { lines, isOpen } = useCart();
  const count = countItems(lines);

  const open = () => {
    track("view_cart", { itens: count, local: `${rastreio}-barra` });
    cartStore.open();
  };

  return (
    <>
      <div className="fixed inset-x-4 bottom-4 z-[60] flex items-center justify-end gap-3 sm:inset-x-auto sm:bottom-6 sm:right-6">
        {count > 0 && (
          <button
            type="button"
            onClick={open}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            className="flex flex-1 items-center justify-between gap-3 rounded-full bg-tinta py-2 pl-5 pr-2 text-farinha shadow-[0_18px_44px_-16px_rgba(42,10,12,0.75)] transition-transform duration-300 hover:scale-[1.03] animate-[surgir_0.5s_var(--ease-out-expo)_both] sm:flex-none"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <ShoppingBag aria-hidden className="size-5" />
              Meu pedido
            </span>
            <span
              key={count}
              className="grid h-8 min-w-8 place-items-center rounded-full bg-primaria px-2 text-sm font-bold animate-[surgir_0.35s_var(--ease-out-expo)_both]"
            >
              {count}
              <span className="sr-only"> {count === 1 ? "item" : "itens"}</span>
            </span>
          </button>
        )}
        <WhatsAppFloat local={`${rastreio}-flutuante`} message={message} className="relative shrink-0" />
      </div>
      {isOpen && <CartDrawer local={`${rastreio}-carrinho`} intro={pedidoIntro} />}
    </>
  );
}
