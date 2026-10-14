import type { Metadata } from "next";
import { BRAND } from "@/data/business";

interface PageSeo {
  /** Título curto (o template adiciona " | Popolare"); ideal ≤ 50 caracteres */
  title: string;
  /** 120–160 caracteres */
  description: string;
  path: string;
  /** Use para títulos que não devem receber o template (ex.: posts longos) */
  absoluteTitle?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
}

/** Metadata completa por página: canonical + Open Graph + Twitter próprios (sem herdar os da home). */
export function pageMetadata({ title, description, path, absoluteTitle, type = "website", publishedTime }: PageSeo): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${BRAND.shortName}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      locale: "pt_BR",
      siteName: BRAND.name,
      url: path,
      title: fullTitle,
      description,
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: { card: "summary_large_image", title: fullTitle, description },
  };
}
