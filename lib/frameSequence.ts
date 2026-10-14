import frames from "@/data/frames.generated.json";

export const FRAMES = frames;

const PASSES = [8, 4, 2, 1] as const;
const PARALLEL = 3;

/** Cede a vez ao navegador entre downloads para não acumular tarefas longas */
const yieldToIdle = () =>
  new Promise<void>((resolve) =>
    typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(() => resolve(), { timeout: 200 }) : setTimeout(resolve, 16)
  );

export function frameUrl(n: number): string {
  const num = String(n + 1).padStart(FRAMES.pad, "0");
  return `${FRAMES.path}/${FRAMES.pattern.replace("{n}", num)}`;
}

/**
 * Sequência de quadros para scrub por scroll.
 * Carrega em passes progressivos para que qualquer posição tenha um quadro próximo cedo.
 */
export class FrameSequence {
  private readonly images: (HTMLImageElement | null)[];
  private started = false;
  private disposed = false;

  /** @param minStep 2 = carrega só quadros pares (metade da memória); o scrub usa o vizinho mais próximo */
  constructor(
    readonly count: number = FRAMES.count,
    private readonly minStep: number = 1
  ) {
    this.images = new Array(count).fill(null);
  }

  /** Ordem: 0, depois múltiplos de 8, de 4, de 2 e o restante (sem repetir). */
  private loadOrder(): number[] {
    const order: number[] = [0];
    const seen = new Set(order);
    for (const step of PASSES.filter((s) => s >= this.minStep)) {
      for (let i = 0; i < this.count; i += step) {
        if (!seen.has(i)) {
          seen.add(i);
          order.push(i);
        }
      }
    }
    return order;
  }

  private async loadOne(index: number): Promise<void> {
    const img = new Image();
    img.decoding = "async";
    img.src = frameUrl(index);
    try {
      // decode() decodifica fora da thread principal; o <img> decodificado desenha barato no canvas
      await img.decode();
      if (!this.disposed) this.images[index] = img;
    } catch {
      // quadro que falhar fica nulo; draw() usa o vizinho carregado mais próximo
    }
  }

  async preload(onProgress?: (loaded: number) => void): Promise<void> {
    if (this.started) return;
    this.started = true;
    const queue = this.loadOrder();
    let loaded = 0;
    const worker = async () => {
      while (queue.length && !this.disposed) {
        const next = queue.shift()!;
        await this.loadOne(next);
        loaded += 1;
        onProgress?.(loaded);
        await yieldToIdle();
      }
    };
    await Promise.all(Array.from({ length: PARALLEL }, worker));
  }

  private nearest(index: number): HTMLImageElement | null {
    for (let d = 0; d < this.count; d++) {
      const a = this.images[index - d];
      if (a) return a;
      const b = this.images[index + d];
      if (b) return b;
    }
    return null;
  }

  /** Desenha o quadro com ajuste "cover" no canvas. Retorna false se nada carregou ainda. */
  draw(ctx: CanvasRenderingContext2D, progress: number): boolean {
    const index = Math.min(this.count - 1, Math.max(0, Math.round(progress * (this.count - 1))));
    const img = this.nearest(index);
    if (!img) return false;
    const { width: cw, height: ch } = ctx.canvas;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    return true;
  }

  dispose(): void {
    this.disposed = true;
    for (const img of this.images) if (img) img.src = "";
    this.images.fill(null);
  }
}
