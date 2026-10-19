/**
 * Paleta dos gráficos do painel — hex dos tokens da Popolare (globals.css).
 * O Recharts recebe cor por prop, por isso os valores ficam aqui e não em var(--…).
 */
export const CHART = {
  tinta: "#2a0a0c",
  primaria: "#9b1b20",
  primariaSuave: "#e3a3a6",
  vinho: "#590e13",
  manjericao: "#3f6b2a",
  dourado: "#eeab3a",
  madeira: "#b9802f",
  tomate: "#c8321e",
  suave: "#5b4340",
  linha: "#eadfd0",
  creme: "#f6eee3",
  azul: "#3b6ea5",
} as const;

/** Sequência categórica (donuts/barras com várias séries). */
export const CATEGORICAL = [
  CHART.primaria,
  CHART.manjericao,
  CHART.dourado,
  CHART.tinta,
  CHART.azul,
  CHART.madeira,
  CHART.tomate,
  CHART.suave,
];

/** Cores fixas por origem, iguais em todo o painel. */
export const CHANNEL_COLORS: Record<string, string> = {
  google_ads: CHART.primaria,
  google_organic: CHART.manjericao,
  other_search: CHART.azul,
  social: CHART.dourado,
  referral: CHART.madeira,
  direct: CHART.suave,
};

export const DEVICE_COLORS: Record<string, string> = {
  mobile: CHART.primaria,
  desktop: CHART.tinta,
  tablet: CHART.dourado,
  desconhecido: CHART.suave,
};

export const TOOLTIP_STYLE = {
  contentStyle: {
    borderRadius: 12,
    border: `1px solid ${CHART.linha}`,
    boxShadow: "0 8px 24px rgba(42,10,12,0.08)",
    fontSize: 13,
    fontFamily: "var(--font-manrope)",
  },
  labelStyle: { color: CHART.tinta, fontWeight: 600 },
  itemStyle: { color: CHART.tinta },
};
