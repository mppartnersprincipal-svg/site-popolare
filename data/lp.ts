// Conteúdo da LP de campanha (/massas-em-goiania) — termos de compra com "Goiânia" para SEO local
// e Índice de Qualidade do Google Ads. Fonte única para a página, o FAQPage e o llms.txt.
import { BRAND, MAIN_UNIT, ORDER_RULES, formatAddress } from "./business";
import type { FaqItem } from "./content";

export const LP_PATH = "/massas-em-goiania";

export const LP_SEO = {
  title: "Massas em Goiânia — massas artesanais congeladas",
  description:
    "Compre massas artesanais congeladas em Goiânia: sfogliatti, lasanhas, canelones e ravióli sem conservantes. Loja no Setor Sul. Peça no WhatsApp.",
  keywords: [
    "massas em Goiânia",
    "massas congeladas Goiânia",
    "comprar massa Goiânia",
    "massa artesanal Goiânia",
    "lasanha congelada Goiânia",
    "massa fresca Goiânia",
    "empório italiano Goiânia",
    "massas Setor Sul",
  ],
};

export const LP_HERO = {
  eyebrow: `Goiânia · desde ${BRAND.foundingYear}`,
  title: "Massas artesanais congeladas em Goiânia",
  subtitle:
    "Sfogliatti, lasanhas, canelones, ravióli e nhoque feitos à mão por uma família italiana. Sem conservantes, prontos para ir do congelador ao forno.",
  bullets: ["Feito à mão em Goiânia", "Sem conservantes", "Retire na loja do Setor Sul"],
};

export const LP_BENEFITS = [
  { title: "Receita de família italiana", text: `Remo e Antonietta trouxeram as receitas da Itália; desde ${BRAND.foundingYear} a família faz massas em Goiânia.` },
  { title: "Congelada, não industrializada", text: "Massa artesanal congelada logo após o preparo: preserva o sabor de massa caseira sem conservantes." },
  { title: "Do congelador ao forno", text: "Não precisa descongelar. Em cerca de 40 minutos o almoço de domingo está na mesa." },
  { title: "Encomendas no seu refratário", text: `Para festas e eventos em Goiânia, montamos a massa no seu refratário. ${ORDER_RULES.note.split(". ")[1] ?? ""}`.trim() },
] as const;

/** Produtos em destaque na LP (ids de data/menu.ts) */
export const LP_PRODUCTS = [
  "sfogliatti-bianco",
  "lasagne-bolognese",
  "cannelloni-carne",
  "ravioli-verde",
  "gnocchi-ripieni",
  "lasagne-quattro-formaggi",
  "rondelli-prosciutto",
  "tiramisu",
] as const;

export const LP_FAQ: readonly FaqItem[] = [
  {
    question: "Onde comprar massas artesanais em Goiânia?",
    answer: `Na loja da ${BRAND.name}, na ${formatAddress(MAIN_UNIT)}. Também dá para pedir pelo WhatsApp e retirar na loja.`,
  },
  {
    question: "As massas congeladas da Popolare têm conservantes?",
    answer: "Não. São massas artesanais feitas à mão e congeladas logo depois do preparo, sem conservantes.",
  },
  {
    question: "Como preparar massa congelada?",
    answer: "Massas de forno vão direto do congelador ao forno a 200 °C por cerca de 40 minutos. Massas para cozinhar vão congeladas na água fervente por 3 a 5 minutos.",
  },
  {
    question: "Vocês fazem encomenda de massa para festas em Goiânia?",
    answer: `Sim. ${ORDER_RULES.note}`,
  },
  {
    question: "Qual a massa mais vendida da Popolare?",
    answer: "O Sfogliatti Bianco: trouxinha de massa fresca recheada com queijo prato, muçarela, provolone e requeijão.",
  },
];
