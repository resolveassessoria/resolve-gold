import { roundCurrency } from "@/lib/utils/currency";
import type { ClientDashboardResult } from "@/lib/types/financial";

export function calculateClientServicePrice(debtValue: number): number {
  if (debtValue <= 7000) return 700;
  return roundCurrency(debtValue * 0.10);
}

export function calculateClientCreditForecast(servicePrice: number): number {
  return roundCurrency(servicePrice * 0.10);
}

export function calculateClientMonthlyCashback(servicePrice: number): number {
  return roundCurrency(servicePrice * 0.02);
}

export function calculateClientCashbackSixMonths(servicePrice: number): number {
  return roundCurrency(calculateClientMonthlyCashback(servicePrice) * 6);
}

export function calculateClientDashboard(debtValue: number): ClientDashboardResult {
  const servicePrice = calculateClientServicePrice(debtValue);
  const appliedPercent = debtValue <= 7000 ? null : 0.10;
  const creditForecast = calculateClientCreditForecast(servicePrice);
  const monthlyCashback = calculateClientMonthlyCashback(servicePrice);
  const cashbackSixMonths = calculateClientCashbackSixMonths(servicePrice);

  return {
    debtValue: roundCurrency(debtValue),
    servicePrice,
    appliedPercent,
    creditForecast,
    monthlyCashback,
    cashbackSixMonths,
  };
}
