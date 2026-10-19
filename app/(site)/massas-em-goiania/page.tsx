import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { whatsappUrl } from "@/lib/whatsapp";
import { MAIN_UNIT } from "@/data/business";
import { findItem, type MenuItem } from "@/data/menu";
import { LP_BENEFITS, LP_FAQ, LP_HERO, LP_PATH, LP_PRODUCTS, LP_SEO } from "@/data/lp";
import { JsonLd } from "@/components/seo/JsonLd";
import { Picture } from "@/components/ui/Picture";
import { ProductCard } from "@/components/ui/ProductCard";
import { Locations } from "@/components/sections/Locations";
import { WhatsAppFloat } from "@/components/lp/WhatsAppFloat";

export const metadata: Metadata = {
  ...pageMetadata({ title: LP_SEO.title, description: LP_SEO.description, path: LP_PATH }),
  keywords: LP_SEO.keywords,
};

const WPP_MSG = "Olá, Popolare! Vi o site e quero comprar massas. Pode me ajudar?";
const PRODUCTS = LP_PRODUCTS.map((id) => findItem(id)).filter((i): i is MenuItem => Boolean(i));

interface CtaProps {
  local: string;
  label?: string;
  className?: string;
}

/** CTA principal (WhatsApp da loja principal) — repetido em todas as dobras */
function CtaWhatsApp({ local, label = "Pedir pelo WhatsApp", className = "" }: CtaProps) {
  return (
    <a
      href={whatsappUrl(MAIN_UNIT, WPP_MSG)}
      target="_blank"
      rel="noopener noreferrer"
      data-track="click_whatsapp"
      data-track-local={local}
      className={`group inline-flex items-center justify-center gap-2 rounded-full bg-primaria px-6 py-3.5 font-semibold text-farinha shadow-[0_14px_40px_-16px_rgba(155,27,32,0.9)] transition-transform duration-300 hover:scale-[1.03] hover:bg-vinho ${className}`}
    >
      {label}
      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
        →
      </span>
    </a>
  );
}

const secondaryCta =
  "inline-flex items-center justify-center rounded-full border border-tinta/20 bg-farinha/70 px-6 py-3.5 font-semibold text-tinta transition-colors hover:border-primaria hover:text-primaria";

export default function MassasEmGoianiaPage() {
  return (
    <>
      <JsonLd data={[faqSchema(LP_FAQ), breadcrumbSchema([{ name: "Massas em Goiânia", path: LP_PATH }])]} />

      {/* 1 — Hero: promessa + palavra-chave + CTA */}
      <section data-section="lp-hero" aria-labelledby="lp-titulo" className="relative overflow-hidden pb-16 pt-24 md:pb-24 md:pt-32">
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
              <a href="#produtos" data-track="click_cta" data-track-local="lp-hero-produtos" className={secondaryCta}>
                Ver as massas
              </a>
            </div>
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

      {/* 2 — Produtos mais pedidos */}
      <section id="produtos" data-section="lp-produtos" aria-labelledby="lp-produtos-titulo" className="scroll-mt-20 bg-farinha py-16 md:py-24">
        <div className="container-popolare">
          <p className="eyebrow text-primaria">Mais pedidos em Goiânia</p>
          <h2 id="lp-produtos-titulo" className="mt-4 max-w-3xl text-[clamp(2rem,1.2rem+3vw,3.8rem)] leading-[1.05]">
            <span className="font-display uppercase tracking-[0.03em]">Massas congeladas </span>
            <span className="italiano text-primaria">para assar ou cozinhar</span>
          </h2>
          <p className="mt-4 max-w-2xl text-tinta-suave">
            Lasanhas, sfogliatti, canelones, ravióli e nhoque artesanais. Escolha a sua e peça direto para a loja pelo WhatsApp.
          </p>
          <p aria-hidden className="mt-6 text-sm font-semibold text-primaria sm:hidden">
            Deslize para ver mais →
          </p>
          {/* Celular: carrossel deslizante (CTA da dobra fica perto); tablet/desktop: grade */}
          <ul
            tabIndex={0}
            aria-label="Massas mais pedidas"
            className="-mx-[var(--gutter)] mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-4 outline-none [scrollbar-width:none] sm:mx-0 sm:mt-10 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4"
          >
            {PRODUCTS.map((item) => (
              <li key={item.id} className="w-[78%] shrink-0 snap-center sm:w-auto">
                <ProductCard item={item} origem="lp-produtos" />
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <CtaWhatsApp local="lp-produtos" label="Quero comprar massas" />
            <Link href="/cardapio" data-track="click_cta" data-track-local="lp-cardapio" className={secondaryCta}>
              Ver cardápio completo
            </Link>
          </div>
        </div>
      </section>

      {/* 3 — Por que a Popolare */}
      <section data-section="lp-diferenciais" aria-labelledby="lp-porque-titulo" className="py-16 md:py-24">
        <div className="container-popolare grid items-center gap-12 lg:grid-cols-12">
          <div className="order-2 lg:order-1 lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem]">
              <Picture
                image="loja/balcao"
                alt="Balcão da Popolare Massas e Empório em Goiânia com massas congeladas e empório italiano"
                sizes="(min-width: 1024px) 38vw, 92vw"
                className="block h-full w-full"
                imgClassName="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="order-1 lg:order-2 lg:col-span-7">
            <p className="eyebrow text-primaria">Por que a Popolare</p>
            <h2 id="lp-porque-titulo" className="mt-4 text-[clamp(2rem,1.2rem+3vw,3.8rem)] leading-[1.05]">
              <span className="font-display uppercase tracking-[0.03em]">A massa caseira </span>
              <span className="italiano text-primaria">que Goiânia conhece</span>
            </h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {LP_BENEFITS.map((b) => (
                <li key={b.title} className="rounded-[1.25rem] bg-farinha p-6">
                  <h3 className="italiano text-2xl text-tinta">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-tinta-suave">{b.text}</p>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaWhatsApp local="lp-diferenciais" />
              <Link href="/encomendas" data-track="click_cta" data-track-local="lp-encomendas" className={secondaryCta}>
                Encomendar para festa
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4 — Onde comprar em Goiânia (cada loja com Como chegar + WhatsApp) */}
      <div className="bg-farinha">
        <Locations />
      </div>

      {/* 5 — Dúvidas + CTA final */}
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
              <p className="mt-3 text-farinha/80">Atendimento direto com a loja pelo WhatsApp.</p>
              <CtaWhatsApp local="lp-final" className="mt-6 w-full bg-farinha text-primaria hover:bg-massa sm:w-auto" />
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

      <WhatsAppFloat />
    </>
  );
}
