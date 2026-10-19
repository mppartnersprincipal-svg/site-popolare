import {
  fmtDuration,
  labelCategory,
  labelLocal,
  labelPage,
  labelPasta,
  labelProduct,
  labelUnit,
  type TrailEvent,
} from "@/lib/painel/types";

/**
 * Resume a trilha de eventos de uma sessão em passos legíveis:
 * "LP · Massas em Goiânia (48 s)" → "Filtrou: Massas para assar" → "WhatsApp · Setor Sul (Sfogliatti branco)".
 */
export type JourneyStep = {
  kind: "page" | "whatsapp" | "phone" | "maps" | "order" | "interest";
  label: string;
  detail?: string;
  ts: string;
};

function joinDetail(...parts: Array<string | null | undefined | false>) {
  return parts.filter(Boolean).join(" · ") || undefined;
}

function contactStep(e: TrailEvent): JourneyStep | null {
  const p = e.params ?? {};
  const unit = p.unidade ? labelUnit(String(p.unidade)) : null;
  const where = p.local ? labelLocal(String(p.local)) : null;
  switch (e.name) {
    case "click_whatsapp":
      return {
        kind: "whatsapp",
        label: joinDetail("WhatsApp", unit) ?? "WhatsApp",
        detail: joinDetail(p.produto ? labelProduct(String(p.produto)) : null, where),
        ts: e.ts,
      };
    case "click_phone":
      return { kind: "phone", label: joinDetail("Ligou", unit) ?? "Ligou", detail: where ?? undefined, ts: e.ts };
    case "click_directions":
      return { kind: "maps", label: joinDetail("Rota", unit) ?? "Rota", detail: where ?? undefined, ts: e.ts };
    case "form_submit":
      return { kind: "order", label: joinDetail("Encomenda", unit) ?? "Encomenda", ts: e.ts };
    default:
      return null;
  }
}

function interestStep(e: TrailEvent): JourneyStep | null {
  const p = e.params ?? {};
  if (e.name === "intro_pasta_select") return { kind: "interest", label: `Escolheu ${labelPasta(String(p.massa ?? ""))}`, ts: e.ts };
  if (e.name === "catalog_filter") return { kind: "interest", label: `Filtrou: ${labelCategory(String(p.categoria ?? ""))}`, ts: e.ts };
  return null;
}

export function summarizeTrail(trail: TrailEvent[]): JourneyStep[] {
  const steps: JourneyStep[] = [];
  let lastPage: JourneyStep | null = null;

  for (const e of trail) {
    if (e.name === "page_view") {
      lastPage = { kind: "page", label: labelPage(e.path, e.title), ts: e.ts };
      steps.push(lastPage);
      continue;
    }
    if (e.name === "page_leave") {
      const target = lastPage && !lastPage.detail ? lastPage : findPage(steps, e.path);
      if (target && e.params?.duration_ms != null) target.detail = fmtDuration(Number(e.params.duration_ms));
      continue;
    }
    const step = contactStep(e) ?? interestStep(e);
    if (step) steps.push(step);
  }
  return steps;
}

function findPage(steps: JourneyStep[], path: string) {
  const label = labelPage(path);
  for (let i = steps.length - 1; i >= 0; i--) {
    if (steps[i].kind === "page" && !steps[i].detail && steps[i].label === label) return steps[i];
  }
  return null;
}

/** Cliques genéricos (botões e links), para a visão expandida. */
export function genericClicks(trail: TrailEvent[]) {
  return trail
    .filter((e) => e.name === "click")
    .map((e) => ({
      ts: e.ts,
      label: String(e.params?.text ?? e.params?.track ?? e.params?.href ?? "clique"),
      page: labelPage(e.path, e.title),
    }));
}
