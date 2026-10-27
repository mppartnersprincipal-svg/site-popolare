import { grupoDaRota } from "@/data/lpGrupos";
import { temaPadrao } from "@/lib/lpTema";
import { LpPage, lpMetadata } from "@/components/lp/LpPage";

const GRUPO = grupoDaRota("/ravioli-e-capeletti");

export const metadata = lpMetadata(GRUPO);

/** LP do grupo "06 – Massas para Cozinhar" do Google Ads. Com utm_term de um tema, o proxy.ts serve a variante estática (/lp-variante). */
export default function RavioliECapelettiPage() {
  return <LpPage grupo={GRUPO} tema={temaPadrao(GRUPO.id)} />;
}
