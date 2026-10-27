import { MAIN_UNIT } from "@/data/business";
import { whatsappUrl } from "@/lib/whatsapp";

export const SECONDARY_CTA =
  "inline-flex items-center justify-center rounded-full border border-tinta/20 bg-farinha/70 px-6 py-3.5 font-semibold text-tinta transition-colors hover:border-primaria hover:text-primaria";

const VARIANTS = {
  /** Marsala sobre fundo claro (padrão) */
  primaria: "bg-primaria text-farinha shadow-[0_14px_40px_-16px_rgba(155,27,32,0.9)] hover:bg-vinho",
  /** Claro sobre fundo marsala (card do CTA final) */
  farinha: "bg-farinha text-primaria shadow-[0_14px_40px_-16px_rgba(42,10,12,0.6)] hover:bg-massa",
} as const;

interface CtaWhatsAppProps {
  /** data-track-local: onde o botão está na LP */
  local: string;
  /** Mensagem pronta do WhatsApp (anuncioMessage da página) */
  message: string;
  label?: string;
  variant?: keyof typeof VARIANTS;
  className?: string;
}

/** CTA principal da LP (WhatsApp da loja), repetido em todas as dobras. */
export function CtaWhatsApp({ local, message, label = "Pedir pelo WhatsApp", variant = "primaria", className = "" }: CtaWhatsAppProps) {
  return (
    <a
      href={whatsappUrl(MAIN_UNIT, message)}
      target="_blank"
      rel="noopener noreferrer"
      data-track="click_whatsapp"
      data-track-local={local}
      className={`group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-semibold transition-transform duration-300 hover:scale-[1.03] ${VARIANTS[variant]} ${className}`}
    >
      {label}
      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
        →
      </span>
    </a>
  );
}
