import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/business";

// GEO: buscadores e assistentes de IA podem ler e citar o conteúdo
const AI_CRAWLERS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "Applebot-Extended", "Bingbot"];

// /lp-variante: variantes de H1 das LPs, só via rewrite do proxy (canonical na rota pública)
const PRIVATE = ["/painel", "/api/", "/lp-variante"];

export default function robots(): MetadataRoute.Robots {
  return {
    // /painel (área privada) e /api ficam fora dos buscadores
    rules: [{ userAgent: "*", allow: "/", disallow: PRIVATE }, ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/", disallow: PRIVATE }))],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
