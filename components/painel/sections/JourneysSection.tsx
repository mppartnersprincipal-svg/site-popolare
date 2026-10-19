import Link from "next/link";
import { ChevronRight, ClipboardList, MapPin, MessageCircle, Monitor, Phone, Smartphone, Sparkles, Tablet } from "lucide-react";
import { getJourneys, withParams, type Range, type SearchParams } from "@/lib/painel/queries";
import { fmtDateTime, fmtDuration, fmtTime, labelChannel, type JourneyRow } from "@/lib/painel/types";
import { genericClicks, summarizeTrail, type JourneyStep } from "@/lib/painel/journey";
import { ChartCard } from "../ChartCard";
import { EmptyState } from "../EmptyState";
import { cn } from "@/lib/cn";

const JOURNEY_LIMIT = 60;

const STEP_STYLE: Record<JourneyStep["kind"], string> = {
  page: "bg-creme text-tinta",
  whatsapp: "bg-manjericao text-farinha",
  phone: "bg-primaria text-farinha",
  order: "bg-primaria text-farinha",
  maps: "bg-dourado/25 text-tinta",
  interest: "bg-massa/60 text-tinta",
};

const STEP_ICON: Partial<Record<JourneyStep["kind"], typeof MessageCircle>> = {
  whatsapp: MessageCircle,
  phone: Phone,
  order: ClipboardList,
  maps: MapPin,
  interest: Sparkles,
};

function DeviceIcon({ device }: { device: string | null }) {
  const Icon = device === "mobile" ? Smartphone : device === "tablet" ? Tablet : Monitor;
  return <Icon aria-hidden className="size-3.5" />;
}

function originLine(j: JourneyRow) {
  const parts = [labelChannel(j.channel)];
  if (j.utm_campaign) parts.push(`campanha ${j.utm_campaign}`);
  if (j.utm_term) parts.push(`termo "${j.utm_term}"`);
  if (!j.utm_campaign && j.referrer_host) parts.push(j.referrer_host);
  return parts.join(" · ");
}

/** O caminho de cada visita: origem → páginas → interesses → pedido. */
export async function JourneysSection({ range, sp }: { range: Range; sp: SearchParams }) {
  const all = (Array.isArray(sp.jornadas) ? sp.jornadas[0] : sp.jornadas) === "todas";
  const rows = await getJourneys(range, !all, JOURNEY_LIMIT);

  const chip = (active: boolean) =>
    cn(
      "inline-flex min-h-8 items-center rounded-full px-3 text-xs font-semibold transition-colors",
      active ? "bg-tinta text-farinha" : "bg-creme text-tinta hover:bg-tinta/10"
    );

  return (
    <ChartCard
      id="jornadas"
      title="Jornadas — o caminho de cada visita"
      description="De onde veio, o que viu, o que escolheu e onde pediu"
      action={
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <Link href={withParams(sp, { jornadas: null })} className={chip(!all)} scroll={false}>
            Só quem pediu
          </Link>
          <Link href={withParams(sp, { jornadas: "todas" })} className={chip(all)} scroll={false}>
            Todas as visitas
          </Link>
        </div>
      }
    >
      {!rows.length ? (
        <EmptyState
          compact
          title={all ? "Nenhuma visita no período" : "Ninguém pediu pelo WhatsApp, telefone ou encomenda no período"}
          hint={all ? "" : "Veja “Todas as visitas” para acompanhar quem navegou sem pedir."}
        />
      ) : (
        <ol className="divide-y divide-tinta/10">
          {rows.map((j) => {
            const steps = summarizeTrail(j.trail);
            const clicks = genericClicks(j.trail);
            const duration = new Date(j.last_seen_at).getTime() - new Date(j.started_at).getTime();
            return (
              <li key={j.id} className="py-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-tinta-suave">
                  <span className="font-semibold text-tinta">{fmtDateTime(j.started_at)}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 font-semibold",
                      j.channel === "google_ads" ? "bg-primaria/10 text-vinho" : "bg-creme text-tinta"
                    )}
                  >
                    {originLine(j)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <DeviceIcon device={j.device} />
                    {[j.browser, j.os].filter(Boolean).join(" · ")}
                  </span>
                  {j.city || j.region ? (
                    <span className="inline-flex items-center gap-1">
                      <MapPin aria-hidden className="size-3.5" />
                      {[j.city, j.region].filter(Boolean).join(" - ")}
                    </span>
                  ) : null}
                  <span>{fmtDuration(duration)} no site</span>
                  {j.is_returning ? <span className="rounded-full bg-tinta/5 px-2 py-0.5 font-semibold text-tinta">já visitou antes</span> : null}
                </div>

                <ol className="mt-2 flex flex-wrap items-center gap-1.5">
                  {steps.map((s, i) => {
                    const Icon = STEP_ICON[s.kind];
                    return (
                      <li key={i} className="flex items-center gap-1.5">
                        {i > 0 ? <ChevronRight aria-hidden className="size-3.5 text-tinta-suave/60" /> : null}
                        <span
                          className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", STEP_STYLE[s.kind])}
                          title={fmtTime(s.ts)}
                        >
                          {Icon ? <Icon aria-hidden className="size-3" /> : null}
                          {s.label}
                          {s.detail ? <span className="font-normal opacity-80">({s.detail})</span> : null}
                        </span>
                      </li>
                    );
                  })}
                </ol>

                {clicks.length ? (
                  <details className="mt-2 text-xs">
                    <summary className="cursor-pointer text-tinta-suave hover:text-tinta">
                      {clicks.length} {clicks.length === 1 ? "clique" : "cliques"} em botões e links
                    </summary>
                    <ul className="mt-1.5 space-y-0.5 pl-3 text-tinta">
                      {clicks.map((c, i) => (
                        <li key={i}>
                          <span className="text-tinta-suave tabular-nums">{fmtTime(c.ts)}</span> · {c.label}{" "}
                          <span className="text-tinta-suave">em {c.page}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </ChartCard>
  );
}
