"use client";

import { ClipboardList, Clock, Eye, MessageCircle, Phone, Target, Timer, Users } from "lucide-react";
import type { KpisRow } from "@/lib/painel/types";
import { KpiCard, type KpiAccent, type KpiFormat } from "./KpiCard";

// Client component porque passa ícones (funções) ao KpiCard — RSC não serializa funções
export function KpiGrid({ kpis, previous }: { kpis: KpisRow; previous?: KpisRow | null }) {
  const cards: Array<{ label: string; key: keyof KpisRow; icon: typeof Users; format: KpiFormat; accent: KpiAccent }> = [
    { label: "Visitas (sessões)", key: "sessions", icon: Users, format: "int", accent: "tinta" },
    { label: "Páginas vistas", key: "page_views", icon: Eye, format: "int", accent: "tinta" },
    { label: "Tempo médio por visita", key: "avg_session_ms", icon: Clock, format: "duration", accent: "tinta" },
    { label: "Tempo médio por página", key: "avg_page_ms", icon: Timer, format: "duration", accent: "tinta" },
    { label: "Cliques no WhatsApp", key: "wa_clicks", icon: MessageCircle, format: "int", accent: "manjericao" },
    { label: "Cliques no telefone", key: "phone_clicks", icon: Phone, format: "int", accent: "primaria" },
    { label: "Encomendas enviadas", key: "orders", icon: ClipboardList, format: "int", accent: "primaria" },
    { label: "Conversão (visitas → pedido)", key: "conv_rate", icon: Target, format: "pct", accent: "primaria" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <KpiCard
          key={c.key}
          label={c.label}
          value={Number(kpis[c.key] ?? 0)}
          previous={previous ? Number(previous[c.key] ?? 0) : null}
          icon={c.icon}
          format={c.format}
          accent={c.accent}
        />
      ))}
    </div>
  );
}
