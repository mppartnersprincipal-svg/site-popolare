import { grupoDaRota } from "@/data/lpGrupos";
import { temaPadrao } from "@/lib/lpTema";
import { LpPage, lpMetadata } from "@/components/lp/LpPage";

const GRUPO = grupoDaRota("/lasanha-congelada");

export const metadata = lpMetadata(GRUPO);

/** LP do grupo "03 – Lasanhas" do Google Ads. Com utm_term de um tema, o proxy.ts serve a variante estática (/lp-variante). */
export default function LasanhaCongeladaPage() {
  return <LpPage grupo={GRUPO} tema={temaPadrao(GRUPO.id)} />;
}
