// Geometrias procedurais de massa fresca — sem modelos externos (KB em vez de MB).
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const TAU = Math.PI * 2;

// ───────────── Fita (base do fettuccine e da massa que desce no scroll) ─────────────
export interface RibbonOptions {
  segments: number;
  width: number;
  /** ângulo de torção (rad) ao longo de t ∈ [0,1] */
  twist?: (t: number) => number;
  /** largura relativa ao longo de t (para afinar as pontas) */
  taper?: (t: number) => number;
}

export function ribbonGeometry(curve: THREE.Curve<THREE.Vector3>, opts: RibbonOptions): THREE.BufferGeometry {
  const { segments, width, twist = () => 0, taper = () => 1 } = opts;
  const frames = curve.computeFrenetFrames(segments, false);
  const positions = new Float32Array((segments + 1) * 2 * 3);
  const uvs = new Float32Array((segments + 1) * 2 * 2);
  const indices: number[] = [];
  const point = new THREE.Vector3();
  const side = new THREE.Vector3();

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    curve.getPointAt(t, point);
    const a = twist(t);
    side
      .copy(frames.normals[i])
      .multiplyScalar(Math.cos(a))
      .addScaledVector(frames.binormals[i], Math.sin(a))
      .multiplyScalar((width * taper(t)) / 2);
    positions.set([point.x + side.x, point.y + side.y, point.z + side.z], i * 6);
    positions.set([point.x - side.x, point.y - side.y, point.z - side.z], i * 6 + 3);
    uvs.set([t, 0, t, 1], i * 4);
    if (i < segments) {
      const a0 = i * 2;
      indices.push(a0, a0 + 1, a0 + 2, a0 + 1, a0 + 3, a0 + 2);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// ───────────── Ninho de fettuccine ─────────────
export function fettuccineNest(): THREE.BufferGeometry {
  const strands: THREE.BufferGeometry[] = [];
  const STRANDS = 9;
  const tilt = new THREE.Euler();
  for (let k = 0; k < STRANDS; k++) {
    const pts: THREE.Vector3[] = [];
    const layer = k / (STRANDS - 1); // 0 = base larga, 1 = topo estreito (formato de ninho)
    const turns = 1.3 + (k % 3) * 0.25;
    // cada fita é um anel levemente inclinado — o cruzamento dá a cara de ninho enrolado à mão
    tilt.set(Math.sin(k * 2.3) * 0.38, 0, Math.cos(k * 1.7) * 0.38);
    for (let i = 0; i <= 72; i++) {
      const t = i / 72;
      const ang = t * TAU * turns + k * 1.7;
      const r = 0.44 - layer * 0.14 + 0.09 * Math.sin(t * 5 + k * 1.3);
      const y = -0.12 + layer * 0.22 + 0.06 * Math.sin(t * 9 + k * 2.1);
      pts.push(new THREE.Vector3(Math.cos(ang) * r, y, Math.sin(ang) * r).applyEuler(tilt));
    }
    strands.push(
      ribbonGeometry(new THREE.CatmullRomCurve3(pts), {
        segments: 180,
        width: 0.078,
        twist: (t) => Math.PI / 2 + 0.3 * Math.sin(t * 9 + k),
        taper: (t) => (t < 0.03 || t > 0.97 ? 0.7 : 1),
      })
    );
  }
  return mergeGeometries(strands)!;
}

// ───────────── Ravióli (travesseirinho com borda dentada) ─────────────
export function ravioli(): THREE.BufferGeometry {
  const SIZE = 1;
  const BORDER = 0.14;
  const HEIGHT = 0.19;
  const SEG = 56;
  const half = (sign: 1 | -1) => {
    const g = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const inner = SIZE / 2 - BORDER;
      // almofada: altura máxima no centro, zero na borda selada
      const fx = Math.max(0, 1 - Math.pow(Math.abs(x) / inner, 4));
      const fy = Math.max(0, 1 - Math.pow(Math.abs(y) / inner, 4));
      const z = HEIGHT * Math.sqrt(fx * fy) + 0.012;
      // borda dentada (corte do carretilha)
      const edge = Math.max(Math.abs(x), Math.abs(y)) > SIZE / 2 - 0.01;
      const crimp = edge ? 0.018 * Math.sin((Math.abs(x) > Math.abs(y) ? y : x) * 70) : 0;
      pos.setXYZ(i, x + Math.sign(x) * crimp, y + Math.sign(y) * crimp, z * sign);
    }
    return g;
  };
  const geo = mergeGeometries([half(1), half(-1)])!;
  geo.rotateX(-Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

// ───────────── Cappelletti ("chapeuzinho": copa recheada + aba dobrada) ─────────────
export function cappelletti(): THREE.BufferGeometry {
  const profile: THREE.Vector2[] = [];
  const STEPS = 28;
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    if (t < 0.4) {
      // aba: sai da borda e sobe levemente
      const u = t / 0.4;
      profile.push(new THREE.Vector2(0.52 - u * 0.2, 0.015 + u * 0.03));
    } else {
      // copa arredondada (recheio)
      const u = (t - 0.4) / 0.6;
      const a = (u * Math.PI) / 2;
      profile.push(new THREE.Vector2(0.32 * Math.cos(a) + 0.001, 0.045 + 0.28 * Math.sin(a)));
    }
  }
  const geo = new THREE.LatheGeometry(profile, 72);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    const ang = Math.atan2(z, x);
    // aba em sela (dobrada para cima em dois lados) e leve ondulação da massa
    const brim = THREE.MathUtils.smoothstep(r, 0.3, 0.52);
    const saddle = brim * (0.13 * Math.cos(2 * ang) + 0.012 * Math.sin(ang * 9));
    pos.setXYZ(i, x, y + saddle, z);
  }
  geo.computeVertexNormals();
  return geo;
}

// ───────────── Sfogliatti (trouxinha de massa) ─────────────
export function sfogliatti(): THREE.BufferGeometry {
  const geo = new RoundedBoxGeometry(1, 0.42, 0.74, 8, 0.19);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    // vincos diagonais de envelope (as abas dobradas sobre o recheio) + inchaço central
    const isTop = y > 0.05;
    const diag = Math.abs(x) / 0.5 - Math.abs(z) / 0.37;
    const crease = isTop ? -0.055 * Math.exp(-diag * diag * 45) : 0;
    const seam = isTop ? -0.035 * Math.exp(-z * z * 160) * (Math.abs(x) < 0.3 ? 1 : 0.4) : 0;
    const puff = (isTop ? 0.07 : 0.02) * Math.cos(x * Math.PI) * Math.cos((z / 0.37) * (Math.PI / 2));
    pos.setXYZ(i, x * (1 + 0.03 * Math.sin(z * 11)), y * 0.85 + crease + seam + puff, z);
  }
  geo.computeVertexNormals();
  return geo;
}

// ───────────── Material de massa fresca ─────────────
function flourNoiseTexture(size = 128): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 150 + Math.random() * 105;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

let sharedNoise: THREE.CanvasTexture | null = null;

export function freshPastaMaterial(color = "#efd39c"): THREE.MeshPhysicalMaterial {
  sharedNoise ??= flourNoiseTexture();
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.74,
    metalness: 0,
    sheen: 0.35,
    sheenColor: new THREE.Color("#fff6e4"),
    sheenRoughness: 0.9,
    bumpMap: sharedNoise,
    bumpScale: 0.45,
    side: THREE.DoubleSide,
  });
}

export const PASTA_BUILDERS = {
  fettuccine: fettuccineNest,
  ravioli,
  cappelletti,
  sfogliatti,
} as const;
