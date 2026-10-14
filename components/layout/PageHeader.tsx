import Link from "next/link";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { Picture } from "@/components/ui/Picture";

interface PageHeaderProps {
  eyebrow: string;
  /** Primeira parte do título (caixa-alta) */
  title: string;
  /** Segunda parte, em itálico marsala */
  accent?: string;
  intro?: string;
  path: string;
  crumb: string;
  image?: { key: string; alt: string };
}

export function PageHeader({ eyebrow, title, accent, intro, path, crumb, image }: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden pb-16 pt-32 md:pb-24 md:pt-44">
      <JsonLd data={breadcrumbSchema([{ name: crumb, path }])} />
      <div className="container-popolare grid items-end gap-10 lg:grid-cols-12">
        <div className={image ? "lg:col-span-7" : "lg:col-span-10"}>
          <nav aria-label="Trilha de navegação" className="eyebrow text-[0.65rem] text-tinta-suave">
            <ol className="flex gap-2">
              <li>
                <Link href="/" className="hover:text-primaria">
                  Início
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-primaria">
                {crumb}
              </li>
            </ol>
          </nav>
          <p className="eyebrow mt-8 text-primaria">{eyebrow}</p>
          <h1 className="mt-4 text-[length:var(--text-display)] leading-[1.02] text-tinta">
            <span className="font-display uppercase tracking-[0.03em]">{title}</span>
            {accent && <span className="italiano text-primaria"> {accent}</span>}
          </h1>
          {intro && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-tinta-suave md:text-xl">{intro}</p>}
        </div>
        {image && (
          <div className="lg:col-span-5">
            <div className="aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[1.5rem] shadow-[0_40px_80px_-40px_rgba(89,14,19,0.55)] max-lg:max-h-[60svh] max-lg:w-3/4">
              <Picture image={image.key} alt={image.alt} priority sizes="(min-width: 1024px) 38vw, 75vw" className="block h-full w-full" imgClassName="h-full w-full object-cover" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
