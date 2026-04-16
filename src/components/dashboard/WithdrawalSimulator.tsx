import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/utils/currency";
import { simulateWithdrawal } from "@/lib/calculations/finance";
import { Banknote } from "lucide-react";
import { ProjectionBadge } from "./ProjectionBadge";

interface WithdrawalSimulatorProps {
  availableBalance: number;
}

export function WithdrawalSimulator({ availableBalance }: WithdrawalSimulatorProps) {
  const [amount, setAmount] = useState("");
  const [isResolveAccount, setIsResolveAccount] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const simulation = simulateWithdrawal(numAmount, isResolveAccount, availableBalance);

  return (
    <Card className="bg-card border-gold">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Banknote className="w-5 h-5 text-primary" />
          Simulador de Saque
          <ProjectionBadge label="Simulação" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm text-muted-foreground">Saldo Disponível</Label>
          <p className="text-lg font-bold text-primary">{formatBRL(availableBalance)}</p>
        </div>

        <div>
          <Label htmlFor="withdraw-amount" className="text-sm text-muted-foreground">Valor do Saque</Label>
          <Input
            id="withdraw-amount"
            type="number"
            placeholder="100.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={isResolveAccount} onCheckedChange={setIsResolveAccount} />
          <Label className="text-sm text-muted-foreground">Conta RESOLVE (sem taxa)</Label>
        </div>

        {numAmount > 0 && (
          <div className="space-y-2 bg-muted rounded-lg p-3 border border-gold/30">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Valor solicitado</span>
              <span>{formatBRL(simulation.requestedAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taxa ({simulation.isFeeExempt ? "isenta" : "5%"})</span>
              <span className={simulation.fee > 0 ? "text-destructive" : "text-green-500"}>
                {simulation.fee > 0 ? `- ${formatBRL(simulation.fee)}` : "R$ 0,00"}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t border-gold/30 pt-2">
              <span>Valor líquido</span>
              <span className="text-primary">{formatBRL(simulation.netAmount)}</span>
            </div>
            {!simulation.minimumReached && (
              <p className="text-xs text-destructive">
                {!simulation.hasBalance ? "Saldo insuficiente." : "Mínimo para saque: R$ 100,00."}
              </p>
            )}
          </div>
        )}

        <Button disabled className="w-full opacity-60">Solicitar Saque — Em breve</Button>
      </CardContent>
    </Card>
  );
}
