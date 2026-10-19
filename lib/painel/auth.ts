import "server-only";
import { createHmac, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getSql } from "@/lib/painel/db";

/**
 * Login do /painel — próprio do site (não usa o Supabase Auth do projeto compartilhado).
 * Usuários em popolare.dashboard_users (senha em scrypt); sessão num cookie
 * httpOnly assinado com HMAC-SHA256 (PAINEL_SESSION_SECRET), válido por 7 dias.
 */

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number, opts: object) => Promise<Buffer>;

export const SESSION_COOKIE = "popolare_painel";
const SESSION_DAYS = 7;
const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;

export type PainelUser = { email: string; name: string };

function secret(): string | null {
  const s = process.env.PAINEL_SESSION_SECRET;
  return s && s.length >= 32 ? s : null;
}

function sign(payload: string, key: string) {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** Formato: scrypt$N$r$p$salt(base64)$hash(base64) — gerado por scripts/painel-usuario.mjs */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, n, r, p, salt, hash] = stored.split("$");
  if (algo !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const derived = await scrypt(password, Buffer.from(salt, "base64"), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: 64 * 1024 * 1024,
  });
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

export function sessionToken(email: string): string | null {
  const key = secret();
  if (!key) return null;
  const payload = Buffer.from(JSON.stringify({ e: email, x: Date.now() + SESSION_MS })).toString("base64url");
  return `${payload}.${sign(payload, key)}`;
}

export const SESSION_MAX_AGE = SESSION_MS / 1000;

function readToken(token: string | undefined): string | null {
  const key = secret();
  if (!key || !token) return null;
  const [payload, mac] = token.split(".");
  if (!payload || !mac || !safeEqual(mac, sign(payload, key))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { e?: string; x?: number };
    return data.e && typeof data.x === "number" && data.x > Date.now() ? data.e : null;
  } catch {
    return null;
  }
}

/** Usuário logado ou null. Confere no banco a cada request (remover o usuário revoga o acesso). */
export async function getUser(): Promise<PainelUser | null> {
  // Sessão é por request (relógio + cookie): nunca entra no prerender da casca
  await connection();
  const email = readToken((await cookies()).get(SESSION_COOKIE)?.value);
  const sql = getSql();
  if (!email || !sql) return null;
  try {
    const rows = await sql<PainelUser[]>`select email, name from popolare.dashboard_users where email = ${email}`;
    return rows[0] ?? null;
  } catch (err) {
    console.error("[painel] getUser", err instanceof Error ? err.message : err);
    return null;
  }
}

/** Para páginas e server actions do painel: sem sessão → tela de login. */
export async function requireUser(): Promise<PainelUser> {
  const user = await getUser();
  if (!user) redirect("/painel/entrar");
  return user;
}
