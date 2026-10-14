"use client";

import { useEffect } from "react";
import type Lenis from "lenis";
import { prefersReducedMotion } from "@/lib/device";

export const SCROLL_LOCK_CLASS = "rolagem-travada";

let instance: Lenis | null = null;

/** Lenis ativo (ou null em reduced-motion / ainda carregando) — para pausar durante a intro ou rolar até âncoras. */
export function getLenis(): Lenis | null {
  return instance;
}

const IDLE_TIMEOUT_MS = 1500;

/**
 * Smooth scroll carregado sob demanda (fora do bundle inicial de todas as páginas, inclusive a LP de campanha):
 * Lenis + GSAP só são baixados quando o navegador fica ocioso após a hidratação.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let cleanup: (() => void) | undefined;
    let isCancelled = false;

    const start = async () => {
      const [{ default: LenisCtor }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (isCancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new LenisCtor({ lerp: 0.1, smoothWheel: true, syncTouch: false });
      instance = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      // Mantém o lagSmoothing padrão do GSAP: sem ele, um frame pesado (ex.: troca de imagem + 3D)
      // faz as timelines "pularem" o tempo perdido e a transição da intro termina de uma vez.
      gsap.ticker.add(tick);

      // Menu mobile e intro travam a rolagem pela classe própria (a "lenis-stopped" é gerida pelo Lenis)
      let wasLocked = false;
      const sync = () => {
        const locked = document.documentElement.classList.contains(SCROLL_LOCK_CLASS);
        if (locked === wasLocked) return;
        wasLocked = locked;
        if (locked) lenis.stop();
        else lenis.start();
      };
      sync();
      const observer = new MutationObserver(sync);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

      cleanup = () => {
        observer.disconnect();
        gsap.ticker.remove(tick);
        lenis.destroy();
        instance = null;
      };
    };

    const idle = typeof window.requestIdleCallback === "function";
    const handle = idle ? window.requestIdleCallback(() => void start(), { timeout: IDLE_TIMEOUT_MS }) : window.setTimeout(() => void start(), 200);

    return () => {
      isCancelled = true;
      if (idle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
      cleanup?.();
    };
  }, []);

  return null;
}
