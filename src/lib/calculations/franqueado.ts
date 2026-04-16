import { roundCurrency } from "@/lib/utils/currency";
import { calculateNetBase } from "./corretor";
import type { CommissionResult, FranchiseRoyaltyResult } from "@/lib/types/financial";

const FRANCHISE_LEVELS = [0.025, 0.02, 0.015, 0.015, 0.01, 0.01, 0.005];

export function calculateFranchiseCommission(base: number): CommissionResult {
  return {
    directCommission: roundCurrency(base * 0.40),
    levels: FRANCHISE_LEVELS.map((p) => roundCurrency(base * p)),
  };
}

export function calculateFranchiseRoyalty(grossValue: number): FranchiseRoyaltyResult {
  const royalty = roundCurrency(grossValue * 0.05);
  return {
    grossValue: roundCurrency(grossValue),
    royalty,
    netAfterRoyalty: roundCurrency(grossValue - royalty),
  };
}

export function calculateRentedFranchiseCommission(grossValue: number): number {
  return roundCurrency(grossValue * 0.30);
}

export type FranqueadoDashboardParams = {
  grossValue: number;
  operationalCost: number;
  rentedGrossValue: number;
};

export function calculateFranqueadoDashboard(params: FranqueadoDashboardParams) {
  const { grossValue, operationalCost, rentedGrossValue } = params;
  const base = calculateNetBase(grossValue, operationalCost);
  return {
    ownOperation: calculateFranchiseCommission(base),
    royalties: calculateFranchiseRoyalty(grossValue),
    rentedOperationCommission: calculateRentedFranchiseCommission(rentedGrossValue),
    base,
  };
}
