// Conteúdo da LP de campanha (/massas-em-goiania) — termos de compra com "Goiânia" para SEO local
// e Índice de Qualidade do Google Ads. Fonte única para a página, o FAQPage e o llms.txt.
import { BRAND, DELIVERY, MAIN_UNIT, ORDER_RULES, formatAddress } from "./business";
import type { FaqItem } from "./content";
import { MENU } from "./menu";

export const LP_PATH = "/massas-em-goiania";

export const LP_SEO = {
  title: "Massas em Goiânia — massas artesanais congeladas",
  description:
    "Compre massas artesanais congeladas em Goiânia: sfogliatti, lasanhas, canelones e ravióli sem conservantes. Monte seu pedido e envie pelo WhatsApp. Loja no Setor Sul.",
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
    "Sfogliatti, lasanhas, canelones, ravióli e nhoque feitos à mão por uma família italiana. Sem conservantes, prontos para ir do congelador ao forno. Monte o pedido aqui e finalize no WhatsApp da loja.",
  bullets: ["Feito à mão em Goiânia", "Sem conservantes", "Retire na loja do Setor Sul"],
};

/** Faixa de prova abaixo do hero (números reais, sem inventar) */
export const LP_PROOF = [
  { value: String(BRAND.foundingYear), label: "receitas de família desde" },
  { value: `${MENU.length}`, label: "massas, molhos e doces no cardápio" },
  { value: `${ORDER_RULES.minBusinessDays} dias`, label: "úteis de antecedência para encomendas" },
] as const;

/** Como funciona o pedido pelo site (3 passos) */
export const LP_STEPS = [
  {
    title: "Escolha as massas",
    text: "Navegue pelo cardápio completo e toque em “Adicionar” nos itens que quiser. Ajuste as quantidades no seu pedido.",
  },
  {
    title: "Envie pelo WhatsApp",
    text: "A mensagem sai pronta, com a lista do pedido. A loja confirma a disponibilidade e o valor com você na conversa.",
  },
  {
    title: "Retire ou receba",
    text: `Retire na loja do ${MAIN_UNIT.neighborhood} ou peça pelos parceiros de entrega. Sem cadastro e sem pagamento pelo site.`,
  },
] as const;

export const LP_BENEFITS = [
  { title: "Receita de família italiana", text: `Remo e Antonietta trouxeram as receitas da Itália; desde ${BRAND.foundingYear} a família faz massas em Goiânia.` },
  { title: "Congelada, não industrializada", text: "Massa artesanal congelada logo após o preparo: preserva o sabor de massa caseira sem conservantes." },
  { title: "Do congelador ao forno", text: "Não precisa descongelar. Em cerca de 40 minutos o almoço de domingo está na mesa." },
  { title: "Encomendas no seu refratário", text: `Para festas e eventos em Goiânia, montamos a massa no seu refratário. ${ORDER_RULES.note.split(". ")[1] ?? ""}`.trim() },
] as const;

/** Produtos em destaque no topo da LP (ids de data/menu.ts) */
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

export interface LpKit {
  id: string;
  name: string;
  tagline: string;
  /** Chave em data/images.generated.json */
  image: string;
  imageAlt: string;
  /** ids de data/menu.ts — um de cada */
  items: readonly string[];
}

/** Sugestões prontas: combinações de itens reais do cardápio, adicionadas de uma vez ao pedido */
export const LP_KITS: readonly LpKit[] = [
  {
    id: "domingo-em-familia",
    name: "Domingo em família",
    tagline: "A mesa cheia sem passar a manhã na cozinha.",
    image: "produtos/lasagne-bolognese",
    imageAlt: "Lasanha à bolonhesa da Popolare, gratinada e cortada em pedaços",
    items: ["lasagne-bolognese", "sfogliatti-bianco", "sugo-pomodoro", "tiramisu"],
  },
  {
    id: "noite-italiana",
    name: "Noite italiana a dois",
    tagline: "Massa fresca, molho da casa e um doce para fechar.",
    image: "produtos/fettuccine-funghi",
    imageAlt: "Fettuccine com molho de funghi e gorgonzola servido no prato",
    items: ["fettuccine-bianco", "funghi-gorgonzola", "tiramisu"],
  },
  {
    id: "para-receber",
    name: "Para receber amigos",
    tagline: "Duas massas de forno e dois molhos para variar o prato.",
    image: "produtos/cannelloni-carne",
    imageAlt: "Canelones de carne da Popolare dispostos num refratário",
    items: ["cannelloni-carne", "rondelli-prosciutto", "sugo-pomodoro", "salsa-bianca"],
  },
  {
    id: "cappelletti-in-brodo",
    name: "Cappelletti in brodo",
    tagline: "O clássico de inverno da família, pronto em minutos.",
    image: "produtos/cappelletti-pollo",
    imageAlt: "Cappelletti de frango da Popolare em caldo",
    items: ["cappelletti-pollo", "brodo-verdure"],
  },
];

const deliveryNames = DELIVERY.map((d) => d.name).join(" e ");

export const LP_FAQ: readonly FaqItem[] = [
  {
    question: "Como funciona o pedido pelo site?",
    answer:
      "Você monta a lista no botão “Adicionar” de cada massa e envia pelo WhatsApp com a mensagem pronta. A loja confirma a disponibilidade e o valor na conversa. Não há cadastro nem pagamento pelo site.",
  },
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
    question: "A Popolare entrega em Goiânia?",
    answer: `Sim. Além da retirada na loja, você pode pedir pelos parceiros de pedido online (${deliveryNames}) ou combinar a entrega pelo WhatsApp da loja.`,
  },
  {
    question: "Vocês fazem encomenda de massa para festas em Goiânia?",
    answer: `Sim. ${ORDER_RULES.note}`,
  },
  {
    question: "Tem opção sem lactose?",
    answer: "Sim, o Rondelli di Mozzarella sem lactose, feito sob encomenda.",
  },
  {
    question: "Qual a massa mais vendida da Popolare?",
    answer: "O Sfogliatti Bianco: trouxinha de massa fresca recheada com queijo prato, muçarela, provolone e requeijão.",
  },
];
