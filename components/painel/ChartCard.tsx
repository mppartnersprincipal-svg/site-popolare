import { cn } from "@/lib/cn";

/** Card padrão das seções do painel: título, descrição e conteúdo. */
export function ChartCard({
  id,
  title,
  description,
  action,
  className,
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("scroll-mt-32", className)} aria-labelledby={id}>
      <div className="flex h-full flex-col rounded-2xl border border-tinta/10 bg-white">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-tinta/10 px-5 py-4">
          <div>
            <h2 id={id} className="text-base font-bold text-tinta">
              {title}
            </h2>
            {description ? <p className="mt-0.5 text-sm text-tinta-suave">{description}</p> : null}
          </div>
          {action}
        </div>
        <div className="flex-1 p-5">{children}</div>
      </div>
    </section>
  );
}
