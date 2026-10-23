import { beforeEach, describe, expect, test } from "vitest";
import { addManyToLines, addToLines, cartStore, countItems, MAX_LINES, MAX_QTY, resolveLines, sanitizeLines, setLineQty } from "./cartStore";

describe("carrinho — funções puras", () => {
  test("adiciona um produto conhecido e soma a quantidade sem mutar a lista original", () => {
    const a = addToLines([], "tiramisu");
    const b = addToLines(a, "tiramisu", 2);
    expect(b).toEqual([{ id: "tiramisu", qty: 3 }]);
    expect(a).toEqual([{ id: "tiramisu", qty: 1 }]);
  });

  test("ignora id que não existe no cardápio", () => {
    expect(addToLines([], "pizza-inexistente")).toEqual([]);
  });

  test("quantidade zero remove a linha e o máximo é respeitado", () => {
    const lines = [
      { id: "pesto", qty: 2 },
      { id: "tiramisu", qty: 1 },
    ];
    expect(setLineQty(lines, "pesto", 0)).toEqual([{ id: "tiramisu", qty: 1 }]);
    expect(setLineQty(lines, "pesto", 999)[0].qty).toBe(MAX_QTY);
  });

  test("kit adiciona vários itens de uma vez (um de cada)", () => {
    const lines = addManyToLines([{ id: "pesto", qty: 1 }], ["pesto", "tiramisu", "lasagne-bolognese"]);
    expect(lines).toEqual([
      { id: "pesto", qty: 2 },
      { id: "tiramisu", qty: 1 },
      { id: "lasagne-bolognese", qty: 1 },
    ]);
    expect(countItems(lines)).toBe(4);
  });

  test("resolve as linhas para itens do cardápio, pulando ids órfãos", () => {
    const entries = resolveLines([
      { id: "tiramisu", qty: 1 },
      { id: "sumiu", qty: 3 },
    ]);
    expect(entries).toHaveLength(1);
    expect(entries[0].item.nameIt).toBe("Tiramisù");
  });

  test("sanitiza dados do localStorage: duplicatas, lixo e limite de linhas", () => {
    const raw = [
      { id: "tiramisu", qty: "2" },
      { id: "tiramisu", qty: 1 },
      { id: 42, qty: 1 },
      { id: "pesto", qty: -1 },
      { id: "pesto", qty: 1.9 },
      "string solta",
      null,
    ];
    expect(sanitizeLines(raw)).toEqual([
      { id: "tiramisu", qty: 2 },
      { id: "pesto", qty: 1 },
    ]);
    expect(sanitizeLines("nope")).toEqual([]);
    const many = Array.from({ length: 60 }, (_, i) => ({ id: `x${i}`, qty: 1 }));
    expect(sanitizeLines(many).length).toBeLessThanOrEqual(MAX_LINES);
  });
});

describe("carrinho — store", () => {
  beforeEach(() => cartStore._reset());

  test("add/setQty/remove/clear notificam e mantêm o estado", () => {
    let calls = 0;
    const unsubscribe = cartStore.subscribe(() => calls++);
    cartStore.add("tiramisu");
    cartStore.add("pesto", 2);
    cartStore.setQty("pesto", 1);
    expect(cartStore.get().lines).toEqual([
      { id: "tiramisu", qty: 1 },
      { id: "pesto", qty: 1 },
    ]);
    cartStore.remove("tiramisu");
    expect(cartStore.get().lines).toEqual([{ id: "pesto", qty: 1 }]);
    cartStore.clear();
    expect(cartStore.get().lines).toEqual([]);
    expect(calls).toBe(5);
    unsubscribe();
  });

  test("abre e fecha o painel sem mexer nas linhas", () => {
    cartStore.add("tiramisu");
    const before = cartStore.get().lines;
    cartStore.open();
    expect(cartStore.get().isOpen).toBe(true);
    expect(cartStore.get().lines).toBe(before);
    cartStore.close();
    expect(cartStore.get().isOpen).toBe(false);
  });
});
