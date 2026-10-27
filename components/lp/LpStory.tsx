import Link from "next/link";
import { BRAND } from "@/data/business";
import { STORY, STORY_INTRO } from "@/data/content";
import { LP_BENEFITS } from "@/data/lp";
import { Picture } from "@/components/ui/Picture";
import { CtaWhatsApp, SECONDARY_CTA } from "./LpCta";

const CARINA = STORY.find((c) => c.id === "carina");

interface LpStoryProps {
  rastreio: string;
  /** Mensagem do WhatsApp da página */
  message: string;
}

/** A família Popolare (prova de origem) + os 4 diferenciais da LP. */
export function LpStory({ rastreio, message }: LpStoryProps) {
  return (
    <section data-section="lp-familia" aria-labelledby="lp-familia-titulo" className="py-16 md:py-24">
      <div className="container-popolare">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <figure className="relative mx-auto max-w-md">
              <div className="aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[1.75rem] shadow-[0_40px_90px_-40px_rgba(89,14,19,0.6)]">
                <Picture
                  image="equipe/carina-balcao"
                  alt="Carina Popolare atrás do balcão da loja, com massas e produtos do empório"
                  sizes="(min-width: 1024px) 38vw, 92vw"
                  className="block h-full w-full"
                  imgClassName="h-full w-full object-cover object-[50%_20%]"
                />
              </div>
              <figcaption className="absolute bottom-4 left-4 rounded-full bg-farinha/90 px-4 py-2 text-sm font-semibold text-tinta backdrop-blur">
                {BRAND.owner} · <span className="text-primaria">filha dos fundadores</span>
              </figcaption>
            </figure>
          </div>
          <div className="lg:col-span-7">
            <p className="eyebrow text-primaria">La famiglia Popolare</p>
            <h2 id="lp-familia-titulo" className="mt-4 text-[clamp(2rem,1.2rem+3vw,3.8rem)] leading-[1.05]">
              <span className="font-display uppercase tracking-[0.03em]">Receita de família, </span>
              <span className="italiano text-primaria">feita à mão em Goiânia</span>
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-tinta-suave">{STORY_INTRO}</p>
            {CARINA && <p className="mt-4 max-w-xl leading-relaxed text-tinta-suave">{CARINA.text}</p>}
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {LP_BENEFITS.map((b) => (
                <li key={b.title} className="rounded-[1.25rem] bg-farinha p-6">
                  <h3 className="italiano text-2xl text-tinta">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-tinta-suave">{b.text}</p>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaWhatsApp local={`${rastreio}-familia`} message={message} />
              <Link href="/sobre-nos" data-track="click_cta" data-track-local={`${rastreio}-historia`} className={SECONDARY_CTA}>
                Conhecer a história completa
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
