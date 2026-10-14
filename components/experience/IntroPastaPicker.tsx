"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { experienceStore, PASTA_OPTIONS, useExperience, type PastaKind } from "@/lib/experienceStore";
import { prefersReducedMotion } from "@/lib/device";
import { track } from "@/lib/tracking";
import { Picture } from "@/components/ui/Picture";
import { LogoSimbolo } from "@/components/ui/Logo";
import { SCROLL_LOCK_CLASS } from "@/components/experience/SmoothScroll";

const INTRO_KEY = "popolare_intro";
const PASTA_KEY = "popolare_massa";
const HAPTIC_MS = 12;
/** id do botão "Trocar massa" do hero — recebe o foco quando o seletor reaberto fecha */
export const TROCAR_MASSA_ID = "trocar-massa";

function remember(kind?: PastaKind) {
  try {
    sessionStorage.setItem(INTRO_KEY, "1");
    if (kind) sessionStorage.setItem(PASTA_KEY, kind);
  } catch {
    // sem sessionStorage a intro apenas reaparece na próxima visita
  }
}

/**
 * Seletor de massa. Na 1ª visita é a intro do site; depois pode ser reaberto pelo botão
 * "Trocar massa" do hero — cada reabertura remonta o seletor do zero (key = pickerRound).
 */
export function IntroPastaPicker() {
  const { pickerRound, selected } = useExperience();
  return <PastaPicker key={pickerRound} isReopened={pickerRound > 0} current={selected} />;
}

interface PastaPickerProps {
  isReopened: boolean;
  current: PastaKind;
}

function PastaPicker({ isReopened, current }: PastaPickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isGone, setIsGone] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    const html = document.documentElement;
    if (isReopened) {
      // volta a exibir o seletor (o CSS o esconde quando html tem .intro-vista)
      html.classList.remove("intro-vista", "intro-saindo");
    } else {
      // Visita repetida: recupera a massa escolhida
      try {
        const saved = sessionStorage.getItem(PASTA_KEY) as PastaKind | null;
        if (saved && PASTA_OPTIONS.some((p) => p.kind === saved)) experienceStore.select(saved);
      } catch {
        // ignora
      }
    }
    const root = rootRef.current;
    if (!root || getComputedStyle(root).display === "none") {
      setIsGone(true);
      return;
    }
    html.classList.add(SCROLL_LOCK_CLASS);
    if (isReopened && !prefersReducedMotion()) {
      gsap.from(root, { autoAlpha: 0, duration: 0.45, ease: "power2.out" });
      gsap.from(root.querySelectorAll("[data-opcao]"), { y: 40, autoAlpha: 0, duration: 0.6, stagger: 0.06, ease: "expo.out", delay: 0.1 });
    }
    // Foco no diálogo (não num botão) para não acender o anel de foco antes de qualquer interação
    root.focus({ preventScroll: true });
    return () => html.classList.remove(SCROLL_LOCK_CLASS);
  }, [isReopened]);

  // Diálogo modal de verdade: o resto da página fica inerte (sem foco/leitura) enquanto o seletor está aberto
  useEffect(() => {
    const root = rootRef.current;
    if (isGone || !root) return;
    const outside = [
      ...Array.from(root.parentElement?.children ?? []).filter((el) => el !== root),
      ...document.querySelectorAll("body > a, header, #menu-mobile, footer"),
    ];
    outside.forEach((el) => el.setAttribute("inert", ""));
    return () => outside.forEach((el) => el.removeAttribute("inert"));
  }, [isGone]);

  function close(kind?: PastaKind) {
    remember(kind);
    document.documentElement.classList.remove(SCROLL_LOCK_CLASS);
    document.documentElement.classList.add("intro-vista");
    window.scrollTo(0, 0);
    experienceStore.finishIntro();
    setIsGone(true);
    // depois que o inert sai (próximo frame), o foco volta para onde o visitante estava
    const focusId = isReopened ? TROCAR_MASSA_ID : "hero-titulo";
    requestAnimationFrame(() => document.getElementById(focusId)?.focus({ preventScroll: true }));
  }

  function choose(kind: PastaKind, slot: HTMLElement) {
    if (busy.current) return;
    busy.current = true;
    document.documentElement.classList.add("intro-saindo");
    track("intro_pasta_select", { massa: kind, origem: isReopened ? "trocar" : "intro", trocou: kind !== current });
    navigator.vibrate?.(HAPTIC_MS);
    experienceStore.select(kind);
    if (prefersReducedMotion()) return close(kind);
    slot.dataset["3dState"] = "selected";

    const root = rootRef.current!;
    const rect = slot.getBoundingClientRect();
    const dx = window.innerWidth / 2 - (rect.left + rect.width / 2);
    const dy = window.innerHeight / 2 - (rect.top + rect.height / 2);
    const scale = (Math.min(window.innerWidth, window.innerHeight) * 0.72) / rect.width;
    const hole = { r: 0 };
    const maxR = Math.hypot(window.innerWidth, window.innerHeight);

    gsap
      .timeline({ onComplete: () => close(kind) })
      .to(root.querySelectorAll("[data-intro-fade]"), { autoAlpha: 0, y: -24, duration: 0.45, ease: "power2.in" }, 0)
      .to(
        root.querySelectorAll(`[data-opcao]:not([data-opcao="${kind}"])`),
        { autoAlpha: 0, y: 60, rotate: () => gsap.utils.random(-14, 14), duration: 0.6, stagger: 0.05, ease: "power3.in" },
        0
      )
      .to(slot, { x: dx, y: dy, scale, duration: 1.1, ease: "expo.inOut" }, 0.15)
      .to(
        hole,
        {
          r: maxR,
          duration: 1.15,
          ease: "power3.in",
          onUpdate: () => root.style.setProperty("--furo", `${hole.r}px`),
        },
        0.95
      )
      .to(slot, { scale: scale * 1.6, autoAlpha: 0, duration: 0.9, ease: "power2.in" }, 1.15);
  }

  /** Sai sem escolher (1ª visita) ou volta sem trocar (seletor reaberto) */
  function dismiss() {
    if (busy.current) return;
    busy.current = true;
    document.documentElement.classList.add("intro-saindo");
    if (prefersReducedMotion()) return close();
    gsap.to(rootRef.current, { autoAlpha: 0, duration: isReopened ? 0.35 : 0.6, ease: "power2.out", onComplete: () => close() });
  }

  const dismissRef = useRef(dismiss);
  useEffect(() => {
    dismissRef.current = dismiss;
  });
  useEffect(() => {
    if (isGone) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && dismissRef.current();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isGone]);

  if (isGone) return null;

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-titulo"
      aria-describedby="intro-ajuda"
      tabIndex={-1}
      className="intro-massa outline-none fixed inset-0 z-[70] flex-col items-center justify-between overflow-hidden bg-creme px-[var(--gutter)] pb-6 pt-8 md:pb-10"
      style={{
        maskImage: "radial-gradient(circle at 50% 50%, transparent var(--furo, 0px), #000 calc(var(--furo, 0px) + 1px))",
        WebkitMaskImage: "radial-gradient(circle at 50% 50%, transparent var(--furo, 0px), #000 calc(var(--furo, 0px) + 1px))",
      }}
    >
      <div data-intro-fade className="flex w-full items-center justify-between text-primaria">
        <LogoSimbolo className="h-9 w-auto" />
        {isReopened ? (
          <button
            type="button"
            onClick={dismiss}
            aria-label="Fechar e manter a massa atual"
            className="grid size-11 place-items-center rounded-full border border-primaria/25 text-xl leading-none transition-colors hover:bg-primaria hover:text-farinha"
          >
            <span aria-hidden>×</span>
          </button>
        ) : (
          <p className="eyebrow">Benvenuto</p>
        )}
      </div>

      <div data-intro-fade className="text-center">
        {/* rótulo do diálogo (não é heading: a intro vem antes do h1 do hero no DOM) */}
        <p id="intro-titulo" className="italiano text-[clamp(3rem,1.6rem+6vw,7.5rem)] leading-[0.9] text-primaria">
          {isReopened ? "Cambia la pasta" : "Scegli la tua pasta"}
        </p>
        <p id="intro-ajuda" className="mx-auto mt-4 max-w-md text-tinta-suave md:text-lg">
          {isReopened
            ? "A massa marcada é a sua escolha atual. Toque em outra para trocar."
            : "Escolha uma massa e entre na Popolare. Ela vai te acompanhar pela casa."}
        </p>
        {!isReopened && <p className="mt-2 text-sm text-tinta-suave/80">Você pode trocar quando quiser.</p>}
      </div>

      <ul className="grid w-full max-w-6xl grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4 md:gap-8">
        {PASTA_OPTIONS.map((p, i) => {
          const isCurrent = isReopened && p.kind === current;
          return (
            <li key={p.kind} data-opcao={p.kind}>
              <button
                type="button"
                data-massa={p.kind}
                aria-pressed={isReopened ? isCurrent : undefined}
                onClick={(e) => choose(p.kind, e.currentTarget.querySelector<HTMLElement>("[data-3d]")!)}
                onPointerEnter={(e) => (e.currentTarget.querySelector<HTMLElement>("[data-3d]")!.dataset["3dState"] = "hover")}
                onPointerLeave={(e) => {
                  const slot = e.currentTarget.querySelector<HTMLElement>("[data-3d]")!;
                  if (slot.dataset["3dState"] === "hover") slot.dataset["3dState"] = "idle";
                }}
                className="group flex w-full flex-col items-center text-center outline-none"
              >
                <span
                  data-3d={`intro:${p.kind}`}
                  data-3d-state="idle"
                  className={`relative block aspect-square w-[min(38vw,15rem)] rounded-full transition-transform duration-500 group-hover:-translate-y-2 group-focus-visible:ring-2 group-focus-visible:ring-primaria group-focus-visible:ring-offset-4 group-focus-visible:ring-offset-creme md:w-[min(19vw,15rem)] ${
                    isCurrent ? "ring-2 ring-primaria ring-offset-4 ring-offset-creme" : ""
                  }`}
                >
                  <span aria-hidden className="absolute inset-[8%] rounded-full bg-farinha shadow-[inset_0_-12px_30px_rgba(185,128,47,0.18),0_30px_60px_-30px_rgba(89,14,19,0.45)]" />
                  <span data-3d-fallback className="absolute inset-[14%] overflow-hidden rounded-full transition-opacity duration-700">
                    <Picture image={p.thumb} alt="" sizes="(min-width: 768px) 15rem, 38vw" className="block h-full w-full" imgClassName="h-full w-full object-cover" />
                  </span>
                  {isCurrent && (
                    <span className="absolute -top-1 left-1/2 z-10 -translate-x-1/2 rounded-full bg-primaria px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-farinha shadow-md">
                      Atual
                    </span>
                  )}
                </span>
                <span className="mt-3 flex items-baseline gap-2">
                  <span aria-hidden className="eyebrow text-[0.6rem] text-madeira-escura">
                    0{i + 1}
                  </span>
                  <span className="italiano text-2xl text-tinta md:text-3xl">
                    <span className="sr-only">{isCurrent ? "Manter " : "Escolher "}</span>
                    {p.label}
                  </span>
                </span>
                <span className="mt-1 hidden text-sm text-tinta-suave md:block">{p.hint}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        data-intro-fade
        onClick={dismiss}
        className="eyebrow rounded-full px-4 py-3 text-tinta-suave underline-offset-4 transition-colors hover:text-primaria hover:underline"
      >
        {isReopened ? "← Voltar sem trocar" : "Entrar sem escolher →"}
      </button>
    </div>
  );
}
