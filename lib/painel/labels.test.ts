import { describe, expect, test } from "vitest";
import { LP_PATHS, labelCategory, labelLocal, labelPage } from "./types";

describe("rótulos do painel para as LPs por grupo", () => {
  test("locais da LP original continuam iguais", () => {
    expect(labelLocal("lp-hero")).toBe("LP · topo");
    expect(labelLocal("lp-carrinho")).toBe("LP · Meu pedido (envio)");
  });

  test("locais das LPs por produto ganham o nome da página", () => {
    expect(labelLocal("lp-lasanha-hero")).toBe("LP Lasanhas · topo");
    expect(labelLocal("lp-nhoque-carrinho")).toBe("LP Nhoque · Meu pedido (envio)");
    expect(labelLocal("lp-forno-final-produtos")).toBe("LP Massas de forno · montar pedido (final)");
  });

  test("local desconhecido aparece cru; vazio vira travessão", () => {
    expect(labelLocal("lp-lasanha-xyz")).toBe("lp-lasanha-xyz");
    expect(labelLocal(null)).toBe("—");
  });

  test("as 6 rotas de LP têm rótulo", () => {
    expect(LP_PATHS).toHaveLength(6);
    expect(labelPage("/lasanha-congelada")).toBe("LP · Lasanhas");
    expect(labelPage("/massas-em-goiania")).toBe("LP · Massas em Goiânia");
  });
});

describe("rótulo das abas do cardápio da LP", () => {
  test("aba própria das LPs por produto tem nome", () => {
    expect(labelCategory("destaque")).toBe("Destaque da LP");
    expect(labelCategory("al-forno")).toBe("Massas para assar");
  });
});
