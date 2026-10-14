import { UNITS, formatAddress } from "@/data/business";
import { generalMessage, whatsappUrl } from "@/lib/whatsapp";
import { Picture } from "@/components/ui/Picture";

interface LocationsProps {
  headingLevel?: "h1" | "h2";
}

export function Locations({ headingLevel = "h2" }: LocationsProps) {
  const Heading = headingLevel;
  const SubHeading = headingLevel === "h1" ? "h2" : "h3";
  return (
    <section id="lojas" data-section="lojas" aria-labelledby="lojas-titulo" className="section-space">
      <div className="container-popolare">
        <p data-reveal className="eyebrow text-primaria">
          Dove siamo
        </p>
        <Heading id="lojas-titulo" data-reveal className="mt-4 text-[length:var(--text-display)] leading-[1.02]">
          <span className="font-display uppercase tracking-[0.03em]">Duas casas </span>
          <span className="italiano text-primaria">em Goiânia.</span>
        </Heading>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {UNITS.map((unit) => (
            <article key={unit.id} data-reveal className="flex flex-col overflow-hidden rounded-[1.75rem] bg-farinha shadow-[0_30px_70px_-50px_rgba(89,14,19,0.6)]">
              <div className="relative aspect-[16/9] overflow-hidden">
                {unit.isMain ? (
                  <Picture
                    image="loja/fachada"
                    alt="Fachada da Popolare no Setor Sul: letreiro vermelho, tijolinho e toldo listrado"
                    sizes="(min-width: 1024px) 45vw, 92vw"
                    className="block h-full w-full"
                    imgClassName="h-full w-full object-cover object-[50%_30%]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-primaria">
                    <p className="italiano text-6xl text-massa">Eldorado</p>
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-7 md:p-9">
                <SubHeading className="italiano text-4xl text-tinta">{unit.name}</SubHeading>
                <address className="mt-3 not-italic leading-relaxed text-tinta-suave">{formatAddress(unit)}</address>

                <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="eyebrow text-[0.65rem] text-madeira-escura">Telefones</dt>
                    <dd className="mt-1 space-y-0.5">
                      {unit.phones.map((p) => (
                        <a key={p} href={`tel:+55${p.replace(/\D/g, "")}`} data-track="click_phone" data-track-unidade={unit.id} className="block hover:text-primaria">
                          {p}
                        </a>
                      ))}
                    </dd>
                  </div>
                  <div>
                    <dt className="eyebrow text-[0.65rem] text-madeira-escura">Horário</dt>
                    <dd className="mt-1 space-y-0.5">
                      {unit.hours ? (
                        <>
                          {unit.hours.map((h) => (
                            <p key={h.days}>
                              {h.days}: {h.opens.replace(":00", "h")}–{h.closes.replace(":00", "h")}
                            </p>
                          ))}
                          <p>Domingo: fechado</p>
                        </>
                      ) : (
                        <p>Consulte pelo WhatsApp</p>
                      )}
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
                    className="rounded-full bg-primaria px-6 py-3 font-semibold text-farinha transition-transform duration-300 hover:scale-[1.04] hover:bg-vinho"
                  >
                    Como chegar
                  </a>
                  <a
                    href={whatsappUrl(unit, generalMessage())}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-track="click_whatsapp"
                    data-track-local="lojas"
                    data-track-unidade={unit.id}
                    className="rounded-full border border-primaria/30 px-6 py-3 font-semibold text-primaria transition-colors hover:bg-primaria hover:text-farinha"
                  >
                    WhatsApp {unit.whatsappDisplay}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
