import { describe, expect, test } from "vitest";
import { NextRequest } from "next/server";
import { LP_GRUPO_IDS, LP_TEMAS } from "@/data/lpTemas";
import { config, proxy } from "@/proxy";

const BASE = "https://loja.popolare.com.br";

function run(path: string, cookie?: string) {
  const headers = cookie ? { cookie } : undefined;
  return proxy(new NextRequest(new URL(path, BASE), { headers }));
}

/** Destino interno do rewrite (o Next manda no header x-middleware-rewrite) */
function rewriteTarget(res: Response): string | null {
  const target = res.headers.get("x-middleware-rewrite");
  return target ? new URL(target).pathname : null;
}

describe("proxy — LPs por grupo", () => {
  test("utm_term de um tema → variante estática, preservando a query", () => {
    const res = run("/lasanha-congelada?utm_source=google&utm_term=comprar+lasanha&gclid=abc");
    const target = res.headers.get("x-middleware-rewrite")!;
    expect(new URL(target).pathname).toBe("/lp-variante/lasanhas/comprar");
    expect(new URL(target).searchParams.get("gclid")).toBe("abc");
  });

  test("termo da marca na /massas-em-goiania → tema da marca", () => {
    expect(rewriteTarget(run("/massas-em-goiania?utm_term=popolare%20massas"))).toBe("/lp-variante/massas-em-goiania/marca");
  });

  test("sem utm_term, tema padrão ou termo que não casa → página padrão (sem rewrite)", () => {
    expect(rewriteTarget(run("/nhoque-artesanal"))).toBeNull();
    expect(rewriteTarget(run("/nhoque-artesanal?utm_term=nhoque"))).toBeNull();
    expect(rewriteTarget(run("/nhoque-artesanal?utm_term=lasanha"))).toBeNull();
  });

  test("acesso direto à variante vira 404", () => {
    expect(rewriteTarget(run("/lp-variante/lasanhas/comprar"))).toBe("/404");
    expect(rewriteTarget(run("/lp-variante"))).toBe("/404");
  });

  test("o matcher cobre todas as rotas de LP configuradas", () => {
    for (const id of LP_GRUPO_IDS) expect(config.matcher).toContain(LP_TEMAS[id].rota);
  });
});

describe("proxy — painel", () => {
  test("sem cookie vai para o login; com cookie segue", () => {
    expect(run("/painel/lp").headers.get("location")).toBe(`${BASE}/painel/entrar`);
    expect(run("/painel/lp", "popolare_painel=x").headers.get("location")).toBeNull();
  });
});
