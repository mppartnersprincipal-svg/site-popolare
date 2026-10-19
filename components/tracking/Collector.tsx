"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { initTracker, trackPageView } from "@/lib/tracker";

/** Medição própria do site (alimenta o /painel). Montado só no layout público. */
export function Collector() {
  const pathname = usePathname();

  useEffect(() => {
    initTracker();
  }, []);

  useEffect(() => {
    // espera o título da nova rota ser aplicado antes de registrar
    const id = window.setTimeout(() => trackPageView(pathname, document.title), 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}
