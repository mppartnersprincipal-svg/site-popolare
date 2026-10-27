// Escolhe o H1 da LP pelo utm_term do anúncio (o sufixo do Google Ads manda utm_term={keyword}).
// Função pura: roda no proxy.ts (rewrite para a variante estática) e nos testes.
import { LP_TEMAS, TEMA_PADRAO, type LpGrupoId, type LpTema } from "@/data/lpTemas";

/** Termos maiores que isso não são keyword: corta antes de normalizar */
const MAX_TERMO = 120;

function decodificar(raw: string): string {
  const comEspacos = raw.replace(/\+/g, " ");
  try {
    return decodeURIComponent(comEspacos);
  } catch {
    // "%" solto (ex.: "massa 100%") — segue com o texto como veio
    return comEspacos;
  }
}

/** minúsculas, sem acento, +/%20 → espaço, só letras/números, espaços colapsados */
export function normalizarTermo(raw: string | null | undefined): string {
  if (!raw) return "";
  return decodificar(raw.slice(0, MAX_TERMO * 3))
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .slice(0, MAX_TERMO)
    .trim();
}

export function temaPadrao(grupo: LpGrupoId): LpTema {
  const tema = LP_TEMAS[grupo].temas.find((t) => t.id === TEMA_PADRAO);
  if (!tema) throw new Error(`Grupo ${grupo} sem tema padrão`);
  return tema;
}

export function temaPorId(grupo: LpGrupoId, id: string): LpTema | undefined {
  return LP_TEMAS[grupo].temas.find((t) => t.id === id);
}

/**
 * utm_term → tema do grupo. 1º casamento exato com uma keyword; senão, a keyword mais longa
 * contida no termo como palavras inteiras (cobre keywords novas no Ads ainda fora do config);
 * senão, o tema padrão. Só olha as keywords do próprio grupo.
 */
export function resolverTema(grupo: LpGrupoId, utmTerm: string | null | undefined): LpTema {
  const termo = normalizarTermo(utmTerm);
  if (!termo) return temaPadrao(grupo);

  const candidatos = LP_TEMAS[grupo].temas.flatMap((tema) => tema.keywords.map((kw) => ({ tema, kw: normalizarTermo(kw) })));

  const exato = candidatos.find((c) => c.kw === termo);
  if (exato) return exato.tema;

  const comEspacos = ` ${termo} `;
  const contido = candidatos
    .filter((c) => c.kw && comEspacos.includes(` ${c.kw} `))
    .reduce<(typeof candidatos)[number] | undefined>((melhor, c) => (!melhor || c.kw.length > melhor.kw.length ? c : melhor), undefined);
  return contido?.tema ?? temaPadrao(grupo);
}

/** H1 como texto corrido (title, testes, painel) */
export function h1Texto(tema: Pick<LpTema, "h1">): string {
  return `${tema.h1[0]} ${tema.h1[1]}`;
}
