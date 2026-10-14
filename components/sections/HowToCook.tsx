import { HOW_TO } from "@/data/content";
import { Picture } from "@/components/ui/Picture";

const COLUMNS = [
  { ...HOW_TO.assar, image: "produtos/lasagne-bolognese-cucina", alt: "Lasanha à bolonhesa gratinada servida no prato", position: "object-center" },
  { ...HOW_TO.cozinhar, image: "equipe/carina-panela", alt: "Carina Popolare mexendo a massa numa panela laranja sobre o fogão", position: "object-[50%_60%]" },
];

interface HowToCookProps {
  headingLevel?: "h1" | "h2";
}

export function HowToCook({ headingLevel = "h2" }: HowToCookProps) {
  const Heading = headingLevel;
  const SubHeading = headingLevel === "h1" ? "h2" : "h3";
  return (
    <section id="modo-de-preparo" data-section="modo-de-preparo" aria-labelledby="preparo-titulo" className="section-space">
      <div className="container-popolare">
        <p data-reveal className="eyebrow text-primaria">
          Come si prepara
        </p>
        <Heading id="preparo-titulo" data-reveal className="mt-4 text-[length:var(--text-display)] leading-[1.02]">
          <span className="font-display uppercase tracking-[0.03em]">Do congelador </span>
          <span className="italiano text-primaria">à mesa.</span>
        </Heading>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {COLUMNS.map((col) => (
            <article key={col.title} data-reveal className="overflow-hidden rounded-[1.75rem] bg-farinha">
              <div className="relative aspect-[16/10] overflow-hidden">
                <Picture image={col.image} alt={col.alt} sizes="(min-width: 768px) 45vw, 92vw" className="block h-full w-full" imgClassName={`h-full w-full object-cover ${col.position}`} />
              </div>
              <div className="p-7 md:p-10">
                <SubHeading className="italiano text-4xl text-tinta">{col.title}</SubHeading>
                <p className="mt-1 text-sm text-tinta-suave">{col.subtitle}</p>
                <ol className="mt-6 space-y-4">
                  {col.steps.map((step, i) => (
                    <li key={step} className="flex gap-4">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primaria font-display text-sm text-farinha">{i + 1}</span>
                      <p className="pt-1.5 leading-relaxed text-tinta-suave">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
