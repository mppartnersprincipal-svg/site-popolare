"use client";

import { useSyncExternalStore } from "react";

export type PastaKind = "fettuccine" | "ravioli" | "cappelletti" | "sfogliatti";

export interface PastaOption {
  kind: PastaKind;
  label: string;
  hint: string;
  /** id em data/menu.ts do produto que vira destaque no hero */
  productId: string;
  /** foto usada no hero/portal */
  image: string;
  /** foto de fallback na intro (sem 3D) */
  thumb: string;
}

export const PASTA_OPTIONS: readonly PastaOption[] = [
  { kind: "fettuccine", label: "Fettuccine", hint: "fita fresca, ovos e semolina", productId: "fettuccine-bianco", image: "produtos/fettuccine-pesto", thumb: "produtos/fettuccine-pesto" },
  { kind: "ravioli", label: "Ravioli", hint: "recheio generoso, borda dentada", productId: "ravioli-verde", image: "produtos/ravioli-verde", thumb: "produtos/ravioli-tre-formaggi" },
  { kind: "cappelletti", label: "Cappelletti", hint: "chapeuzinho que pede um brodo", productId: "cappelletti-pollo", image: "produtos/cappelletti-pollo", thumb: "produtos/cappelletti-pollo" },
  { kind: "sfogliatti", label: "Sfogliatti", hint: "a trouxinha mais pedida da casa", productId: "sfogliatti-bianco", image: "produtos/sfogliatti-bianco", thumb: "produtos/sfogliatti-bianco-cru" },
];

export const DEFAULT_PASTA: PastaKind = "sfogliatti";

interface ExperienceState {
  selected: PastaKind;
  introDone: boolean;
  /** Incrementa a cada reabertura do seletor (remonta a intro do zero) */
  pickerRound: number;
}

let state: ExperienceState = { selected: DEFAULT_PASTA, introDone: false, pickerRound: 0 };
const listeners = new Set<() => void>();

function emit(next: ExperienceState) {
  state = next;
  listeners.forEach((l) => l());
}

export const experienceStore = {
  get: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  select(kind: PastaKind) {
    emit({ ...state, selected: kind });
  },
  finishIntro() {
    emit({ ...state, introDone: true });
  },
  /** "Trocar massa": reabre o seletor da intro por cima do hero */
  reopenPicker() {
    emit({ ...state, pickerRound: state.pickerRound + 1 });
  },
};

const SERVER_STATE: ExperienceState = { selected: DEFAULT_PASTA, introDone: false, pickerRound: 0 };

export function useExperience(): ExperienceState {
  return useSyncExternalStore(experienceStore.subscribe, experienceStore.get, () => SERVER_STATE);
}

export function pastaOption(kind: PastaKind): PastaOption {
  return PASTA_OPTIONS.find((p) => p.kind === kind) ?? PASTA_OPTIONS[0];
}
