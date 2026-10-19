import { Banknote, CircleDollarSign, Eye, MousePointerClick, Percent, Target, Wallet } from "lucide-react";
import type { Range } from "@/lib/painel/queries";
import { getGoogleAdsReport } from "@/lib/painel/google-ads";
import type { GoogleAdsCampaign } from "@/lib/painel/google-ads-types";
import { ChartCard } from "../ChartCard";
import { DataTable, type Column } from "../DataTable";
import { EmptyState } from "../EmptyState";

const integer = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const percentage = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 2 });

const STATUSES: Record<string, { label: string; className: string }> = {
  ENABLED: { label: "Ativa", className: "bg-manjericao/10 text-manjericao" },
  PAUSED: { label: "Pausada", className: "bg-creme text-tinta-suave" },
  REMOVED: { label: "Removida", className: "bg-primaria/10 text-vinho" },
};

function formatDate(value: string) {
  return value.split("-").reverse().join("/");
}

/** Métricas da conta de anúncios (API do Google Ads, só leitura). Portado da Sólida. */
export async function GoogleAdsSection({ range }: { range: Range }) {
  const report = await getGoogleAdsReport(range);

  if (report.status !== "ready") {
    return (
      <ChartCard id="google-ads" title="Google Ads" description="Investimento e resultados das campanhas de anúncios">
        <EmptyState
          compact
          title={report.status === "not_configured" ? "Conexão com o Google Ads pendente" : "Não foi possível carregar o Google Ads"}
          hint={report.message}
        />
      </ChartCard>
    );
  }

  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: report.customer.currencyCode });
  const formatMoney = (value: number | null) => (value === null ? "—" : money.format(value));
  const formatPercent = (value: number | null) => (value === null ? "—" : percentage.format(value));
  const totals = report.totals;
  const cards = [
    { label: "Investimento", value: formatMoney(totals.cost), icon: Wallet, hint: "Valor gasto em anúncios" },
    { label: "Impressões", value: integer.format(totals.impressions), icon: Eye, hint: "Exibições dos anúncios" },
    { label: "Cliques", value: integer.format(totals.clicks), icon: MousePointerClick, hint: "Cliques nos anúncios" },
    { label: "CTR", value: formatPercent(totals.ctr), icon: Percent, hint: "Cliques ÷ impressões" },
    { label: "CPC médio", value: formatMoney(totals.averageCpc), icon: CircleDollarSign, hint: "Custo médio por clique" },
    { label: "Conversões", value: decimal.format(totals.conversions), icon: Target, hint: "Cliques no WhatsApp registrados no Google Ads" },
    { label: "Custo por conversão", value: formatMoney(totals.costPerConversion), icon: Banknote, hint: "Investimento ÷ conversões" },
  ];
  const columns: Column<GoogleAdsCampaign>[] = [
    { key: "name", header: "Campanha", render: (c) => <span className="block min-w-44 font-semibold text-tinta">{c.name}</span> },
    {
      key: "status",
      header: "Status",
      render: (c) => {
        const s = STATUSES[c.status] ?? { label: "Não informado", className: "bg-creme text-tinta-suave" };
        return <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ${s.className}`}>{s.label}</span>;
      },
    },
    { key: "cost", header: "Investimento", align: "right", render: (c) => formatMoney(c.cost) },
    { key: "impressions", header: "Impressões", align: "right", render: (c) => integer.format(c.impressions) },
    { key: "clicks", header: "Cliques", align: "right", render: (c) => integer.format(c.clicks) },
    { key: "ctr", header: "CTR", align: "right", render: (c) => formatPercent(c.ctr) },
    { key: "cpc", header: "CPC médio", align: "right", render: (c) => formatMoney(c.averageCpc) },
    { key: "conversions", header: "Conversões", align: "right", render: (c) => decimal.format(c.conversions) },
    { key: "cpa", header: "Custo / conv.", align: "right", render: (c) => formatMoney(c.costPerConversion) },
  ];

  return (
    <ChartCard id="google-ads" title="Google Ads" description={`Conta ${report.customer.name || "de anúncios"} · ${report.customer.currencyCode}`}>
      <div className="space-y-5">
        <div className="space-y-1 text-sm text-tinta-suave">
          <p>
            {formatDate(report.from)} a {formatDate(report.to)} · Fuso da conta: {report.customer.timeZone}.
          </p>
          <p>O período vale para os anúncios; o filtro de origem vale só para as visitas do site.</p>
        </div>

        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, icon: Icon, hint }) => (
            <div key={label} className="flex min-w-0 flex-col gap-3 rounded-2xl border border-tinta/10 bg-white p-5">
              <dt className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-tinta-suave">{label}</span>
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primaria/10 text-primaria">
                  <Icon aria-hidden className="size-4" />
                </span>
              </dt>
              <dd className="text-3xl font-bold tracking-tight break-words text-tinta tabular-nums">{value}</dd>
              <dd className="text-xs text-tinta-suave">{hint}</dd>
            </div>
          ))}
        </dl>

        <div>
          <h3 className="mb-3 text-sm font-bold text-tinta">Resultados por campanha</h3>
          {report.campaigns.length ? (
            <DataTable rows={report.campaigns} rowKey={(c) => c.id} columns={columns} minWidth={1060} dense />
          ) : (
            <EmptyState compact title="Nenhuma campanha com resultados no período" hint="Amplie o período para ver os resultados dos anúncios." />
          )}
        </div>

        <p className="text-xs text-tinta-suave">
          As conversões seguem a atribuição do Google Ads e podem ser atualizadas depois do clique no anúncio. “—” indica uma taxa
          sem base de cálculo no período.
        </p>
      </div>
    </ChartCard>
  );
}
