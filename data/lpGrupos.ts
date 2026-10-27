// Uma LP por grupo de anúncios da campanha "[MP] - [S] - Massas Artesanais - Goiânia".
// Todas usam a mesma página (components/lp/LpPage.tsx); aqui fica só o que muda por grupo.
// Temas/keywords/H1 em data/lpTemas.ts. Produtos = ids de data/menu.ts (fonte da verdade).
import { BRAND, ORDER_RULES } from "./business";
import type { FaqItem } from "./content";
import { HOW_TO } from "./content";
import { LP_HERO, LP_KITS_PADRAO, LP_SEO } from "./lp";
import { LP_GRUPO_IDS, LP_TEMAS, type LpGrupoId } from "./lpTemas";

export interface LpDestaque {
  /** Rótulo da aba (italiano, como as categorias) */
  label: string;
  sub: string;
  description: string;
  /** ids de data/menu.ts, na ordem da aba */
  produtos: readonly string[];
}

export interface LpGrupo {
  id: LpGrupoId;
  rota: string;
  /** Prefixo do data-track-local */
  rastreio: string;
  rotulo: string;
  /** Nome no BreadcrumbList */
  breadcrumb: string;
  seo: { title: string; description: string; keywords: readonly string[] };
  hero: {
    eyebrow: string;
    subtitle: string;
    bullets: readonly string[];
    /** Produto da foto do hero (o tema pode trocar, se tiver foto real) */
    produto: string;
  };
  /** Aba própria, primeira e aberta no cardápio. Sem ela, abre "Mais pedidos" (a LP original) */
  destaque?: LpDestaque;
  /** Cardápio logo depois do hero e, no celular, foto do produto antes do H1 (todas as LPs de anúncio desde 27/10) */
  catalogoAposHero: boolean;
  /** ids de LP_KITS, na ordem */
  kits: readonly string[];
  /** Perguntas do grupo, antes do FAQ comum */
  faq: readonly FaqItem[];
  /** Completa "Vi o anúncio …" no WhatsApp */
  anuncio: string;
}

const ANO = BRAND.foundingYear;
const RETIRADA = "Retire na loja do Setor Sul";
const [, , PREPARO_ASSAR] = HOW_TO.assar.steps;

const FAQ_COZINHAR: FaqItem = {
  question: "Como cozinhar massa recheada congelada?",
  answer: `Não precisa descongelar. ${HOW_TO.cozinhar.steps.join(" ")}`,
};

type GrupoConteudo = Omit<LpGrupo, "id" | "rota" | "rastreio" | "rotulo">;

const CONTEUDO: Record<LpGrupoId, GrupoConteudo> = {
  "massas-em-goiania": {
    breadcrumb: "Massas em Goiânia",
    seo: LP_SEO,
    hero: { ...LP_HERO, produto: "sfogliatti-bianco" },
    catalogoAposHero: true,
    kits: LP_KITS_PADRAO,
    faq: [],
    anuncio: "das massas artesanais",
  },
  "massas-artesanais": {
    breadcrumb: "Massas artesanais",
    seo: {
      title: "Massas artesanais feitas à mão em Goiânia",
      description:
        "Massas artesanais feitas à mão em Goiânia: ravióli, capeletti, rondelli, sfogliatti e massa fresca para lasanha, sem conservantes. Peça pelo WhatsApp.",
      keywords: ["massas artesanais", "massa fresca", "massas recheadas congeladas", "massa fresca para lasanha", "fábrica de massas", "massas artesanais Goiânia"],
    },
    hero: {
      eyebrow: `Pasta fatta a mano · desde ${ANO}`,
      subtitle:
        "Ravióli, cappelletti, rondelli e sfogliatti recheados à mão por uma família italiana, e massa fresca para lasanha sob encomenda. Sem conservantes, congelados logo depois do preparo. Monte o pedido aqui e finalize no WhatsApp da loja.",
      bullets: [`Feitas à mão desde ${ANO}`, "Sem conservantes", RETIRADA],
      produto: "ravioli-verde",
    },
    destaque: {
      label: "Fatte a mano",
      sub: "recheadas e frescas",
      description: "As massas recheadas da casa e a massa fresca para lasanha (sob encomenda).",
      produtos: ["ravioli-verde", "ravioli-tre-formaggi", "ravioli-carne", "cappelletti-pollo", "cappelletti-carne", "rondelli-prosciutto", "sfogliatti-bianco", "sfoglia-lasagne", "fettuccine-bianco"],
    },
    catalogoAposHero: true,
    kits: ["para-receber", "noite-italiana", "cappelletti-in-brodo", "domingo-em-familia"],
    faq: [
      {
        question: "Vocês vendem massa fresca para lasanha?",
        answer:
          "Sim. A Sfoglia per Lasagne são folhas de massa fresca para montar a sua lasanha em casa, em embalagem de 500 g. É feita sob encomenda: peça pelo WhatsApp e a loja combina a retirada.",
      },
      {
        question: "As massas recheadas são congeladas?",
        answer:
          "Sim. Ravióli, cappelletti, rondelli e sfogliatti são feitos à mão e congelados logo depois do preparo, sem conservantes. Ravióli e cappelletti vão congelados para a água fervente; rondelli e sfogliatti, direto ao forno.",
      },
    ],
    anuncio: "das massas artesanais",
  },
  lasanhas: {
    breadcrumb: "Lasanha congelada",
    seo: {
      title: "Lasanha congelada artesanal em Goiânia",
      description:
        "Lasanha congelada artesanal em Goiânia: à bolonhesa, quatro queijos e de berinjela, sem conservantes e prontas para o forno. Peça pelo WhatsApp e retire no Setor Sul.",
      keywords: ["lasanha congelada", "lasanha congelada Goiânia", "lasanha artesanal", "lasanha à bolonhesa", "lasanha quatro queijos", "lasanha de berinjela", "lasanha para festa"],
    },
    hero: {
      eyebrow: "Lasagne · Goiânia",
      subtitle:
        "Lasanha à bolonhesa, quatro queijos e de berinjela, montadas à mão com massa fresca e congeladas logo depois do preparo. Sem conservantes: do congelador direto ao forno, pronta em cerca de 40 minutos.",
      bullets: ["Do congelador direto ao forno", "Pronta em cerca de 40 minutos", RETIRADA],
      produto: "lasagne-bolognese",
    },
    destaque: {
      label: "Lasagne",
      sub: "lasanhas",
      description: "Lasanhas de 700 g já montadas com molho, prontas para o forno, e a massa e os molhos para montar a sua.",
      produtos: ["lasagne-bolognese", "lasagne-quattro-formaggi", "lasagne-melanzane", "sfoglia-lasagne", "ragu-bolognese", "salsa-bianca"],
    },
    catalogoAposHero: true,
    kits: ["domingo-em-familia", "para-receber", "noite-italiana", "cappelletti-in-brodo"],
    faq: [
      {
        question: "Como assar a lasanha congelada?",
        answer: `Não precisa descongelar: preaqueça o forno a 200 °C e leve a lasanha, que já vem montada com molho. ${PREPARO_ASSAR}`,
      },
      { question: "Vocês fazem lasanha para festa?", answer: `Sim. ${ORDER_RULES.note}` },
      {
        question: "Quais lasanhas a Popolare tem?",
        answer:
          "À bolonhesa, quatro queijos (massa de espinafre) e de berinjela, todas com 700 g e prontas para o forno. Para quem prefere montar em casa, há a massa fresca para lasanha, sob encomenda.",
      },
    ],
    anuncio: "da lasanha congelada",
  },
  "massas-de-forno": {
    breadcrumb: "Canelone, rondelli e sfogliatti",
    seo: {
      title: "Canelone, rondelli e sfogliatti em Goiânia",
      description:
        "Massas de forno artesanais em Goiânia: canelone, rondelli, sfogliatti e agnolotti recheados à mão, sem conservantes, do congelador direto ao forno. Peça pelo WhatsApp.",
      keywords: ["canelone congelado", "canelone de frango", "rondelli congelado", "sfogliatti", "agnolotti", "massas de forno Goiânia"],
    },
    hero: {
      eyebrow: "Pasta al forno · Goiânia",
      subtitle:
        "Canelone, rondelli, sfogliatti e agnolotti recheados à mão, sem conservantes. Vão do congelador direto ao forno, com o molho da casa ou já montados ao sugo. O sfogliatti é o mais vendido da casa.",
      bullets: ["Sem conservantes", "Do congelador direto ao forno", "Encomendas para festas"],
      produto: "cannelloni-carne",
    },
    destaque: {
      label: "Al forno",
      sub: "canelone, rondelli e sfogliatti",
      description: "Recheadas à mão, para levar do congelador ao forno com o molho que você preferir (500 g) ou já montadas ao sugo (700 g).",
      produtos: [
        "cannelloni-carne",
        "cannelloni-pollo",
        "cannelloni-salsiccia",
        "cannelloni-ricotta-spinaci",
        "rondelli-prosciutto",
        "rondelli-mozzarella",
        "sfogliatti-bianco",
        "sfogliatti-verde",
        "sfogliatti-giallo",
        "sfogliatti-carne-secca",
        "agnolotti",
        "agnolotti-giallo",
        "involtino-pizza",
        "cannelloni-carne-sugo",
        "cannelloni-pollo-sugo",
        "rondelli-prosciutto-sugo",
        "sfogliatti-bianco-sugo",
      ],
    },
    catalogoAposHero: true,
    kits: ["para-receber", "domingo-em-familia", "noite-italiana", "cappelletti-in-brodo"],
    faq: [
      { question: "Como assar canelone, rondelli e sfogliatti congelados?", answer: HOW_TO.assar.steps.join(" ") },
      {
        question: "Quais sabores de canelone vocês têm?",
        answer: "Carne, frango, calabresa e ricota com espinafre (500 g), e os de carne, frango e calabresa já montados ao sugo (700 g), prontos para o forno.",
      },
    ],
    anuncio: "das massas de forno",
  },
  nhoque: {
    breadcrumb: "Nhoque artesanal",
    seo: {
      title: "Nhoque artesanal congelado em Goiânia",
      description:
        "Nhoque de batata e nhoque recheado de búfala, feitos à mão em Goiânia e congelados sem conservantes. Do congelador para a panela. Peça pelo WhatsApp.",
      keywords: ["nhoque", "nhoque congelado", "nhoque de batata", "nhoque recheado", "gnocchi", "nhoque Goiânia"],
    },
    hero: {
      eyebrow: "Gnocchi · Goiânia",
      subtitle:
        "Nhoque de batata macio e nhoque recheado de búfala com manjericão, feitos à mão e congelados logo depois do preparo. Do congelador direto para a panela, sem conservantes.",
      bullets: ["Feito à mão em Goiânia", "Do congelador para a panela", RETIRADA],
      produto: "gnocchi-patate",
    },
    destaque: {
      label: "Gnocchi",
      sub: "nhoque e molhos",
      description: "Nhoque de batata e nhoque recheado de búfala, e os molhos da casa para acompanhar.",
      produtos: ["gnocchi-patate", "gnocchi-ripieni", "sugo-pomodoro", "pesto", "quattro-formaggi", "alla-panna"],
    },
    catalogoAposHero: true,
    kits: ["noite-de-nhoque", "domingo-em-familia", "noite-italiana", "para-receber"],
    faq: [
      FAQ_COZINHAR,
      { question: "O que é o nhoque recheado?", answer: "É o nhoque de batata recheado com muçarela de búfala e manjericão, em embalagem de 500 g. Sugestão da chef." },
    ],
    anuncio: "do nhoque artesanal",
  },
  "ravioli-capeletti": {
    breadcrumb: "Ravióli e capeletti",
    seo: {
      title: "Ravióli e capeletti artesanais em Goiânia",
      description:
        "Ravióli, capeletti, tortelli, fettuccine e pappardelle frescos de ovos, feitos à mão em Goiânia e congelados sem conservantes. Peça pelo WhatsApp.",
      keywords: ["ravióli congelado", "capeletti", "cappelletti", "tortelli de abóbora", "fettuccine fresco", "massa fresca de ovos"],
    },
    hero: {
      eyebrow: "Pasta fresca · Goiânia",
      subtitle:
        "Ravióli, cappelletti e tortelli recheados à mão, fettuccine e pappardelle frescos de ovos, e os molhos da casa para acompanhar. Congelados logo depois do preparo, sem conservantes: vão direto para a água fervente.",
      bullets: ["Massa fresca de ovos", "Sem conservantes", RETIRADA],
      produto: "cappelletti-pollo",
    },
    destaque: {
      label: "Pasta fresca",
      sub: "ravióli, capeletti e frescas",
      description: "Massas recheadas e frescas de ovos para cozinhar na água fervente, e o brodo para o cappelletti.",
      produtos: [
        "ravioli-verde",
        "ravioli-tre-formaggi",
        "ravioli-carne",
        "ravioli-brie",
        "cappelletti-pollo",
        "cappelletti-carne",
        "tortelli-zucca",
        "fettuccine-bianco",
        "fettuccine-verde",
        "pappardelle-bianco",
        "pappardelle-verde",
        "brodo-verdure",
      ],
    },
    catalogoAposHero: true,
    kits: ["cappelletti-in-brodo", "noite-italiana", "para-receber", "domingo-em-familia"],
    faq: [
      FAQ_COZINHAR,
      { question: "Vocês têm caldo para cappelletti in brodo?", answer: "Sim. O Brodo di Verdure (caldo de legumes, 1000 ml) é feito para o cappelletti e para sopas." },
    ],
    anuncio: "do ravióli e capeletti",
  },
};

export const LP_GRUPOS: readonly LpGrupo[] = LP_GRUPO_IDS.map((id) => {
  const { rota, rastreio, rotulo } = LP_TEMAS[id];
  return { id, rota, rastreio, rotulo, ...CONTEUDO[id] };
});

export function grupoPorId(id: string): LpGrupo | undefined {
  return LP_GRUPOS.find((g) => g.id === id);
}

/** Grupo de uma rota pública (o build quebra se a rota não estiver configurada) */
export function grupoDaRota(rota: string): LpGrupo {
  const grupo = LP_GRUPOS.find((g) => g.rota === rota);
  if (!grupo) throw new Error(`LP sem grupo: ${rota}`);
  return grupo;
}
