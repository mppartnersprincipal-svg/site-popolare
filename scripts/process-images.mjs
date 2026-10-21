// Processa as fotos originais (16MB+) em AVIF/WebP responsivos + placeholder blur.
// AVIF sempre em croma 4:2:0 (perfil AV1 Main): o Safari do iPhone com decodificador de hardware (A17+) não abre 4:4:4 (High) e mostra imagem quebrada em vez de cair para o WebP.
// Uso: npm run images
// Saída: public/img/<grupo>/<slug>-<largura>.<ext> e data/images.generated.json
import sharp from "sharp";
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..", "..");
const PUBLIC = path.resolve(import.meta.dirname, "..", "public", "img");
const MANIFEST = path.resolve(import.meta.dirname, "..", "data", "images.generated.json");
const P = "Produtos Massas";

const WIDTHS_DEFAULT = [640, 1080, 1600];
const WIDTHS_WIDE = [640, 1080, 1600, 2400];

// slug → arquivo de origem (curadoria manual a partir dos contact sheets)
const SOURCES = {
  produtos: {
    "agnolotti": `${P}/Agnolotti/IMG_7711.jpg`,
    "cannelloni-salsiccia": `${P}/Cannelloni de Calabresa/CANNELLONI.jpg`,
    "cannelloni-salsiccia-cru": `${P}/Cannelloni de Calabresa/IMG_7516.jpg`,
    "cannelloni-carne": `${P}/Cannelloni de Carne/IMG_7576.jpg`,
    "cannelloni-pollo": `${P}/Cannelloni de Frango ao molho pesto/IMG_7642.jpg`,
    "cannelloni-ricotta-spinaci": `${P}/Cannelloni de Ricota e Espinafre/IMG_7590.jpg`,
    "cappelletti-pollo": `${P}/Cappeletti de Frango/IMG_7822.jpg`,
    "fettuccine-pesto": `${P}/Fettuccine ao molho pesto/IMG_7869.jpg`,
    "fettuccine-funghi": `${P}/Fettuccine branco ao molho funghi com gorgonzola/IMG_7877.jpg`,
    "gnocchi": `${P}/Inhoque/IMG_7740.jpg`,
    "gnocchi-cru": `${P}/Inhoque/IMG_7718.jpg`,
    "lasagne-bolognese": `${P}/Lasanha a bolonhesa/IMG_7814.jpg`,
    "lasagne-bolognese-cucina": `${P}/Lasanha Bolonhesa/_MG_3308.JPG`,
    "lasagne-quattro-formaggi": `${P}/Lasanha Quatro Queijos/_MG_3318.JPG`,
    "pesto": `${P}/Molho pesto/IMG_7848.jpg`,
    "ravioli-carne": `${P}/Raviolli de Carne - 3 queijos - Brie/IMG_7777.jpg`,
    "ravioli-tre-formaggi": `${P}/Raviolli de Carne - 3 queijos - Brie/IMG_7759.jpg`,
    "ravioli-brie": `${P}/Raviolli de Carne - 3 queijos - Brie/IMG_7763.jpg`,
    "ravioli-verde": `${P}/Raviolli verde/IMG_7800.jpg`,
    "rondelli-prosciutto": `${P}/Rondelli de Presunto e Queijo/RONDELLI.jpg`,
    "sfogliatti-bianco": `${P}/Sfogliatti branco/IMG_7569.jpg`,
    "sfogliatti-bianco-cru": `${P}/Sfogliatti branco/IMG_7558.jpg`,
    "sfogliatti-giallo": `${P}/Sfogliatti amarelo/IMG_7631.jpg`,
    "sfogliatti-verde": `${P}/Sfogliatti verde/SFOGLIATTI.jpg`,
    "sfogliatti-verde-cru": `${P}/Sfogliatti verde/IMG_7601.jpg`,
    "tiramisu": `Tiramisú/IMG_7840.jpg`,
    // "Fotos 2026": ensaios de 2026 do Drive (pasta 2026/EMPÓRIO POPOLARE - FEV-26)
    "involtino-pizza": "Fotos 2026/involtino-pizza.jpg",
    "tortelli-zucca": "Fotos 2026/tortelli-zucca.jpg",
    "sugo-pomodoro": "Fotos 2026/sugo-pomodoro-4x3.jpg",
    "alla-panna": "Fotos 2026/alla-panna-4x3.jpg",
    "brodo-verdure": "Fotos 2026/brodo-verdure.jpg",
    // original só em RAW (Produtos Massas/Rondelli de queijo ao molho sugo/_MG_2429.CR2); JPG = prévia 2400px do Drive
    "rondelli-mozzarella": "Fotos 2026/rondelli-mozzarella.jpg",
  },
  cucina: {
    "forno-gratinado": `${P}/Manicaretti Verde/_MG_3358.JPG`,
    "forno-servindo": `${P}/Manicaretti Verde/_MG_3373.JPG`,
    "forno-fogao": `${P}/Manicaretti Verde/_MG_3368.JPG`,
    "molho-branco": `${P}/Manicaretti Verde/_MG_3333.JPG`,
    "lasagne-fogao": `${P}/Lasanha Quatro Queijos/_MG_3321.JPG`,
  },
  loja: {
    "fachada": { src: "Fotos Ambiente-Loja/IMG_6783.jpg", widths: WIDTHS_WIDE },
    "balcao": { src: "Fotos Ambiente-Loja/IMG_6667 copiar.jpg", widths: WIDTHS_WIDE },
    "janela-emporio": { src: "Fotos Ambiente-Loja/IMG_6869 copiar.jpg", widths: WIDTHS_WIDE },
    "grissini": "Fotos Ambiente-Loja/IMG_6870 copiar.jpg",
    "prateleiras": "Fotos Ambiente-Loja/IMG_6873 copiar.jpg",
    "vinhos": "Fotos Ambiente-Loja/IMG_6875 copiar.jpg",
  },
  // Carina Popolare (pasta "Fotos da Carina" do Drive do cliente)
  equipe: {
    "carina-retrato": "Fotos da Carina/IMG_7600 copiar.jpg",
    "carina-panela": "Fotos da Carina/IMG_7812 copiar.jpg",
    "carina-prato": "Fotos da Carina/IMG_7757 copiar.jpg",
    "carina-fogao": "Fotos da Carina/IMG_7484 copiar.jpg",
    "carina-emporio": { src: "Fotos da Carina/IMG_0684.JPG", widths: WIDTHS_WIDE },
    "carina-balcao": { src: "Fotos da Carina/IMG_6896 copiar.jpg", widths: WIDTHS_WIDE },
  },
};

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function processOne(group, slug, entry) {
  const { src, widths } = typeof entry === "string" ? { src: entry, widths: WIDTHS_DEFAULT } : entry;
  const outDir = path.join(PUBLIC, group);
  await mkdir(outDir, { recursive: true });

  // Rotaciona pelo EXIF uma vez e trabalha sobre o buffer já orientado
  const { data, info } = await sharp(path.join(ROOT, src), { failOn: "none" })
    .rotate()
    .resize({ width: Math.max(...widths), withoutEnlargement: true })
    .toBuffer({ resolveWithObject: true });

  for (const w of widths) {
    const avif = path.join(outDir, `${slug}-${w}.avif`);
    const webp = path.join(outDir, `${slug}-${w}.webp`);
    if (!(await exists(avif))) {
      await sharp(data).resize({ width: w, withoutEnlargement: true }).avif({ quality: 50, effort: 5, chromaSubsampling: "4:2:0" }).toFile(avif);
    }
    if (!(await exists(webp))) {
      await sharp(data).resize({ width: w, withoutEnlargement: true }).webp({ quality: 72 }).toFile(webp);
    }
  }

  const blur = await sharp(data).resize(20).webp({ quality: 40 }).toBuffer();
  return {
    src: `/img/${group}/${slug}`,
    widths,
    // altura ÷ largura (0.6667 = paisagem 3:2, 1.5 = retrato 2:3)
    aspect: Number((info.height / info.width).toFixed(4)),
    blur: `data:image/webp;base64,${blur.toString("base64")}`,
  };
}

const manifest = {};
for (const [group, items] of Object.entries(SOURCES)) {
  for (const [slug, entry] of Object.entries(items)) {
    manifest[`${group}/${slug}`] = await processOne(group, slug, entry);
    console.log(`ok ${group}/${slug}`);
  }
}
await mkdir(path.dirname(MANIFEST), { recursive: true });
await writeFile(MANIFEST, JSON.stringify(manifest, null, 2));
console.log(`manifesto: ${Object.keys(manifest).length} imagens`);
