import { cn } from "@/lib/cn";

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div aria-hidden style={style} className={cn("animate-pulse rounded-xl bg-tinta/10", className)} />;
}

export function CardSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div className="rounded-2xl border border-tinta/10 bg-white">
      <div className="border-b border-tinta/10 px-5 py-4">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="mt-2 h-3 w-72" />
      </div>
      <div className="p-5">
        <Skeleton style={{ height }} className="w-full" />
      </div>
    </div>
  );
}

export function KpiSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-tinta/10 bg-white p-5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-4 h-8 w-20" />
          <Skeleton className="mt-3 h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

/** Esqueleto da página inteira (enquanto a sessão e os dados carregam). */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Carregando o painel">
      <div>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <Skeleton className="h-14 w-full rounded-2xl" />
      <KpiSkeleton />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CardSkeleton />
        </div>
        <CardSkeleton />
      </div>
    </div>
  );
}
