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

/** Seção "Congelados": como a linha funciona e como cuidar em casa (fatos já usados no site) */
export const LP_FROZEN = {
  intro:
    "Tudo o que sai da Popolare é feito à mão e congelado logo depois do preparo. É assim que a massa chega à sua casa sem conservantes e com sabor de massa fresca.",
  care: [
    { title: "Direto para o congelador", text: "Ao chegar em casa, leve as embalagens ao congelador. Mantenha congelado até a hora de preparar." },
    { title: "Não precisa descongelar", text: "Massas de forno vão congeladas ao forno a 200 °C; massas de cozinhar vão congeladas na água fervente." },
    { title: "Molho pronto, mesa posta", text: "Os molhos também vão congelados: aqueça em fogo baixo enquanto a massa cozinha ou assa." },
  ],
} as const;

export interface LpExtra {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  /** Chave em data/images.generated.json; sem imagem usa o painel marsala com o título */
  image?: string;
  imageAlt?: string;
  /** Mensagem pré-pronta do WhatsApp */
  message: string;
  cta: string;
  /** yyyy-mm-dd — o card some sozinho depois desta data (itens sazonais) */
  validUntil?: string;
}

/**
 * Além do cardápio fixo: o que a Popolare vende ou anuncia e não entra no "Meu pedido"
 * (fonte: doc "POPOLARE PRODUTOS E PLANEJAMENTO" do Drive do cliente + pastas "Produtos Empório").
 * TODO(cliente): confirmar disponibilidade e regras do Nhoque da Fortuna, pães e empório.
 */
export const LP_EXTRAS: readonly LpExtra[] = [
  {
    id: "nhoque-da-fortuna",
    eyebrow: "Todo dia 29",
    title: "Nhoque da Fortuna",
    text: "A tradição italiana do dia 29: nhoque de batata feito à mão para o almoço da sorte. Reserve o seu antes do dia.",
    image: "produtos/gnocchi",
    imageAlt: "Nhoque de batata da Popolare servido com molho e queijo ralado",
    message: "Olá, Popolare! Vi o site e quero reservar o Nhoque da Fortuna do dia 29. Como funciona?",
    cta: "Reservar o Nhoque da Fortuna",
  },
  {
    id: "massa-do-mes-outubro",
    eyebrow: "Massa do mês · outubro",
    title: "Sfogliatti de Frango com Pequi",
    text: "Da Itália ao Cerrado: a trouxinha de massa fresca com um recheio que tem gosto de Goiás. Só em outubro.",
    message: "Olá, Popolare! Vi o site e quero o Sfogliatti de Frango com Pequi, a massa do mês. Está disponível?",
    cta: "Quero a massa do mês",
    validUntil: "2026-10-31",
  },
  {
    id: "paes",
    eyebrow: "Il pane",
    title: "Pães para a mesa italiana",
    text: "Focaccia e sourdough frescos, e os pães congelados da Cantina em Casa, marca parceira da Popolare. Para fazer a scarpetta no molho que ficou no prato.",
    image: "loja/grissini",
    imageAlt: "Grissini e pães do empório da Popolare na prateleira de madeira",
    message: "Olá, Popolare! Vi o site e quero saber quais pães (focaccia, sourdough, congelados) vocês têm hoje.",
    cta: "Perguntar sobre os pães",
  },
  {
    id: "emporio",
    eyebrow: "L'emporio",
    title: "Vinhos, geleias e importados",
    text: "O empório da loja tem vinhos, geleias e produtos italianos escolhidos pela Carina para acompanhar as massas. Peça uma sugestão para o seu prato.",
    image: "loja/vinhos",
    imageAlt: "Prateleira de vinhos do empório da Popolare",
    message: "Olá, Popolare! Vi o site e quero uma sugestão de vinho ou produto do empório para acompanhar as massas.",
    cta: "Pedir uma sugestão",
  },
];

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
    question: "Como conservar as massas congeladas em casa?",
    answer:
      "Leve as embalagens ao congelador assim que chegar e mantenha congelado até a hora de preparar. Não precisa descongelar: a massa vai direto ao forno ou à água fervente.",
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
