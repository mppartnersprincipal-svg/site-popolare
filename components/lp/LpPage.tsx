import type { Metadata } from "next";
import { LP_FAQ } from "@/data/lp";
import type { LpGrupo } from "@/data/lpGrupos";
import type { LpTema } from "@/data/lpTemas";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { anuncioCartIntro, anuncioMessage } from "@/lib/whatsapp";
import { JsonLd } from "@/components/seo/JsonLd";
import { HowToCook } from "@/components/sections/HowToCook";
import { Press } from "@/components/sections/Press";
import { LpHero } from "./LpHero";
import { LpSteps } from "./LpSteps";
import { LpFrozen } from "./LpFrozen";
import { LpCatalog, type CatalogHighlight } from "./LpCatalog";
import { LpKits } from "./LpKits";
import { LpExtras } from "./LpExtras";
import { LpStory } from "./LpStory";
import { LpDelivery } from "./LpDelivery";
import { LpFaq } from "./LpFaq";
import { CartBar } from "./cart/CartBar";

/** Metadata de uma LP: a mesma na rota pública e nas variantes por tema (canonical sempre na rota pública) */
export function lpMetadata(grupo: LpGrupo): Metadata {
  const base = pageMetadata({ title: grupo.seo.title, description: grupo.seo.description, path: grupo.rota });
  return {
    ...base,
    keywords: [...grupo.seo.keywords],
    openGraph: { ...base.openGraph, images: [{ url: `/og/${grupo.id}.jpg`, width: 1200, height: 630, alt: grupo.seo.title }] },
    twitter: { ...base.twitter, images: [`/og/${grupo.id}.jpg`] },
  };
}

/** Aba do grupo com o produto do tema na frente (ex.: "canelone de frango" abre com o Cannelloni al Pollo) */
function highlightFor(grupo: LpGrupo, tema: LpTema): CatalogHighlight | undefined {
  if (!grupo.destaque) return undefined;
  const { produto } = tema;
  if (!produto) return grupo.destaque;
  return { ...grupo.destaque, produtos: [produto, ...grupo.destaque.produtos.filter((id) => id !== produto)] };
}

interface LpPageProps {
  grupo: LpGrupo;
  tema: LpTema;
}

/**
 * LP do Google Ads, uma por grupo de anúncios (data/lpGrupos.ts): página leve (sem intro/3D/vídeo)
 * com o cardápio completo e o "Meu pedido". O H1 vem do tema que o proxy.ts escolheu pelo utm_term.
 */
export function LpPage({ grupo, tema }: LpPageProps) {
  const { rastreio } = grupo;
  const message = anuncioMessage(grupo.anuncio);
  const faq = [...grupo.faq, ...LP_FAQ];
  const catalog = <LpCatalog highlight={highlightFor(grupo, tema)} rastreio={rastreio} />;

  return (
    <>
      <JsonLd data={[faqSchema(faq), breadcrumbSchema([{ name: grupo.breadcrumb, path: grupo.rota }])]} />

      {/* Hero: H1 do tema + promessa do anúncio + CTA + prova */}
      <LpHero grupo={grupo} tema={tema} message={message} isImageFirst={grupo.catalogoAposHero} />

      {/* Cardápio (aba do grupo aberta) logo depois do hero: quem clicou no anúncio vê o produto e já pode montar o pedido */}
      {grupo.catalogoAposHero && catalog}

      <LpSteps />
      <LpFrozen rastreio={rastreio} />

      {/* Ordem antiga (cardápio depois de "Congelados"), se algum grupo desligar catalogoAposHero */}
      {!grupo.catalogoAposHero && catalog}

      <LpKits kitIds={grupo.kits} rastreio={rastreio} />
      <LpExtras rastreio={rastreio} />
      <div className="bg-farinha">
        <HowToCook />
      </div>
      <LpStory rastreio={rastreio} message={message} />
      <Press />
      <LpDelivery rastreio={rastreio} message={message} />
      <LpFaq faq={faq} rastreio={rastreio} message={message} />

      {/* Rodapé flutuante: WhatsApp direto + "Meu pedido" (abre a gaveta com a lista) */}
      <CartBar rastreio={rastreio} message={message} pedidoIntro={anuncioCartIntro(grupo.anuncio)} />
    </>
  );
}
