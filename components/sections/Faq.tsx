import { FAQ, QUICK_FACTS } from "@/data/content";
import { faqSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

interface FaqProps {
  /** JSON-LD FAQPage só numa página (home) para não duplicar o schema */
  withSchema?: boolean;
}

export function Faq({ withSchema = false }: FaqProps) {
  return (
    <section id="perguntas" data-section="faq" aria-labelledby="faq-titulo" className="section-space bg-farinha">
      {withSchema && <JsonLd data={faqSchema(FAQ)} />}
      <div className="container-popolare grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p data-reveal className="eyebrow text-primaria">
            Domande frequenti
          </p>
          <h2 id="faq-titulo" data-reveal className="mt-4 text-[length:var(--text-display)] leading-[1.02]">
            <span className="font-display uppercase tracking-[0.03em]">Perguntas </span>
            <span className="italiano text-primaria">de quem ama massa.</span>
          </h2>

          <section aria-labelledby="fatos-titulo" data-reveal className="mt-12 rounded-[1.75rem] border border-primaria/15 p-7">
            <h3 id="fatos-titulo" className="eyebrow text-madeira-escura">
              Popolare em fatos rápidos
            </h3>
            <dl className="mt-5 space-y-3 text-sm">
              {QUICK_FACTS.map((f) => (
                <div key={f.label} className="grid grid-cols-[7.5rem_1fr] gap-3">
                  <dt className="font-semibold text-tinta">{f.label}</dt>
                  <dd className="text-tinta-suave">{f.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <div className="divide-y divide-primaria/15 border-y border-primaria/15 lg:col-span-7">
          {FAQ.map((item) => (
            <details key={item.question} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left [&::-webkit-details-marker]:hidden">
                <h3 className="italiano text-2xl leading-snug text-tinta md:text-[1.7rem]">{item.question}</h3>
                <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full border border-primaria/30 text-primaria transition-transform duration-500 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="max-w-2xl pb-6 leading-relaxed text-tinta-suave">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
