import { roundCurrency, safeNumber, sumCredits, sumDebits } from "@/lib/utils/currency";
import type { BalanceResult, WithdrawalSimulation, ProfitShareResult } from "@/lib/types/financial";

export function calculateBalance(transactions: any[]): BalanceResult {
  const credits = sumCredits(transactions);
  const debits = sumDebits(transactions);
  // Since we don't have a status field in current schema, treat all as confirmed
  const pending = 0;
  const confirmed = credits;
  const available = roundCurrency(confirmed - debits);

  return { credits, debits, pending, confirmed, available };
}

export function simulateWithdrawal(
  requestedAmount: number,
  isResolveBankAccount: boolean,
  availableBalance: number
): WithdrawalSimulation {
  const amount = safeNumber(requestedAmount);
  const minimumReached = amount >= 100;
  const fee = isResolveBankAccount ? 0 : roundCurrency(amount * 0.05);
  const netAmount = roundCurrency(amount - fee);
  const hasBalance = availableBalance >= amount;

  return {
    requestedAmount: amount,
    fee,
    netAmount,
    minimumReached: minimumReached && hasBalance,
    isFeeExempt: isResolveBankAccount,
    hasBalance,
  };
}

export function calculateProfitShare(globalProfit: number): ProfitShareResult {
  return {
    liveBonusPool: roundCurrency(globalProfit * 0.04),
    championBonusPool: roundCurrency(globalProfit * 0.01),
    divulgationBonusPool: roundCurrency(globalProfit * 0.02),
    founderBonusPool: roundCurrency(globalProfit * 0.03),
    totalPool: roundCurrency(globalProfit * 0.09),
  };
}
