import { LP_STEPS } from "@/data/lp";

/** Como funciona o pedido pelo site, em 3 passos. */
export function LpSteps() {
  return (
    <section data-section="lp-passos" aria-labelledby="lp-passos-titulo" className="bg-massa/40 py-16 md:py-24">
      <div className="container-popolare grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-4">
          <p className="eyebrow text-primaria">Come funziona</p>
          <h2 id="lp-passos-titulo" className="mt-4 text-[clamp(2rem,1.2rem+3vw,3.8rem)] leading-[1.05]">
            <span className="font-display uppercase tracking-[0.03em]">Pedir pelo site </span>
            <span className="italiano text-primaria">é simples assim</span>
          </h2>
          <p className="mt-4 text-tinta-suave">Você monta a lista, a loja responde no WhatsApp. Nada de cadastro, senha ou pagamento online.</p>
        </div>
        <ol className="grid gap-4 sm:grid-cols-3 lg:col-span-8">
          {LP_STEPS.map((step, i) => (
            <li key={step.title} className="relative rounded-[1.5rem] bg-farinha p-6 shadow-[0_20px_50px_-40px_rgba(89,14,19,0.6)] md:p-7">
              <span aria-hidden className="font-display text-5xl leading-none text-primaria/25">
                0{i + 1}
              </span>
              <h3 className="italiano mt-4 text-2xl leading-tight text-tinta">
                <span className="sr-only">Passo {i + 1}: </span>
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-tinta-suave">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
