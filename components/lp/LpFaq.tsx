import type { FaqItem } from "@/data/content";
import { CtaWhatsApp } from "./LpCta";

interface LpFaqProps {
  faq: readonly FaqItem[];
  rastreio: string;
  /** Mensagem do WhatsApp da página */
  message: string;
}

/** Dúvidas frequentes + CTA final (o FAQPage do JSON-LD usa a mesma lista). */
export function LpFaq({ faq, rastreio, message }: LpFaqProps) {
  return (
    <section data-section="lp-faq" aria-labelledby="lp-faq-titulo" className="py-16 md:py-24">
      <div className="container-popolare grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow text-primaria">Dúvidas frequentes</p>
          <h2 id="lp-faq-titulo" className="mt-4 text-[clamp(2rem,1.2rem+3vw,3.8rem)] leading-[1.05]">
            <span className="font-display uppercase tracking-[0.03em]">Comprar massa </span>
            <span className="italiano text-primaria">em Goiânia</span>
          </h2>
          <div className="mt-8 rounded-[1.75rem] bg-primaria p-8 text-farinha">
            <p className="italiano text-3xl leading-tight">Seu almoço de domingo está a uma mensagem.</p>
            <p className="mt-3 text-farinha/80">Monte o pedido no cardápio ou fale direto com a loja pelo WhatsApp.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <CtaWhatsApp local={`${rastreio}-final`} message={message} variant="farinha" />
              <a
                href="#produtos"
                data-track="click_cta"
                data-track-local={`${rastreio}-final-produtos`}
                className="inline-flex items-center justify-center rounded-full border border-farinha/40 px-6 py-3.5 font-semibold text-farinha transition-colors hover:bg-farinha/10"
              >
                Montar meu pedido
              </a>
            </div>
          </div>
        </div>
        <div className="divide-y divide-primaria/15 border-y border-primaria/15 lg:col-span-7">
          {faq.map((f) => (
            <details key={f.question} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
                <h3 className="italiano text-2xl leading-snug text-tinta">{f.question}</h3>
                <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full border border-primaria/30 text-primaria transition-transform duration-500 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-6 leading-relaxed text-tinta-suave">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
