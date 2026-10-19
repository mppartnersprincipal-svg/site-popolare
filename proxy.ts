import { NextResponse, type NextRequest } from "next/server";

// Convenção do Next 16 (substitui o middleware.ts). Atalho para o /painel: sem o cookie
// de sessão, vai direto para o login. A validação de verdade (assinatura + usuário no
// banco) continua em lib/painel/auth.ts, dentro de cada página e server action.
const SESSION_COOKIE = "popolare_painel";

export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();
  return NextResponse.redirect(new URL("/painel/entrar", request.url));
}

export const config = {
  matcher: ["/painel/lp/:path*", "/painel/site/:path*"],
};
