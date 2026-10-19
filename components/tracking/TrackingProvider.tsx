import Script from "next/script";
import { TrackingEvents } from "./TrackingEvents";
import { UTMCapture } from "./UTMCapture";
import { ConsentBanner } from "./ConsentBanner";
import { CONSENT_DEFAULT_SCRIPT } from "@/lib/consent";

// Container da Popolare (ID público). Previews e dev não carregam o GTM, para não sujar o GA4/Ads.
const POPOLARE_GTM_ID = "GTM-MJCKV4JS";
const GTM_ID =
  process.env.NEXT_PUBLIC_GTM_ID ?? (process.env.VERCEL_ENV === "production" ? POPOLARE_GTM_ID : undefined);

/**
 * GTM central: GA4, conversões do Google Ads e Meta Pixel são tags dentro do container.
 * Sem GTM_ID (dev/preview) os eventos continuam indo para window.dataLayer.
 * O padrão do Consent Mode v2 (negado) roda no mesmo script, antes do GTM carregar.
 */
export function TrackingProvider() {
  return (
    <>
      {GTM_ID && (
        <>
          <Script id="gtm" strategy="afterInteractive">
            {`${CONSENT_DEFAULT_SCRIPT}
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
          <ConsentBanner />
        </>
      )}
      <UTMCapture />
      <TrackingEvents />
    </>
  );
}
