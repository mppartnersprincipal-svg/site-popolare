"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmtInt } from "@/lib/painel/types";
import { useReducedMotion } from "../useReducedMotion";
import { EmptyState } from "../EmptyState";
import { CHART, TOOLTIP_STYLE } from "./chartTheme";

export interface BarDatum {
  name: string;
  value: number;
  color?: string;
}

const ROW_PX = 34;
const LABEL_MAX = 26;

/** Barras horizontais ordenadas (ranking). */
export function HorizontalBars({
  data,
  color = CHART.primaria,
  valueLabel = "Total",
  maxItems = 10,
}: {
  data: BarDatum[];
  color?: string;
  valueLabel?: string;
  maxItems?: number;
}) {
  const reduceMotion = useReducedMotion();
  const rows = data.filter((d) => d.value > 0).slice(0, maxItems);
  if (!rows.length) return <EmptyState compact hint="" />;

  return (
    <div style={{ height: Math.max(160, rows.length * ROW_PX + 16) }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 48, left: 0, bottom: 0 }} barCategoryGap={8}>
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={170}
            tick={{ fontSize: 12, fill: CHART.tinta }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: string) => (v.length > LABEL_MAX ? v.slice(0, LABEL_MAX - 1) + "…" : v)}
          />
          <Tooltip {...TOOLTIP_STYLE} cursor={{ fill: CHART.creme }} formatter={(value) => [fmtInt(Number(value)), valueLabel]} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} isAnimationActive={!reduceMotion} animationDuration={800}>
            {rows.map((d) => (
              <Cell key={d.name} fill={d.color ?? color} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              formatter={(v: unknown) => fmtInt(Number(v))}
              style={{ fontSize: 12, fill: CHART.suave, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
