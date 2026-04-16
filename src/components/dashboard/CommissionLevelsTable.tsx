import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL } from "@/lib/utils/currency";
import type { CommissionResult } from "@/lib/types/financial";
import { ProjectionBadge } from "./ProjectionBadge";

interface CommissionLevelsTableProps {
  title: string;
  data: CommissionResult;
  isProjection?: boolean;
}

const LEVEL_LABELS = [
  "Nível 1", "Nível 2", "Nível 3", "Nível 4", "Nível 5", "Nível 6", "Nível 7",
];

export function CommissionLevelsTable({ title, data, isProjection = false }: CommissionLevelsTableProps) {
  const total = data.directCommission + data.levels.reduce((a, b) => a + b, 0);

  return (
    <Card className="bg-card border-gold">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {title}
          {isProjection && <ProjectionBadge />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center py-2 border-b border-gold">
            <span className="text-sm font-semibold">Comissão Direta</span>
            <span className="text-primary font-bold">{formatBRL(data.directCommission)}</span>
          </div>
          {data.levels.map((val, i) => (
            <div key={i} className="flex justify-between items-center py-1.5 border-b border-gold/50 last:border-0">
              <span className="text-sm text-muted-foreground">{LEVEL_LABELS[i]}</span>
              <span className="text-sm text-primary">{formatBRL(val)}</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2 border-t border-primary/30">
            <span className="text-sm font-bold">Total</span>
            <span className="text-primary font-bold">{formatBRL(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
