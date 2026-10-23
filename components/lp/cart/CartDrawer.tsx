"use client";

import { Trash2, X } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { MAIN_UNIT, ORDER_RULES } from "@/data/business";
import { cartStore, countItems, resolveLines, useCart } from "@/lib/cartStore";
import { track } from "@/lib/tracking";
import { cartMessage, whatsappUrl } from "@/lib/whatsapp";
import { SCROLL_LOCK_CLASS } from "@/components/experience/SmoothScroll";
import { Picture } from "@/components/ui/Picture";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { scrollToProducts } from "@/components/lp/LpCatalog";
import { AddToCart } from "./AddToCart";

const MAX_OBS = 300;
const FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])';

/** Gaveta "Meu pedido": lista com quantidades, refratário, observações e envio pelo WhatsApp. */
export function CartDrawer() {
  const { lines } = useCart();
  const entries = resolveLines(lines);
  const count = countItems(lines);
  const [wantsRefratario, setWantsRefratario] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSent, setIsSent] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Trava o scroll da página, leva o foco ao painel e devolve ao fechar
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.documentElement.classList.add(SCROLL_LOCK_CLASS);
    headingRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && cartStore.close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.classList.remove(SCROLL_LOCK_CLASS);
      window.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, []);

  // Foco circula dentro do painel (Tab / Shift+Tab)
  const trapFocus = (e: ReactKeyboardEvent<HTMLElement>) => {
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === headingRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const hasBakeItems = entries.some((e) => e.item.category === "al-forno" || e.item.category === "pronti");
  const message = cartMessage({ entries, refratario: hasBakeItems && wantsRefratario, observacoes: notes });
  const href = whatsappUrl(MAIN_UNIT, message);
  const productIds = lines.map((l) => l.id).join(",");

  const removeLine = (id: string) => {
    cartStore.remove(id);
    track("remove_from_cart", { produto: id, quantidade: 0, local: "lp-carrinho" });
  };

  const goToProducts = () => {
    cartStore.close();
    // a trava de rolagem sai no cleanup do efeito; rola no próximo quadro
    requestAnimationFrame(scrollToProducts);
  };

  const field = "mt-1.5 w-full rounded-2xl border border-tinta/15 bg-farinha px-4 py-3 text-sm text-tinta outline-none transition-colors focus:border-primaria";

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        aria-label="Fechar o pedido"
        onClick={cartStore.close}
        className="absolute inset-0 bg-tinta/55 backdrop-blur-[2px] animate-[aparecer_0.3s_ease_both]"
      />
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pedido-titulo"
        onKeyDown={trapFocus}
        className="absolute inset-x-0 bottom-0 flex max-h-[90dvh] flex-col rounded-t-[1.75rem] bg-creme shadow-[0_-30px_80px_-40px_rgba(42,10,12,0.6)] animate-[subir_0.45s_var(--ease-out-expo)_both] sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[28rem] sm:max-h-none sm:rounded-l-[1.75rem] sm:rounded-tr-none sm:animate-[deslizar_0.45s_var(--ease-out-expo)_both]"
      >
        <header className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
          <div>
            <p className="eyebrow text-primaria">Il mio ordine</p>
            <h2 id="pedido-titulo" ref={headingRef} tabIndex={-1} className="italiano mt-1 text-3xl leading-none text-tinta outline-none">
              Meu pedido
            </h2>
            <p className="mt-1 text-sm text-tinta-suave">
              {count === 0 ? "Nenhum item ainda" : `${count} ${count === 1 ? "item" : "itens"} · a loja confirma o valor no WhatsApp`}
            </p>
          </div>
          <button type="button" onClick={cartStore.close} aria-label="Fechar" className="grid size-10 shrink-0 place-items-center rounded-full text-tinta transition-colors hover:bg-farinha">
            <X aria-hidden className="size-5" />
          </button>
        </header>

        {entries.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
            <p className="italiano text-2xl text-tinta">Seu pedido está vazio.</p>
            <p className="max-w-xs text-sm text-tinta-suave">Escolha as massas no cardápio e toque em “Adicionar”. Elas aparecem aqui.</p>
            <button type="button" onClick={goToProducts} className="rounded-full bg-primaria px-6 py-3 font-semibold text-farinha hover:bg-vinho">
              Ver as massas
            </button>
          </div>
        ) : (
          <>
            <ul data-lenis-prevent className="flex-1 divide-y divide-primaria/10 overflow-y-auto px-6 [overscroll-behavior:contain]">
              {entries.map(({ item, qty }) => (
                <li key={item.id} className="flex items-center gap-3 py-3.5">
                  <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-primaria">
                    {item.image ? (
                      <Picture image={item.image} alt="" sizes="4rem" className="block h-full w-full" imgClassName="h-full w-full object-cover" />
                    ) : (
                      <p aria-hidden className="italiano grid h-full place-items-center p-1 text-center text-[0.7rem] leading-tight text-massa">
                        {item.nameIt}
                      </p>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="italiano truncate text-lg leading-tight text-tinta">{item.nameIt}</p>
                    <p className="text-xs text-tinta-suave">
                      {item.namePt !== item.nameIt && `${item.namePt} · `}
                      {item.size}
                      {qty > 1 && ` · ${qty} un.`}
                    </p>
                  </div>
                  <AddToCart item={item} local="lp-carrinho" compact />
                  <button
                    type="button"
                    onClick={() => removeLine(item.id)}
                    aria-label={`Remover ${item.nameIt} do pedido`}
                    className="grid size-8 shrink-0 place-items-center rounded-full text-tinta-suave transition-colors hover:bg-farinha hover:text-tomate"
                  >
                    <Trash2 aria-hidden className="size-4" />
                  </button>
                </li>
              ))}
            </ul>

            <footer className="space-y-3 border-t border-primaria/10 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
              {hasBakeItems && (
                <label className="flex items-start gap-3 text-sm text-tinta">
                  <input
                    type="checkbox"
                    checked={wantsRefratario}
                    onChange={(e) => setWantsRefratario(e.target.checked)}
                    className="mt-0.5 size-5 shrink-0 accent-[var(--cor-primaria)]"
                  />
                  <span>
                    Montar as massas de assar no meu refratário{" "}
                    <span className="text-tinta-suave">(encomenda · {ORDER_RULES.minBusinessDays} dias úteis)</span>
                  </span>
                </label>
              )}
              <label className="block text-sm font-semibold text-tinta">
                Observações <span className="font-normal text-tinta-suave">(opcional)</span>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value.slice(0, MAX_OBS))}
                  maxLength={MAX_OBS}
                  placeholder="Ex.: retiro no sábado de manhã"
                  className={field}
                />
              </label>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsSent(true)}
                data-track="click_whatsapp"
                data-track-local="lp-carrinho"
                data-track-itens={count}
                data-track-produtos={productIds.slice(0, 200)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1f9e4f] px-6 py-4 font-semibold text-white shadow-[0_14px_36px_-12px_rgba(31,158,79,0.8)] transition-transform duration-300 hover:scale-[1.02]"
              >
                <WhatsAppIcon className="size-6" />
                Enviar pedido pelo WhatsApp
              </a>
              <p className="text-center text-xs leading-relaxed text-tinta-suave">
                {isSent
                  ? "Pedido aberto no WhatsApp. Se a janela não abriu, toque de novo no botão."
                  : "Sem pagamento pelo site: a loja confirma disponibilidade e valor na conversa."}
              </p>
              <button
                type="button"
                onClick={cartStore.clear}
                className="eyebrow mx-auto block text-[0.65rem] text-tinta-suave underline-offset-4 hover:text-primaria hover:underline"
              >
                Limpar pedido
              </button>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}
