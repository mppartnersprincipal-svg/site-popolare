import path from "node:path";
import type { NextConfig } from "next";

// URLs do site antigo (WordPress) → novas rotas, preservando o SEO acumulado
const OLD_POSTS = [
  "a-arte-da-producao-artesanal-de-massas-um-olhar-nos-bastidores-da-popolare",
  "segredos-da-cozinha-italiana-ingredientes-essenciais-e-onde-encontra-los",
  "dicas-e-truques-para-uma-noite-italiana-perfeita-em-casa",
  "a-historia-por-tras-dos-pratos-conheca-a-origem-das-massas-italianas",
];

const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    root: path.resolve(import.meta.dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      { source: "/nossas-massas", destination: "/cardapio", permanent: true },
      { source: "/category/artigos", destination: "/blog", permanent: true },
      { source: "/feed", destination: "/blog", permanent: true },
      { source: "/comments/feed", destination: "/blog", permanent: true },
      { source: "/wp-sitemap.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/sitemap_index.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/:tipo(post|page|category)-sitemap.xml", destination: "/sitemap.xml", permanent: true },
      ...OLD_POSTS.map((slug) => ({ source: `/${slug}`, destination: `/blog/${slug}`, permanent: true })),
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      {
        // Previews e *.vercel.app não devem ser indexados (só o subdomínio oficial;
        // popolare.com.br continua com o WordPress antigo, por decisão da cliente)
        source: "/:path*",
        missing: [{ type: "host", value: "loja\\.popolare\\.com\\.br" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        // nomes sem hash: cache longo com revalidação, para trocas de foto/logo aparecerem
        source: "/:dir(img|frames|brand)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

export default nextConfig;
