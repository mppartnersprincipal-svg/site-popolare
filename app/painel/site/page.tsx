import type { Metadata } from "next";
import { Suspense } from "react";
import { PainelShell } from "@/components/painel/PainelShell";
import { Dashboard } from "@/components/painel/Dashboard";
import { DashboardSkeleton } from "@/components/painel/Skeleton";

export const metadata: Metadata = { title: "Site" };

export default function PainelSitePage({ searchParams }: PageProps<"/painel/site">) {
  return (
    <PainelShell active="site">
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard scope="site" searchParams={searchParams} />
      </Suspense>
    </PainelShell>
  );
}
