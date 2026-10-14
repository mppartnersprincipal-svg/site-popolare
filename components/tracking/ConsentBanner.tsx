"use client";

import Link from "next/link";
import { useSyncExternalStore, useState } from "react";
import { CONSENT_KEY, updateConsent, type ConsentChoice } from "@/lib/consent";

const subscribeNoop = () => () => {};

function storedChoice(): ConsentChoice {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

/** Aviso de cookies (LGPD) com Consent Mode v2 — só aparece até o visitante escolher. */
export function ConsentBanner() {
  // "unknown" no servidor/hidratação: nada é renderizado antes de ler a escolha salva
  const saved = useSyncExternalStore(subscribeNoop, storedChoice, () => "unknown" as const);
  const [answered, setAnswered] = useState(false);

  if (saved !== null || answered) return null;

  const choose = (choice: Exclude<ConsentChoice, null>) => {
    updateConsent(choice);
    setAnswered(true);
  };

  return (
    <div
      role="region"
      aria-label="Aviso de privacidade"
      className="fixed inset-x-3 bottom-3 z-[65] mx-auto max-w-md rounded-[1.5rem] bg-tinta/95 p-5 text-sm text-farinha shadow-2xl backdrop-blur sm:inset-x-auto sm:left-5"
    >
      <p className="leading-relaxed">
        Usamos cookies para medir visitas e melhorar os anúncios. Você escolhe.{" "}
        <Link href="/politica-de-privacidade" className="underline underline-offset-2">
          Política de privacidade
        </Link>
      </p>
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={() => choose("granted")} className="rounded-full bg-farinha px-5 py-2 font-semibold text-tinta hover:bg-massa">
          Aceitar
        </button>
        <button type="button" onClick={() => choose("denied")} className="rounded-full border border-farinha/30 px-5 py-2 font-semibold hover:bg-farinha/10">
          Recusar
        </button>
      </div>
    </div>
  );
}
