"use client";

import { useSyncExternalStore } from "react";
import { MAIN_UNIT } from "@/data/business";
import { LP_EXTRAS, type LpExtra } from "@/data/lp";
import { anuncioPedido, whatsappUrl } from "@/lib/whatsapp";
import { Picture } from "@/components/ui/Picture";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

const subscribeNoop = () => () => {};
/** Data local do visitante (yyyy-mm-dd); no servidor fica vazio para não congelar a data no prerender */
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function isActive(extra: LpExtra, today: string): boolean {
  if (!extra.validUntil) return true;
  if (!today) return false; // sazonal só aparece depois de hidratar, com a data do visitante
  return today <= extra.validUntil;
}

interface LpExtrasProps {
  /** Prefixo do data-track-local da página (lp, lp-lasanha…) */
  rastreio: string;
}

/** Além do cardápio: Nhoque da Fortuna, massa do mês, pães e empório — pedidos direto pelo WhatsApp. */
export function LpExtras({ rastreio }: LpExtrasProps) {
  const today = useSyncExternalStore(subscribeNoop, todayIso, () => "");
  const extras = LP_EXTRAS.filter((e) => isActive(e, today));

  return (
    <section data-section="lp-extras" aria-labelledby="lp-extras-titulo" className="py-16 md:py-24">
      <div className="container-popolare">
        <div className="max-w-3xl">
          <p className="eyebrow text-primaria">Oltre la pasta</p>
          <h2 id="lp-extras-titulo" className="mt-4 text-[clamp(2rem,1.2rem+3vw,3.8rem)] leading-[1.05]">
            <span className="font-display uppercase tracking-[0.03em]">Além das massas, </span>
            <span className="italiano text-primaria">o que mais tem na loja</span>
          </h2>
          <p className="mt-4 text-tinta-suave">
            Novidades do mês, pães e o empório não entram no pedido do site: a disponibilidade varia. Pergunte pelo WhatsApp e a loja separa para você.
          </p>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 md:mt-14">
          {extras.map((extra) => (
            <li key={extra.id}>
              <article className="flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-farinha shadow-[0_24px_60px_-40px_rgba(89,14,19,0.6)]">
                <div className="relative aspect-[4/3] overflow-hidden">
                  {extra.image ? (
                    <Picture image={extra.image} alt={extra.imageAlt ?? extra.title} sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 92vw" className="block h-full w-full" imgClassName="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primaria p-6 text-center">
                      <p className="italiano text-3xl leading-none text-massa">{extra.title}</p>
                    </div>
                  )}
                  <p className="absolute left-3 top-3 rounded-full bg-farinha/90 px-3 py-1 text-[0.66rem] font-bold uppercase tracking-wider text-primaria backdrop-blur">
                    {extra.eyebrow}
                  </p>
                  {extra.imageIllustrative && extra.image && (
                    <p className="absolute bottom-2 right-2 rounded-full bg-tinta/60 px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-wider text-farinha backdrop-blur">
                      Imagem ilustrativa
                    </p>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="italiano text-[1.6rem] leading-[1.05] text-tinta">{extra.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-tinta-suave">{extra.text}</p>
                  <a
                    href={whatsappUrl(MAIN_UNIT, anuncioPedido(extra.pedido))}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-track="click_whatsapp"
                    data-track-local={`${rastreio}-extras`}
                    data-track-produto={extra.id}
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-primaria px-4 py-2.5 text-sm font-semibold text-primaria transition-colors hover:bg-primaria hover:text-farinha"
                  >
                    <WhatsAppIcon className="size-4" />
                    {extra.cta}
                  </a>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
