import { roundCurrency } from "@/lib/utils/currency";
import type { FomentadorDashboardResult } from "@/lib/types/financial";

export function calculateMonthlyRoyaltyForecast(investedAmount: number): number {
  return roundCurrency(investedAmount * 0.05);
}

export function calculateAnnualRoyaltyForecast(investedAmount: number): number {
  return roundCurrency(calculateMonthlyRoyaltyForecast(investedAmount) * 12);
}

export function calculateFomentadorDashboard(investedAmount: number): FomentadorDashboardResult {
  return {
    investedAmount: roundCurrency(investedAmount),
    monthlyRoyalty: calculateMonthlyRoyaltyForecast(investedAmount),
    annualRoyalty: calculateAnnualRoyaltyForecast(investedAmount),
    projectedPercent: 0.05,
    projectionLabel: "até 5% ao mês",
  };
}
