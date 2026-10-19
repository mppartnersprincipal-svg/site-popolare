// Consent Mode v2 (Google) para LGPD: tudo negado até o visitante escolher no ConsentBanner.
import { collect, CONSENT_EVENT } from "@/lib/tracker";

export const CONSENT_KEY = "popolare_consent";

export type ConsentChoice = "granted" | "denied" | null;

/**
 * Roda ANTES do GTM: define o padrão "negado" e reaplica a escolha salva em visitas anteriores.
 * Conteúdo estático (sem dados do usuário) — seguro para script inline.
 */
export const CONSENT_DEFAULT_SCRIPT = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});
try{var c=localStorage.getItem('${CONSENT_KEY}');if(c==='granted'){gtag('consent','update',{ad_storage:'granted',analytics_storage:'granted',ad_user_data:'granted',ad_personalization:'granted'})}}catch(e){}`;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function updateConsent(choice: Exclude<ConsentChoice, null>): void {
  try {
    localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    // sem localStorage o aviso volta na próxima visita
  }
  const value = choice === "granted" ? "granted" : "denied";
  window.gtag?.("consent", "update", {
    ad_storage: value,
    analytics_storage: value,
    ad_user_data: value,
    ad_personalization: value,
  });
  window.dataLayer?.push({ event: "consent_update", consentimento: choice });
  // Painel: cobertura de consentimento + apagar o código de visitante de quem recusou
  collect("cookie_consent", { consent_choice: choice === "granted" ? "accepted" : "essential" });
  window.dispatchEvent(new Event(CONSENT_EVENT));
}
