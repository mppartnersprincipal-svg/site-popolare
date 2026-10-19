import { describe, expect, test } from "vitest";
import { UNITS } from "@/data/business";
import { findItem, MENU } from "@/data/menu";
import { orderMessage, productMessage, unitById, whatsappUrl } from "./whatsapp";

describe("whatsapp", () => {
  test("monta a URL wa.me com a mensagem codificada", () => {
    const url = whatsappUrl(UNITS[0], "Olá & tchau");
    expect(url).toBe("https://wa.me/556239456633?text=Ol%C3%A1%20%26%20tchau");
  });

  test("mensagem de produto traz nome em italiano, português e peso, sem preço", () => {
    const item = findItem("cannelloni-carne");
    expect(item).toBeDefined();
    const msg = productMessage(item!);
    expect(msg).toContain("Cannelloni di Carne (Canelone de carne)");
    expect(msg).toContain("500 g");
    expect(msg).not.toMatch(/R\$/);
  });

  test("não repete o nome quando IT e PT são iguais", () => {
    const msg = productMessage(findItem("tiramisu")!);
    expect(msg).toContain("pedir: Tiramisù (500 g)");
  });

  test("unidade desconhecida cai na unidade principal", () => {
    expect(unitById("inexistente").id).toBe("setor-sul");
    expect(unitById("eldorado").id).toBe("setor-sul");
  });

  test("Eldorado não aparece mais como unidade", () => {
    expect(UNITS.map((u) => u.id)).toEqual(["setor-sul"]);
  });

  test("mensagem de encomenda formata data e refratário", () => {
    const msg = orderMessage({
      nome: "Ana",
      telefone: "(62) 99999-0000",
      unidade: "setor-sul",
      data: "2026-10-20",
      itens: "2 lasanhas bolonhesa",
      refratario: true,
      observacoes: "  sem cebola  ",
    });
    expect(msg).toContain("20/10/2026");
    expect(msg).toContain("Popolare Setor Sul");
    expect(msg).toContain("refratário: Sim");
    expect(msg).toContain("Observações: sem cebola");
  });
});

describe("cardápio", () => {
  test("ids são únicos e nenhum item expõe preço", () => {
    const ids = MENU.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(MENU.every((i) => !("price" in i))).toBe(true);
  });
});
