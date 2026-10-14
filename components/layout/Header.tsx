"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MAIN_UNIT } from "@/data/business";
import { generalMessage, whatsappUrl } from "@/lib/whatsapp";
import { LogoSimbolo } from "@/components/ui/Logo";
import { SCROLL_LOCK_CLASS } from "@/components/experience/SmoothScroll";

const NAV = [
  { href: "/cardapio", label: "Cardápio" },
  { href: "/sobre-nos", label: "Nossa história" },
  { href: "/encomendas", label: "Encomendas" },
  { href: "/contato", label: "Lojas" },
] as const;

const SCROLL_SOLID = 24;
const SCROLL_HIDE_DELTA = 6;

export function Header() {
  const pathname = usePathname();
  const [isSolid, setIsSolid] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setIsSolid(y > SCROLL_SOLID);
      if (Math.abs(y - lastY) > SCROLL_HIDE_DELTA) {
        setIsHidden(y > lastY && y > window.innerHeight * 0.6);
        lastY = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle(SCROLL_LOCK_CLASS, isMenuOpen);
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMenuOpen]);

  const waHref = whatsappUrl(MAIN_UNIT, generalMessage());
  // Com o menu aberto o header fica transparente (sem blur), sobre o fundo marsala do menu
  const headerState = isMenuOpen
    ? "bg-transparent"
    : isSolid
      ? "bg-creme/85 shadow-[0_1px_0_rgba(89,14,19,0.08)] backdrop-blur-md"
      : "bg-transparent";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,box-shadow] duration-500 ease-[var(--ease-out-expo)] ${headerState} ${
          isHidden && !isMenuOpen ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="container-popolare flex h-16 items-center justify-between md:h-20">
          <Link href="/" className={`group flex items-center gap-3 ${isMenuOpen ? "text-farinha" : "text-primaria"}`} aria-label="Popolare — página inicial">
            <LogoSimbolo className="h-8 w-auto transition-transform duration-500 group-hover:-rotate-6 md:h-10" />
            <span className="wordmark hidden text-[0.95rem] sm:inline">Popolare</span>
          </Link>

          <nav aria-label="Navegação principal" className="hidden items-center gap-9 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className="eyebrow relative py-2 text-tinta transition-colors hover:text-primaria aria-[current=page]:text-primaria after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-500 hover:after:scale-x-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              data-track="click_whatsapp"
              data-track-local="header"
              className="hidden rounded-full bg-primaria px-5 py-2.5 text-sm font-semibold text-farinha shadow-[0_8px_24px_-12px_rgba(155,27,32,0.8)] transition-transform duration-300 hover:scale-[1.04] hover:bg-vinho sm:inline-flex"
            >
              Pedir no WhatsApp
            </a>
            <button
              type="button"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-expanded={isMenuOpen}
              aria-controls="menu-mobile"
              className="relative grid size-11 place-items-center rounded-full text-tinta lg:hidden"
            >
              <span className="sr-only">{isMenuOpen ? "Fechar menu" : "Abrir menu"}</span>
              <span
                aria-hidden
                className={`absolute h-px w-6 bg-current transition-transform duration-500 ${isMenuOpen ? "rotate-45 text-farinha" : "-translate-y-1.5"}`}
              />
              <span
                aria-hidden
                className={`absolute h-px w-6 bg-current transition-transform duration-500 ${isMenuOpen ? "-rotate-45 text-farinha" : "translate-y-1.5"}`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Fora do <header>: o backdrop-filter do header criaria um containing block para o "fixed" */}
      <div
        id="menu-mobile"
        hidden={!isMenuOpen}
        className="fixed inset-0 z-[49] flex flex-col justify-between bg-primaria px-[var(--gutter)] pb-10 pt-28 text-farinha lg:hidden"
      >
        <nav aria-label="Menu" className="flex flex-col gap-2">
          <Link href="/" onClick={() => setIsMenuOpen(false)} className="italiano text-5xl leading-tight">
            Início
          </Link>
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)} className="italiano text-5xl leading-tight">
              {item.label}
            </Link>
          ))}
        </nav>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          data-track="click_whatsapp"
          data-track-local="menu-mobile"
          className="rounded-full bg-farinha py-4 text-center font-semibold text-primaria"
        >
          Pedir no WhatsApp
        </a>
      </div>
    </>
  );
}
