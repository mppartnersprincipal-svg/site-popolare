import type { Metadata } from "next";

// Área privada: nunca indexar (o next.config também manda X-Robots-Tag: noindex em /painel)
export const metadata: Metadata = {
  title: { default: "Painel", template: "%s | Painel Popolare" },
  robots: { index: false, follow: false },
};

export default function PainelLayout({ children }: LayoutProps<"/painel">) {
  return <div className="flex min-h-dvh flex-col bg-creme">{children}</div>;
}
