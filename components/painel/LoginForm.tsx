"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { login, type LoginState } from "@/app/painel/actions";

const INITIAL: LoginState = { error: null };

export function LoginForm() {
  const [state, action, pending] = useActionState(login, INITIAL);
  const input =
    "w-full rounded-xl border border-tinta/15 bg-white px-4 py-3 text-sm text-tinta placeholder:text-tinta-suave/60 " +
    "focus:border-primaria focus:outline-none focus:ring-2 focus:ring-primaria/15";

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-tinta">
          E-mail
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className={input} placeholder="voce@email.com" />
      </div>
      <div>
        <label htmlFor="senha" className="mb-1.5 block text-sm font-semibold text-tinta">
          Senha
        </label>
        <input id="senha" name="senha" type="password" autoComplete="current-password" required className={input} placeholder="••••••••" />
      </div>
      {state.error ? (
        <p role="alert" className="text-sm font-medium text-primaria">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primaria px-6 py-3 font-semibold text-farinha transition-colors hover:bg-vinho disabled:opacity-70"
      >
        {pending ? (
          <>
            <Loader2 aria-hidden className="size-4 animate-spin" />
            Entrando…
          </>
        ) : (
          "Entrar"
        )}
      </button>
    </form>
  );
}
