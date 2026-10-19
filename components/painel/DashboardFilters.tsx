"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, Loader2 } from "lucide-react";
import { CHANNEL_LABELS, CHANNEL_ORDER } from "@/lib/painel/types";
import type { Period } from "@/lib/painel/queries";
import { cn } from "@/lib/cn";

const PERIODS: Array<{ id: Period; label: string }> = [
  { id: "hoje", label: "Hoje" },
  { id: "7d", label: "7 dias" },
  { id: "30d", label: "30 dias" },
  { id: "90d", label: "90 dias" },
  { id: "custom", label: "Personalizado" },
];

/** Período e origem. O estado vive na URL (?periodo=&de=&ate=&origem=), então o link é compartilhável. */
export function DashboardFilters({
  period,
  channel,
  de,
  ate,
}: {
  period: Period;
  channel: string | null;
  de?: string;
  ate?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [customFrom, setCustomFrom] = useState(de ?? "");
  const [customTo, setCustomTo] = useState(ate ?? "");
  const [showCustom, setShowCustom] = useState(period === "custom");

  function navigate(next: { periodo?: Period; origem?: string | null; de?: string; ate?: string }) {
    const p = new URLSearchParams();
    const periodo = next.periodo ?? period;
    const origem = next.origem === undefined ? channel : next.origem;
    if (periodo !== "30d") p.set("periodo", periodo);
    if (periodo === "custom") {
      const f = next.de ?? customFrom;
      const t = next.ate ?? customTo;
      if (!f || !t) return;
      p.set("de", f);
      p.set("ate", t);
    }
    if (origem) p.set("origem", origem);
    const qs = p.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  const input = "min-h-9 rounded-full border border-tinta/15 bg-white px-3 text-sm text-tinta";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-tinta/10 bg-white p-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div role="group" aria-label="Período" className="flex flex-wrap gap-1.5">
        {PERIODS.map((p) => {
          const active = p.id === period;
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={active}
              onClick={() => {
                if (p.id === "custom") {
                  setShowCustom(true);
                  if (customFrom && customTo) navigate({ periodo: "custom" });
                  return;
                }
                setShowCustom(false);
                navigate({ periodo: p.id });
              }}
              className={cn(
                "inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors",
                active ? "bg-tinta text-farinha" : "bg-creme text-tinta hover:bg-tinta/10"
              )}
            >
              {p.id === "custom" ? <CalendarDays aria-hidden className="size-3.5" /> : null}
              {p.label}
            </button>
          );
        })}
      </div>

      {showCustom ? (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ periodo: "custom", de: customFrom, ate: customTo });
          }}
        >
          <label className="sr-only" htmlFor="painel-de">
            De
          </label>
          <input id="painel-de" type="date" required value={customFrom} max={customTo || undefined} onChange={(e) => setCustomFrom(e.target.value)} className={input} />
          <span className="text-sm text-tinta-suave">até</span>
          <label className="sr-only" htmlFor="painel-ate">
            Até
          </label>
          <input id="painel-ate" type="date" required value={customTo} min={customFrom || undefined} onChange={(e) => setCustomTo(e.target.value)} className={input} />
          <button type="submit" className="min-h-9 cursor-pointer rounded-full bg-primaria px-4 text-sm font-semibold text-farinha hover:bg-vinho">
            Aplicar
          </button>
        </form>
      ) : null}

      <div className="flex items-center gap-2 sm:ml-auto">
        <label htmlFor="painel-origem" className="text-sm font-semibold text-tinta">
          Origem
        </label>
        <select
          id="painel-origem"
          value={channel ?? ""}
          onChange={(e) => navigate({ origem: e.target.value || null })}
          className={cn(input, "cursor-pointer pr-8")}
        >
          <option value="">Todas as origens</option>
          {CHANNEL_ORDER.map((c) => (
            <option key={c} value={c}>
              {CHANNEL_LABELS[c]}
            </option>
          ))}
        </select>
        {pending ? <Loader2 aria-label="Atualizando" className="size-4 animate-spin text-tinta-suave" /> : null}
      </div>
    </div>
  );
}
