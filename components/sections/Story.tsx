import Link from "next/link";
import { PILLARS, STORY, STORY_INTRO } from "@/data/content";
import { BRAND } from "@/data/business";
import { Picture } from "@/components/ui/Picture";

interface StoryProps {
  /** Na home mostra link para a página completa */
  showMoreLink?: boolean;
}

export function Story({ showMoreLink = true }: StoryProps) {
  return (
    <section id="historia" data-section="historia" aria-labelledby="historia-titulo" className="section-space relative">
      <div className="container-popolare">
        <p data-reveal className="eyebrow text-primaria">
          La nostra storia · desde {BRAND.foundingYear}
        </p>
        <h2 id="historia-titulo" data-reveal className="mt-5 max-w-5xl text-[length:var(--text-display)] leading-[1.02] text-tinta">
          <span className="font-display uppercase tracking-[0.03em]">Uma família, </span>
          <span className="italiano text-primaria">uma receita,</span>
          <span className="font-display uppercase tracking-[0.03em]"> uma cidade.</span>
        </h2>
        <p data-reveal className="mt-8 max-w-2xl text-lg leading-relaxed text-tinta-suave md:text-xl">
          {STORY_INTRO}
        </p>

        <ol className="mt-20 space-y-24 md:mt-28 md:space-y-36">
          {STORY.map((chapter, i) => {
            const isEven = i % 2 === 0;
            return (
              <li key={chapter.id} className="grid items-center gap-10 md:grid-cols-12 md:gap-6">
                <div
                  className={`relative md:col-span-6 ${isEven ? "md:col-start-1" : "md:order-2 md:col-start-7"}`}
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[1.5rem] shadow-[0_40px_80px_-40px_rgba(89,14,19,0.55)]">
                    <div data-parallax="0.18" className="absolute -inset-y-[12%] inset-x-0">
                      <Picture
                        image={chapter.image}
                        alt={chapter.imageAlt}
                        sizes="(min-width: 768px) 45vw, 92vw"
                        className="block h-full w-full"
                        imgClassName="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                  <span
                    aria-hidden
                    className={`italiano absolute -bottom-8 text-[clamp(5rem,3rem+8vw,10rem)] leading-none text-primaria/15 ${
                      isEven ? "-right-2 md:-right-10" : "-left-2 md:-left-10"
                    }`}
                  >
                    0{i + 1}
                  </span>
                </div>

                <div className={`md:col-span-5 ${isEven ? "md:col-start-8" : "md:col-start-1 md:order-1"}`}>
                  <p data-reveal className="eyebrow text-madeira-escura">
                    {chapter.marker}
                  </p>
                  <h3 data-reveal className="italiano mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.4rem)] leading-[1.02] text-tinta">
                    {chapter.title}
                  </h3>
                  <p data-reveal className="mt-6 text-lg leading-relaxed text-tinta-suave">
                    {chapter.text}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <ul className="mt-28 grid gap-px overflow-hidden rounded-[1.5rem] bg-primaria/15 md:mt-36 md:grid-cols-3">
          {PILLARS.map((p) => (
            <li key={p.title} data-reveal className="bg-farinha p-8 md:p-10">
              <p className="italiano text-3xl text-primaria">{p.title}</p>
              <p className="mt-3 leading-relaxed text-tinta-suave">{p.text}</p>
            </li>
          ))}
        </ul>

        {showMoreLink && (
          <p data-reveal className="mt-10">
            <Link href="/sobre-nos" className="eyebrow text-primaria underline-offset-8 hover:underline">
              Ler a história completa →
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
