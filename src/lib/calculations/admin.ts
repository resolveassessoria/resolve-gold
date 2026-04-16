import { roundCurrency, safeNumber, sumByFilter } from "@/lib/utils/currency";
import { calculateProfitShare } from "./finance";

export function calculateTotalByTipo(transactions: any[], tipo: string): number {
  return sumByFilter(transactions, (t) => t.tipo === tipo);
}

export function calculateTotalMarketplaceSales(sales: any[]): number {
  return roundCurrency((sales || []).reduce((s, t) => s + safeNumber(t.valor), 0));
}

export function calculateTotalMarketplaceCommissions(sales: any[]): number {
  return roundCurrency((sales || []).reduce((s, t) => s + safeNumber(t.comissao_recebida), 0));
}

export function calculateAdminDashboard(params: {
  transactions: any[];
  marketplaceSales: any[];
  globalProfit: number;
}) {
  const { transactions, marketplaceSales, globalProfit } = params;
  return {
    totalCashback: calculateTotalByTipo(transactions, "cashback"),
    totalRoyalties: calculateTotalByTipo(transactions, "royalty"),
    totalComissoes: calculateTotalByTipo(transactions, "comissao"),
    totalInvestimentos: calculateTotalByTipo(transactions, "investimento"),
    totalMarketplace: calculateTotalMarketplaceSales(marketplaceSales),
    totalMarketplaceComissoes: calculateTotalMarketplaceCommissions(marketplaceSales),
    profitShare: calculateProfitShare(globalProfit),
  };
}
