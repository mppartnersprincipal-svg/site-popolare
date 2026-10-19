import Link from "next/link";
import { LogoSimbolo } from "@/components/ui/Logo";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// Fica no layout raiz (fora do grupo (site)), então traz o cabeçalho e o rodapé
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="conteudo">
    <section className="container-popolare flex min-h-[80svh] flex-col items-center justify-center pt-24 text-center">
      <LogoSimbolo className="h-16 w-auto text-primaria" />
      <p className="eyebrow mt-8 text-madeira-escura">Errore 404</p>
      <h1 className="italiano mt-4 text-[clamp(2.6rem,1.6rem+4vw,5rem)] leading-none text-primaria">Questa pasta non c’è.</h1>
      <p className="mt-5 max-w-md text-lg text-tinta-suave">A página que você procurou não existe — mas o cardápio está cheio de massa artesanal.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/cardapio" className="rounded-full bg-primaria px-6 py-3 font-semibold text-farinha hover:bg-vinho">
          Ver cardápio
        </Link>
        <Link href="/" className="rounded-full border border-primaria/30 px-6 py-3 font-semibold text-primaria hover:bg-primaria hover:text-farinha">
          Página inicial
        </Link>
      </div>
    </section>
      </main>
      <Footer />
    </>
  );
}
