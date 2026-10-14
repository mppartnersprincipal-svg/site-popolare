"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { freshPastaMaterial, ribbonGeometry } from "./pastaGeometries";

const POINTS = 220;
const STEP = 0.32; // distância vertical entre pontos da curva
const TOP_Y = 5;
const HEAD_SCREEN_Y = -0.9; // onde a "ponta" da massa fica na tela
const MIN_VISIBLE = 0.06;
const END_HIDE = 0.97;

interface PastaRibbonProps {
  /** elemento sticky dentro do wrapper [data-trilha] */
  target: HTMLElement;
}

/**
 * Fita de fettuccine que "desce" junto com o scroll: a geometria cresce (drawRange)
 * e a câmera acompanha a ponta. Fica nas laterais e cruza o centro rapidamente.
 */
export function PastaRibbon({ target }: PastaRibbonProps) {
  const group = useRef<THREE.Group>(null);
  const viewportWidth = useThree((s) => Math.round(s.viewport.width * 10) / 10);
  const material = useMemo(() => freshPastaMaterial("#f3dcaa"), []);

  const geometry = useMemo(() => {
    const halfW = Math.max(1.2, viewportWidth / 2);
    const isNarrow = halfW < 2;
    const lane = halfW * (isNarrow ? 1.02 : 0.82);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= POINTS; i++) {
      // tanh deixa a fita a maior parte do tempo nas laterais, cruzando o meio rápido
      const x = lane * Math.tanh(2.6 * Math.sin(i * 0.085)) + 0.25 * Math.sin(i * 0.41);
      const y = TOP_Y - i * STEP;
      const z = 0.9 * Math.cos(i * 0.19);
      pts.push(new THREE.Vector3(x, y, z));
    }
    return ribbonGeometry(new THREE.CatmullRomCurve3(pts), {
      segments: POINTS * 6,
      width: isNarrow ? 0.18 : 0.34,
      twist: (t) => t * 46 + Math.sin(t * 90) * 0.4,
      taper: (t) => Math.min(1, t * 40),
    });
  }, [viewportWidth]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  const totalIndices = geometry.index?.count ?? 0;

  useFrame(() => {
    const wrapper = target.closest<HTMLElement>("[data-trilha]");
    const g = group.current;
    if (!wrapper || !g) return;
    const rect = wrapper.getBoundingClientRect();
    const range = Math.max(1, rect.height - window.innerHeight);
    const p = THREE.MathUtils.clamp(-rect.top / range, 0, 1);
    // No fim da trilha a fita sai de cena (não invade a seção seguinte)
    g.visible = p < END_HIDE;
    if (!g.visible) return;
    const head = MIN_VISIBLE + p * (1 - MIN_VISIBLE);

    // indices por segmento = 6; arredonda para segmentos inteiros
    const count = Math.floor((totalIndices * head) / 6) * 6;
    geometry.setDrawRange(0, count);

    const headY = TOP_Y - head * POINTS * STEP;
    g.position.y = THREE.MathUtils.lerp(g.position.y, HEAD_SCREEN_Y - headY, 0.18);
    g.rotation.y = Math.sin(p * Math.PI * 2) * 0.12;
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}
