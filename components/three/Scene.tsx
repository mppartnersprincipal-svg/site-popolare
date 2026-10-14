"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { isCoarsePointer } from "@/lib/device";
import { PerspectiveCamera, View } from "@react-three/drei";
import { PastaModel } from "./PastaModel";
import { PastaRibbon } from "./PastaRibbon";
import type { PastaKind } from "@/lib/experienceStore";

interface Target {
  key: string;
  role: "intro" | "vetrina" | "ribbon";
  kind?: PastaKind;
  el: HTMLElement;
}

// Chave estável por elemento: um alvo que some não faz os outros Views remontarem
const elementIds = new WeakMap<HTMLElement, number>();
let nextElementId = 0;

function readTargets(): Target[] {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-3d]")).map((el) => {
    const [role, kind] = (el.dataset["3d"] ?? "").split(":") as [Target["role"], PastaKind | undefined];
    if (!elementIds.has(el)) elementIds.set(el, nextElementId++);
    return { key: `${el.dataset["3d"]}-${elementIds.get(el)}`, role, kind, el };
  });
}

/** Marca o <html> como "3D pronto" só depois do primeiro frame desenhado (antes disso as fotos seguem visíveis). */
function ReadyFlag() {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    document.documentElement.classList.add("tres-pronto");
  });
  useEffect(() => () => document.documentElement.classList.remove("tres-pronto"), []);
  return null;
}

function WarmLights() {
  return (
    <>
      <ambientLight intensity={0.55} color="#fff1dc" />
      <hemisphereLight args={["#fff6e8", "#b9802f", 0.6]} />
      <directionalLight position={[2.5, 3.5, 3]} intensity={2.1} color="#ffe2b0" />
      <directionalLight position={[-3, 1.5, -2]} intensity={0.9} color="#ffb070" />
    </>
  );
}

/** Pausa o render loop quando nenhum alvo 3D está na tela (economiza CPU/GPU/bateria). */
function FrameloopGate({ elements }: { elements: HTMLElement[] }) {
  const setFrameloop = useThree((s) => s.setFrameloop);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const visible = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      if (visible.size > 0) {
        setFrameloop("always");
      } else {
        // um último frame limpa os Views que saíram da tela; depois o loop para
        setFrameloop("demand");
        invalidate();
      }
    });
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [elements, setFrameloop, invalidate]);
  return null;
}

/** Um único canvas WebGL fixo; cada [data-3d] do DOM vira um View que segue o elemento. */
export default function Scene() {
  const [targets, setTargets] = useState<Target[]>([]);

  useEffect(() => {
    const update = () => {
      const next = readTargets();
      setTargets((prev) =>
        prev.length === next.length && prev.every((t, i) => t.el === next[i].el && t.key === next[i].key) ? prev : next
      );
    };
    update();
    const observer = new MutationObserver((mutations) => {
      if (mutations.some((m) => m.type === "childList")) update();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // Telas de toque (celulares): resolução e antialias menores para poupar GPU e bateria
  const [isCoarse] = useState(() => isCoarsePointer());

  const refs = useMemo(() => targets.map((t) => ({ ...t, ref: { current: t.el } })), [targets]);
  const elements = useMemo(() => targets.map((t) => t.el), [targets]);

  return (
    <Canvas
      dpr={isCoarse ? [1, 1.25] : [1, 1.75]}
      gl={{ alpha: true, antialias: !isCoarse, powerPreference: "high-performance" }}
      className="cena-3d"
      style={{ position: "fixed", inset: 0, zIndex: 75 }}
      aria-hidden
    >
      <FrameloopGate elements={elements} />
      <ReadyFlag />
      {refs.map((t) => (
        <View key={t.key} track={t.ref}>
          <PerspectiveCamera makeDefault position={[0, 0, t.role === "ribbon" ? 8 : 2.6]} fov={t.role === "ribbon" ? 40 : 32} />
          <WarmLights />
          {t.role === "ribbon" ? <PastaRibbon target={t.el} /> : t.kind && <PastaModel kind={t.kind} target={t.el} />}
        </View>
      ))}
    </Canvas>
  );
}
