"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { BADGE_LABEL, findItem } from "@/data/menu";
import { MAIN_UNIT } from "@/data/business";
import { isLiteMode } from "@/lib/device";
import { PASTA_OPTIONS, useExperience } from "@/lib/experienceStore";
import { productMessage, whatsappUrl } from "@/lib/whatsapp";
import { Picture } from "@/components/ui/Picture";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function ProductShowcase() {
  const { selected } = useExperience();
  // A massa escolhida na intro abre a vitrine
  const slides = [...PASTA_OPTIONS].sort((a, b) => Number(b.kind === selected) - Number(a.kind === selected));
  const [active, setActive] = useState(0);
  const [isPinned, setIsPinned] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (isLiteMode()) return;
      setIsPinned(true);
      // o layout muda de lista para palco pinado: remede todos os triggers no próximo frame
      const refreshId = requestAnimationFrame(() => ScrollTrigger.refresh());
      const st = ScrollTrigger.create({
        trigger: stageRef.current,
        start: "top top",
        end: `+=${slides.length * 90}%`,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => setActive(Math.min(slides.length - 1, Math.floor(self.progress * slides.length))),
      });
      return () => {
        cancelAnimationFrame(refreshId);
        st.kill();
      };
    },
    { scope: rootRef, dependencies: [slides.length] }
  );

  return (
    <section ref={rootRef} id="vitrine" data-section="vitrine" aria-labelledby="vitrine-titulo" className="relative bg-farinha">
      <div ref={stageRef} className={isPinned ? "relative h-[100svh] min-h-[38rem] overflow-hidden" : "section-space"}>
        <div className="container-popolare flex h-full flex-col pt-20 md:pt-24">
          <div className="flex items-end justify-between gap-6">
            <h2 id="vitrine-titulo" className="eyebrow text-primaria">
              La vetrina · as massas da casa
            </h2>
            {isPinned && (
              <p aria-hidden className="font-display text-sm tracking-[0.3em] text-tinta-suave">
                0{active + 1} / 0{slides.length}
              </p>
            )}
          </div>

          <ul className={isPinned ? "relative mt-6 flex-1" : "mt-10 space-y-24"}>
            {slides.map((s, i) => {
              const product = findItem(s.productId)!;
              const isActive = !isPinned || i === active;
              return (
                <li
                  key={s.kind}
                  aria-hidden={isPinned && !isActive}
                  className={
                    isPinned
                      ? `absolute inset-0 grid grid-rows-[1fr_auto] gap-6 pb-8 transition-[opacity,visibility] duration-700 md:grid-cols-12 md:grid-rows-1 md:items-center ${
                          isActive ? "visible opacity-100" : "invisible opacity-0"
                        }`
                      : "grid gap-8 md:grid-cols-12 md:items-center"
                  }
                >
                  <div className="relative min-h-0 md:order-2 md:col-span-6 md:col-start-7 md:h-[72svh]">
                    <div
                      className={`relative mx-auto h-full max-h-[44svh] w-full max-w-[34rem] overflow-hidden rounded-t-[999px] rounded-b-[1.75rem] transition-[clip-path] duration-1000 ease-[var(--ease-out-expo)] md:max-h-none ${
                        isActive ? "[clip-path:inset(0_0_0_0)]" : "[clip-path:inset(100%_0_0_0)]"
                      } aspect-[4/5] md:aspect-auto`}
                    >
                      <Picture
                        image={s.image}
                        alt={`${product.nameIt}: ${product.description}`}
                        sizes="(min-width: 768px) 40vw, 90vw"
                        className="block h-full w-full"
                        imgClassName={`h-full w-full object-cover transition-transform duration-[1600ms] ease-[var(--ease-out-expo)] ${
                          isActive ? "scale-100" : "scale-110"
                        }`}
                      />
                    </div>
                    {isActive && isPinned && (
                      <span
                        key={`3d-${s.kind}`}
                        data-3d={`vetrina:${s.kind}`}
                        data-3d-state="idle"
                        aria-hidden
                        className="pointer-events-none absolute -bottom-6 -left-2 block size-36 md:-left-16 md:bottom-6 md:size-64"
                      />
                    )}
                  </div>

                  <div className="md:order-1 md:col-span-5">
                    {product.badge && (
                      <p className="mb-4 inline-block rounded-full bg-dourado px-3 py-1 text-xs font-bold uppercase tracking-wider text-tinta">
                        {BADGE_LABEL[product.badge]}
                      </p>
                    )}
                    <h3 className="italiano text-[clamp(2.8rem,1.6rem+5vw,6.5rem)] leading-[0.9] text-primaria">{product.nameIt}</h3>
                    <p className="mt-2 font-display text-sm uppercase tracking-[0.3em] text-tinta-suave">{product.namePt}</p>
                    <p className="mt-5 max-w-md text-base leading-relaxed text-tinta-suave md:text-lg">{product.description}</p>
                    <p className="mt-5 font-display text-sm uppercase tracking-[0.25em] text-tinta-suave">{product.size}</p>
                    <a
                      href={whatsappUrl(MAIN_UNIT, productMessage(product))}
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={isActive ? 0 : -1}
                      data-track="click_whatsapp"
                      data-track-local="vitrine"
                      data-track-produto={product.id}
                      className="mt-6 inline-flex items-center gap-3 rounded-full bg-primaria px-6 py-3.5 font-semibold text-farinha transition-transform duration-300 hover:scale-[1.04] hover:bg-vinho"
                    >
                      Quero esse <span aria-hidden>→</span>
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>

          {isPinned && (
            <div aria-hidden className="mb-6 flex gap-2">
              {slides.map((s, i) => (
                <span key={s.kind} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= active ? "bg-primaria" : "bg-primaria/15"}`} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
