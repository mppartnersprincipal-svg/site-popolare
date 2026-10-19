import { after, userAgent, type NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { getSql } from "@/lib/painel/db";
import { classifyChannel, hostOf } from "@/lib/attribution";
import { SITE_URL } from "@/data/business";

/**
 * Coleta first-party do /painel (lado do navegador: lib/tracker.ts).
 * Portado da Sólida (app/api/collect), gravando via role `popolare_app`.
 *
 * - Lotes via sendBeacon (text/plain → sem preflight); responde 204 na hora e grava em after().
 * - Anônimo: sem IP (só hash em memória p/ rate limit), sem user-agent cru, sem cookies.
 * - Sem POPOLARE_DATABASE_URL aceita e descarta (dev local / preview).
 */

const MAX_BODY = 32 * 1024;
const MAX_EVENTS = 50;
const MAX_PARAM_KEYS = 20;
const NAME_RE = /^[a-z0-9_]{2,40}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BOT_RE =
  /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|gtmetrix|preview|facebookexternalhit|whatsapp|telegram|curl|wget|python|java\//i;
const RATE_PER_SESSION = 120;
const RATE_PER_NETWORK = 600;

type Incoming = {
  sid?: string;
  s?: {
    path?: string;
    ref?: string;
    utm?: Record<string, string>;
    gclid?: boolean;
    sw?: number;
    sh?: number;
    lang?: string;
    vid?: string;
  };
  e?: Array<{ n?: string; p?: string; t?: string; d?: Record<string, unknown> }>;
};

// ---------- rate limit best-effort (por instância) ----------
const buckets = new Map<string, { n: number; reset: number }>();
function allow(key: string, limit: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    if (buckets.size > 5000) buckets.clear();
    buckets.set(key, { n: 1, reset: now + 60_000 });
    return true;
  }
  b.n += 1;
  return b.n <= limit;
}

function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}
function int(v: unknown, max: number): number | null {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.min(Math.round(n), max) : null;
}

function cleanParams(d: unknown): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  if (!d || typeof d !== "object") return out;
  for (const [k, v] of Object.entries(d as Record<string, unknown>)) {
    if (Object.keys(out).length >= MAX_PARAM_KEYS) break;
    if (!/^[a-z_][a-z0-9_]{0,39}$/.test(k)) continue;
    if (typeof v === "string") out[k] = v.slice(0, 200);
    else if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
    else if (typeof v === "boolean") out[k] = v;
  }
  return out;
}

function deviceType(ua: ReturnType<typeof userAgent>, chMobile: string | null) {
  const t = ua.device.type;
  if (t === "mobile" || t === "wearable") return "mobile";
  if (t === "tablet") return "tablet";
  if (chMobile === "?1") return "mobile";
  return "desktop";
}

function family(name: string | undefined, map: Array<[RegExp, string]>) {
  if (!name) return "outro";
  for (const [re, label] of map) if (re.test(name)) return label;
  return "outro";
}

const BROWSERS: Array<[RegExp, string]> = [
  [/edge/i, "edge"],
  [/samsung/i, "samsung"],
  [/opera|opr/i, "opera"],
  [/instagram|facebook|fban|fbav/i, "in-app"],
  [/chrome|chromium|crios/i, "chrome"],
  [/safari/i, "safari"],
  [/firefox|fxios/i, "firefox"],
];
const OSES: Array<[RegExp, string]> = [
  [/android/i, "android"],
  [/ios|iphone|ipad/i, "ios"],
  [/windows/i, "windows"],
  [/mac/i, "macos"],
  [/linux|ubuntu|chrome os|chromium os/i, "linux"],
];

function safeDecode(v: string) {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

type EventRow = { session_id: string; name: string; path: string; title: string | null; params: Record<string, string | number | boolean> };

function parseEvents(sid: string, raw: NonNullable<Incoming["e"]>): EventRow[] {
  return raw.slice(0, MAX_EVENTS).flatMap((ev) => {
    const name = str(ev?.n, 40);
    const path = str(ev?.p, 300);
    if (!name || !NAME_RE.test(name) || !path?.startsWith("/")) return [];
    return [{ session_id: sid, name, path, title: str(ev?.t, 200), params: cleanParams(ev?.d) }];
  });
}

function buildSession(sid: string, s: NonNullable<Incoming["s"]>, request: NextRequest) {
  const utm = s.utm && typeof s.utm === "object" ? s.utm : {};
  const referrerHost = hostOf(str(s.ref, 500));
  const utmSource = str(utm.source, 100);
  const utmMedium = str(utm.medium, 100);
  const utmTerm = str(utm.term, 150);
  const gclid = s.gclid === true;
  const h = request.headers;
  const city = h.get("x-vercel-ip-city");
  const ua = userAgent(request);
  return {
    id: sid,
    landing_path: str(s.path, 300) ?? "/",
    referrer_host: referrerHost,
    channel: classifyChannel({ gclid, utmSource, utmMedium, utmTerm, referrerHost, siteHost: hostOf(SITE_URL) }),
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: str(utm.campaign, 150),
    utm_term: utmTerm,
    utm_content: str(utm.content, 150),
    has_gclid: gclid,
    device: deviceType(ua, h.get("sec-ch-ua-mobile")),
    browser: family(ua.browser.name, BROWSERS),
    os: family(ua.os.name, OSES),
    country: str(h.get("x-vercel-ip-country"), 2),
    region: str(h.get("x-vercel-ip-country-region"), 10),
    city: city ? str(safeDecode(city), 80) : null,
    screen_w: int(s.sw, 10000),
    screen_h: int(s.sh, 10000),
    lang: str(s.lang, 10),
    // novo × recorrente — null se o visitante recusou os cookies
    visitor_id: typeof s.vid === "string" && UUID_RE.test(s.vid) ? s.vid.toLowerCase() : null,
  };
}

export async function POST(request: NextRequest) {
  const uaRaw = request.headers.get("user-agent") ?? "";
  if (!uaRaw || BOT_RE.test(uaRaw) || userAgent(request).isBot) return new Response(null, { status: 204 });

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY) return new Response(null, { status: 413 });

  let body: Incoming;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return new Response(null, { status: 413 });
    body = JSON.parse(text) as Incoming;
  } catch {
    return new Response(null, { status: 400 });
  }

  const sid = typeof body.sid === "string" && UUID_RE.test(body.sid) ? body.sid.toLowerCase() : null;
  if (!sid || !Array.isArray(body.e)) return new Response(null, { status: 400 });

  // Rate limit por sessão e por rede (hash do IP só em memória, nunca gravado)
  const ipHash = createHash("sha256")
    .update(request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "local")
    .digest("hex")
    .slice(0, 16);
  if (!allow(`s:${sid}`, RATE_PER_SESSION) || !allow(`ip:${ipHash}`, RATE_PER_NETWORK)) {
    return new Response(null, { status: 204 });
  }

  const events = parseEvents(sid, body.e);
  const session = body.s && typeof body.s === "object" ? buildSession(sid, body.s, request) : null;
  if (!events.length && !session) return new Response(null, { status: 204 });

  const sql = getSql();
  if (!sql) return new Response(null, { status: 204 });

  after(async () => {
    const rows = events.map((e) => ({ ...e, params: sql.json(e.params) }));
    const insertEvents = () =>
      sql`insert into popolare.events ${sql(rows, "session_id", "name", "path", "title", "params")}`;
    try {
      if (session) await sql`insert into popolare.sessions ${sql(session)} on conflict (id) do nothing`;
      if (!rows.length) return;
      try {
        await insertEvents();
      } catch (err) {
        // 1º lote da sessão se perdeu (FK): cria uma sessão-esqueleto e grava de novo
        if ((err as { code?: string }).code !== "23503") throw err;
        await sql`insert into popolare.sessions (id, landing_path, channel)
                  values (${sid}, ${events[0].path}, 'direct') on conflict (id) do nothing`;
        await insertEvents();
      }
    } catch (err) {
      console.error("[collect]", err instanceof Error ? err.message : err);
    }
  });

  return new Response(null, { status: 204 });
}
