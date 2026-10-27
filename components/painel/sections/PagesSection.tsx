import { getBlog, getTopPages, type Range } from "@/lib/painel/queries";
import { fmtDuration, fmtInt, fmtPct, labelPage, LP_PATHS, type PageRow } from "@/lib/painel/types";
import { ChartCard } from "../ChartCard";
import { DataTable, InlineBar } from "../DataTable";
import { EmptyState } from "../EmptyState";
import { HorizontalBars } from "../charts/HorizontalBars";

function PagesTable({ rows }: { rows: PageRow[] }) {
  const max = Math.max(0, ...rows.map((p) => p.views));
  return (
    <DataTable
      rows={rows}
      rowKey={(p) => p.path}
      dense
      columns={[
        {
          key: "page",
          header: "Página",
          render: (p) => (
            <div className="min-w-40">
              <p className="truncate font-semibold text-tinta" title={p.path}>
                {labelPage(p.path, p.title)}
              </p>
              <p className="truncate text-xs text-tinta-suave">{p.path}</p>
            </div>
          ),
        },
        {
          key: "views",
          header: "Views",
          align: "right",
          render: (p) => (
            <div className="min-w-24">
              <span className="font-semibold text-tinta">{fmtInt(p.views)}</span>
              <InlineBar value={p.views} max={max} />
            </div>
          ),
        },
        { key: "time", header: "Tempo médio", align: "right", render: (p) => fmtDuration(p.avg_ms) },
        { key: "scroll", header: "Rolagem média", align: "right", render: (p) => fmtPct(p.avg_scroll, 0) },
      ]}
    />
  );
}

/** Páginas mais vistas + tempo e rolagem por página (painel do site). */
export async function PagesSection({ range }: { range: Range }) {
  const rows = await getTopPages(range, 12);
  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="min-w-0 lg:col-span-2">
        <ChartCard id="paginas" title="Páginas mais vistas" description="Top 10 por visualizações" className="h-full">
          <HorizontalBars valueLabel="Visualizações" data={rows.map((p) => ({ name: labelPage(p.path, p.title), value: p.views }))} />
        </ChartCard>
      </div>
      <div className="min-w-0 lg:col-span-3">
        <ChartCard id="paginas-tempo" title="Tempo e leitura por página" description="Quanto tempo o visitante fica e até onde rola" className="h-full">
          {rows.length ? <PagesTable rows={rows} /> : <EmptyState compact hint="" />}
        </ChartCard>
      </div>
    </div>
  );
}

/** Leitura da LP: tempo e rolagem (mostra se o visitante chega até o cardápio e o CTA final). */
export async function LpReadingSection({ range }: { range: Range }) {
  const rows = (await getTopPages(range, 20)).filter((p) => LP_PATHS.includes(p.path));
  return (
    <ChartCard id="leitura-lp" title="Leitura das LPs" description="Tempo em cada página de anúncio e até onde o visitante rola" className="h-full">
      {rows.length ? <PagesTable rows={rows} /> : <EmptyState compact hint="" />}
    </ChartCard>
  );
}

export async function BlogSection({ range }: { range: Range }) {
  const rows = await getBlog(range, 15);
  return (
    <ChartCard id="blog" title="Blog — posts mais lidos" description="Leituras, tempo médio e rolagem" className="h-full">
      {rows.length ? <PagesTable rows={rows} /> : <EmptyState compact title="Nenhuma leitura de post no período" hint="" />}
    </ChartCard>
  );
}
