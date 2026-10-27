import { grupoDaRota } from "@/data/lpGrupos";
import { temaPadrao } from "@/lib/lpTema";
import { LpPage, lpMetadata } from "@/components/lp/LpPage";

const GRUPO = grupoDaRota("/massas-em-goiania");

export const metadata = lpMetadata(GRUPO);

/** LP do grupo "01 – Massas em Goiânia (e 07 – Marca)" do Google Ads. Com utm_term de um tema, o proxy.ts serve a variante estática (/lp-variante). */
export default function MassasEmGoianiaPage() {
  return <LpPage grupo={GRUPO} tema={temaPadrao(GRUPO.id)} />;
}
