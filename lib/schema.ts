// Construtores de JSON-LD (Schema.org) a partir da fonte única de dados.
import { BRAND, SITE_URL, SOCIAL, UNITS, formatAddress, type StoreUnit } from "@/data/business";
import { CATEGORIES, MENU } from "@/data/menu";
import type { FaqItem } from "@/data/content";
import { getImage, largestSrc } from "@/lib/images";

type Json = Record<string, unknown>;

const ORG_ID = `${SITE_URL}/#organizacao`;
const abs = (path: string) => new URL(path, SITE_URL).toString();

/** "(62) 3225-7858" → "+55-62-3225-7858" */
const toE164 = (phone: string) => `+55-${phone.replace(/[()]/g, "").replace(/\s+/, "-")}`;


export function organizationSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: BRAND.name,
    alternateName: ["Popolare", "Popolare Massas"],
    url: SITE_URL,
    logo: abs("/brand/popolare-logotipo.svg"),
    image: abs(largestSrc(getImage("loja/fachada"))),
    description: `${BRAND.legalTagline}. Negócio de família fundado por ${BRAND.founders.join(" e ")}, hoje conduzido por ${BRAND.owner}.`,
    foundingDate: String(BRAND.foundingYear),
    foundingLocation: { "@type": "Place", name: `${BRAND.city}, ${BRAND.state}, Brasil` },
    founder: BRAND.founders.map((name) => ({ "@type": "Person", name })),
    employee: { "@type": "Person", name: BRAND.owner, jobTitle: "Chef e proprietária", image: abs(largestSrc(getImage("equipe/carina-retrato"))) },
    sameAs: SOCIAL.instagramVerified ? [SOCIAL.instagram, SOCIAL.facebook] : [SOCIAL.facebook],
  };
}

export function websiteSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#site`,
    url: SITE_URL,
    name: BRAND.name,
    inLanguage: "pt-BR",
    publisher: { "@id": ORG_ID },
  };
}

function storeSchema(unit: StoreUnit): Json {
  return {
    "@context": "https://schema.org",
    "@type": ["FoodEstablishment", "Store"],
    "@id": `${SITE_URL}/#loja-${unit.id}`,
    name: unit.name,
    parentOrganization: { "@id": ORG_ID },
    url: `${SITE_URL}/contato`,
    image: abs(largestSrc(getImage(unit.isMain ? "loja/fachada" : "loja/balcao"))),
    telephone: unit.phones.map(toE164),
    servesCuisine: "Italiana",
    hasMenu: `${SITE_URL}/cardapio`,
    acceptsReservations: false,
    address: {
      "@type": "PostalAddress",
      streetAddress: unit.street,
      addressLocality: BRAND.city,
      addressRegion: BRAND.state,
      postalCode: unit.postalCode,
      addressCountry: "BR",
    },
    ...(unit.geoVerified ? { geo: { "@type": "GeoCoordinates", latitude: unit.geo.lat, longitude: unit.geo.lng } } : {}),
    hasMap: unit.mapsUrl,
    openingHoursSpecification: unit.hours?.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.schemaDays,
      opens: h.opens,
      closes: h.closes,
    })),
    description: `Loja Popolare Massas e Empório em ${formatAddress(unit)}.`,
  };
}

export function storeSchemas(): Json[] {
  return UNITS.map(storeSchema);
}

export function menuSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": `${SITE_URL}/cardapio#menu`,
    name: "Cardápio Popolare 2026",
    inLanguage: "pt-BR",
    hasMenuSection: CATEGORIES.map((cat) => ({
      "@type": "MenuSection",
      name: `${cat.nameIt} — ${cat.namePt}`,
      description: cat.description,
      hasMenuItem: MENU.filter((i) => i.category === cat.id).map((item) => ({
        "@type": "MenuItem",
        name: item.nameIt === item.namePt ? item.nameIt : `${item.nameIt} (${item.namePt})`,
        description: item.description,
        ...(item.image ? { image: abs(largestSrc(getImage(item.image))) } : {}),
        ...(item.lactoseFree ? { suitableForDiet: "https://schema.org/LowLactoseDiet" } : {}),
      })),
    })),
  };
}

export function faqSchema(items: readonly FaqItem[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function breadcrumbSchema(trail: readonly { name: string; path: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Início", path: "/" }, ...trail].map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: abs(t.path),
    })),
  };
}

export function articleSchema(a: { title: string; description: string; path: string; date: string; image: string }): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    datePublished: a.date,
    image: abs(largestSrc(getImage(a.image))),
    mainEntityOfPage: abs(a.path),
    inLanguage: "pt-BR",
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  };
}
