/**
 * Tipos das linhas das funções `popolare.*` (supabase/migrations/0001_painel.sql)
 * e rótulos pt-BR do /painel. Sem dependência de servidor — pode ir para client components.
 */
import type { Channel } from "@/lib/attribution";
import { CATEGORIES, MENU } from "@/data/menu";
import { UNITS } from "@/data/business";

export type { Channel };

export type KpisRow = {
  sessions: number;
  page_views: number;
  avg_session_ms: number;
  avg_page_ms: number;
  wa_clicks: number;
  phone_clicks: number;
  orders: number;
  wa_sessions: number;
  conv_rate: number;
};
/** wa_clicks = pedidos do dia (WhatsApp + telefone + encomenda) */
export type DailyRow = { day: string; sessions: number; page_views: number; wa_clicks: number };
export type HeatmapRow = { dow: number; hour: number; sessions: number };
export type ChannelRow = { channel: Channel; sessions: number; wa_clicks: number };
export type DeviceRow = { device: string; sessions: number };
export type PageRow = { path: string; title: string | null; views: number; avg_ms: number; avg_scroll: number };
export type GeoRow = { country: string | null; region: string | null; city: string | null; sessions: number; wa_clicks: number };
export type CampaignRow = {
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  sessions: number;
  wa_clicks: number;
  conv_rate: number | null;
};
export type ButtonKind = "click_whatsapp" | "click_phone" | "click_directions" | "click_delivery" | "form_submit";
export type ButtonRow = {
  kind: ButtonKind;
  unidade: string | null;
  produto: string | null;
  local: string | null;
  channel: Channel;
  clicks: number;
  sessions: number;
};
export type InterestRow = {
  kind: "intro_pasta_select" | "catalog_filter" | "click_whatsapp";
  item: string | null;
  total: number;
  sessions: number;
};
export type ClickRow = { label: string | null; tag: string | null; href: string | null; clicks: number; sessions: number };
export type FunnelRow = { step: string; sessions: number };
export type VisitorRow = { kind: "new" | "returning" | "unknown"; sessions: number; wa_clicks: number };
export type ConsentRow = { choice: "accepted" | "essential" | "none"; sessions: number };
export type TrailEvent = {
  ts: string;
  name: string;
  path: string;
  title: string | null;
  params: Record<string, string | number | boolean>;
};
export type JourneyRow = {
  id: string;
  started_at: string;
  last_seen_at: string;
  channel: Channel;
  utm_campaign: string | null;
  utm_term: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  region: string | null;
  city: string | null;
  landing_path: string;
  referrer_host: string | null;
  converted: boolean;
  is_returning: boolean;
  trail: TrailEvent[];
};
export type RecentRow = {
  ts: string;
  session_id: string;
  name: string;
  path: string;
  params: Record<string, string | number | boolean>;
  channel: Channel;
  device: string | null;
  city: string | null;
  region: string | null;
};

// ---------- Rótulos ----------

export const CHANNEL_LABELS: Record<Channel, string> = {
  google_ads: "Google Ads",
  google_organic: "Google orgânico",
  other_search: "Outros buscadores",
  social: "Redes sociais",
  referral: "Outros sites",
  direct: "Direto",
};
export const CHANNEL_ORDER: Channel[] = ["google_ads", "google_organic", "other_search", "social", "referral", "direct"];

export const DEVICE_LABELS: Record<string, string> = {
  mobile: "Celular",
  tablet: "Tablet",
  desktop: "Computador",
  desconhecido: "Desconhecido",
};

export const VISITOR_LABELS: Record<string, string> = {
  new: "Primeira visita",
  returning: "Já visitou antes",
  unknown: "Sem identificação (recusou)",
};
export const CONSENT_LABELS: Record<string, string> = {
  accepted: "Aceitou cookies",
  essential: "Recusou cookies",
  none: "Não respondeu",
};

export const FUNNEL_LABELS: Record<string, string> = {
  visitou: "Visitou",
  viu_cardapio: "Viu o cardápio / produtos",
  pediu: "Pediu (WhatsApp, telefone ou encomenda)",
};

export const BUTTON_LABELS: Record<ButtonKind, string> = {
  click_whatsapp: "WhatsApp",
  click_phone: "Telefone",
  click_directions: "Rota no mapa",
  click_delivery: "Delivery",
  form_submit: "Encomenda",
};

const UNIT_LABELS: Record<string, string> = {
  // Unidade fechada em out/2026 — mantém o rótulo para eventos antigos do painel
  eldorado: "Eldorado (encerrada)",
  ...Object.fromEntries(UNITS.map((u) => [u.id, u.name.replace(/^Popolare /, "")])),
};
const PRODUCT_LABELS: Record<string, string> = Object.fromEntries(MENU.map((m) => [m.id, m.namePt]));
const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.namePt]));
const PASTA_LABELS: Record<string, string> = {
  fettuccine: "Fettuccine",
  ravioli: "Ravioli",
  cappelletti: "Cappelletti",
  sfogliatti: "Sfogliatti",
};

/** Onde o botão estava (data-track-local) */
export const LOCAL_LABELS: Record<string, string> = {
  header: "Cabeçalho",
  "menu-mobile": "Menu (celular)",
  hero: "Topo da home",
  "hero-trocar-massa": "Topo da home (trocar massa)",
  vitrine: "Vitrine 3D",
  catalogo: "Cardápio",
  lojas: "Lojas",
  footer: "Rodapé",
  blog: "Blog",
  "encomenda-sucesso": "Encomenda enviada",
  "lp-hero": "LP · topo",
  "lp-hero-produtos": "LP · produtos do topo",
  "lp-cardapio": "LP · cardápio",
  "lp-encomendas": "LP · encomendas",
  "lp-flutuante": "LP · botão flutuante",
};

export const EVENT_LABELS: Record<string, string> = {
  page_view: "Abriu página",
  page_leave: "Saiu da página",
  click: "Clique",
  click_whatsapp: "Clicou no WhatsApp",
  click_phone: "Clicou no telefone",
  click_directions: "Abriu a rota",
  click_delivery: "Abriu o delivery",
  click_cta: "Clicou num botão",
  form_submit: "Enviou encomenda",
  section_view: "Viu seção",
  intro_pasta_select: "Escolheu massa na intro",
  catalog_filter: "Filtrou o cardápio",
  cookie_consent: "Respondeu os cookies",
};

export const PAGE_LABELS: Record<string, string> = {
  "/": "Home",
  "/massas-em-goiania": "LP · Massas em Goiânia",
  "/cardapio": "Cardápio",
  "/encomendas": "Encomendas",
  "/sobre-nos": "Sobre nós",
  "/contato": "Contato",
  "/modo-de-preparo": "Modo de preparo",
  "/midia": "Na mídia",
  "/blog": "Blog",
  "/politica-de-privacidade": "Política de privacidade",
};

export function labelChannel(c: string | null | undefined) {
  return (c && CHANNEL_LABELS[c as Channel]) || c || "—";
}
export function labelDevice(d: string | null | undefined) {
  return (d && DEVICE_LABELS[d]) || d || "Desconhecido";
}
export function labelUnit(u: string | null | undefined) {
  return (u && UNIT_LABELS[u]) || u || "Sem unidade";
}
export function labelProduct(p: string | null | undefined) {
  return (p && PRODUCT_LABELS[p]) || p || "—";
}
export function labelCategory(c: string | null | undefined) {
  return (c && CATEGORY_LABELS[c]) || c || "Todas";
}
export function labelPasta(p: string | null | undefined) {
  return (p && PASTA_LABELS[p]) || p || "—";
}
export function labelLocal(l: string | null | undefined) {
  return (l && LOCAL_LABELS[l]) || l || "—";
}
export function labelEvent(n: string) {
  return EVENT_LABELS[n] || n;
}
export function labelPage(path: string, title?: string | null) {
  if (PAGE_LABELS[path]) return PAGE_LABELS[path];
  const clean = title?.replace(/ \| Popolare$/, "").replace(/ — Popolare.*$/, "");
  return clean || path;
}

// ---------- Formatação pt-BR ----------

const nf = new Intl.NumberFormat("pt-BR");
export function fmtInt(n: number | null | undefined) {
  return nf.format(Math.round(Number(n ?? 0)));
}
export function fmtPct(n: number | null | undefined, digits = 1) {
  return `${Number(n ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: digits })}%`;
}
/** 4200 → "4 s"; 75000 → "1 min 15 s" */
export function fmtDuration(ms: number | null | undefined) {
  const s = Math.round(Number(ms ?? 0) / 1000);
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m < 60) return r ? `${m} min ${r} s` : `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}
const TZ = "America/Sao_Paulo";
export function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}
export function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { timeZone: TZ, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
export function fmtDay(isoDate: string) {
  const [y, m, d] = isoDate.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("pt-BR", { timeZone: "UTC", day: "2-digit", month: "short" });
}
