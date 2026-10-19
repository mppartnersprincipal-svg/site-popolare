/**
 * Coletor first-party (lado do navegador) — alimenta o /painel.
 * Portado do site da Sólida (lib/tracker.ts), com as chaves da Popolare.
 *
 * Anônimo por desenho: o id de sessão é um UUID aleatório em sessionStorage
 * (morre ao fechar a aba; renova após 30 min parado). O código de visitante
 * (novo × recorrente) fica no localStorage e NÃO existe para quem recusou os
 * cookies. Roda sempre, porque não trata dado pessoal.
 *
 * Envia para /api/collect:
 * - page_view  { sw, sh, ref_host? }            a cada rota (load + navegação)
 * - page_leave { duration_ms, max_scroll_pct }   ao sair da página/aba
 * - click      { tag, text, href, track, section, x_pct, y_pct } em links/botões
 * - eventos nomeados de lib/tracking.ts via collect() (click_whatsapp, form_submit…)
 */

const ENDPOINT = "/api/collect";
const SESSION_KEY = "popolare_s";
/** Identificador persistente (novo × recorrente). Não existe para quem recusou. */
const VISITOR_KEY = "popolare_v";
const VISITOR_TTL_MS = 13 * 30 * 24 * 60 * 60 * 1000;
// Mesmo valor de lib/consent.ts (não importar — evita ciclo de import)
const CONSENT_KEY = "popolare_consent";
export const CONSENT_EVENT = "popolare-consent-change";
const SESSION_TTL_MS = 30 * 60 * 1000;
const FLUSH_EVERY_MS = 5000;
const FLUSH_AT = 10;
const MAX_BATCH_BYTES = 60 * 1024;
const EXCLUDED_PREFIXES = ["/painel", "/api"];
const BOT_RE = /bot|crawl|spider|headless|lighthouse|pagespeed|gtmetrix/i;

type Params = Record<string, string | number | boolean | undefined>;
type QueuedEvent = { n: string; p: string; t?: string; d?: Params };
type SessionInit = {
  path: string;
  ref: string;
  utm: Record<string, string>;
  gclid: boolean;
  sw: number;
  sh: number;
  lang: string;
  /** visitor id persistente (ausente se o visitante recusou) */
  vid?: string;
};
type StoredSession = { id: string; last: number; init: SessionInit | null };

function consentRefused(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === "denied";
  } catch {
    return false;
  }
}

/** Lê/cria o identificador persistente; null se recusou (e apaga o existente). */
function visitorId(): string | null {
  try {
    if (consentRefused()) {
      localStorage.removeItem(VISITOR_KEY);
      return null;
    }
    const raw = localStorage.getItem(VISITOR_KEY);
    if (raw) {
      const v = JSON.parse(raw) as { id: string; at: number };
      if (v?.id && Date.now() - v.at < VISITOR_TTL_MS) return v.id;
    }
    const id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, JSON.stringify({ id, at: Date.now() }));
    return id;
  } catch {
    return null;
  }
}

let started = false;
let enabled = false;
let session: StoredSession | null = null;
let queue: QueuedEvent[] = [];
let timer: number | null = null;

// estado da página atual
let currentPath: string | null = null;
let visibleSince: number | null = null;
let accumulatedMs = 0;
let maxScroll = 0;
let pageEnded = false;
let scrollScheduled = false;

function isExcluded(path: string) {
  return EXCLUDED_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
}

function canRun() {
  if (typeof window === "undefined") return false;
  if (navigator.webdriver) return false;
  if (BOT_RE.test(navigator.userAgent)) return false;
  return !isExcluded(window.location.pathname);
}

function readSession(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

function writeSession(s: StoredSession) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } catch {
    // sem storage — a sessão vive só em memória
  }
}

function newSession(): StoredSession {
  const q = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const k of ["source", "medium", "campaign", "term", "content"]) {
    const v = q.get("utm_" + k);
    if (v) utm[k] = v.slice(0, 150);
  }
  const vid = visitorId();
  return {
    id: crypto.randomUUID(),
    last: Date.now(),
    init: {
      path: window.location.pathname,
      ref: document.referrer || "",
      utm,
      gclid: q.has("gclid") || q.has("gbraid") || q.has("wbraid"),
      sw: window.screen?.width ?? 0,
      sh: window.screen?.height ?? 0,
      lang: navigator.language || "",
      ...(vid ? { vid } : {}),
    },
  };
}

/** Banner respondido: se recusou, apaga o identificador persistente na hora. */
function onConsentChange() {
  if (!consentRefused()) return;
  try {
    localStorage.removeItem(VISITOR_KEY);
  } catch {
    // sem storage
  }
  if (session?.init?.vid) {
    session = { ...session, init: { ...session.init, vid: undefined } };
    writeSession(session);
  }
}

function ensureSession(): StoredSession {
  const now = Date.now();
  if (session && now - session.last < SESSION_TTL_MS) {
    session = { ...session, last: now };
    return session;
  }
  const stored = readSession();
  session = stored && now - stored.last < SESSION_TTL_MS ? { ...stored, last: now } : newSession();
  writeSession(session);
  return session;
}

function send(payload: string) {
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "text/plain" });
      if (navigator.sendBeacon(ENDPOINT, blob)) return;
    }
    fetch(ENDPOINT, { method: "POST", body: payload, keepalive: true, headers: { "Content-Type": "text/plain" } }).catch(
      () => {}
    );
  } catch {
    // rede indisponível — descarta
  }
}

function flush() {
  if (timer !== null) {
    window.clearTimeout(timer);
    timer = null;
  }
  if (!queue.length && !session?.init) return;
  const s = ensureSession();
  const batch: { v: number; sid: string; s?: SessionInit; e: QueuedEvent[] } = { v: 1, sid: s.id, e: queue };
  if (s.init) batch.s = s.init;
  queue = [];

  let payload = JSON.stringify(batch);
  while (payload.length > MAX_BATCH_BYTES && batch.e.length > 1) {
    batch.e = batch.e.slice(0, Math.ceil(batch.e.length / 2));
    payload = JSON.stringify(batch);
  }
  send(payload);

  if (s.init) {
    session = { ...s, init: null };
    writeSession(session);
  }
}

function enqueue(ev: QueuedEvent) {
  if (!enabled) return;
  ensureSession();
  queue.push(ev);
  if (queue.length >= FLUSH_AT) flush();
  else if (timer === null) timer = window.setTimeout(flush, FLUSH_EVERY_MS);
}

// UTMs/gclid já ficam na sessão; não repetir em cada evento
const SKIP_PARAMS = /^(utm_|gclid|gbraid|wbraid)/;

/** Evento nomeado (chamado por lib/tracking.ts e lib/consent.ts). */
export function collect(name: string, params?: Params) {
  if (!enabled) return;
  const d: Params = {};
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || SKIP_PARAMS.test(k)) continue;
      d[k] = typeof v === "string" ? v.slice(0, 200) : v;
    }
  }
  enqueue({ n: name, p: window.location.pathname, d });
}

// ---------- tempo visível + scroll ----------
function onVisible() {
  if (visibleSince === null) visibleSince = performance.now();
}
function onHidden() {
  if (visibleSince !== null) {
    accumulatedMs += performance.now() - visibleSince;
    visibleSince = null;
  }
}
function measureScroll() {
  scrollScheduled = false;
  const total = Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight ?? 0);
  if (total <= 0) return;
  const pct = Math.min(100, Math.round(((window.scrollY + window.innerHeight) / total) * 100));
  if (pct > maxScroll) maxScroll = pct;
}
function onScroll() {
  if (scrollScheduled) return;
  scrollScheduled = true;
  requestAnimationFrame(measureScroll);
}

/** Fecha a página atual (page_leave). Idempotente até o próximo trackPageView. */
export function endPage() {
  if (!enabled || currentPath === null || pageEnded) return;
  onHidden();
  measureScroll();
  pageEnded = true;
  enqueue({ n: "page_leave", p: currentPath, d: { duration_ms: Math.round(accumulatedMs), max_scroll_pct: maxScroll } });
}

/** Abre uma página (load inicial ou navegação no app). */
export function trackPageView(path: string, title: string) {
  if (!enabled) return;
  if (isExcluded(path)) {
    endPage();
    currentPath = null;
    return;
  }
  if (currentPath !== null && !pageEnded) endPage();

  currentPath = path;
  accumulatedMs = 0;
  maxScroll = 0;
  pageEnded = false;
  visibleSince = document.visibilityState === "visible" ? performance.now() : null;
  requestAnimationFrame(measureScroll);

  const s = ensureSession();
  const d: Params = { sw: window.innerWidth, sh: window.innerHeight };
  if (s.init === null && document.referrer) {
    const refHost = hostOnly(document.referrer);
    if (refHost && refHost !== window.location.hostname) d.ref_host = refHost;
  }
  enqueue({ n: "page_view", p: path, t: title.slice(0, 200), d });
}

function hostOnly(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

// ---------- cliques ----------
const CLICK_SELECTOR = "a,button,[role=button],[data-track],input[type=submit],summary";

function onClick(e: MouseEvent) {
  const el = (e.target as Element | null)?.closest?.(CLICK_SELECTOR) as HTMLElement | null;
  if (!el) return;

  const d: Params = { tag: el.tagName.toLowerCase() };
  const track = el.getAttribute("aria-label") || el.id;
  if (track) d.track = track.slice(0, 120);
  if (el.dataset.track) d.event = el.dataset.track;

  const text = (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
  if (text) d.text = text.slice(0, 80);

  const rawHref = el.getAttribute("href");
  if (rawHref) d.href = describeHref(rawHref);

  const section = el.closest("[data-section],section[id]") as HTMLElement | null;
  const sectionId = section?.getAttribute("data-section") || section?.id;
  if (sectionId) d.section = sectionId.slice(0, 60);

  if (window.innerWidth > 0 && window.innerHeight > 0) {
    d.x_pct = Math.round((e.clientX / window.innerWidth) * 100);
    d.y_pct = Math.round((e.clientY / window.innerHeight) * 100);
  }
  enqueue({ n: "click", p: window.location.pathname, d });
}

function describeHref(href: string) {
  if (/^(tel|mailto):/i.test(href)) return href.slice(0, 120);
  try {
    const u = new URL(href, window.location.origin);
    if (u.hostname === window.location.hostname) return (u.pathname + u.hash).slice(0, 200);
    if (/wa\.me|whatsapp\.com/i.test(u.hostname)) return "wa.me";
    return u.hostname;
  } catch {
    return href.slice(0, 120);
  }
}

// ---------- ciclo de vida ----------
function onVisibilityChange() {
  if (document.visibilityState === "hidden") {
    endPage();
    flush();
  } else if (currentPath !== null) {
    // voltou para a aba: reabre a MESMA página sem novo page_view
    pageEnded = false;
    accumulatedMs = 0;
    onVisible();
  }
}

function onPageHide() {
  endPage();
  flush();
}

/** Inicializa uma única vez (chamado pelo <Collector /> no layout do site). */
export function initTracker() {
  if (started) return;
  started = true;
  enabled = canRun();
  if (!enabled) return;

  ensureSession();
  document.addEventListener("click", onClick, { capture: true, passive: true });
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("pagehide", onPageHide);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener(CONSENT_EVENT, onConsentChange);
}
