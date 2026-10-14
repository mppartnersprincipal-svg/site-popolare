"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { BRAND, MAIN_UNIT } from "@/data/business";
import { findItem } from "@/data/menu";
import { isCoarsePointer, isLiteMode } from "@/lib/device";
import { experienceStore, pastaOption, useExperience } from "@/lib/experienceStore";
import { TROCAR_MASSA_ID } from "@/components/experience/IntroPastaPicker";
import { FrameSequence } from "@/lib/frameSequence";
import { productMessage, whatsappUrl } from "@/lib/whatsapp";
import { Picture } from "@/components/ui/Picture";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const CAPTIONS = [
  { eyebrow: `${MAIN_UNIT.street}, ${MAIN_UNIT.neighborhood}`, title: "Benvenuti alla Popolare", text: "Tijolinho, toldo listrado e a bandeira da Itália na porta." },
  { eyebrow: `Desde ${BRAND.foundingYear}`, title: "Entre, a casa é sua", text: "Uma família italiana que faz massa como se fosse para o almoço de domingo." },
  { eyebrow: "Massas e empório", title: "Il nostro emporio", text: "Massas no balcão, vinhos e importados nas prateleiras de madeira." },
] as const;

// Fatias do timeline (0–1): expansão do portal, scrub do vídeo e legendas
const EXPAND_END = 0.14;
const SCRUB_END = 0.94;
const MAX_DPR = 1.5;
const FRAMES_IDLE_DELAY_MS = 4000;
const BACKDROP_W = 48;
// Estado "hero" do portal no desktop (precisa bater com .portal-loja em globals.css)
const PORTAL_OFFSET_X = 0.24;
const PORTAL_HERO_SCALE = 0.8;

/** Mesmo arco do CSS mobile (.portal-loja): inset(max(50svh, 25rem) 7vw 3svh 7vw round 43vw 43vw 1.25rem 1.25rem) */
function mobileArchClip(): string {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const top = Math.max(vh * 0.5, 25 * rem);
  const side = vw * 0.07;
  const radius = vw * 0.43;
  const corner = 1.25 * rem;
  return `inset(${top}px ${side}px ${vh * 0.03}px ${side}px round ${radius}px ${radius}px ${corner}px ${corner}px)`;
}

export function HeroPortal() {
  const { selected, introDone } = useExperience();
  const option = pastaOption(selected);
  const product = findItem(option.productId);

  const pinRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const pictureRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backdropRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const sequenceRef = useRef<FrameSequence | null>(null);
  const progressRef = useRef(0);

  // A massa escolhida na intro "vira" o hero: a foto nasce ampliada e assenta no arco
  useEffect(() => {
    if (!introDone || !pictureRef.current) return;
    gsap.fromTo(
      pictureRef.current,
      { scale: 1.35, rotate: -4, filter: "saturate(1.4) brightness(1.08)" },
      { scale: 1, rotate: 0, filter: "saturate(1) brightness(1)", duration: 1.6, ease: "expo.out" }
    );
  }, [introDone, selected]);

  useGSAP(
    () => {
      if (isLiteMode()) return;
      // Celular: metade dos quadros (poupa ~150MB de imagens decodificadas no iOS)
      const sequence = new FrameSequence(undefined, isCoarsePointer() ? 2 : 1);
      sequenceRef.current = sequence;
      const canvas = canvasRef.current!;
      const backdrop = backdropRef.current!;
      // alpha: o canvas fica transparente (mostrando a foto) até o primeiro quadro carregar
      const ctx = canvas.getContext("2d")!;
      const bctx = backdrop.getContext("2d")!;

      const draw = () => {
        const p = progressRef.current;
        if (sequence.draw(ctx, p)) sequence.draw(bctx, p);
      };

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
        canvas.width = Math.round(canvas.clientWidth * dpr);
        canvas.height = Math.round(canvas.clientHeight * dpr);
        backdrop.width = BACKDROP_W;
        backdrop.height = Math.round((BACKDROP_W * backdrop.clientHeight) / Math.max(1, backdrop.clientWidth));
        draw();
      };
      const ro = new ResizeObserver(resize);
      ro.observe(canvas);

      // Os quadros só começam a baixar depois do load (não disputam o LCP) ou no primeiro scroll
      let startTimer = 0;
      const start = () => {
        window.removeEventListener("scroll", start);
        window.clearTimeout(startTimer);
        void sequence.preload(() => draw());
      };
      window.addEventListener("scroll", start, { once: true, passive: true });
      const onLoad = () => (startTimer = window.setTimeout(start, FRAMES_IDLE_DELAY_MS));
      if (document.readyState === "complete") onLoad();
      else window.addEventListener("load", onLoad, { once: true });

      const mm = gsap.matchMedia();
      mm.add({ isDesktop: "(min-width: 1024px)", isMobile: "(max-width: 1023.98px)" }, (context) => {
        const { isDesktop } = context.conditions as { isDesktop: boolean };
        if (isDesktop) {
          // Mesmo estado do CSS inicial (.portal-loja), agora controlado pelo GSAP
          gsap.set(portalRef.current, { xPercent: -50, yPercent: -50, x: () => window.innerWidth * PORTAL_OFFSET_X, scale: PORTAL_HERO_SCALE });
        }

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: pinRef.current,
            start: "top top",
            end: "+=340%",
            scrub: 0.6,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const p = gsap.utils.clamp(0, 1, (self.progress - EXPAND_END) / (SCRUB_END - EXPAND_END));
              if (p !== progressRef.current) {
                progressRef.current = p;
                requestAnimationFrame(draw);
              }
            },
          },
        });

        // 1) Texto sai, portal cresce e a foto do produto dá lugar à fachada
        tl.to(textRef.current, { y: -60, autoAlpha: 0, duration: EXPAND_END * 0.8 }, 0);
        tl.to(cueRef.current, { autoAlpha: 0, duration: 0.03 }, 0);
        if (isDesktop) {
          tl.to(portalRef.current, { x: 0, scale: 1, duration: EXPAND_END }, 0);
          tl.to(backdrop, { autoAlpha: 0.55, duration: EXPAND_END }, 0);
        } else {
          // Valores explícitos (4 lados + 4 raios): o clip-path computado vem abreviado pelo navegador
          // e o GSAP interpolaria números desalinhados, deformando o arco.
          tl.fromTo(
            portalRef.current,
            { clipPath: () => mobileArchClip() },
            { clipPath: "inset(0px 0px 0px 0px round 0px 0px 0px 0px)", duration: EXPAND_END, immediateRender: true },
            0
          );
        }
        tl.to(canvas, { autoAlpha: 1, duration: EXPAND_END * 0.4 }, EXPAND_END * 0.55);

        // 2) Legendas durante o passeio
        const slots = [0.24, 0.48, 0.72];
        gsap.utils.toArray<HTMLElement>("[data-legenda]", pinRef.current).forEach((el, i) => {
          tl.fromTo(el, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.06 }, slots[i]);
          tl.to(el, { autoAlpha: 0, y: -40, duration: 0.06 }, slots[i] + 0.16);
        });
        // Garante duração total = 1 para que o progresso do scroll mapeie direto nas fatias acima
        tl.set({}, {}, 1);
      });

      return () => {
        ro.disconnect();
        window.removeEventListener("scroll", start);
        window.removeEventListener("load", onLoad);
        window.clearTimeout(startTimer);
        mm.revert();
        sequence.dispose();
      };
    },
    { scope: pinRef }
  );

  const waHref = product ? whatsappUrl(MAIN_UNIT, productMessage(product)) : whatsappUrl(MAIN_UNIT, "");

  return (
    <section id="inicio" data-section="hero" aria-labelledby="hero-titulo" className="relative">
      <div ref={pinRef} className="relative h-[100svh] min-h-[36rem] overflow-hidden bg-creme">
        <canvas ref={backdropRef} aria-hidden className="absolute inset-0 hidden h-full w-full scale-125 opacity-0 blur-3xl lg:block" />

        <div ref={portalRef} className="portal-loja absolute overflow-hidden bg-vinho shadow-[0_40px_120px_-40px_rgba(89,14,19,0.65)]">
          <div ref={pictureRef} className="absolute inset-0">
            <Picture
              key={option.image}
              image={option.image}
              alt={product ? `${product.nameIt} — ${product.description}` : "Massa artesanal Popolare"}
              sizes="(min-width: 1024px) 40vw, 90vw"
              priority
              className="block h-full w-full"
              imgClassName="h-full w-full object-cover"
            />
          </div>
          <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full opacity-0" />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-tinta/45 via-transparent to-transparent" />
        </div>

        <div
          ref={textRef}
          className="container-popolare relative z-10 flex h-full flex-col pt-24 sm:pt-28 lg:max-w-none lg:justify-center lg:pt-0"
        >
          <div className="lg:max-w-[30rem] xl:max-w-[40rem]">
            <p className="eyebrow text-primaria">Massas e Empório · {BRAND.city}, dal {BRAND.foundingYear}</p>
            <h1 id="hero-titulo" tabIndex={-1} className="mt-4 text-tinta outline-none sm:mt-6">
              <span className="block font-display text-[clamp(2.4rem,1rem+4.2vw,5.6rem)] uppercase leading-[0.95] tracking-[0.04em]">
                Massas italianas
              </span>
              <span className="italiano block text-[clamp(2.6rem,1.2rem+5.8vw,6.8rem)] leading-[0.9] text-primaria">artesanais,</span>
              <span className="mt-2 block text-[clamp(1.05rem,0.9rem+0.6vw,1.5rem)] font-medium text-tinta-suave">
                feitas à mão em Goiânia.
              </span>
            </h1>
            <p className="mt-5 hidden max-w-md text-base leading-relaxed text-tinta-suave sm:block lg:mt-8 lg:text-lg">
              Da família Popolare para a sua mesa: massas frescas recheadas, molhos sem conservantes e um empório cheio de
              Itália. É só levar ao forno.
            </p>

            {product && (
              // A escolha da intro fica visível e reversível: o selo é o próprio botão de troca
              <button
                type="button"
                id={TROCAR_MASSA_ID}
                onClick={() => experienceStore.reopenPicker()}
                data-track="click_cta"
                data-track-local="hero-trocar-massa"
                aria-label={`Sua escolha: ${product.nameIt}. Trocar massa`}
                className="group mt-4 inline-flex max-w-full items-center gap-3 rounded-full border border-primaria/20 bg-farinha/70 py-1.5 pl-1.5 pr-2 text-left text-sm backdrop-blur transition-[border-color,box-shadow] duration-300 hover:border-primaria/50 hover:shadow-[0_10px_30px_-18px_rgba(89,14,19,0.6)] sm:mt-5 lg:mt-8"
              >
                <span aria-hidden className="relative size-9 shrink-0 overflow-hidden rounded-full ring-2 ring-farinha">
                  <Picture image={option.thumb} alt="" sizes="36px" className="block h-full w-full" imgClassName="h-full w-full object-cover" />
                </span>
                <span className="min-w-0 leading-tight">
                  <span className="block text-[0.65rem] font-bold uppercase tracking-wider text-primaria max-[379px]:hidden">Sua escolha</span>
                  <span className="italiano block truncate text-lg leading-none">{product.nameIt}</span>
                </span>
                <span className="ml-1 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primaria px-3 py-1.5 text-xs font-semibold text-farinha transition-colors group-hover:bg-vinho">
                  <span aria-hidden className="inline-block transition-transform duration-500 group-hover:-rotate-180">
                    ↻
                  </span>
                  Trocar
                </span>
              </button>
            )}

            <div className="mt-4 flex flex-wrap gap-2 sm:mt-5 sm:gap-3 lg:mt-8">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                data-track="click_whatsapp"
                data-track-local="hero"
                data-track-produto={product?.id}
                className="group inline-flex items-center gap-2 rounded-full bg-primaria px-5 py-3 text-sm font-semibold text-farinha shadow-[0_14px_40px_-16px_rgba(155,27,32,0.9)] transition-transform duration-300 hover:scale-[1.04] hover:bg-vinho sm:gap-3 sm:px-6 sm:py-3.5 sm:text-base"
              >
                <span>
                  <span className="max-[379px]:hidden">Pedir pelo </span>WhatsApp
                </span>
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </a>
              <a
                href={MAIN_UNIT.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-track="click_directions"
                data-track-local="hero"
                className="inline-flex items-center rounded-full border border-tinta/20 bg-farinha/60 px-5 py-3 text-sm font-semibold text-tinta backdrop-blur transition-colors hover:border-primaria hover:text-primaria sm:px-6 sm:py-3.5 sm:text-base"
              >
                Como chegar
              </a>
            </div>
          </div>
        </div>

        {CAPTIONS.map((c, i) => (
          <div
            key={c.title}
            data-legenda
            className={`pointer-events-none invisible absolute z-20 max-w-xs text-farinha opacity-0 max-lg:inset-x-[var(--gutter)] max-lg:bottom-[12svh] lg:top-1/2 lg:-translate-y-1/2 lg:text-tinta ${
              i % 2 === 0 ? "lg:left-[var(--gutter)]" : "lg:right-[var(--gutter)] lg:text-right"
            }`}
          >
            <p className="eyebrow text-dourado lg:text-primaria">{c.eyebrow}</p>
            <p className="italiano mt-3 text-4xl leading-none lg:text-5xl">{c.title}</p>
            <p className="mt-3 text-sm leading-relaxed opacity-90 lg:text-base">{c.text}</p>
          </div>
        ))}

        <div ref={cueRef} aria-hidden className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-tinta-suave lg:flex">
          <span className="eyebrow text-[0.62rem]">Role para entrar</span>
          <span className="h-10 w-px origin-top animate-[cue_1.8s_var(--ease-massa)_infinite] bg-current" />
        </div>
      </div>
    </section>
  );
}
