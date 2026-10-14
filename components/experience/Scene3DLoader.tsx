"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useState, type ReactNode } from "react";
import { isLiteMode } from "@/lib/device";

const Scene = dynamic(() => import("@/components/three/Scene"), { ssr: false });

/** Se o WebGL falhar (contexto indisponível, GPU bloqueada), o site segue com as fotos de fallback. */
class SceneErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    document.documentElement.classList.remove("tres-pronto");
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

const IDLE_DELAY_MS = 3500;
const INTERACTIONS = ["pointermove", "pointerdown", "touchstart", "keydown", "wheel", "scroll"] as const;

/**
 * Carrega three.js + cena fora do caminho crítico (LCP/TBT):
 * na primeira interação do visitante ou ~3,5s após o "load", o que vier antes.
 * Até lá a intro mostra as fotos de fallback. Em modo leve, nunca carrega.
 */
export function Scene3DLoader() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isLiteMode()) return;
    let timer = 0;
    const go = () => {
      cleanup();
      setIsReady(true);
    };
    const onLoad = () => (timer = window.setTimeout(go, IDLE_DELAY_MS));
    function cleanup() {
      window.clearTimeout(timer);
      window.removeEventListener("load", onLoad);
      INTERACTIONS.forEach((ev) => window.removeEventListener(ev, go));
    }
    INTERACTIONS.forEach((ev) => window.addEventListener(ev, go, { once: true, passive: true }));
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    return cleanup;
  }, []);

  return isReady ? (
    <SceneErrorBoundary>
      <Scene />
    </SceneErrorBoundary>
  ) : null;
}
