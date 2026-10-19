import { getHeatmap, type Range } from "@/lib/painel/queries";
import { fmtInt } from "@/lib/painel/types";
import { ChartCard } from "../ChartCard";
import { EmptyState } from "../EmptyState";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const HOURS = 24;
const MIN_SHADE = 12;

/** Dia da semana × hora (horário de Brasília) — ajuda a programar anúncios e atendimento. */
export async function HeatmapSection({ range }: { range: Range }) {
  const rows = await getHeatmap(range);
  const grid = new Map(rows.map((r) => [`${r.dow}-${r.hour}`, r.sessions]));
  const max = Math.max(0, ...rows.map((r) => r.sessions));
  const byHour = Array.from({ length: HOURS }, (_, h) => rows.filter((r) => r.hour === h).reduce((s, r) => s + r.sessions, 0));
  const byDay = DAYS.map((_, d) => rows.filter((r) => r.dow === d).reduce((s, r) => s + r.sessions, 0));
  const bestHour = byHour.indexOf(Math.max(...byHour));
  const bestDay = byDay.indexOf(Math.max(...byDay));
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <ChartCard
      id="horarios"
      title="Horários de visita"
      description={max ? `Pico: ${DAYS[bestDay]} · ${pad(bestHour)}h–${pad(bestHour + 1)}h (horário de Brasília)` : "Dia da semana × hora (horário de Brasília)"}
      className="h-full"
    >
      {!max ? (
        <EmptyState compact hint="" />
      ) : (
        <div className="overflow-x-auto">
          <div className="grid min-w-[560px] grid-cols-[2.5rem_repeat(24,minmax(0,1fr))] gap-0.5 text-[10px] text-tinta-suave">
            <div />
            {Array.from({ length: HOURS }, (_, h) => (
              <div key={h} className="pb-1 text-center tabular-nums">
                {h % 3 === 0 ? `${h}h` : ""}
              </div>
            ))}
            {DAYS.map((d, di) => (
              <div key={d} className="contents">
                <div className="pr-1 text-right leading-5 font-semibold text-tinta">{d}</div>
                {Array.from({ length: HOURS }, (_, h) => {
                  const v = grid.get(`${di}-${h}`) ?? 0;
                  const pct = Math.round((v / max) * 100);
                  return (
                    <div
                      key={h}
                      title={`${d} ${h}h–${h + 1}h: ${fmtInt(v)} ${v === 1 ? "visita" : "visitas"}`}
                      className="h-5 rounded-sm"
                      style={{
                        background: v
                          ? `color-mix(in oklab, var(--cor-primaria) ${Math.max(MIN_SHADE, pct)}%, var(--cor-creme))`
                          : "var(--cor-creme)",
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-tinta-suave">Quanto mais forte o marsala, mais visitas naquele horário.</p>
        </div>
      )}
    </ChartCard>
  );
}
