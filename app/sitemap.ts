import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/business";
import { allPosts } from "@/lib/blog";

// Data do lançamento do novo site; atualize ao mudar conteúdo relevante
const SITE_UPDATED = "2026-10-13";

const ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/massas-em-goiania", priority: 0.9, changeFrequency: "monthly" },
  { path: "/cardapio", priority: 0.9, changeFrequency: "monthly" },
  { path: "/encomendas", priority: 0.8, changeFrequency: "monthly" },
  { path: "/contato", priority: 0.8, changeFrequency: "monthly" },
  { path: "/sobre-nos", priority: 0.7, changeFrequency: "yearly" },
  { path: "/modo-de-preparo", priority: 0.6, changeFrequency: "yearly" },
  { path: "/midia", priority: 0.5, changeFrequency: "yearly" },
  { path: "/blog", priority: 0.5, changeFrequency: "monthly" },
  { path: "/politica-de-privacidade", priority: 0.2, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...ROUTES.map((r) => ({ url: `${SITE_URL}${r.path === "/" ? "" : r.path}`, lastModified: SITE_UPDATED, changeFrequency: r.changeFrequency, priority: r.priority })),
    ...allPosts().map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: p.data, changeFrequency: "yearly" as const, priority: 0.4 })),
  ];
}
