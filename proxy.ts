import { NextResponse, type NextRequest } from "next/server";
import { LP_GRUPO_IDS, LP_TEMAS, TEMA_PADRAO, type LpGrupoId } from "@/data/lpTemas";
import { resolverTema } from "@/lib/lpTema";

// Convenção do Next 16 (substitui o middleware.ts). Duas funções:
// 1) /painel: sem o cookie de sessão, vai direto para o login. A validação de verdade
//    (assinatura + usuário no banco) continua em lib/painel/auth.ts.
// 2) LPs do Google Ads: o utm_term (= keyword do anúncio) escolhe o H1. Rewrite para a variante
//    pré-renderizada em /lp-variante/<grupo>/<tema> — a URL do navegador não muda e o H1 certo
//    já vem no HTML estático (sem troca de texto, sem CLS). Sem tema ou sem casar: página padrão.
const SESSION_COOKIE = "popolare_painel";
const VARIANTE_PREFIX = "/lp-variante";

const GRUPO_POR_ROTA = new Map<string, LpGrupoId>(LP_GRUPO_IDS.map((id) => [LP_TEMAS[id].rota, id]));

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname.startsWith("/painel")) {
    if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();
    return NextResponse.redirect(new URL("/painel/entrar", request.url));
  }

  // A variante só existe atrás do rewrite: acesso direto vira 404
  if (pathname === VARIANTE_PREFIX || pathname.startsWith(`${VARIANTE_PREFIX}/`)) {
    return NextResponse.rewrite(new URL("/404", request.url));
  }

  const grupo = GRUPO_POR_ROTA.get(pathname);
  if (!grupo) return NextResponse.next();

  const tema = resolverTema(grupo, searchParams.get("utm_term"));
  if (tema.id === TEMA_PADRAO) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `${VARIANTE_PREFIX}/${grupo}/${tema.id}`;
  return NextResponse.rewrite(url);
}

// O matcher precisa ser literal (análise estática do Next): ao criar uma LP nova em data/lpTemas.ts,
// incluir a rota aqui — lib/proxy.test.ts confere.
export const config = {
  matcher: [
    "/painel/lp/:path*",
    "/painel/site/:path*",
    "/lp-variante/:path*",
    "/massas-em-goiania",
    "/massas-artesanais",
    "/lasanha-congelada",
    "/canelone-rondelli-sfogliatti",
    "/nhoque-artesanal",
    "/ravioli-e-capeletti",
  ],
};
