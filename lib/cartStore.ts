"use client";

import { useSyncExternalStore } from "react";
import { findItem, type MenuItem } from "@/data/menu";

/**
 * "Meu pedido" da LP: lista de produtos + quantidades que vira a mensagem do WhatsApp.
 * Sem preço (decisão do cliente) e sem pagamento — a loja confirma disponibilidade e valor.
 * Persistido em localStorage (funcional, não precisa de consentimento) para sobreviver à ida ao WhatsApp.
 */

export interface CartLine {
  id: string;
  qty: number;
}

export interface CartEntry {
  item: MenuItem;
  qty: number;
}

export interface CartState {
  lines: readonly CartLine[];
  isOpen: boolean;
}

export const MAX_QTY = 20;
export const MAX_LINES = 30;
const STORAGE_KEY = "popolare_pedido";

// ───────── funções puras (testáveis) ─────────

function clampQty(qty: number): number {
  return Math.min(MAX_QTY, Math.max(0, Math.trunc(qty)));
}

export function setLineQty(lines: readonly CartLine[], id: string, qty: number): CartLine[] {
  const next = clampQty(qty);
  const exists = lines.some((l) => l.id === id);
  if (next === 0) return lines.filter((l) => l.id !== id);
  if (exists) return lines.map((l) => (l.id === id ? { ...l, qty: next } : l));
  if (lines.length >= MAX_LINES || !findItem(id)) return [...lines];
  return [...lines, { id, qty: next }];
}

export function addToLines(lines: readonly CartLine[], id: string, qty = 1): CartLine[] {
  const current = lines.find((l) => l.id === id)?.qty ?? 0;
  return setLineQty(lines, id, current + qty);
}

export function addManyToLines(lines: readonly CartLine[], ids: readonly string[]): CartLine[] {
  return ids.reduce<CartLine[]>((acc, id) => addToLines(acc, id, 1), [...lines]);
}

export function countItems(lines: readonly CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.qty, 0);
}

export function resolveLines(lines: readonly CartLine[]): CartEntry[] {
  return lines.flatMap((l) => {
    const item = findItem(l.id);
    return item ? [{ item, qty: l.qty }] : [];
  });
}

/** Descarta ids desconhecidos, quantidades inválidas e duplicatas (dados vindos do localStorage). */
export function sanitizeLines(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const lines: CartLine[] = [];
  for (const entry of raw as Array<{ id?: unknown; qty?: unknown } | null>) {
    if (lines.length >= MAX_LINES) break;
    const id = typeof entry?.id === "string" ? entry.id : null;
    const qty = Number(entry?.qty);
    if (!id || seen.has(id) || !findItem(id) || !Number.isFinite(qty) || qty < 1) continue;
    seen.add(id);
    lines.push({ id, qty: clampQty(qty) });
  }
  return lines;
}

// ───────── persistência ─────────

function readStorage(): CartLine[] {
  try {
    return sanitizeLines(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"));
  } catch {
    return [];
  }
}

function writeStorage(lines: readonly CartLine[]): void {
  try {
    if (lines.length === 0) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // localStorage indisponível (modo privado restrito) — o pedido vive só em memória
  }
}

// ───────── store ─────────

const EMPTY: CartState = { lines: [], isOpen: false };
let state: CartState = EMPTY;
let isLoaded = false;
const listeners = new Set<() => void>();

function emit(next: CartState) {
  const linesChanged = next.lines !== state.lines;
  state = next;
  if (linesChanged) writeStorage(next.lines);
  listeners.forEach((l) => l());
}

function loadOnce() {
  if (isLoaded) return;
  isLoaded = true;
  const lines = readStorage();
  if (lines.length > 0) emit({ ...state, lines });
}

export const cartStore = {
  get: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    // A primeira inscrição acontece depois da hidratação: seguro ler o localStorage sem divergir do servidor
    loadOnce();
    return () => listeners.delete(listener);
  },
  add(id: string, qty = 1) {
    emit({ ...state, lines: addToLines(state.lines, id, qty) });
  },
  addMany(ids: readonly string[]) {
    emit({ ...state, lines: addManyToLines(state.lines, ids) });
  },
  setQty(id: string, qty: number) {
    emit({ ...state, lines: setLineQty(state.lines, id, qty) });
  },
  remove(id: string) {
    emit({ ...state, lines: setLineQty(state.lines, id, 0) });
  },
  clear() {
    emit({ ...state, lines: [] });
  },
  open() {
    emit({ ...state, isOpen: true });
  },
  close() {
    emit({ ...state, isOpen: false });
  },
  /** Só para testes */
  _reset() {
    state = EMPTY;
    isLoaded = false;
  },
};

export function useCart(): CartState {
  return useSyncExternalStore(cartStore.subscribe, cartStore.get, () => EMPTY);
}

export function useCartQty(id: string): number {
  return useSyncExternalStore(
    cartStore.subscribe,
    () => state.lines.find((l) => l.id === id)?.qty ?? 0,
    () => 0
  );
}
