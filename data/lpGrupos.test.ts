import { describe, expect, test } from "vitest";
import { LP_KITS } from "./lp";
import { LP_GRUPOS } from "./lpGrupos";
import { LP_GRUPO_IDS, LP_TEMAS, TEMA_PADRAO } from "./lpTemas";
import { findItem } from "./menu";
import { normalizarTermo } from "@/lib/lpTema";

// Copy de anúncio: sem preço, sem itens fora do cardápio e sem os termos de receita já negativados no Ads
const PROIBIDO = /R\$|preço|preco|penne|espaguete|spaghetti|receita de lasanha|como fazer|como preparar|o que precisa|ingrediente/i;

function textos(): string[] {
  return LP_GRUPOS.flatMap((g) => [
    g.seo.title,
    g.seo.description,
    ...g.seo.keywords,
    g.hero.eyebrow,
    g.hero.subtitle,
    ...g.hero.bullets,
    g.destaque?.label ?? "",
    g.destaque?.description ?? "",
    ...g.faq.flatMap((f) => [f.question, f.answer]),
    g.anuncio,
    ...LP_TEMAS[g.id].temas.flatMap((t) => t.h1),
  ]);
}

describe("LPs por grupo de anúncios", () => {
  test("um grupo por id, com rota e prefixo de rastreio únicos", () => {
    expect(LP_GRUPOS.map((g) => g.id)).toEqual([...LP_GRUPO_IDS]);
    expect(new Set(LP_GRUPOS.map((g) => g.rota)).size).toBe(LP_GRUPOS.length);
    expect(new Set(LP_GRUPOS.map((g) => g.rastreio)).size).toBe(LP_GRUPOS.length);
    // a LP original mantém os locais antigos (lp-hero, lp-catalogo…)
    expect(LP_GRUPOS[0]).toMatchObject({ rota: "/massas-em-goiania", rastreio: "lp" });
  });

  test("todo produto citado existe em data/menu.ts", () => {
    for (const g of LP_GRUPOS) {
      for (const id of [g.hero.produto, ...(g.destaque?.produtos ?? [])]) expect(findItem(id), `${g.id}: ${id}`).toBeDefined();
      for (const t of LP_TEMAS[g.id].temas) if (t.produto) expect(findItem(t.produto), `${g.id}/${t.id}: ${t.produto}`).toBeDefined();
    }
  });

  test("o produto do tema está na aba do grupo", () => {
    for (const g of LP_GRUPOS) {
      if (!g.destaque) continue;
      for (const t of LP_TEMAS[g.id].temas) if (t.produto) expect(g.destaque.produtos, `${g.id}/${t.id}`).toContain(t.produto);
    }
  });

  test("o hero usa foto real (nunca imagem ilustrativa)", () => {
    for (const g of LP_GRUPOS) expect(findItem(g.hero.produto)?.imageIllustrative, g.id).toBeFalsy();
  });

  test("kits existem e não se repetem", () => {
    const ids = new Set(LP_KITS.map((k) => k.id));
    for (const g of LP_GRUPOS) {
      expect(new Set(g.kits).size, g.id).toBe(g.kits.length);
      for (const k of g.kits) expect(ids.has(k), `${g.id}: ${k}`).toBe(true);
    }
    for (const kit of LP_KITS) for (const item of kit.items) expect(findItem(item), `${kit.id}: ${item}`).toBeDefined();
  });

  test("cada grupo tem exatamente um tema padrão e nenhuma keyword repetida", () => {
    for (const id of LP_GRUPO_IDS) {
      const temas = LP_TEMAS[id].temas;
      expect(temas.filter((t) => t.id === TEMA_PADRAO), id).toHaveLength(1);
      expect(new Set(temas.map((t) => t.id)).size, id).toBe(temas.length);
      // "ravioli" e "ravióli" no mesmo tema tudo bem; a mesma keyword em dois temas, não
      const donos = new Map<string, string>();
      for (const t of temas) {
        for (const kw of t.keywords.map(normalizarTermo)) {
          expect(donos.get(kw) ?? t.id, `${id}: "${kw}" em dois temas`).toBe(t.id);
          donos.set(kw, t.id);
        }
      }
      // slug do tema vira segmento de rota
      for (const t of temas) expect(t.id).toMatch(/^[a-z0-9-]+$/);
    }
  });

  test("copy sem preço, penne/espaguete ou termos de receita", () => {
    for (const texto of textos()) expect(texto).not.toMatch(PROIBIDO);
  });

  test("títulos dentro do limite do template (≤ 50) e descrições 120–170", () => {
    for (const g of LP_GRUPOS) {
      expect(g.seo.title.length, g.id).toBeLessThanOrEqual(50);
      expect(g.seo.description.length, g.id).toBeGreaterThanOrEqual(120);
      // 170: a descrição da /massas-em-goiania (166) é a que já está no ar
      expect(g.seo.description.length, g.id).toBeLessThanOrEqual(170);
    }
  });
});
