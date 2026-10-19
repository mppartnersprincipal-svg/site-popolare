"use client";

import { useEffect, useState } from "react";
import { MapPin, Monitor, RefreshCw, Smartphone, Tablet } from "lucide-react";
import { getRecentEvents } from "@/app/painel/actions";
import type { Scope } from "@/lib/painel/queries";
import {
  fmtTime,
  labelCategory,
  labelChannel,
  labelEvent,
  labelLocal,
  labelPage,
  labelPasta,
  labelProduct,
  labelUnit,
  type RecentRow,
} from "@/lib/painel/types";
import { EmptyState } from "./EmptyState";
import { cn } from "@/lib/cn";

const INTERVAL_MS = 30_000;

const BADGE: Record<string, string> = {
  click_whatsapp: "bg-manjericao text-farinha",
  click_phone: "bg-primaria text-farinha",
  form_submit: "bg-primaria text-farinha",
  click_directions: "bg-dourado/30 text-tinta",
  page_view: "bg-creme text-tinta",
  page_leave: "bg-creme text-tinta-suave",
  click: "bg-tinta/10 text-tinta",
};

function detail(r: RecentRow) {
  const p = r.params ?? {};
  const s = (k: string) => (p[k] != null ? String(p[k]) : "");
  switch (r.name) {
    case "click_whatsapp":
    case "click_phone":
    case "click_directions":
      return [p.unidade ? labelUnit(s("unidade")) : null, p.produto ? labelProduct(s("produto")) : null, p.local ? labelLocal(s("local")) : null]
        .filter(Boolean)
        .join(" · ");
    case "form_submit":
      return p.unidade ? `Encomenda · ${labelUnit(s("unidade"))}` : "Encomenda";
    case "intro_pasta_select":
      return labelPasta(s("massa"));
    case "catalog_filter":
      return labelCategory(s("categoria"));
    case "section_view":
      return s("secao");
    case "click":
      return s("text") || s("track") || s("href");
    case "page_leave":
      return p.duration_ms != null ? `${Math.round(Number(p.duration_ms) / 1000)} s · rolou ${s("max_scroll_pct") || 0}%` : "";
    case "cookie_consent":
      return p.consent_choice === "accepted" ? "aceitou" : "recusou";
    default:
      return "";
  }
}

export function LiveFeed({ initial, scope }: { initial: RecentRow[]; scope: Scope }) {
  const [rows, setRows] = useState(initial);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      if (document.visibilityState === "hidden") return;
      setBusy(true);
      try {
        const next = await getRecentEvents(scope, 40);
        if (!cancelled) {
          setRows(next);
          setUpdatedAt(new Date());
        }
      } catch {
        // mantém a lista anterior
      } finally {
        if (!cancelled) setBusy(false);
      }
    };
    const id = window.setInterval(tick, INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [scope]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs text-tinta-suave">
        <span className="inline-flex items-center gap-1.5">
          <span className={cn("size-2 rounded-full bg-manjericao", busy && "animate-pulse")} aria-hidden />
          {updatedAt ? `Atualizado às ${updatedAt.toLocaleTimeString("pt-BR")}` : "Ao vivo"}
        </span>
        <RefreshCw aria-hidden className={cn("size-3.5", busy && "animate-spin")} />
      </div>
      {!rows.length ? (
        <EmptyState compact title="Nenhum evento ainda" hint="Assim que alguém acessar, aparece aqui." />
      ) : (
        <ul className="max-h-[520px] space-y-1 overflow-y-auto pr-1 text-sm">
          {rows.map((r, i) => {
            const Device = r.device === "mobile" ? Smartphone : r.device === "tablet" ? Tablet : Monitor;
            const text = detail(r);
            return (
              <li key={`${r.ts}-${i}`} className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg px-2 py-1.5 hover:bg-creme/70">
                <span className="w-16 shrink-0 text-xs text-tinta-suave tabular-nums">{fmtTime(r.ts)}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", BADGE[r.name] ?? "bg-creme text-tinta")}>
                  {labelEvent(r.name)}
                </span>
                <span className="min-w-0 flex-1 truncate text-tinta" title={text}>
                  {text || labelPage(r.path)}
                </span>
                <span className="hidden items-center gap-2 text-xs text-tinta-suave sm:inline-flex">
                  <span>{labelChannel(r.channel)}</span>
                  <Device aria-hidden className="size-3.5" />
                  {r.city ? (
                    <span className="inline-flex items-center gap-0.5">
                      <MapPin aria-hidden className="size-3" />
                      {r.city}
                    </span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
