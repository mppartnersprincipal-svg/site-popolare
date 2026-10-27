import { BADGE_LABEL, findItem, type MenuItem } from "@/data/menu";
import { LP_PROOF } from "@/data/lp";
import type { LpGrupo } from "@/data/lpGrupos";
import type { LpTema } from "@/data/lpTemas";
import { getImage } from "@/lib/images";
import { Picture } from "@/components/ui/Picture";
import { CtaWhatsApp, SECONDARY_CTA } from "./LpCta";

/** Moldura do hero (largura/altura): arco 4:5; no celular das LPs por produto, 4:3 para a foto caber acima do H1 */
const FRAME_RATIO = 0.8;
const FRAME_RATIO_MOBILE_FIRST = 4 / 3;

function hasRealPhoto(item: MenuItem | undefined): item is MenuItem & { image: string } {
  return Boolean(item?.image && !item.imageIllustrative);
}

/** Produto da foto: o do tema (ex.: "canelone de frango"), se tiver foto real; senão, o do grupo */
function heroItem(grupo: LpGrupo, tema: LpTema): MenuItem & { image: string } {
  const doTema = tema.produto ? findItem(tema.produto) : undefined;
  if (hasRealPhoto(doTema)) return doTema;
  const doGrupo = findItem(grupo.hero.produto);
  if (!hasRealPhoto(doGrupo)) throw new Error(`Hero da LP ${grupo.id} sem foto real: ${grupo.hero.produto}`);
  return doGrupo;
}

/** Foto mais larga que a moldura é recortada (object-cover): a largura exibida cresce na mesma proporção */
function heroSizes(image: string, isImageFirst: boolean): string {
  const { aspect } = getImage(image);
  const widthFactor = (frameRatio: number) => Math.max(1, 1 / frameRatio / aspect);
  const mobileRatio = isImageFirst ? FRAME_RATIO_MOBILE_FIRST : FRAME_RATIO;
  return `(min-width: 1024px) ${Math.round(32 * widthFactor(FRAME_RATIO))}vw, ${Math.round(91 * widthFactor(mobileRatio))}vw`;
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

interface LpHeroProps {
  grupo: LpGrupo;
  /** Tema escolhido pelo utm_term (proxy.ts) — define o H1 */
  tema: LpTema;
  /** Mensagem do WhatsApp da página */
  message: string;
  /** No celular, a foto do produto vem antes do H1 (LPs por produto: quem clicou em "lasanha" vê a lasanha na 1ª tela) */
  isImageFirst: boolean;
}

/** Hero das LPs: H1 do tema (renderizado no servidor, já na variante estática), promessa, CTA e prova. */
export function LpHero({ grupo, tema, message, isImageFirst }: LpHeroProps) {
  const item = heroItem(grupo, tema);
  const legenda = item.badge ? lowerFirst(BADGE_LABEL[item.badge]) : lowerFirst(item.namePt);
  const { hero, rastreio } = grupo;
  const imageColumn = isImageFirst ? "order-first lg:order-none lg:col-span-5" : "lg:col-span-5";
  const frame = isImageFirst ? "aspect-[4/3] lg:aspect-[4/5] lg:max-h-[70svh]" : "aspect-[4/5] max-h-[70svh]";
  const sectionPadding = isImageFirst ? "pt-20 md:pt-32" : "pt-24 md:pt-32";

  return (
    <section data-section="lp-hero" aria-labelledby="lp-titulo" className={`relative overflow-hidden pb-14 md:pb-20 ${sectionPadding}`}>
      <div className="container-popolare grid items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="eyebrow text-primaria">{hero.eyebrow}</p>
          <h1 id="lp-titulo" className="mt-4 text-[clamp(2.3rem,1.2rem+4.4vw,5rem)] leading-[1] text-tinta">
            <span className="font-display uppercase tracking-[0.03em]">{tema.h1[0]} </span>
            <span className="italiano text-primaria">{tema.h1[1]}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-tinta-suave">{hero.subtitle}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {hero.bullets.map((b) => (
              <li key={b} className="rounded-full bg-farinha px-4 py-2 text-sm font-semibold text-tinta shadow-[0_6px_20px_-14px_rgba(89,14,19,0.6)]">
                <span aria-hidden className="mr-1.5 text-primaria">✓</span>
                {b}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <CtaWhatsApp local={`${rastreio}-hero`} message={message} />
            <a href="#produtos" data-track="click_cta" data-track-local={`${rastreio}-hero-produtos`} className={SECONDARY_CTA}>
              Montar meu pedido ↓
            </a>
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-primaria/15 pt-6">
            {LP_PROOF.map((p) => (
              <div key={p.label}>
                <dd className="font-display text-2xl leading-none text-primaria sm:text-4xl">{p.value}</dd>
                <dt className="mt-1.5 text-[0.7rem] leading-snug text-tinta-suave sm:text-xs">{p.label}</dt>
              </div>
            ))}
          </dl>
        </div>
        <div className={imageColumn}>
          <div className={`relative mx-auto ${frame} overflow-hidden rounded-t-[999px] rounded-b-[1.75rem] shadow-[0_40px_90px_-40px_rgba(89,14,19,0.6)]`}>
            <Picture
              image={item.image}
              alt={`${item.nameIt} (${item.namePt}), massa artesanal da Popolare em Goiânia`}
              priority
              sizes={heroSizes(item.image, isImageFirst)}
              className="block h-full w-full"
              imgClassName="h-full w-full object-cover"
            />
            <p className="absolute bottom-4 left-4 right-4 w-fit rounded-full bg-farinha/90 px-4 py-2 text-sm font-semibold text-tinta backdrop-blur">
              {item.nameIt} · <span className="text-primaria">{legenda}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
