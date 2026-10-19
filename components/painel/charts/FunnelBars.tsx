import { fmtInt } from "@/lib/painel/types";
import { EmptyState } from "../EmptyState";
import { CHART } from "./chartTheme";

const COLORS = [CHART.tinta, CHART.primariaSuave, CHART.manjericao];

/** Funil em barras decrescentes, com % do topo e taxa entre etapas. */
export function FunnelBars({ steps }: { steps: Array<{ label: string; value: number }> }) {
  const top = steps[0]?.value ?? 0;
  if (!top) return <EmptyState compact hint="" />;

  return (
    <ol className="space-y-4">
      {steps.map((s, i) => {
        const pct = Math.round((s.value / top) * 100);
        const prev = i > 0 ? steps[i - 1].value : null;
        const stepRate = prev ? Math.round((s.value / prev) * 100) : null;
        return (
          <li key={s.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <span className="font-semibold text-tinta">{s.label}</span>
              <span className="text-tinta-suave tabular-nums">
                <span className="font-bold text-tinta">{fmtInt(s.value)}</span> · {pct}%
                {stepRate !== null ? <span className="ml-1 text-xs">({stepRate}% da etapa anterior)</span> : null}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-creme">
              <div className="h-full rounded-full" style={{ width: `${Math.max(pct, 1)}%`, background: COLORS[i % COLORS.length] }} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
