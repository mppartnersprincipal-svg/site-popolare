import type { CSSProperties } from "react";
import { getImage, srcSet } from "@/lib/images";

interface PictureProps {
  /** Chave do manifesto (ex.: "produtos/agnolotti") */
  image: string;
  alt: string;
  /** Atributo sizes do srcset */
  sizes?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  style?: CSSProperties;
}

/**
 * <picture> com AVIF + WebP responsivos e placeholder blur.
 * Width/height reais evitam CLS; o recorte fica a cargo de object-fit no imgClassName.
 */
export function Picture({ image, alt, sizes = "100vw", priority = false, className, imgClassName, style }: PictureProps) {
  const asset = getImage(image);
  const baseWidth = 1080;
  const fallbackWidth = asset.widths.find((w) => w >= baseWidth) ?? asset.widths[asset.widths.length - 1];

  return (
    <picture className={className} style={style}>
      <source type="image/avif" srcSet={srcSet(asset, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(asset, "webp")} sizes={sizes} />
      <img
        src={`${asset.src}-${fallbackWidth}.webp`}
        alt={alt}
        width={baseWidth}
        height={Math.round(baseWidth * asset.aspect)}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding={priority ? "sync" : "async"}
        className={imgClassName}
        style={{ backgroundImage: `url(${asset.blur})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
    </picture>
  );
}
