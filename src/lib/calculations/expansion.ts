import type { ExpansionLevelResult } from "@/lib/types/financial";

export const EXPANSION_LEVELS = [
  { name: "Corretor", threshold: 1500, reward: "PIN", advanceBonus: 0 },
  { name: "Consultor", threshold: 2800, reward: "R$ 200", advanceBonus: 0 },
  { name: "Assessor", threshold: 7000, reward: "R$ 500", advanceBonus: 0 },
  { name: "Broker", threshold: 21000, reward: "R$ 1.000", advanceBonus: 0 },
  { name: "Especialista", threshold: 28000, reward: "Cruzeiro R$ 4.000", advanceBonus: 1000 },
  { name: "Gestor", threshold: 100000, reward: "Caribe R$ 12.000", advanceBonus: 3000 },
  { name: "Elite", threshold: 280000, reward: "Moto R$ 35.000", advanceBonus: 10000 },
  { name: "Premium", threshold: 840000, reward: "Carro R$ 160.000", advanceBonus: 40000 },
  { name: "Supremo", threshold: 2000000, reward: "Super Carro R$ 400.000", advanceBonus: 120000 },
];

export function calculateExpansionLevel(
  points: number,
  comprou_conteudo = true
): ExpansionLevelResult {
  let currentIndex = -1;
  for (let i = EXPANSION_LEVELS.length - 1; i >= 0; i--) {
    if (points >= EXPANSION_LEVELS[i].threshold) {
      currentIndex = i;
      break;
    }
  }

  const current = currentIndex >= 0 ? EXPANSION_LEVELS[currentIndex] : null;
  const next = currentIndex < EXPANSION_LEVELS.length - 1 ? EXPANSION_LEVELS[currentIndex + 1] : null;

  const currentThreshold = current?.threshold ?? 0;
  const nextThreshold = next?.threshold ?? currentThreshold;
  const pointsToNextLevel = Math.max(nextThreshold - points, 0);
  const rangeSize = nextThreshold - currentThreshold;
  const progressPercent = rangeSize > 0
    ? Math.min(((points - currentThreshold) / rangeSize) * 100, 100)
    : 100;

  return {
    currentLevel: current?.name ?? "Iniciante",
    nextLevel: next?.name ?? null,
    currentPoints: points,
    pointsToNextLevel,
    unlockedReward: current?.reward ?? null,
    advanceBonus: current?.advanceBonus ?? 0,
    progressPercent: Math.round(progressPercent),
    showZeroRiskWarning: !comprou_conteudo,
    marketplaceKeepsPoints: true,
  };
}
