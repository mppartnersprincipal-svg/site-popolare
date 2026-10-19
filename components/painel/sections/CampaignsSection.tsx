import { getCampaigns, type Range } from "@/lib/painel/queries";
import { fmtInt, fmtPct } from "@/lib/painel/types";
import { ChartCard } from "../ChartCard";
import { DataTable, InlineBar } from "../DataTable";
import { EmptyState } from "../EmptyState";

/** Visitas de anúncios identificadas pelo site (gclid + UTMs): campanha › grupo/anúncio › termo. */
export async function CampaignsSection({ range }: { range: Range }) {
  const rows = await getCampaigns(range);
  const max = Math.max(0, ...rows.map((r) => r.sessions));
  const total = rows.reduce((s, r) => s + r.sessions, 0);

  return (
    <ChartCard
      id="campanhas"
      title="Campanhas no site (UTM)"
      description={
        total
          ? `${fmtInt(total)} visitas de anúncios no período, pelo utm_campaign / utm_content / utm_term`
          : "Visitas identificadas pelas UTMs dos links das campanhas"
      }
      className="h-full"
    >
      {!rows.length ? (
        <EmptyState
          compact
          title="Nenhuma visita de anúncio no período"
          hint="Aparecem aqui quando a campanha está no ar com as UTMs do padrão da Popolare."
        />
      ) : (
        <DataTable
          dense
          rows={rows}
          rowKey={(r, i) => `${r.utm_campaign}-${r.utm_term}-${r.utm_content}-${i}`}
          columns={[
            {
              key: "campaign",
              header: "Campanha · grupo",
              render: (r) => (
                <div className="min-w-44">
                  <p className="font-semibold text-tinta">{r.utm_campaign ?? "Sem utm_campaign (só gclid)"}</p>
                  {r.utm_content ? <p className="text-xs text-tinta-suave">{r.utm_content}</p> : null}
                </div>
              ),
            },
            { key: "term", header: "Termo", render: (r) => <span className="text-tinta">{r.utm_term ?? "—"}</span> },
            {
              key: "sessions",
              header: "Visitas",
              align: "right",
              render: (r) => (
                <div className="min-w-20">
                  <span className="font-semibold">{fmtInt(r.sessions)}</span>
                  <InlineBar value={r.sessions} max={max} color="bg-primaria" />
                </div>
              ),
            },
            { key: "wa", header: "WhatsApp", align: "right", render: (r) => fmtInt(r.wa_clicks) },
            { key: "conv", header: "Visitas → WhatsApp", align: "right", render: (r) => fmtPct(r.conv_rate ?? 0) },
          ]}
        />
      )}
    </ChartCard>
  );
}
