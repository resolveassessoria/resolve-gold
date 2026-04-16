export function roundCurrency(value: number): number {
  return Math.round((safeNumber(value) + Number.EPSILON) * 100) / 100;
}

export function formatBRL(value: number): string {
  return `R$ ${roundCurrency(value).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function safeNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

export function sumByFilter(
  transactions: any[],
  filterFn: (t: any) => boolean,
  field = "valor"
): number {
  return roundCurrency(
    (transactions || [])
      .filter(filterFn)
      .reduce((sum, t) => sum + safeNumber(t[field]), 0)
  );
}

export function sumCredits(transactions: any[]): number {
  return sumByFilter(transactions, (t) =>
    ["cashback", "royalty", "comissao"].includes(t.tipo)
  );
}

export function sumDebits(transactions: any[]): number {
  return sumByFilter(transactions, (t) => t.tipo === "investimento");
}

export function sumPending(transactions: any[]): number {
  return sumByFilter(transactions, (t) => t.status === "pendente");
}

export function sumConfirmed(transactions: any[]): number {
  return sumByFilter(transactions, (t) => t.status !== "pendente");
}
