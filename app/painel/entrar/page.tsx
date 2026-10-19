import type { Metadata } from "next";
import Link from "next/link";
import { LogoCompleto } from "@/components/ui/Logo";
import { LoginForm } from "@/components/painel/LoginForm";

export const metadata: Metadata = { title: "Entrar" };

export default function EntrarPage() {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-vinho px-4 py-16">
      <div aria-hidden className="absolute -top-24 right-0 size-96 rounded-full bg-primaria/40 blur-3xl" />
      <div aria-hidden className="absolute -bottom-32 -left-16 size-96 rounded-full bg-dourado/10 blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoCompleto className="h-14 w-auto text-farinha" />
          <p className="mt-4 text-sm text-farinha/60">Painel de métricas do site</p>
        </div>

        <div className="rounded-2xl border border-farinha/10 bg-farinha p-6 shadow-2xl sm:p-8">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-farinha/50 transition-colors hover:text-farinha">
            ← Voltar para o site
          </Link>
        </p>
      </div>
    </main>
  );
}
