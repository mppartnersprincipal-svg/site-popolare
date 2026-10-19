"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSql } from "@/lib/painel/db";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  requireUser,
  sessionToken,
  verifyPassword,
} from "@/lib/painel/auth";
import { getRecent, type Scope } from "@/lib/painel/queries";
import type { RecentRow } from "@/lib/painel/types";

export type LoginState = { error: string | null };

const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { n: number; reset: number }>();

function tooManyAttempts(key: string) {
  const now = Date.now();
  const a = attempts.get(key);
  if (!a || a.reset < now) {
    if (attempts.size > 2000) attempts.clear();
    attempts.set(key, { n: 1, reset: now + WINDOW_MS });
    return false;
  }
  a.n += 1;
  return a.n > MAX_ATTEMPTS;
}

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  const password = String(form.get("senha") ?? "").slice(0, 200);
  if (!email || !password) return { error: "Preencha e-mail e senha." };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (tooManyAttempts(ip) || tooManyAttempts(`e:${email}`)) {
    return { error: "Muitas tentativas. Aguarde alguns minutos e tente de novo." };
  }

  const sql = getSql();
  if (!sql) return { error: "O painel ainda não está conectado ao banco de dados." };

  let ok = false;
  try {
    const rows = await sql<{ pass_hash: string }[]>`
      select pass_hash from popolare.dashboard_users where email = ${email}`;
    ok = rows[0] ? await verifyPassword(password, rows[0].pass_hash) : false;
  } catch (err) {
    console.error("[painel] login", err instanceof Error ? err.message : err);
    return { error: "Não foi possível entrar agora. Tente de novo em instantes." };
  }
  if (!ok) return { error: "E-mail ou senha incorretos." };

  const token = sessionToken(email);
  if (!token) return { error: "O painel ainda não está configurado (segredo de sessão ausente)." };

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/painel",
    maxAge: SESSION_MAX_AGE,
  });
  await sql`update popolare.dashboard_users set last_login = now() where email = ${email}`.catch(() => {});
  redirect("/painel/lp");
}

export async function logout() {
  (await cookies()).delete({ name: SESSION_COOKIE, path: "/painel" });
  redirect("/painel/entrar");
}

/** Últimos eventos — polling da seção "Ao vivo". */
export async function getRecentEvents(scope: Scope, limit = 40): Promise<RecentRow[]> {
  await requireUser();
  return getRecent(scope, limit);
}
