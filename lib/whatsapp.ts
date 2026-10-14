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

export function productMessage(item: Pick<MenuItem, "nameIt" | "namePt" | "size">): string {
  const nome = item.nameIt === item.namePt ? item.nameIt : `${item.nameIt} (${item.namePt})`;
  return `Olá, Popolare! Vim pelo site e quero pedir: ${nome} (${item.size}). Está disponível? Qual o valor?`;
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
