import "server-only";
import { getUser } from "@/lib/painel/auth";
import { fetchGoogleAdsReport } from "@/lib/painel/google-ads-api";
import type { Range } from "@/lib/painel/queries";
import type { GoogleAdsReport } from "@/lib/painel/google-ads-types";

/** A API usa credenciais do servidor: confere a sessão antes de buscar os dados. */
export async function getGoogleAdsReport(range: Range): Promise<GoogleAdsReport> {
  const user = await getUser();
  if (!user) return { status: "error", message: "Entre novamente no painel para consultar o Google Ads." };
  return fetchGoogleAdsReport(range);
}
