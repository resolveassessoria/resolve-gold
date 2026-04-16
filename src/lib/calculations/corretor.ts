import { roundCurrency } from "@/lib/utils/currency";
import type { CommissionResult } from "@/lib/types/financial";
import { calculateExpansionLevel } from "./expansion";

export function calculateNetBase(grossValue: number, operationalCost: number): number {
  return roundCurrency(Math.max(grossValue - operationalCost, 0));
}

const CLIENT_LEVELS = [0.05, 0.04, 0.03, 0.03, 0.02, 0.02, 0.01];
const FOMENTADOR_LEVELS = [0.025, 0.02, 0.015, 0.015, 0.01, 0.01, 0.005];

export function calculateBrokerClientCommission(base: number): CommissionResult {
  return {
    directCommission: roundCurrency(base * 0.30),
    levels: CLIENT_LEVELS.map((p) => roundCurrency(base * p)),
  };
}

export function calculateBrokerFomentadorCommission(
  base: number,
  halveNetworkBonuses = false
): CommissionResult {
  const factor = halveNetworkBonuses ? 0.5 : 1;
  return {
    directCommission: roundCurrency(base * 0.15),
    levels: FOMENTADOR_LEVELS.map((p) => roundCurrency(base * p * factor)),
  };
}

export function calculateMarketplaceCommission(saleValue: number): CommissionResult {
  return {
    directCommission: roundCurrency(saleValue * 0.30),
    levels: CLIENT_LEVELS.map((p) => roundCurrency(saleValue * p)),
  };
}

export type CorretorDashboardParams = {
  grossValue: number;
  operationalCost: number;
  type: "client" | "fomentador";
  halveNetworkBonuses?: boolean;
  marketplaceSalesTotal: number;
  expansionPoints: number;
  comprou_conteudo?: boolean;
};

export function calculateCorretorDashboard(params: CorretorDashboardParams) {
  const {
    grossValue, operationalCost, type, halveNetworkBonuses = false,
    marketplaceSalesTotal, expansionPoints, comprou_conteudo = true,
  } = params;

  const base = calculateNetBase(grossValue, operationalCost);
  const commission = type === "client"
    ? calculateBrokerClientCommission(base)
    : calculateBrokerFomentadorCommission(base, halveNetworkBonuses);
  const marketplace = calculateMarketplaceCommission(marketplaceSalesTotal);
  const expansion = calculateExpansionLevel(expansionPoints, comprou_conteudo);

  const totalProjected = roundCurrency(
    commission.directCommission +
    commission.levels.reduce((a, b) => a + b, 0) +
    marketplace.directCommission
  );

  return { grossValue, operationalCost, base, commission, marketplace, expansion, totalProjected };
}
