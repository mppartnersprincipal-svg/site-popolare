import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { LP_FAQ, LP_HERO, LP_PATH, LP_PROOF, LP_SEO } from "@/data/lp";
import { JsonLd } from "@/components/seo/JsonLd";
import { Picture } from "@/components/ui/Picture";
import { HowToCook } from "@/components/sections/HowToCook";
import { Press } from "@/components/sections/Press";
import { CtaWhatsApp, SECONDARY_CTA } from "@/components/lp/LpCta";
import { LpSteps } from "@/components/lp/LpSteps";
import { LpFrozen } from "@/components/lp/LpFrozen";
import { LpCatalog } from "@/components/lp/LpCatalog";
import { LpKits } from "@/components/lp/LpKits";
import { LpExtras } from "@/components/lp/LpExtras";
import { LpStory } from "@/components/lp/LpStory";
import { LpDelivery } from "@/components/lp/LpDelivery";
import { CartBar } from "@/components/lp/cart/CartBar";

export const metadata: Metadata = {
  ...pageMetadata({ title: LP_SEO.title, description: LP_SEO.description, path: LP_PATH }),
  keywords: LP_SEO.keywords,
};

/**
 * LP do Google Ads (/massas-em-goiania): página leve (sem intro/3D/vídeo) com o cardápio completo
 * e o "Meu pedido" — lista de itens que vira a mensagem pronta do WhatsApp (CartBar).
 */
export default function MassasEmGoianiaPage() {
  return (
    <>
      <JsonLd data={[faqSchema(LP_FAQ), breadcrumbSchema([{ name: "Massas em Goiânia", path: LP_PATH }])]} />

      {/* 1 — Hero: promessa + palavra-chave + CTA + prova */}
      <section data-section="lp-hero" aria-labelledby="lp-titulo" className="relative overflow-hidden pb-14 pt-24 md:pb-20 md:pt-32">
        <div className="container-popolare grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="eyebrow text-primaria">{LP_HERO.eyebrow}</p>
            <h1 id="lp-titulo" className="mt-4 text-[clamp(2.3rem,1.2rem+4.4vw,5rem)] leading-[1] text-tinta">
              <span className="font-display uppercase tracking-[0.03em]">Massas artesanais </span>
              <span className="italiano text-primaria">congeladas em Goiânia</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-tinta-suave">{LP_HERO.subtitle}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {LP_HERO.bullets.map((b) => (
                <li key={b} className="rounded-full bg-farinha px-4 py-2 text-sm font-semibold text-tinta shadow-[0_6px_20px_-14px_rgba(89,14,19,0.6)]">
                  <span aria-hidden className="mr-1.5 text-primaria">✓</span>
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaWhatsApp local="lp-hero" />
              <a href="#produtos" data-track="click_cta" data-track-local="lp-hero-produtos" className={SECONDARY_CTA}>
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
          <div className="lg:col-span-5">
            <div className="relative mx-auto aspect-[4/5] max-h-[70svh] overflow-hidden rounded-t-[999px] rounded-b-[1.75rem] shadow-[0_40px_90px_-40px_rgba(89,14,19,0.6)]">
              <Picture
                image="produtos/sfogliatti-bianco"
                alt="Sfogliatti Bianco, a massa artesanal mais vendida da Popolare em Goiânia"
                priority
                // foto 3:2 recortada em moldura 4:5 (object-cover): a largura exibida é ~1,9× a da moldura
                sizes="(min-width: 1024px) 60vw, 170vw"
                className="block h-full w-full"
                imgClassName="h-full w-full object-cover"
              />
              <p className="absolute bottom-4 left-4 rounded-full bg-farinha/90 px-4 py-2 text-sm font-semibold text-tinta backdrop-blur">
                Sfogliatti Bianco · <span className="text-primaria">o mais vendido</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — Como funciona o pedido pelo site */}
      <LpSteps />

      {/* 3 — Congelados: a linha, como cuidar e atalhos para as categorias */}
      <LpFrozen />

      {/* 4 — Cardápio completo com "Adicionar" */}
      <LpCatalog />

      {/* 5 — Sugestões prontas (kits) */}
      <LpKits />

      {/* 6 — Além das massas: Nhoque da Fortuna, massa do mês, pães, empório */}
      <LpExtras />

      {/* 7 — Modo de preparo */}
      <div className="bg-farinha">
        <HowToCook />
      </div>

      {/* 8 — A família + diferenciais */}
      <LpStory />

      {/* 9 — Na mídia (prova social) */}
      <Press />

      {/* 10 — Loja (retirada) e entrega */}
      <LpDelivery />

      {/* 11 — Dúvidas + CTA final */}
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
                <CtaWhatsApp local="lp-final" variant="farinha" />
                <a href="#produtos" data-track="click_cta" data-track-local="lp-final-produtos" className="inline-flex items-center justify-center rounded-full border border-farinha/40 px-6 py-3.5 font-semibold text-farinha transition-colors hover:bg-farinha/10">
                  Montar meu pedido
                </a>
              </div>
            </div>
          </div>
          <div className="divide-y divide-primaria/15 border-y border-primaria/15 lg:col-span-7">
            {LP_FAQ.map((f) => (
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

      {/* Rodapé flutuante: WhatsApp direto + "Meu pedido" (abre a gaveta com a lista) */}
      <CartBar />
    </>
  );
}
