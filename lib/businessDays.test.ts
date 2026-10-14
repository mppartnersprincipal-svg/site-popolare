import { describe, expect, test } from "vitest";
import { addBusinessDays, minOrderDate, isValidOrderDate, toIsoDate } from "./businessDays";

describe("businessDays", () => {
  test("adiciona dias úteis pulando o fim de semana", () => {
    // sexta 2026-10-16 + 2 dias úteis = terça 2026-10-20
    expect(toIsoDate(addBusinessDays(new Date(2026, 9, 16), 2))).toBe("2026-10-20");
  });

  test("a partir de segunda, 2 dias úteis caem na quarta", () => {
    expect(toIsoDate(addBusinessDays(new Date(2026, 9, 12), 2))).toBe("2026-10-14");
  });

  test("pedido feito no sábado conta a partir de segunda", () => {
    expect(minOrderDate(new Date(2026, 9, 17), 2)).toBe("2026-10-20");
  });

  test("rejeita data anterior ao mínimo de dias úteis", () => {
    const hoje = new Date(2026, 9, 13); // terça
    expect(isValidOrderDate("2026-10-14", hoje, 2)).toBe(false);
    expect(isValidOrderDate("2026-10-15", hoje, 2)).toBe(true);
  });

  test("rejeita domingo (loja fechada) e datas inválidas", () => {
    const hoje = new Date(2026, 9, 13);
    expect(isValidOrderDate("2026-10-18", hoje, 2)).toBe(false);
    expect(isValidOrderDate("2026-13-40", hoje, 2)).toBe(false);
    expect(isValidOrderDate("", hoje, 2)).toBe(false);
  });
});
