// Gera /llms.txt (resumo) e /llms-full.txt (completo) a partir da fonte única de dados.
import { BRAND, DELIVERY, ORDER_RULES, SITE_URL, SOCIAL, UNITS, formatAddress } from "@/data/business";
import { LP_GRUPOS } from "@/data/lpGrupos";
import { CATEGORIES, MENU } from "@/data/menu";
import { FAQ, HOW_TO, PRESS, QUICK_FACTS, STORY, STORY_INTRO } from "@/data/content";
import { allPosts } from "@/lib/blog";

function unitsSection(): string[] {
  return UNITS.flatMap((u) => [
    `### ${u.name}`,
    `- Endereço: ${formatAddress(u)}`,
    `- Telefones: ${u.phones.join(", ")}`,
    `- WhatsApp: ${u.whatsappDisplay} (https://wa.me/${u.whatsapp})`,
    `- Horário: ${u.hours ? `${u.hours.map((h) => `${h.days} ${h.opens}–${h.closes}`).join("; ")}; domingo fechado` : "consultar pelo WhatsApp"}`,
    `- Rota: ${u.mapsUrl}`,
    "",
  ]);
}

function menuSection(): string[] {
  return CATEGORIES.flatMap((c) => [
    `### ${c.nameIt} — ${c.namePt}`,
    ...MENU.filter((i) => i.category === c.id).map(
      (i) =>
        `- ${i.nameIt}${i.namePt !== i.nameIt ? ` (${i.namePt})` : ""}: ${i.description} ${i.size}${i.onOrder ? " — sob encomenda" : ""}`
    ),
    "",
  ]);
}

export function buildLlmsText(full: boolean): string {
  const lines = [
    `# ${BRAND.name}`,
    "",
    `> ${BRAND.legalTagline}. Negócio de família fundado por ${BRAND.founders.join(" e ")} em ${BRAND.city}-${BRAND.state}, hoje conduzido por ${BRAND.owner}. Massas frescas recheadas, lasanhas, molhos sem conservantes, tiramisù e empório de importados.`,
    "",
    "## Fatos rápidos",
    ...QUICK_FACTS.map((f) => `- ${f.label}: ${f.value}`),
    "",
    "## Loja",
    ...unitsSection(),
    "## Como pedir",
    `- WhatsApp da loja (acima) ou pedido online: ${DELIVERY.map((d) => `${d.name} ${d.url}`).join("; ")}`,
    `- Encomendas: ${ORDER_RULES.note} Formulário: ${SITE_URL}/encomendas`,
    `- Instagram: ${SOCIAL.instagram} · Facebook: ${SOCIAL.facebook}`,
    "",
    "## Páginas",
    `- [Massas artesanais congeladas em Goiânia — onde comprar](${SITE_URL}/massas-em-goiania)`,
    ...LP_GRUPOS.filter((g) => g.rota !== "/massas-em-goiania").map((g) => `- [${g.seo.title}](${SITE_URL}${g.rota})`),
    `- [Cardápio completo](${SITE_URL}/cardapio)`,
    `- [História da família](${SITE_URL}/sobre-nos)`,
    `- [Encomendas](${SITE_URL}/encomendas)`,
    `- [Modo de preparo](${SITE_URL}/modo-de-preparo)`,
    `- [Loja e contato](${SITE_URL}/contato)`,
    `- [Na mídia](${SITE_URL}/midia)`,
    `- [Versão completa deste arquivo](${SITE_URL}/llms-full.txt)`,
    "",
  ];

  if (!full) {
    lines.push("## Perguntas frequentes", ...FAQ.map((f) => `- ${f.question} ${f.answer}`));
    return lines.join("\n");
  }

  lines.push(
    "## Cardápio 2026",
    ...menuSection(),
    "## História",
    STORY_INTRO,
    ...STORY.map((s) => `- ${s.marker}: ${s.text}`),
    "",
    "## Modo de preparo",
    ...[HOW_TO.assar, HOW_TO.cozinhar].flatMap((h) => [`### ${h.title} (${h.subtitle})`, ...h.steps.map((s, i) => `${i + 1}. ${s}`), ""]),
    "## Na imprensa",
    ...PRESS.map((p) => `- ${p.outlet}${p.year ? ` (${p.year})` : ""}: "${p.title}"${p.url ? ` ${p.url}` : ""}`),
    "",
    "## Perguntas frequentes",
    ...FAQ.flatMap((f) => [`### ${f.question}`, f.answer, ""]),
    "## Artigos do blog",
    ...allPosts().map((p) => `- [${p.titulo}](${SITE_URL}/blog/${p.slug})`)
  );
  return lines.join("\n");
}
