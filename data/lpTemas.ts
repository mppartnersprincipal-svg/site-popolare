// Keywords da campanha "[MP] - [S] - Massas Artesanais - Goiânia" agrupadas por tema, com o H1 de cada tema.
// Fonte: ../Palavras Chaves/01..07 (gerados por popolare_keywords_por_grupo.py). Ao mexer nas keywords
// do Google Ads, rodar o script de novo e atualizar aqui. Lido pelo proxy.ts: manter sem imports pesados.
import { BRAND } from "./business";

export const TEMA_PADRAO = "padrao";

export const LP_GRUPO_IDS = [
  "massas-em-goiania",
  "massas-artesanais",
  "lasanhas",
  "massas-de-forno",
  "nhoque",
  "ravioli-capeletti",
] as const;

export type LpGrupoId = (typeof LP_GRUPO_IDS)[number];

export interface LpTema {
  /** Slug do tema (rota interna /lp-variante/<grupo>/<tema>); "padrao" = H1 padrão do grupo */
  id: string;
  /** H1 em duas partes: [caixa-alta, itálico]. O texto completo é a junção das duas com espaço */
  h1: readonly [string, string];
  /** Keywords ativas do tema, como estão no Google Ads (o utm_term chega com o texto exato) */
  keywords: readonly string[];
  /** id de data/menu.ts: abre a aba do grupo e vai para o hero (se tiver foto real) */
  produto?: string;
}

export interface LpGrupoTemas {
  /** Rota pública da página */
  rota: string;
  /** Prefixo do data-track-local (a /massas-em-goiania mantém "lp" para não quebrar o histórico) */
  rastreio: string;
  /** Nome curto no painel */
  rotulo: string;
  temas: readonly LpTema[];
}

const ANO = BRAND.foundingYear;

export const LP_TEMAS: Record<LpGrupoId, LpGrupoTemas> = {
  // 01 + 07 (Marca): as buscas pela marca também caem aqui
  "massas-em-goiania": {
    rota: "/massas-em-goiania",
    rastreio: "lp",
    rotulo: "Massas em Goiânia",
    temas: [
      { id: TEMA_PADRAO, h1: ["Massas artesanais", "em Goiânia"], keywords: ["massa artesanal goiânia", "massas artesanais goiânia", "massas em goiânia", "massas goiânia"] },
      { id: "pastificio", h1: ["Pastifício artesanal", "em Goiânia"], keywords: ["pastificio goiânia", "pastificio perto de mim"] },
      { id: "macarrao-perto", h1: ["Macarrão artesanal fresco", "perto de você"], keywords: ["macarrão perto de mim"], produto: "fettuccine-bianco" },
      { id: "emporio", h1: ["Empório italiano em Goiânia,", `desde ${ANO}`], keywords: ["empório italiano", "empório italiano goiânia"] },
      { id: "fabrica", h1: ["Fábrica de massas artesanais", "em Goiânia"], keywords: ["fábrica de massas em goiânia", "fábrica de massas goiânia", "fábrica de massas perto de mim"] },
      { id: "casa-de-massas", h1: ["Casa de massas artesanais", "no Setor Sul"], keywords: ["casa de massas goiania", "casa de massas perto de mim"] },
      { id: "loja-de-massas", h1: ["Loja de massas artesanais", "no Setor Sul"], keywords: ["loja de massas goiânia", "loja de massas perto de mim"] },
      { id: "perto-de-mim", h1: ["Massas artesanais perto de você,", "no Setor Sul"], keywords: ["massa fresca perto de mim", "massas congeladas perto de mim", "massas perto de mim"] },
      { id: "onde-comprar", h1: ["Onde comprar massa fresca", "em Goiânia"], keywords: ["onde comprar massa fresca", "onde comprar massas artesanais"] },
      { id: "congeladas", h1: ["Massas congeladas artesanais", "em Goiânia"], keywords: ["massa congelada goiânia", "massas congeladas goiânia"] },
      { id: "massa-fresca", h1: ["Massa fresca feita à mão", "em Goiânia"], keywords: ["massa fresca goiânia", "massas frescas goiânia"] },
      {
        id: "marca",
        h1: ["Popolare Massas e Empório,", `desde ${ANO}`],
        keywords: ["pastificio popolare", "popolare", "popolare goiânia", "popolare massas", "popolare massas e empório", "popolare massas goiânia", "popolare setor sul"],
      },
    ],
  },
  "massas-artesanais": {
    rota: "/massas-artesanais",
    rastreio: "lp-artesanais",
    rotulo: "Massas artesanais",
    temas: [
      { id: TEMA_PADRAO, h1: ["Massas artesanais", "feitas à mão"], keywords: ["comprar massa artesanal", "massa artesanal", "massas artesanais", "massas italianas artesanais"] },
      { id: "massa-lasanha", h1: ["Massa fresca para lasanha,", "feita à mão"], keywords: ["massa de lasanha fresca", "massa fresca de lasanha", "massa fresca para lasanha"], produto: "sfoglia-lasagne" },
      { id: "macarrao", h1: ["Macarrão artesanal", "fresco"], keywords: ["macarrão artesanal", "macarrão fresco"], produto: "fettuccine-bianco" },
      { id: "recheadas", h1: ["Massas recheadas", "artesanais"], keywords: ["massa recheada", "massa recheada congelada", "massas recheadas", "massas recheadas congeladas"] },
      { id: "fabrica", h1: ["Fábrica de massas frescas", `desde ${ANO}`], keywords: ["fábrica de massas", "fábrica de massas frescas"] },
      { id: "casa-de-massas", h1: ["Casa de massas", "artesanais"], keywords: ["casa de massas"] },
      { id: "loja-de-massas", h1: ["Loja de massas", "artesanais"], keywords: ["loja de massas"] },
      {
        id: "congeladas",
        h1: ["Massas artesanais congeladas,", "do congelador ao forno"],
        keywords: ["massa artesanal congelada", "massa congelada", "massa fresca congelada", "massas artesanais congeladas", "massas congeladas"],
      },
      { id: "massa-fresca", h1: ["Massa fresca", "feita à mão"], keywords: ["comprar massa fresca", "massa fresca", "massas frescas"] },
    ],
  },
  lasanhas: {
    rota: "/lasanha-congelada",
    rastreio: "lp-lasanha",
    rotulo: "Lasanhas",
    temas: [
      {
        id: TEMA_PADRAO,
        h1: ["Lasanha congelada artesanal,", "pronta para o forno"],
        keywords: ["lasanha artesanal", "lasanha congelada", "lasanha congelada artesanal", "lasanha pronta", "lasanha pronta congelada", "lasanhas congeladas"],
      },
      { id: "lasanha-berinjela", h1: ["Lasanha de berinjela", "artesanal"], keywords: ["lasanha de berinjela"], produto: "lasagne-melanzane" },
      { id: "lasanha-quatro-queijos", h1: ["Lasanha quatro queijos", "artesanal"], keywords: ["lasanha 4 queijos", "lasanha quatro queijos"], produto: "lasagne-quattro-formaggi" },
      { id: "lasanha-bolonhesa", h1: ["Lasanha à bolonhesa", "artesanal"], keywords: ["lasanha bolonhesa", "lasanha bolonhesa congelada", "lasanha à bolonhesa"], produto: "lasagne-bolognese" },
      { id: "festa", h1: ["Lasanha para festa,", "montada no seu refratário"], keywords: ["lasanha para festa"] },
      { id: "encomenda", h1: ["Encomende sua lasanha", "artesanal"], keywords: ["encomenda de lasanha", "lasanha encomenda"] },
      { id: "comprar", h1: ["Compre lasanha artesanal", "pronta para o forno"], keywords: ["comprar lasanha"] },
      { id: "perto-de-mim", h1: ["Lasanha artesanal perto de você,", "no Setor Sul"], keywords: ["lasanha perto de mim"] },
      { id: "goiania", h1: ["Lasanha artesanal", "em Goiânia"], keywords: ["lasanha goiânia"] },
    ],
  },
  "massas-de-forno": {
    rota: "/canelone-rondelli-sfogliatti",
    rastreio: "lp-forno",
    rotulo: "Massas de forno",
    temas: [
      { id: TEMA_PADRAO, h1: ["Massas de forno", "artesanais"], keywords: [] },
      { id: "canelone-ricota-espinafre", h1: ["Canelone de ricota", "com espinafre"], keywords: ["canelone de ricota com espinafre"], produto: "cannelloni-ricotta-spinaci" },
      { id: "canelone-ricota", h1: ["Canelone de ricota", "artesanal"], keywords: ["canelone de ricota"], produto: "cannelloni-ricotta-spinaci" },
      { id: "canelone-calabresa", h1: ["Canelone de calabresa", "artesanal"], keywords: ["canelone de calabresa"], produto: "cannelloni-salsiccia" },
      { id: "canelone-frango", h1: ["Canelone de frango", "artesanal"], keywords: ["canelone de frango"], produto: "cannelloni-pollo" },
      { id: "canelone-carne", h1: ["Canelone de carne", "artesanal"], keywords: ["canelone de carne"], produto: "cannelloni-carne" },
      { id: "canelone", h1: ["Canelone artesanal", "congelado"], keywords: ["canelone", "canelone congelado", "canelones", "caneloni"], produto: "cannelloni-carne" },
      { id: "rondelli-presunto", h1: ["Rondelli de presunto", "e queijo"], keywords: ["rondelli de presunto e queijo", "rondelli presunto e queijo"], produto: "rondelli-prosciutto" },
      { id: "rondelli-queijo", h1: ["Rondelli de queijo", "artesanal"], keywords: ["rondelli de queijo"], produto: "rondelli-mozzarella" },
      { id: "rondelli-mucarela", h1: ["Rondelli de muçarela", "artesanal"], keywords: ["rondelli de muçarela"], produto: "rondelli-mozzarella" },
      { id: "rondelli", h1: ["Rondelli artesanal,", "pronto para assar"], keywords: ["rondelli", "rondelli congelado"], produto: "rondelli-prosciutto" },
      { id: "sfogliatti", h1: ["Sfogliatti,", "o mais vendido da casa"], keywords: ["sfogliatti"], produto: "sfogliatti-bianco" },
      { id: "agnolotti", h1: ["Agnolotti", "artesanal"], keywords: ["agnolotti"], produto: "agnolotti" },
    ],
  },
  nhoque: {
    rota: "/nhoque-artesanal",
    rastreio: "lp-nhoque",
    rotulo: "Nhoque",
    temas: [
      { id: TEMA_PADRAO, h1: ["Nhoque artesanal", "congelado"], keywords: ["gnocchi", "inhoque", "nhoque", "nhoque artesanal", "nhoque congelado"] },
      { id: "nhoque-recheado", h1: ["Nhoque recheado", "de búfala"], keywords: ["gnocchi recheado", "nhoque recheado", "nhoque recheado congelado"], produto: "gnocchi-ripieni" },
      { id: "nhoque-batata", h1: ["Nhoque de batata artesanal,", "macio"], keywords: ["nhoque de batata", "nhoque de batatas"], produto: "gnocchi-patate" },
      { id: "perto-de-mim", h1: ["Nhoque artesanal", "perto de você"], keywords: ["nhoque perto de mim"] },
      { id: "goiania", h1: ["Nhoque artesanal", "em Goiânia"], keywords: ["nhoque goiânia"] },
      { id: "pronto", h1: ["Nhoque pronto,", "do congelador para a panela"], keywords: ["nhoque pronto"] },
    ],
  },
  "ravioli-capeletti": {
    rota: "/ravioli-e-capeletti",
    rastreio: "lp-ravioli",
    rotulo: "Ravióli e capeletti",
    temas: [
      { id: TEMA_PADRAO, h1: ["Ravióli, capeletti e massas frescas", "artesanais"], keywords: [] },
      { id: "ravioli-bufala", h1: ["Ravióli de búfala", "artesanal"], keywords: ["ravioli de búfala"], produto: "ravioli-verde" },
      { id: "ravioli-tres-queijos", h1: ["Ravióli três queijos", "artesanal"], keywords: ["ravioli três queijos"], produto: "ravioli-tre-formaggi" },
      { id: "ravioli-queijo", h1: ["Ravióli de queijo", "artesanal"], keywords: ["ravioli de queijo"], produto: "ravioli-tre-formaggi" },
      { id: "ravioli-carne", h1: ["Ravióli de carne", "artesanal"], keywords: ["ravioli de carne"], produto: "ravioli-carne" },
      { id: "ravioli", h1: ["Ravióli artesanal", "congelado"], keywords: ["ravioli", "ravioli congelado", "ravióli"], produto: "ravioli-verde" },
      { id: "capeletti-frango", h1: ["Capeletti de frango", "artesanal"], keywords: ["capeletti de frango"], produto: "cappelletti-pollo" },
      { id: "capeletti-carne", h1: ["Capeletti de carne", "artesanal"], keywords: ["capeletti de carne"], produto: "cappelletti-carne" },
      { id: "capeletti", h1: ["Capeletti caseiro", "congelado"], keywords: ["capeletti", "capeletti congelado", "cappelletti"], produto: "cappelletti-pollo" },
      { id: "tortelli", h1: ["Tortelli de abóbora", "artesanal"], keywords: ["tortelli", "tortelli de abóbora"], produto: "tortelli-zucca" },
      { id: "pappardelle", h1: ["Pappardelle fresco", "de ovos"], keywords: ["pappardelle fresco"], produto: "pappardelle-bianco" },
      { id: "fettuccine", h1: ["Fettuccine fresco", "de ovos"], keywords: ["fettuccine fresca", "fettuccine fresco"], produto: "fettuccine-bianco" },
      { id: "massa-ovos", h1: ["Massa fresca de ovos,", "feita à mão"], keywords: ["massa fresca de ovos"], produto: "fettuccine-bianco" },
    ],
  },
};
