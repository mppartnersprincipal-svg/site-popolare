// Gera grades de miniaturas (contact sheets) para curadoria das fotos.
// Uso: node scripts/contact-sheet.mjs <pastaOrigem> <pastaSaida>
import sharp from "sharp";
import { readdir, mkdir, stat } from "node:fs/promises";
import path from "node:path";

const [, , SRC, OUT] = process.argv;
const THUMB = 360;
const COLS = 5;
const IMG_EXT = /\.(jpe?g|png)$/i;

async function listDirs(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const dirs = [dir];
  for (const e of entries) {
    if (e.isDirectory() && e.name !== "site") dirs.push(...(await listDirs(path.join(dir, e.name))));
  }
  return dirs;
}

function label(text) {
  const safe = text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return Buffer.from(
    `<svg width="${THUMB}" height="28"><rect width="100%" height="100%" fill="black" opacity="0.7"/><text x="8" y="19" font-size="16" font-family="Arial" fill="white">${safe}</text></svg>`
  );
}

async function sheetFor(dir) {
  const files = (await readdir(dir)).filter((f) => IMG_EXT.test(f));
  if (files.length === 0) return;
  const tiles = await Promise.all(
    files.map((f) =>
      sharp(path.join(dir, f), { failOn: "none" })
        .rotate()
        .resize(THUMB, THUMB, { fit: "cover" })
        .composite([{ input: label(f), gravity: "south" }])
        .jpeg({ quality: 70 })
        .toBuffer()
    )
  );
  const rows = Math.ceil(tiles.length / COLS);
  const name = path.relative(SRC, dir).replace(/[\\/]/g, "__") || "root";
  await sharp({
    create: { width: COLS * THUMB, height: rows * THUMB, channels: 3, background: "#222" },
  })
    .composite(tiles.map((input, i) => ({ input, left: (i % COLS) * THUMB, top: Math.floor(i / COLS) * THUMB })))
    .jpeg({ quality: 72 })
    .toFile(path.join(OUT, `${name}.jpg`));
  console.log(`ok ${name} (${files.length})`);
}

await mkdir(OUT, { recursive: true });
for (const d of await listDirs(SRC)) {
  if ((await stat(d)).isDirectory()) await sheetFor(d);
}
