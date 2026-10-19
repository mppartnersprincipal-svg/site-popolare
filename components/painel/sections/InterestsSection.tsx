import { getInterests, type Range, type Scope } from "@/lib/painel/queries";
import { labelCategory, labelPasta, labelProduct } from "@/lib/painel/types";
import { ChartCard } from "../ChartCard";
import { HorizontalBars } from "../charts/HorizontalBars";
import { CHART } from "../charts/chartTheme";

/** O que interessa a quem visita: produto pedido no WhatsApp, massa escolhida na intro e categoria filtrada. */
export async function InterestsSection({ range, scope }: { range: Range; scope: Scope }) {
  const rows = await getInterests(range);
  const of = (kind: string, label: (v: string | null) => string) =>
    rows.filter((r) => r.kind === kind).map((r) => ({ name: label(r.item), value: r.total }));

  const products = of("click_whatsapp", labelProduct);
  const pastas = of("intro_pasta_select", labelPasta);
  const categories = of("catalog_filter", labelCategory);

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <ChartCard
        id="interesses"
        title="Produtos pedidos no WhatsApp"
        description="Quando o botão de WhatsApp é de um produto específico"
        className={scope === "lp" ? "h-full xl:col-span-2" : "h-full"}
      >
        <HorizontalBars data={products} valueLabel="Cliques no WhatsApp" color={CHART.manjericao} />
      </ChartCard>
      {scope === "site" ? (
        <ChartCard id="massas-intro" title="Massa escolhida na intro" description="“Scegli la tua pasta” na abertura da home" className="h-full">
          <HorizontalBars data={pastas} valueLabel="Escolhas" />
        </ChartCard>
      ) : null}
      <ChartCard id="categorias" title="Categorias filtradas" description="Filtros usados no cardápio" className="h-full">
        <HorizontalBars data={categories} valueLabel="Filtros" color={CHART.dourado} />
      </ChartCard>
    </div>
  );
}
