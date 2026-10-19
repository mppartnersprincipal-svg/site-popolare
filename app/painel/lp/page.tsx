import type { Metadata } from "next";
import { Suspense } from "react";
import { PainelShell } from "@/components/painel/PainelShell";
import { Dashboard } from "@/components/painel/Dashboard";
import { DashboardSkeleton } from "@/components/painel/Skeleton";

export const metadata: Metadata = { title: "LP · Google Ads" };

export default function PainelLpPage({ searchParams }: PageProps<"/painel/lp">) {
  return (
    <PainelShell active="lp">
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard scope="lp" searchParams={searchParams} />
      </Suspense>
    </PainelShell>
  );
}
