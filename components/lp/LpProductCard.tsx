"use client";

import { BADGE_LABEL, type MenuItem } from "@/data/menu";
import { Picture } from "@/components/ui/Picture";
import { AddToCart } from "@/components/lp/cart/AddToCart";

interface LpProductCardProps {
  item: MenuItem;
  /** Onde o card está, para o tracking (lp-catalogo) */
  local: string;
}

/** Card compacto da LP (2 colunas no celular) com o botão "Adicionar" do pedido. */
export function LpProductCard({ item, local }: LpProductCardProps) {
  const tags = [item.badge && BADGE_LABEL[item.badge], item.onOrder && "Sob encomenda", item.lactoseFree && "Sem lactose"].filter(
    Boolean
  ) as string[];
  const illustrative = item.imageIllustrative && item.image;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] bg-farinha shadow-[0_20px_50px_-36px_rgba(89,14,19,0.6)] sm:rounded-[1.5rem]">
      <div className="relative aspect-square overflow-hidden sm:aspect-[4/3]">
        {item.image ? (
          <Picture
            image={item.image}
            alt={`${item.nameIt} — ${item.description}`}
            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 45vw"
            className="block h-full w-full"
            imgClassName="h-full w-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primaria p-4 text-center">
            <p className="italiano text-2xl leading-none text-massa sm:text-3xl">{item.nameIt}</p>
          </div>
        )}
        {tags.length > 0 && (
          <ul className="absolute left-2 top-2 flex flex-wrap gap-1 sm:left-3 sm:top-3">
            {tags.map((t) => (
              <li key={t} className="rounded-full bg-farinha/90 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-primaria backdrop-blur sm:px-2.5 sm:py-1 sm:text-[0.66rem]">
                {t}
              </li>
            ))}
          </ul>
        )}
        {illustrative && (
          <p className="absolute bottom-2 right-2 rounded-full bg-tinta/60 px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-wider text-farinha backdrop-blur">
            Imagem ilustrativa
          </p>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-5">
        <h3 className="italiano text-xl leading-[1.05] text-tinta sm:text-2xl">{item.nameIt}</h3>
        {item.namePt !== item.nameIt && <p className="mt-0.5 text-xs font-medium text-tinta-suave sm:text-sm">{item.namePt}</p>}
        <p className="mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-tinta-suave sm:text-sm">{item.description}</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-2 sm:mt-4">
          <p className="whitespace-nowrap text-xs font-medium text-tinta-suave sm:text-sm">{item.size}</p>
          <AddToCart item={item} local={local} />
        </div>
      </div>
    </article>
  );
}
