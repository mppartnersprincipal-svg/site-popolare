import { getClicks, getRecent, type Range, type Scope } from "@/lib/painel/queries";
import { fmtInt } from "@/lib/painel/types";
import { ChartCard } from "../ChartCard";
import { DataTable, InlineBar } from "../DataTable";
import { EmptyState } from "../EmptyState";
import { LiveFeed } from "../LiveFeed";

/** Ranking de todos os cliques (links, botões, menus) pelo texto do elemento. */
export async function ClicksSection({ range }: { range: Range }) {
  const rows = await getClicks(range, 25);
  const max = Math.max(0, ...rows.map((r) => r.clicks));

  return (
    <ChartCard id="cliques" title="Tudo que foi clicado" description="Qualquer link ou botão, pelo nome — do mais ao menos clicado" className="h-full">
      {!rows.length ? (
        <EmptyState compact hint="" />
      ) : (
        <DataTable
          dense
          minWidth={360}
          rows={rows}
          rowKey={(r, i) => `${r.label}-${i}`}
          columns={[
            {
              key: "label",
              header: "Elemento",
              render: (r) => (
                <div className="min-w-48">
                  <p className="font-semibold text-tinta">{r.label ?? "—"}</p>
                  {r.href ? <p className="truncate text-xs text-tinta-suave">{r.href}</p> : null}
                </div>
              ),
            },
            {
              key: "clicks",
              header: "Cliques",
              align: "right",
              render: (r) => (
                <div className="min-w-20">
                  <span className="font-semibold">{fmtInt(r.clicks)}</span>
                  <InlineBar value={r.clicks} max={max} />
                </div>
              ),
            },
            { key: "sessions", header: "Visitas", align: "right", render: (r) => fmtInt(r.sessions) },
          ]}
        />
      )}
    </ChartCard>
  );
}

/** Últimos eventos do painel, atualizando sozinho. */
export async function LiveSection({ scope }: { scope: Scope }) {
  const initial = await getRecent(scope, 40);
  return (
    <ChartCard id="ao-vivo" title="Ao vivo" description="Últimos eventos — atualiza a cada 30 s" className="h-full">
      <LiveFeed initial={initial} scope={scope} />
    </ChartCard>
  );
}
