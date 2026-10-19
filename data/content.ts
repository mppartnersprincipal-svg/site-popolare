// Conteúdo editorial: história, imprensa, FAQ, modo de preparo e "fatos rápidos" (GEO).
import { BRAND, ORDER_RULES, UNITS, formatAddress } from "./business";

// ───────────── História (texto do site oficial /sobre-nos) ─────────────
export interface StoryChapter {
  id: string;
  marker: string;
  title: string;
  text: string;
  image: string;
  imageAlt: string;
}

export const STORY_INTRO =
  "A história da Popolare começou com o desejo de uma família italiana de compartilhar o sabor da autêntica cozinha italiana com amigos — e com Goiânia.";

export const STORY: readonly StoryChapter[] = [
  {
    id: "comeco",
    marker: "O começo",
    title: "Um pequeno cômodo, uma grande vontade",
    text: "Tudo começou de forma humilde, com a produção de massas italianas artesanais em um pequeno cômodo na residência da família. As massas, com pães e doces, eram vendidas numa escola de italiano de amigos — e foi assim que surgiram as primeiras encomendas.",
    image: "cucina/molho-branco",
    imageAlt: "Massa recheada coberta com molho branco e queijo ralado, em prato de cerâmica verde",
  },
  {
    id: "remo-antonietta",
    marker: "Remo & Antonietta",
    title: "Um pouco da Itália em cada produto",
    text: "O casal Remo e Antonietta, apaixonados pela culinária da sua terra natal, desenvolveu o projeto com carinho e zelo. Quem provava as massas sentia-se à beira do Mediterrâneo.",
    image: "cucina/forno-gratinado",
    imageAlt: "Massas gratinadas saindo do forno, douradas e borbulhando",
  },
  {
    id: "carina",
    marker: "Hoje",
    title: "Carina segue o sonho dos pais",
    text: "Hoje, a Popolare Massas e Empório é conduzida por Carina Popolare, filha de Remo e Antonietta, com a missão de continuar o sonho da família: levar às famílias de Goiânia a tradição, o sabor e a essência da verdadeira culinária italiana.",
    image: "equipe/carina-retrato",
    imageAlt: "Carina Popolare, de dólmã marsala com o logo da Popolare, sorrindo apoiada na bancada da cozinha",
  },
];

// ───────────── Diferenciais ─────────────
export const PILLARS = [
  { title: "Feito à mão", text: "Massas abertas, recheadas e dobradas uma a uma, como em casa." },
  { title: "Sem conservantes", text: "Produto fresco, com ingredientes selecionados e jeitinho de mãe." },
  { title: "Receita de família", text: `Desde ${BRAND.foundingYear}, as mesmas receitas de Remo e Antonietta.` },
] as const;

// ───────────── Imprensa (/midia) ─────────────
export interface PressItem {
  outlet: string;
  title: string;
  url?: string;
  year?: number;
}

export const PRESS: readonly PressItem[] = [
  {
    outlet: "Pequenas Empresas & Grandes Negócios",
    title: "Com a morte dos pais, ela assumiu negócio de massas congeladas e hoje fatura R$ 1,8 milhão por ano",
    url: "https://revistapegn.globo.com/mulheres-empreendedoras/noticia/2023/08/com-a-morte-dos-pais-ela-assumiu-negocio-de-massas-congeladas-e-hoje-fatura-r-18-milhao-por-ano.ghtml",
    year: 2023,
  },
  {
    outlet: "Jornal O Goiás",
    title: "Chef goiana conquista paladares com massas artesanais e molhos sem conservantes",
    url: "https://www.jornalogoias.com.br/noticias/chef-goiana-conquista-paladares-com-massas-artesanais-e-molhos-sem-conservantes",
    year: 2023,
  },
  // TODO(cliente): links originais destas duas matérias não foram encontrados
  { outlet: "Jornal Hora Extra", title: "Receita de massa fresca vira febre nas redes sociais" },
  { outlet: "Giro Goiás Notícias", title: "Réveillon em casa sem ter trabalho e com massa italiana artesanal" },
];

// ───────────── Modo de preparo ─────────────
export const HOW_TO = {
  assar: {
    title: "Para assar",
    subtitle: "Pasta al forno e prontas para o forno",
    steps: [
      "Preaqueça o forno a 200 °C. Não precisa descongelar.",
      "Disponha a massa num refratário e cubra com o molho de sua preferência (as prontas para o forno já vêm com molho).",
      "Cubra com papel-alumínio e asse por cerca de 40 minutos; retire o papel nos últimos 10 para gratinar.",
    ],
  },
  cozinhar: {
    title: "Para cozinhar",
    subtitle: "Fettuccine, ravióli, cappelletti e nhoque",
    steps: [
      "Ferva bastante água com sal (1 litro para cada 100 g de massa).",
      "Coloque a massa ainda congelada e mexa delicadamente.",
      "Massas frescas cozinham em 3 a 5 minutos; recheadas, quando subirem à superfície. Escorra e sirva com o molho aquecido.",
    ],
  },
} as const;

// ───────────── FAQ (também alimenta o FAQPage e o llms.txt) ─────────────
export interface FaqItem {
  question: string;
  answer: string;
}

const enderecos = UNITS.map((u) => `${u.name}: ${formatAddress(u)}`).join("; ");

export const FAQ: readonly FaqItem[] = [
  {
    question: "Onde comprar massa fresca artesanal em Goiânia?",
    answer: `Na Popolare Massas e Empório, que produz massas italianas artesanais desde ${BRAND.foundingYear}. Endereços: ${enderecos}.`,
  },
  {
    question: "As massas da Popolare têm conservantes?",
    answer: "Não. As massas e os molhos são feitos com ingredientes selecionados e sem conservantes, por isso são vendidos congelados para manter o frescor.",
  },
  {
    question: "Como faço uma encomenda?",
    answer: `Pelo WhatsApp ou pelo formulário de encomendas do site. ${ORDER_RULES.note}`,
  },
  {
    question: "Vocês montam a lasanha no meu refratário?",
    answer: "Sim. Você deixa o refratário na loja e montamos a massa de assar nele, sob encomenda, com antecedência mínima de 2 dias úteis.",
  },
  {
    question: "Tem opção sem lactose?",
    answer: "Sim, o Rondelli di Mozzarella sem lactose, feito sob encomenda.",
  },
  {
    question: "Qual o horário de funcionamento?",
    answer: `${UNITS.filter((u) => u.hours)
      .map((u) => `${u.name}: ${u.hours!.map((h) => `${h.days.toLowerCase()} das ${h.opens.replace(":00", "h")} às ${h.closes.replace(":00", "h")}`).join("; ")}`)
      .join(". ")}. Aos domingos a loja fica fechada.`,
  },
  {
    question: "Qual é o produto mais vendido?",
    answer: "O Sfogliatti Bianco, uma trouxinha de massa fresca recheada com queijo prato, muçarela, provolone e requeijão.",
  },
  {
    question: "A Popolare faz entrega?",
    answer: "Sim, pelos canais de pedido online (Menudino e Anota AI) e pelo WhatsApp da loja.",
  },
];

// ───────────── Fatos rápidos (bloco citável para GEO) ─────────────
export const QUICK_FACTS: readonly { label: string; value: string }[] = [
  { label: "O que é", value: "Fábrica e loja de massas italianas artesanais congeladas, molhos e empório de importados" },
  { label: "Desde", value: `${BRAND.foundingYear}, em ${BRAND.city}-${BRAND.state}` },
  { label: "Fundadores", value: BRAND.founders.join(" e ") },
  { label: "À frente hoje", value: `${BRAND.owner}, chef e filha dos fundadores` },
  { label: "Loja", value: UNITS.map((u) => `${u.neighborhood} (${u.street})`).join(" e ") },
  { label: "Diferenciais", value: "Feito à mão, sem conservantes, receitas de família" },
  { label: "Encomendas", value: "Com 2 dias úteis de antecedência; montagem no refratário do cliente" },
];
