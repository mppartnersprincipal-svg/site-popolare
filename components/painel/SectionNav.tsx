import type { Scope } from "@/lib/painel/queries";

const SECTIONS: Record<Scope, Array<{ id: string; label: string }>> = {
  lp: [
    { id: "kpis", label: "Visão geral" },
    { id: "google-ads", label: "Google Ads" },
    { id: "campanhas", label: "Campanhas (UTM)" },
    { id: "origem", label: "Origem" },
    { id: "botoes", label: "Pedidos" },
    { id: "interesses", label: "Produtos" },
    { id: "jornadas", label: "Jornadas" },
    { id: "horarios", label: "Horários" },
    { id: "geo", label: "Cidades" },
    { id: "ao-vivo", label: "Ao vivo" },
  ],
  site: [
    { id: "kpis", label: "Visão geral" },
    { id: "origem", label: "Origem" },
    { id: "botoes", label: "Pedidos" },
    { id: "interesses", label: "Interesses" },
    { id: "jornadas", label: "Jornadas" },
    { id: "paginas", label: "Páginas" },
    { id: "horarios", label: "Horários" },
    { id: "geo", label: "Cidades" },
    { id: "blog", label: "Blog" },
    { id: "ao-vivo", label: "Ao vivo" },
  ],
};

/** Âncoras das seções (fixa abaixo do cabeçalho). */
export function SectionNav({ scope }: { scope: Scope }) {
  return (
    <nav
      aria-label="Seções do painel"
      className="sticky top-16 z-30 -mx-4 overflow-x-auto border-b border-tinta/10 bg-creme/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
    >
      <ul className="flex gap-1 py-2 text-sm">
        {SECTIONS[scope].map((s) => (
          <li key={s.id} className="shrink-0">
            <a
              href={`#${s.id}`}
              className="inline-flex min-h-8 items-center rounded-full px-3 font-semibold text-tinta-suave transition-colors hover:bg-white hover:text-tinta"
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
