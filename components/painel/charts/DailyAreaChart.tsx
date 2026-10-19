"use client";

import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmtDay, fmtInt, type DailyRow } from "@/lib/painel/types";
import { useReducedMotion } from "../useReducedMotion";
import { CHART, TOOLTIP_STYLE } from "./chartTheme";

const MANY_DAYS = 45;

/** Visitas por dia (área) + pedidos (linha verde, eixo da direita). */
export function DailyAreaChart({ data }: { data: DailyRow[] }) {
  const reduceMotion = useReducedMotion();
  const rows = data.map((d) => ({ ...d, label: fmtDay(d.day) }));
  const many = rows.length > MANY_DAYS;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="painel-visitas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART.primaria} stopOpacity={0.22} />
              <stop offset="100%" stopColor={CHART.primaria} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={CHART.linha} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: CHART.suave }}
            tickLine={false}
            axisLine={false}
            interval={many ? Math.ceil(rows.length / 10) : "preserveStartEnd"}
            minTickGap={16}
          />
          <YAxis yAxisId="left" allowDecimals={false} tick={{ fontSize: 11, fill: CHART.suave }} tickLine={false} axisLine={false} />
          <YAxis
            yAxisId="right"
            orientation="right"
            allowDecimals={false}
            tick={{ fontSize: 11, fill: CHART.manjericao }}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <Tooltip {...TOOLTIP_STYLE} formatter={(value, name) => [fmtInt(Number(value)), String(name)]} />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="sessions"
            name="Visitas"
            stroke={CHART.primaria}
            strokeWidth={2}
            fill="url(#painel-visitas)"
            isAnimationActive={!reduceMotion}
            animationDuration={900}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="wa_clicks"
            name="Pedidos (WhatsApp, telefone, encomenda)"
            stroke={CHART.manjericao}
            strokeWidth={2.5}
            dot={rows.length <= 31 ? { r: 3, strokeWidth: 0, fill: CHART.manjericao } : false}
            isAnimationActive={!reduceMotion}
            animationDuration={900}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
