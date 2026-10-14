"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/device";

/**
 * Animações declarativas por atributo (servem a todas as páginas sem virar Client Component):
 * - data-reveal          → fade + subida ao entrar na tela (em lote, com stagger)
 * - data-parallax="0.2"  → desloca o elemento conforme o scroll (fração da altura)
 * GSAP é importado sob demanda para não pesar no carregamento inicial.
 */
export function ScrollReveals() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let isCancelled = false;
    let cleanup: (() => void) | undefined;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (isCancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        ScrollTrigger.batch("[data-reveal]", {
          start: "top 88%",
          once: true,
          onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.09, overwrite: true }),
        });

        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          const amount = Number(el.dataset.parallax ?? 0.15);
          gsap.fromTo(
            el,
            { yPercent: -amount * 50 },
            {
              yPercent: amount * 50,
              ease: "none",
              scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
            }
          );
        });
      });
      // Pins acima (hero/vitrine) mudam a altura da página depois do primeiro layout
      const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 400);
      cleanup = () => {
        window.clearTimeout(refresh);
        ctx.revert();
      };
    });

    return () => {
      isCancelled = true;
      cleanup?.();
    };
  }, [pathname]);

  return null;
}
