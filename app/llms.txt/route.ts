import { buildLlmsText } from "@/lib/llms";

export function GET() {
  return new Response(buildLlmsText(false), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
