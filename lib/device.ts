"use client";

import { useSyncExternalStore } from "react";

interface NavigatorHints extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
}

const MIN_MEMORY_GB = 4;
const SLOW_CONNECTIONS = new Set(["slow-2g", "2g", "3g"]);

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Modo leve: sem 3D contínuo, sem scrub de quadros — usa imagens estáticas e transições simples.
 * Ativado por reduced-motion, pouca memória, economia de dados ou conexão lenta.
 */
export function isLiteMode(): boolean {
  if (typeof window === "undefined") return true;
  const nav = navigator as NavigatorHints;
  const lowMemory = nav.deviceMemory !== undefined && nav.deviceMemory < MIN_MEMORY_GB;
  const saveData = nav.connection?.saveData === true;
  const slow = SLOW_CONNECTIONS.has(nav.connection?.effectiveType ?? "");
  return prefersReducedMotion() || lowMemory || saveData || slow;
}

export function isCoarsePointer(): boolean {
  return window.matchMedia("(pointer: coarse)").matches;
}

const subscribeNoop = () => () => {};

/** null durante SSR/hidratação; depois, o valor real no cliente */
export function useLiteMode(): boolean | null {
  return useSyncExternalStore(
    subscribeNoop,
    () => isLiteMode(),
    () => null
  );
}
