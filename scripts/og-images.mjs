// Imagens de compartilhamento (Open Graph) das LPs por grupo: public/og/<grupo>.jpg, 1200×630, JPG
// (WhatsApp e redes não leem AVIF). Fonte: a foto do hero de cada grupo, já processada em public/img.
// Ao trocar o produto do hero em data/lpGrupos.ts, ajustar aqui e rodar `npm run og`.
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public", "og");

/** grupo (data/lpTemas.ts) → imagem (chave de data/images.generated.json) */
const OG = {
  "massas-em-goiania": "produtos/sfogliatti-bianco",
  "massas-artesanais": "produtos/ravioli-verde",
  lasanhas: "produtos/lasagne-bolognese",
  "massas-de-forno": "produtos/cannelloni-carne",
  nhoque: "produtos/gnocchi",
  "ravioli-capeletti": "produtos/cappelletti-pollo",
};

await mkdir(OUT, { recursive: true });
for (const [grupo, image] of Object.entries(OG)) {
  const src = path.join(ROOT, "public", "img", `${image}-1600.webp`);
  const dest = path.join(OUT, `${grupo}.jpg`);
  await sharp(src).resize(1200, 630, { fit: "cover", position: "attention" }).jpeg({ quality: 82, mozjpeg: true }).toFile(dest);
  console.log(`og: ${grupo} ← ${image}`);
}
