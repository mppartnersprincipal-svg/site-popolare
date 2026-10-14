// Extrai a sequência de quadros do vídeo "entrando na loja" para o scrub por scroll.
// Uso: npm run frames -- <caminho-do-video.mp4>
// Ao receber o vídeo real (Rafael), rode de novo com o novo arquivo — nada mais muda.
import { execFileSync } from "node:child_process";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const [, , VIDEO] = process.argv;
if (!VIDEO) {
  console.error("Informe o vídeo: npm run frames -- caminho/video.mp4");
  process.exit(1);
}

const OUT = path.resolve(import.meta.dirname, "..", "public", "frames", "loja");
const MANIFEST = path.resolve(import.meta.dirname, "..", "data", "frames.generated.json");
const FRAME_COUNT = 96;
const WIDTH = 768;
const QUALITY = 62;

const probe = JSON.parse(
  execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,duration", "-of", "json", VIDEO]).toString()
);
const { width, height, duration } = probe.streams[0];
const fps = FRAME_COUNT / Number(duration);

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

execFileSync(
  "ffmpeg",
  [
    "-v", "error", "-y", "-i", VIDEO,
    "-vf", `fps=${fps.toFixed(4)},scale=${WIDTH}:-2:flags=lanczos`,
    "-frames:v", String(FRAME_COUNT),
    "-c:v", "libwebp", "-quality", String(QUALITY), "-compression_level", "6",
    path.join(OUT, "f%03d.webp"),
  ],
  { stdio: "inherit" }
);

const files = (await readdir(OUT)).filter((f) => f.endsWith(".webp")).sort();
const outHeight = Math.round((Number(height) / Number(width)) * WIDTH);
await writeFile(
  MANIFEST,
  JSON.stringify({ path: "/frames/loja", count: files.length, width: WIDTH, height: outHeight, pattern: "f{n}.webp", pad: 3 }, null, 2)
);
console.log(`${files.length} quadros em ${OUT}`);
