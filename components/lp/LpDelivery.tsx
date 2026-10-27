import { DELIVERY, MAIN_UNIT, formatAddress } from "@/data/business";
import { whatsappUrl } from "@/lib/whatsapp";
import { Picture } from "@/components/ui/Picture";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

interface LpDeliveryProps {
  rastreio: string;
  /** Mensagem do WhatsApp da página */
  message: string;
}

/** Onde retirar (loja do Setor Sul) e como receber em casa (parceiros de entrega). */
export function LpDelivery({ rastreio, message }: LpDeliveryProps) {
  const unit = MAIN_UNIT;
  const local = `${rastreio}-loja`;
  return (
    <section id="lojas" data-section="lp-loja" aria-labelledby="lp-loja-titulo" className="bg-farinha py-16 md:py-24">
      <div className="container-popolare">
        <p className="eyebrow text-primaria">Ritiro o consegna</p>
        <h2 id="lp-loja-titulo" className="mt-4 max-w-3xl text-[clamp(2rem,1.2rem+3vw,3.8rem)] leading-[1.05]">
          <span className="font-display uppercase tracking-[0.03em]">Retire na loja </span>
          <span className="italiano text-primaria">ou receba em casa</span>
        </h2>

        <div className="mt-10 grid gap-6 lg:grid-cols-12 md:mt-14">
          {/* Loja */}
          <article className="flex flex-col overflow-hidden rounded-[1.75rem] bg-creme shadow-[0_30px_70px_-50px_rgba(89,14,19,0.6)] lg:col-span-7">
            <div className="relative aspect-[16/9] overflow-hidden">
              <Picture
                image="loja/fachada"
                alt="Fachada da Popolare no Setor Sul: letreiro vermelho, tijolinho e toldo listrado"
                sizes="(min-width: 1024px) 56vw, 92vw"
                className="block h-full w-full"
                imgClassName="h-full w-full object-cover object-[50%_30%]"
              />
            </div>
            <div className="flex flex-1 flex-col p-7 md:p-9">
              <h3 className="italiano text-4xl text-tinta">{unit.name}</h3>
              <address className="mt-3 not-italic leading-relaxed text-tinta-suave">{formatAddress(unit)}</address>
              <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="eyebrow text-[0.65rem] text-madeira-escura">Telefones</dt>
                  <dd className="mt-1 space-y-0.5">
                    {unit.phones.map((p) => (
                      <a key={p} href={`tel:+55${p.replace(/\D/g, "")}`} data-track="click_phone" data-track-unidade={unit.id} data-track-local={local} className="flex items-center gap-1.5 hover:text-primaria">
                        {p}
                        {p === unit.whatsappDisplay && (
                          <>
                            <WhatsAppIcon className="size-4 shrink-0 text-[#1f9e4f]" />
                            <span className="sr-only">(WhatsApp)</span>
                          </>
                        )}
                      </a>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-[0.65rem] text-madeira-escura">Horário</dt>
                  <dd className="mt-1 space-y-0.5">
                    {unit.hours?.map((h) => (
                      <p key={h.days}>
                        {h.days}: {h.opens.replace(":00", "h")}–{h.closes.replace(":00", "h")}
                      </p>
                    ))}
                    <p>Domingo: fechado</p>
                  </dd>
                </div>
              </dl>
              <div className="mt-auto flex flex-wrap gap-3 pt-8">
                <a
                  href={unit.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track="click_directions"
                  data-track-unidade={unit.id}
                  data-track-local={local}
                  className="rounded-full bg-primaria px-6 py-3 font-semibold text-farinha transition-transform duration-300 hover:scale-[1.04] hover:bg-vinho"
                >
                  Como chegar
                </a>
                <a
                  href={whatsappUrl(unit, message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track="click_whatsapp"
                  data-track-local={local}
                  data-track-unidade={unit.id}
                  className="rounded-full border border-primaria/30 px-6 py-3 font-semibold text-primaria transition-colors hover:bg-primaria hover:text-farinha"
                >
                  WhatsApp {unit.whatsappDisplay}
                </a>
              </div>
            </div>
          </article>

          {/* Entrega */}
          <article className="flex flex-col rounded-[1.75rem] bg-primaria p-7 text-farinha md:p-9 lg:col-span-5">
            <p className="eyebrow text-dourado">Consegna a casa</p>
            <h3 className="italiano mt-3 text-4xl leading-tight">Prefere receber em casa?</h3>
            <p className="mt-4 leading-relaxed text-farinha/80">
              Peça pelos nossos parceiros de pedido online e receba as massas congeladas na sua porta. Ou envie a lista pelo WhatsApp e combine a entrega direto com a loja.
            </p>
            <ul className="mt-6 space-y-3">
              {DELIVERY.map((d) => (
                <li key={d.url}>
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-track="click_delivery"
                    data-track-canal={d.name}
                    data-track-local={local}
                    className="group flex items-center justify-between gap-4 rounded-2xl bg-farinha/10 px-5 py-4 font-semibold transition-colors hover:bg-farinha hover:text-primaria"
                  >
                    {d.name}
                    <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-auto pt-8 text-sm text-farinha/70">
              Massas congeladas: ao receber, leve direto ao congelador. Não precisa descongelar antes de preparar.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
