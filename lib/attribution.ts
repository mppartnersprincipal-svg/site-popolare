/**
 * Classificação da origem da sessão (pago × orgânico × direto…).
 * Função pura — usada no servidor (/api/collect) a partir dos sinais que o
 * navegador manda (query da landing e host do referrer).
 */

export const CHANNELS = [
  "google_ads",
  "google_organic",
  "other_search",
  "social",
  "referral",
  "direct",
] as const;

export type Channel = (typeof CHANNELS)[number];

export type AttributionInput = {
  /** Havia gclid/gbraid/wbraid na landing */
  gclid: boolean;
  utmSource?: string | null;
  utmMedium?: string | null;
  /** utm_term cru — se vier "{keyword}" é ValueTrack não substituído (teste, não clique real) */
  utmTerm?: string | null;
  /** Host do document.referrer (sem protocolo/path) */
  referrerHost?: string | null;
  /** Host do próprio site (para ignorar referrer interno) */
  siteHost?: string | null;
};

const SEARCH_HOSTS = /(^|\.)(bing|yahoo|duckduckgo|ecosia|yandex|baidu|ask)\./i;
const SOCIAL_HOSTS =
  /(^|\.)(facebook|instagram|linkedin|twitter|x|t|youtube|youtu|tiktok|whatsapp|wa|pinterest|threads)\.(com|me|be|co)$/i;
const PAID_MEDIUMS = new Set(["cpc", "ppc", "paid", "paidsearch", "paid_search", "sem"]);

export function classifyChannel(input: AttributionInput): Channel {
  const source = (input.utmSource ?? "").toLowerCase();
  const medium = (input.utmMedium ?? "").toLowerCase();
  const ref = (input.referrerHost ?? "").toLowerCase();
  const site = (input.siteHost ?? "").toLowerCase();

  if (input.gclid) return "google_ads";

  // Teste/visualização, não clique em anúncio: link aberto de dentro do painel
  // do Ads (referrer ads.google.com) ou UTM com ValueTrack cru ("{keyword}").
  // Clique real sempre chega com gclid e com o {keyword} já substituído.
  const rawValueTrack = /\{\w+\}/.test(input.utmTerm ?? "");
  const fromAdsPanel = ref === "ads.google.com";
  if (fromAdsPanel || rawValueTrack) return "direct";

  if (source.includes("google") && PAID_MEDIUMS.has(medium)) return "google_ads";
  if (medium === "social" || medium === "paidsocial") return "social";

  if (ref && site && (ref === site || ref.endsWith("." + site) || site.endsWith("." + ref))) {
    return "direct";
  }
  if (/(^|\.)google\./i.test(ref)) return "google_organic";
  if (SEARCH_HOSTS.test(ref)) return "other_search";
  if (SOCIAL_HOSTS.test(ref)) return "social";
  if (ref) return "referral";
  if (source) return "referral";
  return "direct";
}

/** Só o host de uma URL (sem query/path) — nunca guardamos a URL inteira. */
export function hostOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "") || null;
  } catch {
    return null;
  }
}
