import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { grupoPorId, LP_GRUPOS } from "@/data/lpGrupos";
import { LP_TEMAS, TEMA_PADRAO } from "@/data/lpTemas";
import { temaPorId } from "@/lib/lpTema";
import { LpPage, lpMetadata } from "@/components/lp/LpPage";

/**
 * Variantes das LPs por tema de keyword (H1 do que a pessoa pesquisou), todas pré-renderizadas no build.
 * Só é alcançada por rewrite do proxy.ts (/lasanha-congelada?utm_term=… → /lp-variante/lasanhas/<tema>);
 * o acesso direto dá 404 e a canonical aponta para a rota pública.
 */
export function generateStaticParams() {
  return LP_GRUPOS.flatMap((g) => LP_TEMAS[g.id].temas.filter((t) => t.id !== TEMA_PADRAO).map((t) => ({ grupo: g.id, tema: t.id })));
}

async function resolve(params: PageProps<"/lp-variante/[grupo]/[tema]">["params"]) {
  const { grupo: grupoId, tema: temaId } = await params;
  const grupo = grupoPorId(grupoId);
  const tema = grupo ? temaPorId(grupo.id, temaId) : undefined;
  return grupo && tema ? { grupo, tema } : undefined;
}

export async function generateMetadata({ params }: PageProps<"/lp-variante/[grupo]/[tema]">): Promise<Metadata> {
  const found = await resolve(params);
  return found ? lpMetadata(found.grupo) : {};
}

export default async function LpVariantePage({ params }: PageProps<"/lp-variante/[grupo]/[tema]">) {
  const found = await resolve(params);
  if (!found) notFound();
  return <LpPage grupo={found.grupo} tema={found.tema} />;
}
