import { describe, expect, test } from "vitest";
import { LP_GRUPO_IDS, LP_TEMAS, TEMA_PADRAO } from "@/data/lpTemas";
import { h1Texto, normalizarTermo, resolverTema } from "./lpTema";

describe("normalizarTermo", () => {
  test("minúsculas, sem acento e + vira espaço (utm_term cru do {keyword})", () => {
    expect(normalizarTermo("Comprar+Lasanha")).toBe("comprar lasanha");
    expect(normalizarTermo("lasanha+à+bolonhesa")).toBe("lasanha a bolonhesa");
  });

  test("decodifica %20 e acentos codificados", () => {
    expect(normalizarTermo("nhoque%20goi%C3%A2nia")).toBe("nhoque goiania");
  });

  test("tira aspas/colchetes de tipo de correspondência e colapsa espaços", () => {
    expect(normalizarTermo('  "Ravióli   de  Búfala" ')).toBe("ravioli de bufala");
    expect(normalizarTermo("[canelone]")).toBe("canelone");
  });

  test("mantém números (lasanha 4 queijos)", () => {
    expect(normalizarTermo("lasanha 4 queijos")).toBe("lasanha 4 queijos");
  });

  test("% solto não quebra a decodificação", () => {
    expect(normalizarTermo("massa 100%")).toBe("massa 100");
  });

  test("vazio, nulo e {keyword} não substituído", () => {
    expect(normalizarTermo(null)).toBe("");
    expect(normalizarTermo(undefined)).toBe("");
    expect(normalizarTermo("   ")).toBe("");
    expect(normalizarTermo("{keyword}")).toBe("keyword");
  });

  test("corta termos absurdamente longos", () => {
    expect(normalizarTermo("a".repeat(1000)).length).toBeLessThanOrEqual(120);
  });
});

describe("resolverTema", () => {
  test("keyword exata do tema → H1 do tema", () => {
    expect(h1Texto(resolverTema("lasanhas", "comprar+lasanha"))).toBe("Compre lasanha artesanal pronta para o forno");
    expect(h1Texto(resolverTema("lasanhas", "lasanha+4+queijos"))).toBe("Lasanha quatro queijos artesanal");
    expect(h1Texto(resolverTema("massas-de-forno", "canelone de frango"))).toBe("Canelone de frango artesanal");
    expect(h1Texto(resolverTema("nhoque", "inhoque"))).toBe("Nhoque artesanal congelado");
  });

  test("acento e caixa não importam", () => {
    expect(h1Texto(resolverTema("ravioli-capeletti", "Ravióli+de+Búfala"))).toBe("Ravióli de búfala artesanal");
    expect(h1Texto(resolverTema("massas-em-goiania", "empório italiano goiânia"))).toBe("Empório italiano em Goiânia, desde 1994");
  });

  test("sem utm_term ou sem casamento → tema padrão do grupo", () => {
    expect(resolverTema("lasanhas", null).id).toBe(TEMA_PADRAO);
    expect(resolverTema("lasanhas", "").id).toBe(TEMA_PADRAO);
    expect(resolverTema("lasanhas", "{keyword}").id).toBe(TEMA_PADRAO);
    expect(resolverTema("lasanhas", "lasanha de carne moida").id).toBe(TEMA_PADRAO);
    expect(h1Texto(resolverTema("lasanhas", "xyz"))).toBe("Lasanha congelada artesanal, pronta para o forno");
  });

  test("termo que contém uma keyword (palavras inteiras) → a keyword mais longa vence", () => {
    expect(resolverTema("massas-de-forno", "canelone de ricota com espinafre congelado").id).toBe("canelone-ricota-espinafre");
    expect(resolverTema("nhoque", "nhoque de batata congelado goiania").id).toBe("nhoque-batata");
    expect(resolverTema("lasanhas", "lasanha bolonhesa congelada perto").id).toBe("lasanha-bolonhesa");
  });

  test("não casa pedaço de palavra", () => {
    // "rondelli" não pode casar dentro de "rondellis"
    expect(resolverTema("massas-de-forno", "rondellis").id).toBe(TEMA_PADRAO);
  });

  test("só procura nas keywords do próprio grupo", () => {
    expect(resolverTema("nhoque", "comprar lasanha").id).toBe(TEMA_PADRAO);
    expect(resolverTema("lasanhas", "nhoque").id).toBe(TEMA_PADRAO);
  });

  test("buscas pela marca caem no tema da marca da /massas-em-goiania", () => {
    expect(h1Texto(resolverTema("massas-em-goiania", "popolare+massas"))).toBe("Popolare Massas e Empório, desde 1994");
    expect(resolverTema("massas-em-goiania", "pastificio popolare").id).toBe("marca");
  });

  test("todo tema de todo grupo é alcançável pelas próprias keywords", () => {
    for (const grupo of LP_GRUPO_IDS) {
      for (const tema of LP_TEMAS[grupo].temas) {
        for (const kw of tema.keywords) expect(resolverTema(grupo, kw).id, `${grupo}: ${kw}`).toBe(tema.id);
      }
    }
  });
});
