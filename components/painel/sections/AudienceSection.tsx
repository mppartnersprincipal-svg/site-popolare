import { getConsent, getFunnel, getVisitors, type Range } from "@/lib/painel/queries";
import { CONSENT_LABELS, FUNNEL_LABELS, VISITOR_LABELS, fmtInt } from "@/lib/painel/types";
import { ChartCard } from "../ChartCard";
import { DonutChart } from "../charts/DonutChart";
import { FunnelBars } from "../charts/FunnelBars";
import { CHART } from "../charts/chartTheme";

const VISITOR_COLORS: Record<string, string> = { new: CHART.tinta, returning: CHART.primaria, unknown: CHART.suave };
const CONSENT_COLORS: Record<string, string> = { accepted: CHART.manjericao, essential: CHART.dourado, none: CHART.suave };

/** Novo × recorrente · cobertura de consentimento · funil até o pedido. */
export async function AudienceSection({ range }: { range: Range }) {
  const [visitors, consent, funnel] = await Promise.all([getVisitors(range), getConsent(range), getFunnel(range)]);

  const consentTotal = consent.reduce((s, c) => s + c.sessions, 0);
  const accepted = consent.find((c) => c.choice === "accepted")?.sessions ?? 0;
  const coverage = consentTotal ? Math.round((accepted / consentTotal) * 100) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <ChartCard id="funil" title="Funil até o pedido" description="Visitou → viu o cardápio ou os produtos → pediu" className="h-full md:col-span-2 xl:col-span-1">
        <FunnelBars steps={funnel.map((f) => ({ label: FUNNEL_LABELS[f.step] ?? f.step, value: f.sessions }))} />
      </ChartCard>

      <ChartCard id="visitantes" title="Novo × recorrente" description="Quem está voltando (código anônimo no navegador)" className="h-full">
        <DonutChart
          totalLabel="visitas"
          data={visitors.map((v) => ({
            name: VISITOR_LABELS[v.kind] ?? v.kind,
            value: v.sessions,
            color: VISITOR_COLORS[v.kind],
            hint: `${fmtInt(v.wa_clicks)} cliques no WhatsApp`,
          }))}
        />
      </ChartCard>

      <ChartCard
        id="consentimento"
        title="Cobertura de consentimento"
        description={`${coverage}% aceitaram cookies — é o que o GA4 e o Google Ads enxergam; este painel mede todos`}
        className="h-full"
      >
        <DonutChart
          totalLabel="visitas"
          data={consent.map((c) => ({ name: CONSENT_LABELS[c.choice] ?? c.choice, value: c.sessions, color: CONSENT_COLORS[c.choice] }))}
        />
      </ChartCard>
    </div>
  );
}
