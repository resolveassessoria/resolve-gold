export type Money = number;

export type CalculationBreakdown = {
  gross: Money;
  operationalCost?: Money;
  base?: Money;
  percentage?: number;
  amount: Money;
  label: string;
};

export type CommissionResult = {
  directCommission: Money;
  levels: Money[];
};

export type ExpansionLevelResult = {
  currentLevel: string;
  nextLevel: string | null;
  currentPoints: number;
  pointsToNextLevel: number;
  unlockedReward: string | null;
  advanceBonus: Money;
  progressPercent: number;
  showZeroRiskWarning: boolean;
  marketplaceKeepsPoints: boolean;
};

export type WithdrawalSimulation = {
  requestedAmount: Money;
  fee: Money;
  netAmount: Money;
  minimumReached: boolean;
  isFeeExempt: boolean;
  hasBalance: boolean;
};

export type BalanceResult = {
  credits: Money;
  debits: Money;
  pending: Money;
  confirmed: Money;
  available: Money;
};

export type ClientDashboardResult = {
  debtValue: Money;
  servicePrice: Money;
  appliedPercent: number | null;
  creditForecast: Money;
  monthlyCashback: Money;
  cashbackSixMonths: Money;
};

export type FomentadorDashboardResult = {
  investedAmount: Money;
  monthlyRoyalty: Money;
  annualRoyalty: Money;
  projectedPercent: number;
  projectionLabel: string;
};

export type ProfitShareResult = {
  liveBonusPool: Money;
  championBonusPool: Money;
  divulgationBonusPool: Money;
  founderBonusPool: Money;
  totalPool: Money;
};

export type FranchiseRoyaltyResult = {
  grossValue: Money;
  royalty: Money;
  netAfterRoyalty: Money;
};
