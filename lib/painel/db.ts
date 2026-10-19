import "server-only";
import postgres from "postgres";

/**
 * Conexão do painel com o Postgres do Supabase, pela role `popolare_app`
 * (só enxerga o schema `popolare`). Pooler em modo transação (porta 6543),
 * então nada de prepared statements. Sem POPOLARE_DATABASE_URL → null
 * (dev local / preview): o site funciona igual, só não grava nem lê métricas.
 */
type Sql = ReturnType<typeof postgres>;

const globalForDb = globalThis as unknown as { popolareSql?: Sql | null };

export function getSql(): Sql | null {
  if (globalForDb.popolareSql !== undefined) return globalForDb.popolareSql;
  const url = process.env.POPOLARE_DATABASE_URL;
  globalForDb.popolareSql = url
    ? postgres(url, {
        prepare: false,
        max: 3,
        idle_timeout: 20,
        connect_timeout: 10,
        ssl: "require",
        // contagens (bigint) e médias (numeric) chegam como number — cabem com folga e serializam para o client
        types: {
          bigint: { to: 20, from: [20], parse: (v: string) => Number(v), serialize: (v: number) => String(v) },
          numeric: { to: 1700, from: [1700], parse: (v: string) => Number(v), serialize: (v: number) => String(v) },
          // datas como texto ISO (iguais às que vêm dentro dos jsonb das jornadas)
          date: { to: 1082, from: [1082], parse: (v: string) => v, serialize: (v: string) => v },
          timestamptz: {
            to: 1184,
            from: [1184, 1114],
            parse: (v: string) => new Date(v).toISOString(),
            serialize: (v: string | Date) => (v instanceof Date ? v.toISOString() : v),
          },
        },
      })
    : null;
  return globalForDb.popolareSql;
}
