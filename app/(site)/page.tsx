import { IntroPastaPicker } from "@/components/experience/IntroPastaPicker";
import { HeroPortal } from "@/components/experience/HeroPortal";
import { Scene3DLoader } from "@/components/experience/Scene3DLoader";
import { Story } from "@/components/sections/Story";
import { ProductShowcase } from "@/components/sections/ProductShowcase";
import { Catalog } from "@/components/sections/Catalog";
import { Emporio } from "@/components/sections/Emporio";
import { HowToCook } from "@/components/sections/HowToCook";
import { OrderForm } from "@/components/sections/OrderForm";
import { Press } from "@/components/sections/Press";
import { Locations } from "@/components/sections/Locations";
import { Faq } from "@/components/sections/Faq";

export default function Home() {
  return (
    <>
      <IntroPastaPicker />
      <HeroPortal />

      {/* Trilha da massa: a fita 3D desce pelas seções enquanto este bloco rola */}
      <div data-trilha className="relative">
        <div data-3d="ribbon" aria-hidden className="pointer-events-none sticky top-0 -mb-[100svh] h-[100svh]" />
        <Story />
        <ProductShowcase />
        <Catalog />
      </div>

      <Emporio />
      <HowToCook />
      <OrderForm />
      <Press />
      <Locations />
      <Faq withSchema />

      <Scene3DLoader />
    </>
  );
}
