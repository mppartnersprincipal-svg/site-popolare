"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { isLiteMode } from "@/lib/device";
import { Picture } from "@/components/ui/Picture";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ITEMS = [
  { image: "loja/janela-emporio", alt: "Prateleiras de madeira do empório com janela em arco e cortinas de linho", title: "A janela do empório", wide: true },
  { image: "loja/vinhos", alt: "Adega com vinhos italianos e nacionais", title: "Vinhos para cada massa", wide: false },
  { image: "equipe/carina-emporio", alt: "Carina Popolare no empório, entre a janela de cortinas de linho e as prateleiras de massas secas", title: "Escolhido pela Carina", wide: true },
  { image: "loja/grissini", alt: "Grissini, torradas e farofas artesanais nas prateleiras", title: "Grissini e crocantes", wide: true },
  { image: "loja/prateleiras", alt: "Biscoitos, doces italianos e geleias", title: "Dolci da dispensa", wide: false },
  { image: "equipe/carina-balcao", alt: "Carina Popolare de dólmã branco, apoiada no balcão refrigerado das massas, com o empório ao fundo", title: "O balcão das massas", wide: true },
  { image: "cucina/lasagne-fogao", alt: "Lasanha quatro queijos servida na cozinha", title: "E em casa, assim", wide: false },
] as const;

export function Emporio() {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      if (isLiteMode()) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const track = trackRef.current!;
        // sem GSAP (modo leve) a lista continua rolável; com o pin, o GSAP assume o deslocamento
        gsap.set(track, { overflowX: "visible" });
        const distance = () => track.scrollWidth - window.innerWidth;
        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 0.8,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      id="emporio"
      data-section="emporio"
      aria-labelledby="emporio-titulo"
      className="relative overflow-hidden bg-[#2b140d] py-20 text-farinha lg:flex lg:h-[100svh] lg:flex-col lg:justify-center lg:py-0"
    >
      <div className="container-popolare">
        <p className="eyebrow text-dourado">L&apos;emporio</p>
        <h2 id="emporio-titulo" className="mt-4 max-w-3xl text-[clamp(2.2rem,1.4rem+3vw,4.4rem)] leading-[1.02]">
          <span className="italiano text-dourado">Tudo o que acompanha</span>{" "}
          <span className="font-display uppercase tracking-[0.03em]">uma boa massa.</span>
        </h2>
        <p className="mt-5 max-w-xl text-farinha/75">
          Vinhos, azeites, grissini, biscoitos e doces importados — escolhidos a dedo, nas prateleiras de madeira da loja.
        </p>
      </div>

      <ul
        ref={trackRef}
        data-lenis-prevent-touch
        tabIndex={0}
        role="region"
        aria-label="Galeria de fotos do empório"
        className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-4 outline-none [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-dourado lg:mt-14 lg:snap-none lg:gap-6"
      >
        {ITEMS.map((item) => (
          <li
            key={item.image}
            className={`relative shrink-0 snap-center overflow-hidden rounded-[1.5rem] ${
              item.wide ? "w-[82vw] lg:w-[46vw]" : "w-[62vw] lg:w-[24vw]"
            } h-[52svh] lg:h-[58vh]`}
          >
            <Picture
              image={item.image}
              alt={item.alt}
              sizes={item.wide ? "(min-width: 1024px) 46vw, 82vw" : "(min-width: 1024px) 24vw, 62vw"}
              className="block h-full w-full"
              imgClassName="h-full w-full object-cover"
            />
            <p className="italiano absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 pt-16 text-2xl">
              {item.title}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
