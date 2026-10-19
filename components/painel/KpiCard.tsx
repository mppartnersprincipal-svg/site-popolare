"use client";

import { useEffect, useRef, useState } from "react";
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { fmtDuration, fmtInt, fmtPct } from "@/lib/painel/types";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "./useReducedMotion";

export type KpiFormat = "int" | "pct" | "duration";
export type KpiAccent = "tinta" | "primaria" | "manjericao";

const COUNT_MS = 1100;

function format(v: number, f: KpiFormat) {
  if (f === "pct") return fmtPct(v);
  if (f === "duration") return fmtDuration(v);
  return fmtInt(v);
}

const ACCENTS: Record<KpiAccent, string> = {
  tinta: "bg-tinta/5 text-tinta",
  primaria: "bg-primaria/10 text-primaria",
  manjericao: "bg-manjericao/10 text-manjericao",
};

/** KPI com contagem animada (só ao entrar na tela) e variação vs. período anterior. */
export function KpiCard({
  label,
  value,
  previous,
  format: fmt = "int",
  icon: Icon,
  accent = "tinta",
}: {
  label: string;
  value: number;
  previous?: number | null;
  format?: KpiFormat;
  icon: LucideIcon;
  accent?: KpiAccent;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [animated, setAnimated] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion || value === 0) return;
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / COUNT_MS);
          const eased = 1 - Math.pow(1 - t, 3);
          setAnimated(t < 1 ? value * eased : null);
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { rootMargin: "-20px" }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, reduceMotion]);

  const shown = animated ?? value;
  let delta: number | null = null;
  if (previous != null && previous > 0) delta = ((value - previous) / previous) * 100;
  else if (previous === 0 && value > 0) delta = 100;

  return (
    <div
      ref={ref}
      className="flex h-full flex-col gap-3 rounded-2xl border border-tinta/10 bg-white p-5 transition-shadow hover:shadow-[0_8px_24px_rgba(42,10,12,0.06)]"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-tinta-suave">{label}</p>
        <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-full", ACCENTS[accent])}>
          <Icon aria-hidden className="size-4" />
        </span>
      </div>
      <p className="text-3xl font-bold tracking-tight text-tinta tabular-nums">
        {format(fmt === "pct" ? Math.round(shown * 10) / 10 : Math.round(shown), fmt)}
      </p>
      <div className="flex min-h-5 items-center gap-2 text-xs">
        {delta !== null ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold",
              delta >= 0 ? "bg-manjericao/10 text-manjericao" : "bg-primaria/10 text-vinho"
            )}
          >
            {delta >= 0 ? <TrendingUp aria-hidden className="size-3" /> : <TrendingDown aria-hidden className="size-3" />}
            {delta >= 0 ? "+" : ""}
            {delta.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}%
          </span>
        ) : null}
        <span className="text-tinta-suave">{delta !== null ? "vs. período anterior" : ""}</span>
      </div>
    </div>
  );
}
