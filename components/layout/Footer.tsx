import Link from "next/link";
import { BRAND, DELIVERY, SOCIAL, UNITS, formatAddress } from "@/data/business";
import { LP_GRUPOS } from "@/data/lpGrupos";
import { generalMessage, whatsappUrl } from "@/lib/whatsapp";
import { LogoCompleto } from "@/components/ui/Logo";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

const LINKS = [
  { href: "/massas-em-goiania", label: "Massas em Goiânia" },
  { href: "/cardapio", label: "Cardápio completo" },
  { href: "/sobre-nos", label: "Nossa história" },
  { href: "/encomendas", label: "Encomendas" },
  { href: "/modo-de-preparo", label: "Modo de preparo" },
  { href: "/midia", label: "Na mídia" },
  { href: "/blog", label: "Blog" },
  { href: "/contato", label: "Loja e contato" },
  { href: "/politica-de-privacidade", label: "Privacidade" },
] as const;

/** LPs por produto: links internos para não ficarem órfãs no orgânico */
const POR_TIPO = LP_GRUPOS.filter((g) => g.rota !== "/massas-em-goiania").map((g) => ({ href: g.rota, label: g.breadcrumb }));

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-vinho text-farinha">
      <div className="container-popolare grid gap-14 pb-10 pt-20 md:grid-cols-12 md:pt-28">
        <div className="md:col-span-4">
          <LogoCompleto className="w-48 text-farinha md:w-56" />
          <p className="italiano mt-8 max-w-xs text-2xl leading-snug text-massa">
            “Levando um pouco da Itália em cada produto.”
          </p>
          <p className="mt-4 max-w-xs text-sm text-farinha/70">
            Massas artesanais de família em {BRAND.city} desde {BRAND.foundingYear}.
          </p>
        </div>

        {UNITS.map((unit) => (
          <address key={unit.id} className="not-italic md:col-span-5">
            <h2 className="eyebrow text-dourado">{unit.name}</h2>
            <p className="mt-4 leading-relaxed text-farinha/85">{formatAddress(unit)}</p>
            <ul className="mt-4 space-y-1 text-farinha/85">
              {unit.phones.map((phone) => {
                const isWhatsApp = phone === unit.whatsappDisplay;
                return (
                  <li key={phone}>
                    <a
                      href={`tel:+55${phone.replace(/\D/g, "")}`}
                      data-track="click_phone"
                      data-track-unidade={unit.id}
                      className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
                    >
                      {phone}
                      {isWhatsApp && (
                        <>
                          <WhatsAppIcon className="size-4 shrink-0 text-[#25d366]" />
                          <span className="sr-only">(WhatsApp)</span>
                        </>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
            {unit.hours && (
              <ul className="mt-4 space-y-1 text-sm text-farinha/70">
                {unit.hours.map((h) => (
                  <li key={h.days}>
                    {h.days}: {h.opens.replace(":00", "h")} às {h.closes.replace(":00", "h")}
                  </li>
                ))}
                <li>Domingo: fechado</li>
              </ul>
            )}
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <a
                href={whatsappUrl(unit, generalMessage())}
                target="_blank"
                rel="noopener noreferrer"
                data-track="click_whatsapp"
                data-track-local="footer"
                data-track-unidade={unit.id}
                className="rounded-full border border-farinha/30 px-4 py-2 transition-colors hover:bg-farinha hover:text-vinho"
              >
                WhatsApp
              </a>
              <a
                href={unit.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-track="click_directions"
                data-track-unidade={unit.id}
                className="rounded-full border border-farinha/30 px-4 py-2 transition-colors hover:bg-farinha hover:text-vinho"
              >
                Como chegar
              </a>
            </div>
          </address>
        ))}

        <nav aria-label="Rodapé" className="md:col-span-3">
          <h2 className="eyebrow text-dourado">Navegue</h2>
          <ul className="mt-4 space-y-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-farinha/85 hover:text-farinha">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <h2 className="eyebrow mt-8 text-dourado">Massas por tipo</h2>
          <ul className="mt-4 space-y-2">
            {POR_TIPO.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-farinha/85 hover:text-farinha">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="container-popolare flex flex-col gap-6 border-t border-farinha/15 py-8 text-sm text-farinha/70 md:flex-row md:items-center md:justify-between">
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          <li>
            <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-farinha">
              Instagram
            </a>
          </li>
          <li>
            <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-farinha">
              Facebook
            </a>
          </li>
          {DELIVERY.map((d) => (
            <li key={d.url}>
              <a
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                data-track="click_delivery"
                data-track-canal={d.name}
                className="hover:text-farinha"
              >
                {d.name}
              </a>
            </li>
          ))}
        </ul>
        <p>
          © {BRAND.name}. Site por MP Assessoria Digital.
        </p>
      </div>

      {/* Marca d'água decorativa via pseudo-elemento (fora da árvore de acessibilidade) */}
      <div
        aria-hidden
        data-marca="Popolare"
        className="wordmark pointer-events-none select-none whitespace-nowrap pb-4 text-center text-[15vw] leading-none text-farinha/[0.06] before:content-[attr(data-marca)]"
      />
    </footer>
  );
}
