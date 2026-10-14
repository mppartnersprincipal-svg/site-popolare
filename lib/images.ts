import manifest from "@/data/images.generated.json";

export interface ImageAsset {
  src: string;
  widths: number[];
  /** altura ÷ largura */
  aspect: number;
  blur: string;
}

const IMAGES = manifest as Record<string, ImageAsset>;

export function getImage(key: string): ImageAsset {
  const asset = IMAGES[key];
  if (!asset) throw new Error(`Imagem não encontrada no manifesto: ${key}`);
  return asset;
}

export function srcSet(asset: ImageAsset, ext: "avif" | "webp"): string {
  return asset.widths.map((w) => `${asset.src}-${w}.${ext} ${w}w`).join(", ");
}

/** Maior variante disponível (para OG e JSON-LD) */
export function largestSrc(asset: ImageAsset, ext: "avif" | "webp" = "webp"): string {
  return `${asset.src}-${Math.max(...asset.widths)}.${ext}`;
}
