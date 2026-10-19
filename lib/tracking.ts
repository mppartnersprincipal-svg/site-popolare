// Helpers de dataLayer (GTM). Todas as tags (GA4, Google Ads, Meta Pixel) são configuradas no GTM.
import { collect } from "@/lib/tracker";

export type TrackingEvent =
  | "click_whatsapp"
  | "click_phone"
  | "click_cta"
  | "click_directions"
  | "click_delivery"
  | "form_submit"
  | "section_view"
  | "intro_pasta_select"
  | "catalog_filter"
  | `scroll_${25 | 50 | 75 | 100}`;

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

// UTMs + identificadores de clique do Google Ads (gclid/gbraid/wbraid) para atribuir conversões às campanhas
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "gbraid", "wbraid"] as const;
const UTM_STORAGE = "popolare_utm";

export function readUtms(): EventParams {
  try {
    return JSON.parse(sessionStorage.getItem(UTM_STORAGE) ?? "{}") as EventParams;
  } catch {
    return {};
  }
}

/** Salva as UTMs da URL de entrada; visitas internas não sobrescrevem a origem. */
export function captureUtms(search: string): void {
  const params = new URLSearchParams(search);
  const found = Object.fromEntries(UTM_KEYS.flatMap((k) => (params.get(k) ? [[k, params.get(k)!]] : [])));
  if (Object.keys(found).length === 0) return;
  try {
    sessionStorage.setItem(UTM_STORAGE, JSON.stringify(found));
  } catch {
    // sessionStorage indisponível (modo privado restrito) — segue sem persistir
  }
}

export function track(event: TrackingEvent, params: EventParams = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...readUtms(), ...params });
  // Medição própria do /painel (scroll_* fica de fora: o coletor já mede o scroll por página)
  if (!event.startsWith("scroll_")) collect(event, params);
}
