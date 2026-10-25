import { ClipboardList, MapPin, MessageCircle, Phone, Truck } from "lucide-react";
import { getButtons, type Range } from "@/lib/painel/queries";
import {
  BUTTON_LABELS,
  CHANNEL_ORDER,
  fmtInt,
  labelChannel,
  labelLocal,
  labelUnit,
  type ButtonKind,
  type ButtonRow,
} from "@/lib/painel/types";
import { ChartCard } from "../ChartCard";
import { DataTable, InlineBar } from "../DataTable";
import { EmptyState } from "../EmptyState";
import { cn } from "@/lib/cn";

const ICONS: Record<ButtonKind, typeof Phone> = {
  click_whatsapp: MessageCircle,
  click_phone: Phone,
  click_directions: MapPin,
  click_delivery: Truck,
  form_submit: ClipboardList,
};

interface Pivot {
  name: string;
  total: number;
  cells: Record<string, number>;
}

function buttonName(r: ButtonRow) {
  return r.unidade ? `${BUTTON_LABELS[r.kind]} · ${labelUnit(r.unidade)}` : BUTTON_LABELS[r.kind];
}

function pivot(rows: ButtonRow[], colKey: (r: ButtonRow) => string) {
  const map = new Map<string, Pivot>();
  const cols = new Set<string>();
  for (const r of rows) {
    const name = buttonName(r);
    const col = colKey(r) || "—";
    cols.add(col);
    const p = map.get(name) ?? { name, total: 0, cells: {} };
    map.set(name, { ...p, total: p.total + r.clicks, cells: { ...p.cells, [col]: (p.cells[col] ?? 0) + r.clicks } });
  }
  return { rows: [...map.values()].sort((a, b) => b.total - a.total), cols: [...cols] };
}

function PivotTable({ title, data, colLabel }: { title: string; data: ReturnType<typeof pivot>; colLabel: (c: string) => string }) {
  if (!data.rows.length) return null;
  const max = Math.max(...data.rows.map((r) => r.total));
  return (
    <div className="min-w-0">
      <h3 className="mb-2 text-sm font-bold text-tinta">{title}</h3>
      <DataTable
        dense
        rows={data.rows}
        rowKey={(r) => r.name}
        columns={[
          {
            key: "name",
            header: "Botão",
            render: (r) => (
              <div className="min-w-44">
                <p className="font-semibold text-tinta">{r.name}</p>
                <InlineBar value={r.total} max={max} color="bg-manjericao" />
              </div>
            ),
          },
          { key: "total", header: "Total", align: "right", render: (r) => <span className="font-bold">{fmtInt(r.total)}</span> },
          ...data.cols.map((c) => ({
            key: c,
            header: colLabel(c),
            align: "right" as const,
            render: (r: Pivot) => (r.cells[c] ? fmtInt(r.cells[c]) : <span className="text-tinta-suave/50">–</span>),
          })),
        ]}
      />
    </div>
  );
}

/** Pedidos: WhatsApp, telefone, rota e encomenda — por unidade, origem da visita e onde o botão estava. */
export async function ButtonsSection({ range }: { range: Range }) {
  const rows = await getButtons(range);

  // Pago = visita que chegou por anúncio (Google Ads); orgânico = todo o resto (busca, direto, social, referência)
  const cards = new Map<string, { kind: ButtonKind; clicks: number; sessions: number; paid: number; organic: number }>();
  for (const r of rows) {
    const k = buttonName(r);
    const c = cards.get(k) ?? { kind: r.kind, clicks: 0, sessions: 0, paid: 0, organic: 0 };
    const isPaid = r.channel === "google_ads";
    cards.set(k, {
      ...c,
      clicks: c.clicks + r.clicks,
      sessions: c.sessions + r.sessions,
      paid: c.paid + (isPaid ? r.clicks : 0),
      organic: c.organic + (isPaid ? 0 : r.clicks),
    });
  }
  const cardList = [...cards.entries()].sort((a, b) => b[1].clicks - a[1].clicks);
  const maxClicks = Math.max(0, ...cardList.map(([, c]) => c.clicks));

  const byChannel = pivot(rows, (r) => r.channel);
  byChannel.cols.sort((a, b) => CHANNEL_ORDER.indexOf(a as never) - CHANNEL_ORDER.indexOf(b as never));
  const byLocal = pivot(rows, (r) => r.local ?? "");

  return (
    <ChartCard id="botoes" title="Pedidos e contatos" description="Cada clique em WhatsApp, telefone, rota e encomenda — pago (veio de anúncio) ou orgânico (busca, direto, social)">
      {!rows.length ? (
        <EmptyState compact title="Nenhum pedido ou contato no período" hint="" />
      ) : (
        <div className="space-y-8">
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            {cardList.map(([name, c], i) => {
              const Icon = ICONS[c.kind];
              return (
                <li key={name}>
                  <div
                    className={cn(
                      "flex h-full flex-col gap-2 rounded-2xl border p-4",
                      i === 0 ? "border-manjericao/40 bg-manjericao/5" : "border-tinta/10 bg-creme/60"
                    )}
                  >
                    <div className={cn("flex items-center gap-2", c.kind === "click_whatsapp" ? "text-manjericao" : "text-primaria")}>
                      <Icon aria-hidden className="size-4" />
                      <span className="text-xs font-semibold tracking-wide text-tinta-suave uppercase">{BUTTON_LABELS[c.kind]}</span>
                    </div>
                    <p className="text-sm leading-snug font-semibold text-tinta">{name.replace(`${BUTTON_LABELS[c.kind]} · `, "")}</p>
                    <p className="text-3xl font-bold text-tinta tabular-nums">{fmtInt(c.clicks)}</p>
                    <p className="text-xs text-tinta-suave">
                      {fmtInt(c.sessions)} {c.sessions === 1 ? "visita" : "visitas"}
                    </p>
                    <ul className="flex flex-wrap gap-1.5" aria-label="Origem dos cliques">
                      <li
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[0.68rem] font-semibold tabular-nums",
                          c.paid ? "bg-primaria/10 text-primaria" : "bg-tinta/5 text-tinta-suave/60"
                        )}
                      >
                        Pago {fmtInt(c.paid)}
                      </li>
                      <li
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[0.68rem] font-semibold tabular-nums",
                          c.organic ? "bg-manjericao/10 text-manjericao" : "bg-tinta/5 text-tinta-suave/60"
                        )}
                      >
                        Orgânico {fmtInt(c.organic)}
                      </li>
                    </ul>
                    <InlineBar value={c.clicks} max={maxClicks} color="bg-manjericao" />
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="grid gap-6 xl:grid-cols-2">
            <PivotTable title="Botão × origem da visita" data={byChannel} colLabel={labelChannel} />
            <PivotTable title="Botão × onde foi clicado" data={byLocal} colLabel={labelLocal} />
          </div>
        </div>
      )}
    </ChartCard>
  );
}
