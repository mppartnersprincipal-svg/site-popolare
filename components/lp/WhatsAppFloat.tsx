import { MAIN_UNIT } from "@/data/business";
import { whatsappUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

const MESSAGE = "Olá, vim do site e gostaria de fazer um pedido";

interface WhatsAppFloatProps {
  /** Posicionamento; por padrão flutua no canto inferior direito. A CartBar o coloca dentro da própria barra. */
  className?: string;
}

/** Botão flutuante de WhatsApp da LP: abre direto o atendimento da loja do Setor Sul. */
export function WhatsAppFloat({ className = "fixed bottom-4 right-4 z-[60] sm:bottom-6 sm:right-6" }: WhatsAppFloatProps) {
  return (
    <a
      href={whatsappUrl(MAIN_UNIT, MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      data-track="click_whatsapp"
      data-track-local="lp-flutuante"
      data-track-unidade={MAIN_UNIT.id}
      aria-label="Pedir no WhatsApp"
      className={`group flex items-center gap-2 rounded-full bg-[#1f9e4f] py-3 pl-3 pr-3 text-white shadow-[0_14px_36px_-10px_rgba(31,158,79,0.75)] transition-transform duration-300 hover:scale-105 sm:pr-5 ${className}`}
    >
      <span aria-hidden className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#1f9e4f]/40 [animation-duration:2.4s]" />
      <WhatsAppIcon className="size-8" />
      <span className="hidden text-sm font-semibold sm:inline">Pedir no WhatsApp</span>
    </a>
  );
}
