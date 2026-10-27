import { MAIN_UNIT, UNITS, type StoreUnit } from "@/data/business";
import type { MenuItem } from "@/data/menu";

export function whatsappUrl(unit: StoreUnit, message: string): string {
  return `https://wa.me/${unit.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function unitById(id: string | undefined): StoreUnit {
  return UNITS.find((u) => u.id === id) ?? MAIN_UNIT;
}

export function generalMessage(): string {
  return "Olá, Popolare! Vim pelo site e gostaria de fazer um pedido.";
}

// LPs do Google Ads: a loja sabe pela mensagem que o cliente veio do anúncio (e de qual)

/** `produto` completa a frase: "da lasanha congelada", "do nhoque artesanal"… */
export function anuncioMessage(produto: string): string {
  return `Olá, Popolare! Vi o anúncio ${produto} e quero fazer um pedido. Pode me ajudar?`;
}

/** Pedidos que não são do cardápio (extras da LP): "quero reservar o Nhoque da Fortuna…" */
export function anuncioPedido(pedido: string): string {
  return `Olá, Popolare! Vi o anúncio e ${pedido}`;
}

/** 1ª linha do "Meu pedido" nas LPs */
export function anuncioCartIntro(produto: string): string {
  return `Olá, Popolare! Vi o anúncio ${produto} e quero fazer este pedido:`;
}

type NamedItem = Pick<MenuItem, "nameIt" | "namePt" | "size">;

function displayName(item: Pick<MenuItem, "nameIt" | "namePt">): string {
  return item.nameIt === item.namePt ? item.nameIt : `${item.nameIt} (${item.namePt})`;
}

export function productMessage(item: NamedItem): string {
  return `Olá, Popolare! Vim pelo site e quero pedir: ${displayName(item)} (${item.size}). Está disponível? Qual o valor?`;
}

export interface CartOrder {
  entries: readonly { item: NamedItem; qty: number }[];
  /** Montar as massas de assar no refratário do cliente (encomenda) */
  refratario?: boolean;
  observacoes?: string;
  /** 1ª linha da mensagem (nas LPs, anuncioCartIntro) */
  intro?: string;
}

/** Mensagem do "Meu pedido" da LP: lista com quantidades, sem preço — a loja confirma valor e disponibilidade. */
export function cartMessage(order: CartOrder, unit: StoreUnit = MAIN_UNIT): string {
  const linhas = [
    order.intro ?? "Olá, Popolare! Vim pelo site e quero fazer este pedido:",
    "",
    ...order.entries.map(({ item, qty }) => `• ${qty}× ${displayName(item)} — ${item.size}`),
    "",
    `Retirada: ${unit.name} (${unit.street})`,
  ];
  if (order.refratario) linhas.push("Montar as massas de assar no meu refratário: Sim");
  const obs = order.observacoes?.trim();
  if (obs) linhas.push(`Observações: ${obs}`);
  linhas.push("", "Pode confirmar a disponibilidade e o valor total?");
  return linhas.join("\n");
}

export interface OrderRequest {
  nome: string;
  telefone: string;
  unidade: StoreUnit["id"];
  /** yyyy-mm-dd */
  data: string;
  itens: string;
  refratario: boolean;
  observacoes?: string;
}

function formatDateBr(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

export function orderMessage(order: OrderRequest): string {
  const linhas = [
    "Olá, Popolare! Quero fazer uma encomenda pelo site:",
    "",
    `• Nome: ${order.nome}`,
    `• Telefone: ${order.telefone}`,
    `• Unidade de retirada: ${unitById(order.unidade).name}`,
    `• Data desejada: ${formatDateBr(order.data)}`,
    `• Itens: ${order.itens}`,
    `• Montar no meu refratário: ${order.refratario ? "Sim" : "Não"}`,
  ];
  if (order.observacoes?.trim()) linhas.push(`• Observações: ${order.observacoes.trim()}`);
  return linhas.join("\n");
}
