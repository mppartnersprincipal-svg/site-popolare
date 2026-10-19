"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MAIN_UNIT, ORDER_RULES } from "@/data/business";
import { isValidOrderDate, minOrderDate } from "@/lib/businessDays";
import type { OrderFields } from "@/lib/orderSchema";
import { track } from "@/lib/tracking";
import { orderMessage, unitById, whatsappUrl } from "@/lib/whatsapp";

type Errors = Partial<Record<OrderFields, string>>;
type SchemaModule = typeof import("@/lib/orderSchema");

// zod fica fora do bundle inicial: carrega quando o visitante foca o formulário
let schemaModule: SchemaModule | null = null;
const loadSchema = async (): Promise<SchemaModule> => (schemaModule ??= await import("@/lib/orderSchema"));
const subscribeNoop = () => () => {};

interface OrderFormProps {
  headingLevel?: "h1" | "h2";
}

function formatPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function OrderForm({ headingLevel = "h2" }: OrderFormProps) {
  const Heading = headingLevel;
  // Data mínima só no cliente (fuso do visitante; Date no prerender quebraria o cacheComponents)
  const minDate = useSyncExternalStore(subscribeNoop, () => minOrderDate(new Date(), ORDER_RULES.minBusinessDays), () => "");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sentUrl, setSentUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const thanksRef = useRef<HTMLParagraphElement>(null);

  // Troca formulário ↔ confirmação muda a altura: remede o ScrollTrigger e leva o foco à confirmação
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    if (sentUrl) thanksRef.current?.focus();
    return () => cancelAnimationFrame(id);
  }, [sentUrl]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    if (form.get("empresa")) return; // honeypot preenchido por bots

    // Normalmente já carregado no foco — mantém o window.open dentro do gesto do usuário
    let mod: SchemaModule;
    try {
      mod = schemaModule ?? (await loadSchema());
      setLoadError(false);
    } catch {
      setLoadError(true);
      return;
    }
    const parsed = mod.orderSchema.safeParse({
      nome: form.get("nome"),
      telefone: form.get("telefone"),
      unidade: form.get("unidade"),
      data: form.get("data"),
      itens: form.get("itens"),
      refratario: form.get("refratario") === "on",
      observacoes: form.get("observacoes") || undefined,
    });

    const nextErrors: Errors = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) nextErrors[issue.path[0] as keyof Errors] ??= issue.message;
    } else if (!isValidOrderDate(parsed.data.data, new Date(), ORDER_RULES.minBusinessDays)) {
      nextErrors.data = `Encomendas precisam de ${ORDER_RULES.minBusinessDays} dias úteis de antecedência (domingo a loja fecha).`;
    }
    setErrors(nextErrors);
    if (!parsed.success || Object.keys(nextErrors).length > 0) {
      // aguarda o React aplicar aria-invalid antes de focar o primeiro campo com erro
      requestAnimationFrame(() => formEl.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }

    const order = { ...parsed.data, telefone: formatPhone(parsed.data.telefone) };
    const url = whatsappUrl(unitById(order.unidade), orderMessage(order));
    track("form_submit", { formulario: "encomenda", unidade: order.unidade, refratario: order.refratario });
    // Pode ser bloqueado (navegador do Instagram, Safari): a tela de sucesso mantém um link para abrir
    window.open(url, "_blank", "noopener,noreferrer");
    setSentUrl(url);
  };

  const field = "mt-2 w-full rounded-2xl border border-tinta/15 bg-farinha px-4 py-3.5 text-tinta outline-none transition-colors focus:border-primaria aria-[invalid=true]:border-tomate";
  const errorText = (key: keyof Errors) =>
    errors[key] ? (
      <p id={`erro-${key}`} className="mt-1.5 text-sm text-tomate">
        {errors[key]}
      </p>
    ) : null;

  return (
    <section id="encomendas" data-section="encomendas" aria-labelledby="encomenda-titulo" className="section-space relative bg-massa/40">
      <div className="container-popolare grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p data-reveal className="eyebrow text-primaria">
            Su ordinazione
          </p>
          <Heading id="encomenda-titulo" data-reveal className="mt-4 text-[length:clamp(2.2rem,1.2rem+3.2vw,4.4rem)] leading-[1.02]">
            <span className="font-display uppercase tracking-[0.03em]">Encomendas </span>
            <span className="italiano text-primaria">no seu refratário.</span>
          </Heading>
          <p data-reveal className="mt-6 max-w-md text-lg leading-relaxed text-tinta-suave">
            {ORDER_RULES.note} Para almoços de família, festas e eventos: monte o pedido aqui e finalize com a loja pelo WhatsApp.
          </p>
        </div>

        <form onSubmit={onSubmit} onFocusCapture={() => void loadSchema()} noValidate className="rounded-[2rem] bg-creme p-6 shadow-[0_30px_80px_-50px_rgba(89,14,19,0.6)] md:p-10 lg:col-span-7">
          {sentUrl ? (
            <div role="status" className="py-10 text-center">
              <p ref={thanksRef} tabIndex={-1} className="italiano text-4xl text-primaria outline-none">
                Grazie!
              </p>
              <p className="mx-auto mt-3 max-w-sm text-tinta-suave">
                Seu pedido está pronto no WhatsApp. É só enviar a mensagem para a loja confirmar. Se o WhatsApp não abriu, toque no botão abaixo.
              </p>
              <a
                href={sentUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-track="click_whatsapp"
                data-track-local="encomenda-sucesso"
                className="mt-6 inline-flex rounded-full bg-primaria px-6 py-3 font-semibold text-farinha hover:bg-vinho"
              >
                Abrir WhatsApp
              </a>
              <p className="mt-5">
                <button type="button" onClick={() => setSentUrl(null)} className="eyebrow text-primaria underline-offset-4 hover:underline">
                  Fazer outra encomenda
                </button>
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              <label className="hidden" aria-hidden>
                Empresa
                <input name="empresa" tabIndex={-1} autoComplete="off" />
              </label>
              <label className="text-sm font-semibold">
                Nome
                <input name="nome" autoComplete="name" maxLength={100} className={field} aria-invalid={!!errors.nome} aria-describedby={errors.nome ? "erro-nome" : undefined} />
                {errorText("nome")}
              </label>
              <label className="text-sm font-semibold">
                WhatsApp
                <input
                  name="telefone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(62) 99999-0000"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  className={field}
                  aria-invalid={!!errors.telefone}
                  aria-describedby={errors.telefone ? "erro-telefone" : undefined}
                />
                {errorText("telefone")}
              </label>
              <div className="text-sm font-semibold">
                Retirada na loja
                <p className={`${field} font-normal text-tinta-suave`}>
                  {MAIN_UNIT.name} · {MAIN_UNIT.street}
                </p>
                <input type="hidden" name="unidade" value={MAIN_UNIT.id} />
              </div>
              <label className="text-sm font-semibold">
                Data de retirada
                <input
                  name="data"
                  type="date"
                  min={minDate || undefined}
                  className={field}
                  aria-invalid={!!errors.data}
                  aria-describedby={errors.data ? "erro-data" : "dica-data"}
                />
                {errors.data ? errorText("data") : <p id="dica-data" className="mt-1.5 text-xs font-normal text-tinta-suave">Mínimo de {ORDER_RULES.minBusinessDays} dias úteis.</p>}
              </label>
              <label className="text-sm font-semibold md:col-span-2">
                O que você quer encomendar?
                <textarea
                  name="itens"
                  rows={3}
                  maxLength={600}
                  placeholder="Ex.: 2 lasanhas à bolonhesa e 1 tiramisù"
                  className={field}
                  aria-invalid={!!errors.itens}
                  aria-describedby={errors.itens ? "erro-itens" : undefined}
                />
                {errorText("itens")}
              </label>
              <label className="flex items-center gap-3 text-sm font-semibold md:col-span-2">
                <input name="refratario" type="checkbox" className="size-5 accent-[var(--cor-primaria)]" />
                Quero que montem a massa no meu refratário
              </label>
              <label className="text-sm font-semibold md:col-span-2">
                Observações <span className="font-normal text-tinta-suave">(opcional)</span>
                <input name="observacoes" maxLength={500} className={field} />
              </label>
              <button
                type="submit"
                className="mt-2 rounded-full bg-primaria px-8 py-4 font-semibold text-farinha shadow-[0_14px_40px_-16px_rgba(155,27,32,0.9)] transition-transform duration-300 hover:scale-[1.02] hover:bg-vinho md:col-span-2"
              >
                Enviar encomenda pelo WhatsApp
              </button>
              {loadError && (
                <p role="alert" className="text-sm text-tomate md:col-span-2">
                  Não conseguimos carregar o formulário (conexão instável). Tente de novo ou chame a loja direto no WhatsApp.
                </p>
              )}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
