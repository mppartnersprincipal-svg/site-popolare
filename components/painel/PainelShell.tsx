import { Suspense } from "react";
import Link from "next/link";
import { ExternalLink, LogOut, Megaphone, Store } from "lucide-react";
import { LogoSimbolo } from "@/components/ui/Logo";
import { logout } from "@/app/painel/actions";
import { getUser } from "@/lib/painel/auth";
import type { Scope } from "@/lib/painel/queries";
import { cn } from "@/lib/cn";

const TABS: Array<{ id: Scope; href: "/painel/lp" | "/painel/site"; label: string; icon: typeof Store }> = [
  { id: "lp", href: "/painel/lp", label: "LP · Google Ads", icon: Megaphone },
  { id: "site", href: "/painel/site", label: "Site", icon: Store },
];

async function UserName() {
  const user = await getUser();
  return user ? (
    <span className="hidden max-w-48 truncate text-sm text-farinha/60 lg:inline" title={user.email}>
      {user.name}
    </span>
  ) : null;
}

/** Casca do painel: logo, abas LP × Site, link para o site, usuário e Sair. */
export function PainelShell({ active, children }: { active: Scope; children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-farinha/10 bg-vinho text-farinha">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-5">
            <Link href="/painel/lp" className="flex shrink-0 items-center gap-2.5" aria-label="Painel Popolare">
              <LogoSimbolo className="h-8 w-auto text-farinha" />
              <span className="hidden font-display text-lg tracking-wide md:inline">Painel</span>
            </Link>
            <nav aria-label="Painéis" className="flex items-center gap-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.id === active;
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                      isActive ? "bg-farinha text-vinho" : "text-farinha/70 hover:bg-farinha/10 hover:text-farinha"
                    )}
                  >
                    <Icon aria-hidden className="size-4" />
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noopener"
              className="hidden items-center gap-1.5 text-sm font-semibold text-farinha/70 transition-colors hover:text-farinha sm:inline-flex"
            >
              Ver site
              <ExternalLink aria-hidden className="size-3.5" />
            </a>
            <Suspense fallback={null}>
              <UserName />
            </Suspense>
            <form action={logout}>
              <button
                type="submit"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-farinha/25 px-3.5 py-1.5 text-sm font-semibold text-farinha/85 transition-colors hover:border-farinha hover:text-farinha"
              >
                <LogOut aria-hidden className="size-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">{children}</main>
    </>
  );
}
