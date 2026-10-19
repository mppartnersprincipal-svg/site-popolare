import { MAIN_UNIT } from "@/data/business";
import { whatsappUrl } from "@/lib/whatsapp";

const MESSAGE = "Olá, Popolare! Vi o anúncio e quero comprar massas. Pode me ajudar?";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className} fill="currentColor">
      <path d="M16.04 3C8.86 3 3.04 8.82 3.04 16c0 2.29.6 4.53 1.74 6.5L3 29l6.68-1.75A12.94 12.94 0 0 0 16.04 29C23.22 29 29 23.18 29 16S23.22 3 16.04 3Zm0 23.7c-2.02 0-4-.54-5.72-1.57l-.41-.24-3.96 1.04 1.06-3.86-.27-.4A10.66 10.66 0 0 1 5.33 16c0-5.9 4.8-10.7 10.71-10.7 5.9 0 10.67 4.8 10.67 10.7 0 5.9-4.77 10.7-10.67 10.7Zm5.87-8.01c-.32-.16-1.9-.94-2.2-1.04-.29-.11-.5-.16-.72.16-.21.32-.83 1.04-1.01 1.25-.19.21-.37.24-.69.08-.32-.16-1.36-.5-2.59-1.6-.96-.85-1.6-1.9-1.79-2.22-.19-.32-.02-.49.14-.65.15-.14.32-.37.48-.56.16-.19.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.66s1.15 3.08 1.31 3.3c.16.21 2.26 3.45 5.47 4.84.76.33 1.36.53 1.83.68.77.24 1.47.21 2.02.13.62-.09 1.9-.78 2.17-1.53.27-.75.27-1.39.19-1.53-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  );
}

/** Botão flutuante de WhatsApp da LP: abre direto o atendimento da loja do Setor Sul. */
export function WhatsAppFloat() {
  return (
    <a
      href={whatsappUrl(MAIN_UNIT, MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      data-track="click_whatsapp"
      data-track-local="lp-flutuante"
      data-track-unidade={MAIN_UNIT.id}
      aria-label="Pedir no WhatsApp"
      className="group fixed bottom-4 right-4 z-[60] flex items-center gap-2 rounded-full bg-[#1f9e4f] py-3 pl-3 pr-3 text-white shadow-[0_14px_36px_-10px_rgba(31,158,79,0.75)] transition-transform duration-300 hover:scale-105 sm:bottom-6 sm:right-6 sm:pr-5"
    >
      <span aria-hidden className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#1f9e4f]/40 [animation-duration:2.4s]" />
      <WhatsAppIcon className="size-8" />
      <span className="hidden text-sm font-semibold sm:inline">Pedir no WhatsApp</span>
    </a>
  );
}
