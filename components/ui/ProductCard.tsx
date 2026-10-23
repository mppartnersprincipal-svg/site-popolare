"use client";

import { animated, to, useSpring } from "@react-spring/web";
import type { PointerEvent } from "react";
import { MAIN_UNIT } from "@/data/business";
import { prefersReducedMotion } from "@/lib/device";
import { BADGE_LABEL, type MenuItem } from "@/data/menu";
import { productMessage, whatsappUrl } from "@/lib/whatsapp";
import { Picture } from "@/components/ui/Picture";

interface ProductCardProps {
  item: MenuItem;
  /** Lista de origem para o tracking (home, cardapio) */
  origem: string;
}

const MAX_TILT_DEG = 7;

export function ProductCard({ item, origem }: ProductCardProps) {
  const [spring, api] = useSpring(() => ({ rx: 0, ry: 0, lift: 0, glowX: 50, glowY: 30, config: { tension: 260, friction: 22 } }));

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse" || prefersReducedMotion()) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    api.start({ rx: (0.5 - py) * MAX_TILT_DEG * 2, ry: (px - 0.5) * MAX_TILT_DEG * 2, lift: 1, glowX: px * 100, glowY: py * 100 });
  };
  const onLeave = () => api.start({ rx: 0, ry: 0, lift: 0 });

  const tags = [
    item.badge && BADGE_LABEL[item.badge],
    item.onOrder && "Sob encomenda",
    item.lactoseFree && "Sem lactose",
  ].filter(Boolean) as string[];

  return (
    <animated.article
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{
        transform: to(
          [spring.rx, spring.ry, spring.lift],
          (rx, ry, lift) => `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(${lift * -6}px)`
        ),
      }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-farinha shadow-[0_24px_60px_-36px_rgba(89,14,19,0.55)] [transform-style:preserve-3d]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {item.image ? (
          <Picture
            image={item.image}
            alt={`${item.nameIt} — ${item.description}`}
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 88vw"
            className="block h-full w-full"
            imgClassName="h-full w-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.07]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primaria p-6 text-center">
            <p className="italiano text-4xl leading-none text-massa">{item.nameIt}</p>
          </div>
        )}
        <animated.span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: to(
              [spring.glowX, spring.glowY],
              (x, y) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,240,210,0.9), transparent 55%)`
            ),
          }}
        />
        {tags.length > 0 && (
          <ul className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <li key={t} className="rounded-full bg-farinha/90 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wider text-primaria backdrop-blur">
                {t}
              </li>
            ))}
          </ul>
        )}
        {item.imageIllustrative && item.image && (
          <p className="absolute bottom-3 right-3 rounded-full bg-tinta/60 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-wider text-farinha backdrop-blur">
            Imagem ilustrativa
          </p>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="italiano text-[1.75rem] leading-[1.05] text-tinta">{item.nameIt}</h3>
        {item.namePt !== item.nameIt && <p className="mt-1 text-sm font-medium text-tinta-suave">{item.namePt}</p>}
        <p className="mt-3 flex-1 text-sm leading-relaxed text-tinta-suave">{item.description}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-tinta-suave">{item.size}</p>
          <a
            href={whatsappUrl(MAIN_UNIT, productMessage(item))}
            target="_blank"
            rel="noopener noreferrer"
            data-track="click_whatsapp"
            data-track-local={origem}
            data-track-produto={item.id}
            aria-label={`Pedir ${item.nameIt} pelo WhatsApp`}
            className="rounded-full bg-primaria px-4 py-2 text-sm font-semibold text-farinha transition-transform duration-300 hover:scale-105 hover:bg-vinho"
          >
            Pedir
          </a>
        </div>
      </div>
    </animated.article>
  );
}
