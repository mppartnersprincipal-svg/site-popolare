"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";
import { freshPastaMaterial, PASTA_BUILDERS } from "./pastaGeometries";
import type { PastaKind } from "@/lib/experienceStore";

const geometryCache = new Map<PastaKind, THREE.BufferGeometry>();

function geometryFor(kind: PastaKind): THREE.BufferGeometry {
  let geo = geometryCache.get(kind);
  if (!geo) {
    geo = PASTA_BUILDERS[kind]();
    geometryCache.set(kind, geo);
  }
  return geo;
}

const BASE_SCALE: Record<PastaKind, number> = { fettuccine: 1.15, ravioli: 0.95, cappelletti: 1.05, sfogliatti: 0.95 };
const BASE_TILT: Record<PastaKind, number> = { fettuccine: 0.6, ravioli: 0.75, cappelletti: 0.5, sfogliatti: 0.5 };
const SPIN = { idle: 0.35, hover: 1.6, selected: 4.2 } as const;
const PHASE: Record<PastaKind, number> = { fettuccine: 0, ravioli: 1.7, cappelletti: 3.4, sfogliatti: 5.1 };

interface PastaModelProps {
  kind: PastaKind;
  /** elemento DOM rastreado; data-3d-state = idle | hover | selected */
  target: HTMLElement;
}

export function PastaModel({ kind, target }: PastaModelProps) {
  const group = useRef<THREE.Group>(null);
  const speed = useRef<number>(SPIN.idle);
  const appear = useRef(0);
  const geometry = useMemo(() => geometryFor(kind), [kind]);
  const material = useMemo(() => freshPastaMaterial(), []);
  useEffect(() => () => material.dispose(), [material]);
  // fase determinística por tipo (cada massa "flutua" num ritmo diferente)
  const phase = PHASE[kind];

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const mode = (target.dataset["3dState"] as keyof typeof SPIN) ?? "idle";
    const goal = SPIN[mode] ?? SPIN.idle;
    speed.current += (goal - speed.current) * Math.min(1, delta * 3);
    appear.current = Math.min(1, appear.current + delta * 1.4);

    const t = state.clock.elapsedTime + phase;
    const ease = 1 - Math.pow(1 - appear.current, 3);
    const hoverLift = mode === "hover" ? 0.08 : 0;
    g.rotation.y += delta * speed.current;
    g.rotation.x = BASE_TILT[kind] + Math.sin(t * 0.8) * 0.08;
    g.rotation.z = Math.sin(t * 0.6) * 0.06;
    g.position.y = Math.sin(t * 1.1) * 0.05 + hoverLift;
    g.scale.setScalar(BASE_SCALE[kind] * ease);
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry} material={material} />
    </group>
  );
}
