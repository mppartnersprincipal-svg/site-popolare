// Fonte única de NAP (nome, endereço, telefone), horários e redes.
// Usada pela UI, JSON-LD, llms.txt e mensagens de WhatsApp.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://loja.popolare.com.br").replace(/\/+$/, "");

export const BRAND = {
  name: "Popolare Massas e Empório",
  shortName: "Popolare",
  legalTagline: "Massas italianas artesanais em Goiânia",
  slogan: "Sabor artesanal, tradição de família",
  // TODO(cliente): o texto do site diz 1992, o cardápio 2026 diz "Dal 1994"
  foundingYear: 1994,
  founders: ["Remo Popolare", "Antonietta Popolare"],
  owner: "Carina Popolare",
  city: "Goiânia",
  state: "GO",
} as const;

export interface OpeningHours {
  days: string;
  /** Dias no formato Schema.org (Monday, Tuesday...) */
  schemaDays: readonly string[];
  opens: string;
  closes: string;
}

export interface StoreUnit {
  id: "setor-sul";
  name: string;
  street: string;
  neighborhood: string;
  postalCode?: string;
  phones: readonly string[];
  /** Somente dígitos com DDI, para wa.me */
  whatsapp: string;
  whatsappDisplay: string;
  geo: { lat: number; lng: number };
  /** Só publica as coordenadas no JSON-LD depois de conferidas no Google Business Profile */
  geoVerified: boolean;
  hours: readonly OpeningHours[] | null;
  mapsUrl: string;
  isMain: boolean;
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

function directionsUrl(destination: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

export const UNITS: readonly StoreUnit[] = [
  {
    id: "setor-sul",
    name: "Popolare Setor Sul",
    street: "Rua 88, 402",
    neighborhood: "Setor Sul",
    postalCode: "74085-010",
    phones: ["(62) 3225-7858", "(62) 3945-6633"],
    whatsapp: "556239456633",
    whatsappDisplay: "(62) 3945-6633",
    // Coordenadas aproximadas da Rua 88 — confirmar com o Google Business Profile
    geo: { lat: -16.6928, lng: -49.2556 },
    geoVerified: false,
    hours: [
      { days: "Segunda a sexta", schemaDays: WEEKDAYS, opens: "09:00", closes: "19:00" },
      { days: "Sábado", schemaDays: ["Saturday"], opens: "09:00", closes: "15:00" },
    ],
    mapsUrl: directionsUrl("Popolare Massas e Empório, Rua 88, 402, Setor Sul, Goiânia - GO, 74085-010"),
    isMain: true,
  },
  // A unidade Eldorado (Rua das Orquídeas, 1864) foi fechada — removida em 19/10/2026
];

export const MAIN_UNIT = UNITS.find((u) => u.isMain) ?? UNITS[0];

export const SOCIAL = {
  // Confirmado pelo cliente (out/2026)
  instagram: "https://www.instagram.com/popolaremassas/",
  instagramVerified: true,
  facebook: "https://www.facebook.com/popolaremassaseemporio",
} as const;

export const DELIVERY = [
  { name: "Pedido online (Menudino)", url: "https://popolare.menudino.com" },
  { name: "Anota AI", url: "https://pedido.anota.ai/loja/popolare-massas-e-emporio" },
] as const;

export const ORDER_RULES = {
  minBusinessDays: 2,
  note: "Montamos a massa de assar no seu refratário, sob encomenda. Pedidos com antecedência mínima de 2 dias úteis.",
} as const;

export function formatAddress(unit: StoreUnit): string {
  const cep = unit.postalCode ? `, CEP ${unit.postalCode}` : "";
  return `${unit.street}, ${unit.neighborhood}, ${BRAND.city} - ${BRAND.state}${cep}`;
}
