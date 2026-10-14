import { PRESS } from "@/data/content";
import { Picture } from "@/components/ui/Picture";

interface PressProps {
  headingLevel?: "h1" | "h2";
}

export function Press({ headingLevel = "h2" }: PressProps) {
  const Heading = headingLevel;
  return (
    <section id="midia" data-section="midia" aria-labelledby="midia-titulo" className="section-space bg-primaria text-farinha">
      <div className="container-popolare">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p data-reveal className="eyebrow text-dourado">
              Dicono di noi
            </p>
            <Heading id="midia-titulo" data-reveal className="mt-4 text-[length:var(--text-display)] leading-[1.02]">
              <span className="italiano text-massa">Na mídia</span>
            </Heading>
            <p data-reveal className="mt-4 max-w-md text-farinha/75">
              A história da Carina, que assumiu a fábrica dos pais, já foi contada pela imprensa.
            </p>
          </div>
          <figure data-reveal className="w-28 shrink-0 sm:w-40 md:w-56">
            <div className="aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[1.25rem] ring-1 ring-farinha/20">
              <Picture
                image="equipe/carina-fogao"
                alt="Carina Popolare na cozinha, ao lado do fogão com panelas laranja"
                sizes="(min-width: 768px) 14rem, 8rem"
                className="block h-full w-full"
                imgClassName="h-full w-full object-cover object-[50%_25%]"
              />
            </div>
            <figcaption className="eyebrow mt-3 text-center text-[0.6rem] text-farinha/70">Carina Popolare</figcaption>
          </figure>
        </div>
        <ul className="mt-12 grid gap-px overflow-hidden rounded-[1.75rem] bg-farinha/15 md:grid-cols-2">
          {PRESS.map((item) => {
            const content = (
              <>
                <p className="eyebrow text-dourado">
                  {item.outlet}
                  {item.year ? ` · ${item.year}` : ""}
                </p>
                <p className="italiano mt-4 text-[1.7rem] leading-snug">“{item.title}”</p>
                {item.url && <span className="eyebrow mt-6 inline-block text-farinha/70 group-hover:text-farinha">Ler matéria →</span>}
              </>
            );
            return (
              <li key={item.title} data-reveal className="bg-primaria">
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="group block h-full p-8 transition-colors hover:bg-vinho md:p-10">
                    {content}
                  </a>
                ) : (
                  <div className="h-full p-8 md:p-10">{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
