import "server-only";
import { getSql } from "@/lib/painel/db";
import { CHANNELS, type Channel } from "@/lib/attribution";
import type {
  ButtonRow,
  CampaignRow,
  ChannelRow,
  ClickRow,
  ConsentRow,
  DailyRow,
  DeviceRow,
  FunnelRow,
  GeoRow,
  HeatmapRow,
  InterestRow,
  JourneyRow,
  KpisRow,
  PageRow,
  RecentRow,
  VisitorRow,
} from "@/lib/painel/types";

/**
 * Leitura do /painel — Server Components chamam as funções SQL `popolare.*`
 * com a role popolare_app. Portado de lib/analytics-queries.ts da Sólida,
 * com o escopo do painel: 'lp' (entrou pela LP do Google Ads) ou 'site'.
 */

export type Scope = "lp" | "site";
export const SCOPES: Scope[] = ["lp", "site"];
export type Period = "hoje" | "7d" | "30d" | "90d" | "custom";

export type Range = {
  scope: Scope;
  period: Period;
  from: Date;
  to: Date;
  /** null = todas as origens */
  channel: Channel | null;
  label: string;
  de?: string;
  ate?: string;
};

const TZ = "America/Sao_Paulo";
const DAY_MS = 24 * 3600 * 1000;

/** Meia-noite (Brasília, UTC-3 fixo desde 2019) do dia `d` deslocado em `offsetDays`. */
function brMidnight(d: Date, offsetDays = 0): Date {
  const [y, m, day] = d.toLocaleDateString("en-CA", { timeZone: TZ }).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day + offsetDays, 3, 0, 0));
}

function parseYmd(s: string | undefined): Date | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 3, 0, 0));
  return Number.isNaN(date.getTime()) ? null : date;
}

function fmtBr(d: Date) {
  return d.toLocaleDateString("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit" });
}

export type SearchParams = Record<string, string | string[] | undefined>;

export function getRange(scope: Scope, sp: SearchParams): Range {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k]) as string | undefined;
  const periodRaw = one("periodo");
  const channelRaw = one("origem");
  const channel = CHANNELS.includes(channelRaw as Channel) ? (channelRaw as Channel) : null;
  const now = new Date();
  const tomorrow = brMidnight(now, 1);

  if (periodRaw === "custom") {
    const from = parseYmd(one("de"));
    const toDay = parseYmd(one("ate"));
    if (from && toDay && from <= toDay) {
      return {
        scope,
        period: "custom",
        from,
        to: new Date(toDay.getTime() + DAY_MS),
        channel,
        label: `${fmtBr(from)} a ${fmtBr(toDay)}`,
        de: one("de"),
        ate: one("ate"),
      };
    }
  }
  if (periodRaw === "hoje") return { scope, period: "hoje", from: brMidnight(now), to: tomorrow, channel, label: "Hoje" };
  const days = periodRaw === "7d" ? 7 : periodRaw === "90d" ? 90 : 30;
  const period: Period = periodRaw === "7d" ? "7d" : periodRaw === "90d" ? "90d" : "30d";
  return { scope, period, from: brMidnight(now, -(days - 1)), to: tomorrow, channel, label: `Últimos ${days} dias` };
}

/** Mesmo tamanho de janela, imediatamente antes (deltas dos KPIs). */
export function previousRange(r: Range): Range {
  const len = r.to.getTime() - r.from.getTime();
  return { ...r, from: new Date(r.from.getTime() - len), to: r.from, label: "período anterior" };
}

async function run<T>(name: string, query: (sql: NonNullable<ReturnType<typeof getSql>>) => Promise<T[]>): Promise<T[]> {
  const sql = getSql();
  if (!sql) return [];
  try {
    return await query(sql);
  } catch (err) {
    console.error(`[painel] ${name}:`, err instanceof Error ? err.message : err);
    return [];
  }
}

const EMPTY_KPIS: KpisRow = {
  sessions: 0,
  page_views: 0,
  avg_session_ms: 0,
  avg_page_ms: 0,
  wa_clicks: 0,
  phone_clicks: 0,
  orders: 0,
  wa_sessions: 0,
  conv_rate: 0,
};

export async function getKpis(r: Range): Promise<KpisRow> {
  const rows = await run<KpisRow>("kpis", (sql) => sql`select * from popolare.kpis(${r.from}, ${r.to}, ${r.channel}, ${r.scope})`);
  return rows[0] ?? EMPTY_KPIS;
}
export const getDaily = (r: Range) =>
  run<DailyRow>("daily", (sql) => sql`select * from popolare.daily(${r.from}, ${r.to}, ${r.channel}, ${r.scope})`);
export const getHeatmap = (r: Range) =>
  run<HeatmapRow>("heatmap", (sql) => sql`select * from popolare.heatmap(${r.from}, ${r.to}, ${r.channel}, ${r.scope})`);
/** Ignora o filtro de origem (o gráfico É a origem). */
export const getByChannel = (r: Range) =>
  run<ChannelRow>("by_channel", (sql) => sql`select * from popolare.by_channel(${r.from}, ${r.to}, ${r.scope})`);
export const getByDevice = (r: Range) =>
  run<DeviceRow>("by_device", (sql) => sql`select * from popolare.by_device(${r.from}, ${r.to}, ${r.channel}, ${r.scope})`);
export const getTopPages = (r: Range, limit = 20) =>
  run<PageRow>("top_pages", (sql) => sql`select * from popolare.top_pages(${r.from}, ${r.to}, ${r.channel}, ${limit}, ${r.scope})`);
export const getGeo = (r: Range, limit = 30) =>
  run<GeoRow>("geo", (sql) => sql`select * from popolare.geo(${r.from}, ${r.to}, ${r.channel}, ${limit}, ${r.scope})`);
export const getCampaigns = (r: Range) =>
  run<CampaignRow>("campaigns", (sql) => sql`select * from popolare.campaigns(${r.from}, ${r.to}, ${r.scope})`);
export const getButtons = (r: Range) =>
  run<ButtonRow>("buttons", (sql) => sql`select * from popolare.buttons(${r.from}, ${r.to}, ${r.channel}, ${r.scope})`);
export const getInterests = (r: Range) =>
  run<InterestRow>("interests", (sql) => sql`select * from popolare.interests(${r.from}, ${r.to}, ${r.channel}, ${r.scope})`);
export const getClicks = (r: Range, limit = 30) =>
  run<ClickRow>("clicks", (sql) => sql`select * from popolare.clicks(${r.from}, ${r.to}, ${r.channel}, ${limit}, ${r.scope})`);
export const getBlog = (r: Range, limit = 20) =>
  run<PageRow>("blog", (sql) => sql`select * from popolare.blog(${r.from}, ${r.to}, ${r.channel}, ${limit}, ${r.scope})`);
export const getFunnel = (r: Range) =>
  run<FunnelRow>("funnel", (sql) => sql`select * from popolare.funnel(${r.from}, ${r.to}, ${r.channel}, ${r.scope})`);
export const getJourneys = (r: Range, onlyConverted = true, limit = 50) =>
  run<JourneyRow>(
    "journeys",
    (sql) => sql`select * from popolare.journeys(${r.from}, ${r.to}, ${r.channel}, ${onlyConverted}, ${limit}, ${r.scope})`
  );
export const getVisitors = (r: Range) =>
  run<VisitorRow>("visitors", (sql) => sql`select * from popolare.visitors(${r.from}, ${r.to}, ${r.channel}, ${r.scope})`);
export const getConsent = (r: Range) =>
  run<ConsentRow>("consent", (sql) => sql`select * from popolare.consent(${r.from}, ${r.to}, ${r.scope})`);

export function getRecent(scope: Scope, limit = 50) {
  const safeScope: Scope = SCOPES.includes(scope) ? scope : "lp";
  const safeLimit = Math.min(Math.max(1, Math.round(limit)), 100);
  return run<RecentRow>("recent", (sql) => sql`select * from popolare.recent(${safeLimit}, ${safeScope})`);
}

/** Query string atual com alterações (links que preservam os filtros). */
export function withParams(sp: SearchParams, changes: Record<string, string | null>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    const val = Array.isArray(v) ? v[0] : v;
    if (val) p.set(k, val);
  }
  for (const [k, v] of Object.entries(changes)) {
    if (v === null) p.delete(k);
    else p.set(k, v);
  }
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}
