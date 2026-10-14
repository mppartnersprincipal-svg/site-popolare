// Cardápio Popolare 2026 — transcrito do menu oficial (popolare.com.br/cardapio).
// Sem preços: decisão do cliente (out/2026) — preços só no atendimento pelo WhatsApp/loja.

export type MenuCategoryId = "al-forno" | "pronti" | "da-cuocere" | "sughi" | "dolci";

export interface MenuCategory {
  id: MenuCategoryId;
  nameIt: string;
  namePt: string;
  description: string;
  unit: string;
}

export interface MenuItem {
  id: string;
  category: MenuCategoryId;
  nameIt: string;
  namePt: string;
  description: string;
  size: string;
  /** Chave em data/images.generated.json (ex.: "produtos/agnolotti") */
  image?: string;
  badge?: "mais-vendido" | "sugestao-chef";
  onOrder?: boolean;
  lactoseFree?: boolean;
  /** Aparece no catálogo breve da home */
  featured?: boolean;
}

export const CATEGORIES: readonly MenuCategory[] = [
  {
    id: "al-forno",
    nameIt: "Pasta al Forno",
    namePt: "Massas para assar",
    description: "Recheadas à mão, prontas para levar ao forno com o molho que você preferir.",
    unit: "500 g",
  },
  {
    id: "pronti",
    nameIt: "Pronti da Infornare",
    namePt: "Prontas para o forno",
    description: "Já montadas com molho. É só aquecer e servir.",
    unit: "700 g",
  },
  {
    id: "da-cuocere",
    nameIt: "Pasta da Cuocere",
    namePt: "Massas para cozinhar",
    description: "Massas frescas e recheadas para cozinhar em água fervente.",
    unit: "500 g",
  },
  {
    id: "sughi",
    nameIt: "Sughi",
    namePt: "Molhos",
    description: "Molhos da casa, sem conservantes, para acompanhar cada massa.",
    unit: "200–1000 ml",
  },
  {
    id: "dolci",
    nameIt: "Dolci",
    namePt: "Sobremesas",
    description: "O final feliz de um almoço italiano.",
    unit: "500 g",
  },
];

export const MENU: readonly MenuItem[] = [
  // — Pasta al Forno (500 g) —
  { id: "sfoglia-lasagne", category: "al-forno", nameIt: "Sfoglia per Lasagne", namePt: "Massa para lasanha", description: "Folhas de massa fresca para montar a sua lasanha.", size: "500 g", onOrder: true },
  { id: "agnolotti", category: "al-forno", nameIt: "Agnolotti", namePt: "Agnolotti", description: "Ricota de búfala, nozes, uvas-passas e requeijão cremoso.", size: "500 g", image: "produtos/agnolotti", featured: true },
  { id: "agnolotti-giallo", category: "al-forno", nameIt: "Agnolotti Giallo", namePt: "Agnolotti amarelo", description: "Massa com cenoura, recheio de filé mignon e gorgonzola.", size: "500 g" },
  { id: "involtino-pizza", category: "al-forno", nameIt: "Involtino di Pizza", namePt: "Enrolado de pizza", description: "Massa tradicional, presunto cozido, muçarela, requeijão, azeitonas, azeite e orégano.", size: "500 g", image: "produtos/involtino-pizza" },
  { id: "sfogliatti-bianco", category: "al-forno", nameIt: "Sfogliatti Bianco", namePt: "Sfogliatti branco", description: "Queijo prato, muçarela, provolone e requeijão.", size: "500 g", image: "produtos/sfogliatti-bianco", badge: "mais-vendido", featured: true },
  { id: "sfogliatti-giallo", category: "al-forno", nameIt: "Sfogliatti Giallo", namePt: "Sfogliatti amarelo", description: "Massa com cenoura, muçarela de búfala e manjericão.", size: "500 g", image: "produtos/sfogliatti-giallo" },
  { id: "sfogliatti-verde", category: "al-forno", nameIt: "Sfogliatti Verde", namePt: "Sfogliatti verde", description: "Massa com espinafre, provolone, cheddar, muçarela e damasco.", size: "500 g", image: "produtos/sfogliatti-verde", featured: true },
  { id: "sfogliatti-carne-secca", category: "al-forno", nameIt: "Sfogliatti di Carne Secca", namePt: "Sfogliatti de carne seca", description: "Carne seca com cream cheese.", size: "500 g" },
  { id: "sfogliattini-pere-gorgonzola", category: "al-forno", nameIt: "Sfogliattini Pere e Gorgonzola", namePt: "Sfogliattini de pera e gorgonzola", description: "Pera, gorgonzola e parmesão.", size: "500 g" },
  { id: "rondelli-prosciutto", category: "al-forno", nameIt: "Rondelli di Prosciutto e Mozzarella", namePt: "Rondelli de presunto e muçarela", description: "Rolinhos de massa fresca com presunto e muçarela.", size: "500 g", image: "produtos/rondelli-prosciutto", featured: true },
  { id: "rondelli-mozzarella", category: "al-forno", nameIt: "Rondelli di Mozzarella", namePt: "Rondelli de muçarela", description: "Rolinhos de massa fresca recheados com muçarela.", size: "500 g", image: "produtos/rondelli-mozzarella" },
  { id: "rondelli-mozzarella-senza-lattosio", category: "al-forno", nameIt: "Rondelli di Mozzarella Senza Lattosio", namePt: "Rondelli de muçarela sem lactose", description: "A versão sem lactose do nosso rondelli de muçarela.", size: "500 g", onOrder: true, lactoseFree: true },
  { id: "cannelloni-carne", category: "al-forno", nameIt: "Cannelloni di Carne", namePt: "Canelone de carne", description: "Carne moída, muçarela e requeijão.", size: "500 g", image: "produtos/cannelloni-carne", featured: true },
  { id: "cannelloni-pollo", category: "al-forno", nameIt: "Cannelloni al Pollo", namePt: "Canelone de frango", description: "Frango desfiado, muçarela e cheddar.", size: "500 g", image: "produtos/cannelloni-pollo" },
  { id: "cannelloni-salsiccia", category: "al-forno", nameIt: "Cannelloni alla Salsiccia Piccante", namePt: "Canelone de calabresa", description: "Calabresa moída, pimenta calabresa, muçarela e requeijão.", size: "500 g", image: "produtos/cannelloni-salsiccia" },
  { id: "cannelloni-ricotta-spinaci", category: "al-forno", nameIt: "Cannelloni di Ricotta con Spinaci", namePt: "Canelone de ricota com espinafre", description: "Ricota de búfala, espinafre e requeijão.", size: "500 g", image: "produtos/cannelloni-ricotta-spinaci" },

  // — Pronti da Infornare (700 g) —
  { id: "lasagne-bolognese", category: "pronti", nameIt: "Lasagne alla Bolognese", namePt: "Lasanha à bolonhesa", description: "Camadas de massa fresca, ragù à bolonhesa e queijo.", size: "700 g", image: "produtos/lasagne-bolognese", featured: true },
  { id: "lasagne-quattro-formaggi", category: "pronti", nameIt: "Lasagne ai Quattro Formaggi", namePt: "Lasanha quatro queijos", description: "Massa de espinafre com muçarela, gorgonzola, parmesão e meia cura.", size: "700 g", image: "produtos/lasagne-quattro-formaggi", featured: true },
  { id: "lasagne-melanzane", category: "pronti", nameIt: "Lasagne alle Melanzane", namePt: "Lasanha de berinjela", description: "Berinjela selada no azeite, bolonhesa e muçarela.", size: "700 g" },
  { id: "sfogliatti-bianco-sugo", category: "pronti", nameIt: "Sfogliatti Bianco al Sugo", namePt: "Sfogliatti branco ao sugo", description: "Nosso mais vendido, já com molho de tomate.", size: "700 g", image: "produtos/sfogliatti-bianco" },
  { id: "sfogliatti-giallo-sugo", category: "pronti", nameIt: "Sfogliatti Giallo al Sugo", namePt: "Sfogliatti amarelo ao sugo", description: "Massa com cenoura, muçarela de búfala e manjericão, com molho de tomate.", size: "700 g", image: "produtos/sfogliatti-giallo" },
  { id: "rondelli-prosciutto-sugo", category: "pronti", nameIt: "Rondelli di Prosciutto e Mozzarella al Sugo", namePt: "Rondelli de presunto e muçarela ao sugo", description: "Rondelli já montado com molho.", size: "700 g", image: "produtos/rondelli-prosciutto" },
  { id: "cannelloni-carne-sugo", category: "pronti", nameIt: "Cannelloni di Carne al Sugo", namePt: "Canelone de carne ao sugo", description: "Canelone de carne já montado com molho.", size: "700 g", image: "produtos/cannelloni-carne" },
  { id: "cannelloni-pollo-sugo", category: "pronti", nameIt: "Cannelloni al Pollo al Sugo", namePt: "Canelone de frango ao sugo", description: "Canelone de frango já montado com molho.", size: "700 g", image: "produtos/cannelloni-pollo" },
  { id: "cannelloni-salsiccia-sugo", category: "pronti", nameIt: "Cannelloni alla Salsiccia Piccante al Sugo", namePt: "Canelone de calabresa ao sugo", description: "Canelone de calabresa já montado com molho.", size: "700 g", image: "produtos/cannelloni-salsiccia" },

  // — Pasta da Cuocere (500 g) —
  { id: "fettuccine-bianco", category: "da-cuocere", nameIt: "Fettuccine Bianco", namePt: "Fettuccine tradicional", description: "Farinha de trigo, semolina e ovos.", size: "500 g", image: "produtos/fettuccine-pesto", featured: true },
  { id: "fettuccine-verde", category: "da-cuocere", nameIt: "Fettuccine Verde", namePt: "Fettuccine verde", description: "Farinha de trigo, semolina, ovos e espinafre.", size: "500 g" },
  { id: "pappardelle-bianco", category: "da-cuocere", nameIt: "Pappardelle Bianco", namePt: "Pappardelle tradicional", description: "Farinha de trigo, semolina e ovos.", size: "500 g" },
  { id: "pappardelle-verde", category: "da-cuocere", nameIt: "Pappardelle Verde", namePt: "Pappardelle verde", description: "Farinha de trigo, semolina, ovos e espinafre.", size: "500 g" },
  { id: "cappelletti-carne", category: "da-cuocere", nameIt: "Cappelletti di Carne", namePt: "Cappelletti de carne", description: "Blend de carne bovina, suína e frango.", size: "500 g" },
  { id: "cappelletti-pollo", category: "da-cuocere", nameIt: "Cappelletti di Pollo", namePt: "Cappelletti de frango", description: "Peito de frango e provolone. Perfeito em brodo.", size: "500 g", image: "produtos/cappelletti-pollo", featured: true },
  { id: "ravioli-tre-formaggi", category: "da-cuocere", nameIt: "Ravioli ai Tre Formaggi", namePt: "Ravióli três queijos", description: "Muçarela, provolone e cream cheese.", size: "500 g", image: "produtos/ravioli-tre-formaggi" },
  { id: "ravioli-verde", category: "da-cuocere", nameIt: "Ravioli Verde", namePt: "Ravióli verde", description: "Muçarela de búfala e manjericão.", size: "500 g", image: "produtos/ravioli-verde", featured: true },
  { id: "ravioli-carne", category: "da-cuocere", nameIt: "Ravioli di Carne", namePt: "Ravióli de carne", description: "Carne bovina moída.", size: "500 g", image: "produtos/ravioli-carne" },
  { id: "ravioli-brie", category: "da-cuocere", nameIt: "Ravioli di Brie, Noci e Albicocche", namePt: "Ravióli de brie, nozes e damasco", description: "Brie, ricota, nozes e damasco.", size: "500 g", image: "produtos/ravioli-brie" },
  { id: "tortelli-zucca", category: "da-cuocere", nameIt: "Tortelli di Zucca", namePt: "Tortelli de abóbora", description: "Abóbora, parmesão e canela.", size: "500 g", image: "produtos/tortelli-zucca" },
  { id: "gnocchi-patate", category: "da-cuocere", nameIt: "Gnocchi di Patate", namePt: "Nhoque de batata", description: "Nhoque de batata, macio e leve.", size: "500 g", image: "produtos/gnocchi" },
  { id: "gnocchi-ripieni", category: "da-cuocere", nameIt: "Gnocchi Ripieni", namePt: "Nhoque recheado", description: "Recheado com muçarela de búfala e manjericão.", size: "500 g", image: "produtos/gnocchi-cru", badge: "sugestao-chef", featured: true },

  // — Sughi —
  { id: "pesto", category: "sughi", nameIt: "Pesto", namePt: "Pesto", description: "Manjericão, azeite, alho, nozes e queijo.", size: "200 ml", image: "produtos/pesto", featured: true },
  { id: "sugo-pomodoro", category: "sughi", nameIt: "Sugo al Pomodoro", namePt: "Molho de tomate", description: "Tomates cozidos lentamente com ervas.", size: "400 ml", image: "produtos/sugo-pomodoro" },
  { id: "salsa-bianca", category: "sughi", nameIt: "Salsa Bianca", namePt: "Molho branco", description: "Molho branco cremoso.", size: "400 ml" },
  { id: "alla-panna", category: "sughi", nameIt: "Alla Panna", namePt: "Molho de creme", description: "Molho cremoso à base de creme de leite.", size: "400 ml", image: "produtos/alla-panna" },
  { id: "ragu-bolognese", category: "sughi", nameIt: "Ragù alla Bolognese", namePt: "Molho à bolonhesa", description: "Ragù de carne cozido lentamente.", size: "400 ml" },
  { id: "quattro-formaggi", category: "sughi", nameIt: "Quattro Formaggi", namePt: "Molho quatro queijos", description: "Quatro queijos derretidos num molho cremoso.", size: "400 ml" },
  { id: "funghi-gorgonzola", category: "sughi", nameIt: "Funghi con Gorgonzola", namePt: "Molho de funghi com gorgonzola", description: "Cogumelos e gorgonzola.", size: "400 ml", image: "produtos/fettuccine-funghi" },
  { id: "brodo-verdure", category: "sughi", nameIt: "Brodo di Verdure", namePt: "Caldo de legumes", description: "Caldo de legumes para cappelletti e sopas.", size: "1000 ml", image: "produtos/brodo-verdure" },

  // — Dolci —
  { id: "tiramisu", category: "dolci", nameIt: "Tiramisù", namePt: "Tiramisù", description: "A receita de família: biscoito, café, creme e cacau.", size: "500 g", image: "produtos/tiramisu", featured: true },
];

export const BADGE_LABEL: Record<NonNullable<MenuItem["badge"]>, string> = {
  "mais-vendido": "O mais vendido",
  "sugestao-chef": "Sugestão da chef",
};

export function itemsByCategory(category: MenuCategoryId): MenuItem[] {
  return MENU.filter((item) => item.category === category);
}

export function featuredItems(): MenuItem[] {
  return MENU.filter((item) => item.featured);
}

export function findItem(id: string): MenuItem | undefined {
  return MENU.find((item) => item.id === id);
}
