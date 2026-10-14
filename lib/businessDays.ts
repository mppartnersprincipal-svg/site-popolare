// Regras de prazo das encomendas: mínimo de N dias úteis (seg–sex) e loja fechada aos domingos.
// Feriados não são considerados — a confirmação final é feita pela loja no WhatsApp.

const SUNDAY = 0;
const SATURDAY = 6;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === SUNDAY || day === SATURDAY;
}

export function toIsoDate(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

export function parseIsoDate(value: string): Date | null {
  const match = ISO_DATE.exec(value);
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const date = new Date(y, m - 1, d);
  const isReal = date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  return isReal ? date : null;
}

export function addBusinessDays(from: Date, days: number): Date {
  const result = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let remaining = days;
  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    if (!isWeekend(result)) remaining -= 1;
  }
  return result;
}

/** Primeira data aceita para retirada (yyyy-mm-dd) */
export function minOrderDate(today: Date, minBusinessDays: number): string {
  return toIsoDate(addBusinessDays(today, minBusinessDays));
}

export function isValidOrderDate(value: string, today: Date, minBusinessDays: number): boolean {
  const date = parseIsoDate(value);
  if (!date || date.getDay() === SUNDAY) return false;
  return toIsoDate(date) >= minOrderDate(today, minBusinessDays);
}
