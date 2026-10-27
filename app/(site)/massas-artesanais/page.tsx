import { grupoDaRota } from "@/data/lpGrupos";
import { temaPadrao } from "@/lib/lpTema";
import { LpPage, lpMetadata } from "@/components/lp/LpPage";

const GRUPO = grupoDaRota("/massas-artesanais");

export const metadata = lpMetadata(GRUPO);

/** LP do grupo "02 – Massas Artesanais" do Google Ads. Com utm_term de um tema, o proxy.ts serve a variante estática (/lp-variante). */
export default function MassasArtesanaisPage() {
  return <LpPage grupo={GRUPO} tema={temaPadrao(GRUPO.id)} />;
}
