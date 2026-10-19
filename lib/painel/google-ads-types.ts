export type GoogleAdsMetrics = {
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  /** Fração: 0,05 corresponde a 5%. */
  ctr: number | null;
  averageCpc: number | null;
  costPerConversion: number | null;
};

export type GoogleAdsCampaign = GoogleAdsMetrics & {
  id: string;
  name: string;
  status: string;
};

export type GoogleAdsReport =
  | {
      status: "ready";
      customer: { id: string; name: string; currencyCode: string; timeZone: string };
      from: string;
      to: string;
      totals: GoogleAdsMetrics;
      campaigns: GoogleAdsCampaign[];
      fetchedAt: string;
    }
  | { status: "not_configured" | "error"; message: string };
