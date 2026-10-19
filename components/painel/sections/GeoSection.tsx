import { getGeo, type Range } from "@/lib/painel/queries";
import { fmtInt } from "@/lib/painel/types";
import { ChartCard } from "../ChartCard";
import { DataTable, InlineBar } from "../DataTable";
import { EmptyState } from "../EmptyState";

const UF: Record<string, string> = {
  GO: "Goiás", DF: "Distrito Federal", SP: "São Paulo", RJ: "Rio de Janeiro", MG: "Minas Gerais",
  PR: "Paraná", SC: "Santa Catarina", RS: "Rio Grande do Sul", BA: "Bahia", MT: "Mato Grosso",
  MS: "Mato Grosso do Sul", TO: "Tocantins", ES: "Espírito Santo", PE: "Pernambuco", CE: "Ceará",
  PA: "Pará", AM: "Amazonas", MA: "Maranhão", PB: "Paraíba", RN: "Rio Grande do Norte", PI: "Piauí",
  AL: "Alagoas", SE: "Sergipe", RO: "Rondônia", AC: "Acre", AP: "Amapá", RR: "Roraima",
};

/** Estado (barras) e cidade (tabela), aproximados pela rede — sem IP guardado. */
export async function GeoSection({ range }: { range: Range }) {
  const rows = await getGeo(range, 40);
  const known = rows.filter((r) => r.city || r.region);

  const byState = new Map<string, number>();
  for (const r of rows) {
    const k = r.region ? `${UF[r.region] ?? r.region} (${r.region})` : "Não identificado";
    byState.set(k, (byState.get(k) ?? 0) + r.sessions);
  }
  const states = [...byState.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const maxCity = Math.max(0, ...known.map((r) => r.sessions));

  return (
    <ChartCard id="geo" title="De onde acessam" description="Estado e cidade aproximados pela rede do visitante (sem IP armazenado)" className="h-full">
      {!rows.length ? (
        <EmptyState compact hint="" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h3 className="mb-2 text-sm font-bold text-tinta">Por estado</h3>
            <ul className="space-y-2.5">
              {states.slice(0, 8).map((s) => (
                <li key={s.name} className="text-sm">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-tinta">{s.name}</span>
                    <span className="font-semibold text-tinta tabular-nums">{fmtInt(s.value)}</span>
                  </div>
                  <InlineBar value={s.value} max={states[0]?.value ?? 0} color="bg-primaria" />
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-3">
            <h3 className="mb-2 text-sm font-bold text-tinta">Por cidade</h3>
            {known.length ? (
              <DataTable
                dense
                minWidth={300}
                rows={known.slice(0, 15)}
                rowKey={(r) => `${r.region}-${r.city}`}
                columns={[
                  {
                    key: "city",
                    header: "Cidade",
                    render: (r) => (
                      <div className="min-w-36">
                        <p className="font-semibold text-tinta">{r.city ?? "—"}</p>
                        <p className="text-xs text-tinta-suave">{r.region ?? ""}</p>
                      </div>
                    ),
                  },
                  {
                    key: "sessions",
                    header: "Visitas",
                    align: "right",
                    render: (r) => (
                      <div className="min-w-20">
                        <span className="font-semibold">{fmtInt(r.sessions)}</span>
                        <InlineBar value={r.sessions} max={maxCity} color="bg-primaria" />
                      </div>
                    ),
                  },
                  { key: "wa", header: "WhatsApp", align: "right", render: (r) => fmtInt(r.wa_clicks) },
                ]}
              />
            ) : (
              <p className="text-sm text-tinta-suave">As cidades só aparecem em visitas reais pela Vercel.</p>
            )}
          </div>
        </div>
      )}
    </ChartCard>
  );
}
