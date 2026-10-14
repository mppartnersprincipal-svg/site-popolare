import posts from "@/data/blog.generated.json";

export interface BlogBlock {
  tipo: "h2" | "p" | "li";
  texto: string;
}

export interface BlogPost {
  slug: string;
  /** yyyy-mm-dd */
  data: string;
  titulo: string;
  resumo: string;
  blocos: BlogBlock[];
}

// Imagem de capa por post (fotos próprias da Popolare)
const COVERS: Record<string, string> = {
  "a-arte-da-producao-artesanal-de-massas-um-olhar-nos-bastidores-da-popolare": "produtos/sfogliatti-verde-cru",
  "segredos-da-cozinha-italiana-ingredientes-essenciais-e-onde-encontra-los": "produtos/pesto",
  "dicas-e-truques-para-uma-noite-italiana-perfeita-em-casa": "produtos/lasagne-bolognese-cucina",
  "a-historia-por-tras-dos-pratos-conheca-a-origem-das-massas-italianas": "produtos/ravioli-tre-formaggi",
};

const ALL = posts as BlogPost[];

export function allPosts(): BlogPost[] {
  return [...ALL].sort((a, b) => b.data.localeCompare(a.data));
}

export function findPost(slug: string): BlogPost | undefined {
  return ALL.find((p) => p.slug === slug);
}

export function coverFor(slug: string): string {
  return COVERS[slug] ?? "produtos/fettuccine-pesto";
}

export function formatDateLong(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(Date.UTC(y, m - 1, d));
}
