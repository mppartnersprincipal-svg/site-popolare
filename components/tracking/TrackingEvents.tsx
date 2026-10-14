"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { track, type TrackingEvent } from "@/lib/tracking";

const SCROLL_MARKS = [25, 50, 75, 100] as const;
const SECTION_VISIBLE_RATIO = 0.4;

/**
 * Eventos automáticos:
 * - cliques em qualquer elemento com data-track="evento" (atributos data-track-* viram parâmetros)
 * - profundidade de scroll (25/50/75/100) por página
 * - section_view em elementos com data-section="nome"
 */
export function TrackingEvents() {
  const pathname = usePathname();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-track]");
      if (!el) return;
      const params: Record<string, string> = { pagina: window.location.pathname };
      for (const [key, value] of Object.entries(el.dataset)) {
        if (key.startsWith("track") && key !== "track" && value) {
          params[key.slice(5).toLowerCase()] = value;
        }
      }
      if (el instanceof HTMLAnchorElement) params.destino = el.href;
      track(el.dataset.track as TrackingEvent, params);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  useEffect(() => {
    const fired = new Set<number>();
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const pct = (window.scrollY / max) * 100;
      for (const mark of SCROLL_MARKS) {
        if (pct >= mark - 1 && !fired.has(mark)) {
          fired.add(mark);
          track(`scroll_${mark}`, { pagina: pathname });
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => {
    const seen = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const name = (entry.target as HTMLElement).dataset.section;
          if (entry.isIntersecting && name && !seen.has(name)) {
            seen.add(name);
            track("section_view", { secao: name, pagina: pathname });
          }
        }
      },
      { threshold: SECTION_VISIBLE_RATIO }
    );
    document.querySelectorAll("[data-section]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
