import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/utils/currency";
import type { ExpansionLevelResult } from "@/lib/types/financial";
import { Trophy, AlertTriangle } from "lucide-react";

interface ExpansionProgressCardProps {
  data: ExpansionLevelResult;
}

export function ExpansionProgressCard({ data }: ExpansionProgressCardProps) {
  return (
    <Card className="bg-card border-gold">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="w-5 h-5 text-primary" />
          Expansão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Nível Atual</p>
            <p className="text-xl font-bold text-primary">{data.currentLevel}</p>
          </div>
          {data.unlockedReward && (
            <Badge className="bg-primary/10 text-primary border-primary/30">
              🎁 {data.unlockedReward}
            </Badge>
          )}
        </div>

        {data.nextLevel && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progresso para {data.nextLevel}</span>
              <span className="text-primary font-medium">{data.progressPercent}%</span>
            </div>
            <Progress value={data.progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Faltam <span className="text-primary font-medium">{data.pointsToNextLevel.toLocaleString("pt-BR")}</span> pontos
            </p>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Pontos Atuais</span>
          <span className="text-primary font-bold">{data.currentPoints.toLocaleString("pt-BR")}</span>
        </div>

        {data.advanceBonus > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Bônus Avanço</span>
            <span className="text-primary font-bold">{formatBRL(data.advanceBonus)}</span>
          </div>
        )}

        {data.showZeroRiskWarning && (
          <div className="flex items-start gap-2 bg-destructive/10 rounded-lg p-3 border border-destructive/20">
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-xs text-destructive">
              Atenção: sem aquisição de conteúdo nos últimos 3 meses, pontos podem ser zerados.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
