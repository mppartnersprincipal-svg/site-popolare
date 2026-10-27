import { Suspense } from "react";
import { requireUser } from "@/lib/painel/auth";
import {
  getByChannel,
  getByDevice,
  getDaily,
  getKpis,
  getRange,
  previousRange,
  type Range,
  type Scope,
  type SearchParams,
} from "@/lib/painel/queries";
import { fmtInt, labelChannel, labelDevice } from "@/lib/painel/types";
import { DashboardFilters } from "./DashboardFilters";
import { SectionNav } from "./SectionNav";
import { KpiGrid } from "./KpiGrid";
import { ChartCard } from "./ChartCard";
import { EmptyState } from "./EmptyState";
import { CardSkeleton } from "./Skeleton";
import { DailyAreaChart } from "./charts/DailyAreaChart";
import { DonutChart } from "./charts/DonutChart";
import { CHANNEL_COLORS, DEVICE_COLORS } from "./charts/chartTheme";
import { GoogleAdsSection } from "./sections/GoogleAdsSection";
import { CampaignsSection } from "./sections/CampaignsSection";
import { AudienceSection } from "./sections/AudienceSection";
import { ButtonsSection } from "./sections/ButtonsSection";
import { InterestsSection } from "./sections/InterestsSection";
import { JourneysSection } from "./sections/JourneysSection";
import { HeatmapSection } from "./sections/HeatmapSection";
import { GeoSection } from "./sections/GeoSection";
import { BlogSection, LpReadingSection, PagesSection } from "./sections/PagesSection";
import { ClicksSection, LiveSection } from "./sections/ClicksSection";

const TITLES: Record<Scope, { title: string; subtitle: string }> = {
  lp: {
    title: "LP · Google Ads",
    subtitle: "Visitas que entraram pelas páginas dos anúncios (/massas-em-goiania e as LPs por produto)",
  },
  site: {
    title: "Site",
    subtitle: "Visitas que entraram pela home e pelas demais páginas (sem a LP)",
  },
};

function Lazy({ height = 220, children }: { height?: number; children: React.ReactNode }) {
  return <Suspense fallback={<CardSkeleton height={height} />}>{children}</Suspense>;
}

async function Overview({ range }: { range: Range }) {
  const [kpis, prevKpis, daily, byChannel, byDevice] = await Promise.all([
    getKpis(range),
    getKpis(previousRange(range)),
    getDaily(range),
    getByChannel(range),
    getByDevice(range),
  ]);
  const hasData = kpis.sessions > 0;

  return (
    <>
      <div id="kpis" className="scroll-mt-32">
        <KpiGrid kpis={kpis} previous={prevKpis} />
      </div>
      {!hasData ? (
        <EmptyState
          title="Nenhuma visita registrada no período"
          hint="Os dados aparecem assim que alguém acessar. Tente outro período ou remova o filtro de origem."
        />
      ) : null}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <ChartCard id="visitas" title="Visitas por dia" description="Visitas (área) e pedidos — WhatsApp, telefone e encomenda (linha verde)" className="h-full">
            {hasData ? <DailyAreaChart data={daily} /> : <EmptyState compact hint="" />}
          </ChartCard>
        </div>
        <ChartCard
          id="origem"
          title="De onde vêm as visitas"
          description={range.channel ? "Todas as origens (este gráfico ignora o filtro de origem)" : "Google Ads × orgânico × direto × redes"}
          className="h-full"
        >
          <DonutChart
            totalLabel="visitas"
            data={byChannel.map((c) => ({
              name: labelChannel(c.channel),
              value: c.sessions,
              color: CHANNEL_COLORS[c.channel],
              hint: `${fmtInt(c.wa_clicks)} cliques no WhatsApp`,
            }))}
          />
        </ChartCard>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard id="dispositivo" title="Dispositivo" description="Celular, computador ou tablet" className="h-full">
          <DonutChart
            totalLabel="visitas"
            data={byDevice.map((d) => ({ name: labelDevice(d.device), value: d.sessions, color: DEVICE_COLORS[d.device] }))}
          />
        </ChartCard>
        {range.scope === "lp" ? (
          <Lazy>
            <LpReadingSection range={range} />
          </Lazy>
        ) : (
          <Lazy>
            <ClicksSection range={range} />
          </Lazy>
        )}
      </div>
    </>
  );
}

/** Painel completo. Lê a sessão e os filtros, por isso sempre fica dentro de um <Suspense>. */
export async function Dashboard({ scope, searchParams }: { scope: Scope; searchParams: Promise<SearchParams> }) {
  await requireUser();
  const sp = await searchParams;
  const range = getRange(scope, sp);
  const { title, subtitle } = TITLES[scope];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-tinta sm:text-4xl">{title}</h1>
        <p className="mt-1 text-sm text-tinta-suave">
          {subtitle} · {range.label}
          {range.channel ? ` · ${labelChannel(range.channel)}` : ""}
        </p>
      </div>

      <SectionNav scope={scope} />
      <DashboardFilters period={range.period} channel={range.channel} de={range.de} ate={range.ate} />

      <Suspense fallback={<CardSkeleton height={360} />}>
        <Overview range={range} />
      </Suspense>

      {scope === "lp" ? (
        <>
          <Lazy height={400}>
            <GoogleAdsSection range={range} />
          </Lazy>
          <Lazy>
            <CampaignsSection range={range} />
          </Lazy>
        </>
      ) : null}

      <Lazy>
        <AudienceSection range={range} />
      </Lazy>
      <Lazy height={320}>
        <ButtonsSection range={range} />
      </Lazy>
      <Lazy>
        <InterestsSection range={range} scope={scope} />
      </Lazy>
      <Lazy height={400}>
        <JourneysSection range={range} sp={sp} />
      </Lazy>

      {scope === "site" ? (
        <Lazy>
          <PagesSection range={range} />
        </Lazy>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <Lazy>
          <HeatmapSection range={range} />
        </Lazy>
        <Lazy>
          <GeoSection range={range} />
        </Lazy>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {scope === "site" ? (
          <Lazy>
            <BlogSection range={range} />
          </Lazy>
        ) : (
          <Lazy>
            <ClicksSection range={range} />
          </Lazy>
        )}
        <Lazy height={320}>
          <LiveSection scope={scope} />
        </Lazy>
      </div>
    </div>
  );
}
