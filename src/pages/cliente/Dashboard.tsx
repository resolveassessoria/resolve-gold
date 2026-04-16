import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { clienteNav } from "@/components/dashboard/nav/clienteNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Link2, ShieldCheck, DollarSign, TrendingUp, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { BreakdownTable } from "@/components/dashboard/BreakdownTable";
import { ProjectionBadge } from "@/components/dashboard/ProjectionBadge";
import { WithdrawalSimulator } from "@/components/dashboard/WithdrawalSimulator";
import { calculateClientDashboard } from "@/lib/calculations/client";
import { calculateBalance } from "@/lib/calculations/finance";
import { formatBRL } from "@/lib/utils/currency";
import { safeNumber } from "@/lib/utils/currency";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ClienteDashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const [debtInput, setDebtInput] = useState("7000");

  const { data: transactions } = useQuery({
    queryKey: ["cliente-transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: kycDocs } = useQuery({
    queryKey: ["cliente-kyc", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("kyc_documents").select("*").eq("user_id", user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const debtValue = safeNumber(debtInput);
  const calc = calculateClientDashboard(debtValue);
  const balance = calculateBalance(transactions || []);
  const cashbackTotal = (transactions || []).filter((t: any) => t.tipo === "cashback").reduce((s: number, t: any) => s + safeNumber(t.valor), 0);
  const referralLink = `${window.location.origin}/register?ref=${user?.id}`;
  const kycComplete = kycDocs && kycDocs.length >= 3 && kycDocs.every((d: any) => d.status === "aprovado");

  if (loading) return null;

  return (
    <DashboardShell title="Painel do Cliente" userName={profile?.nome} onSignOut={signOut} navItems={clienteNav}>
      <h1 className="text-2xl font-heading font-bold mb-6">Painel do <span className="text-primary">Cliente</span></h1>

      {/* KPIs */}
      <KPIGrid columns={4} items={[
        { title: "Cashback Acumulado", value: cashbackTotal, icon: DollarSign },
        { title: "Crédito Bancário", value: 0.10, icon: CreditCard, format: "percent", subtitle: "do valor pago" },
        { title: "Status KYC", value: 0, icon: ShieldCheck, format: "text", textValue: kycComplete ? "Aprovado" : "Pendente" },
        { title: "Saldo Disponível", value: balance.available, icon: TrendingUp },
      ]} />

      {/* Simulador de Serviço */}
      <Card className="bg-card border-gold mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calculator className="w-5 h-5 text-primary" />
            Simulador de Serviço
            <ProjectionBadge />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">Valor da Dívida (R$)</Label>
            <Input
              type="number"
              value={debtInput}
              onChange={(e) => setDebtInput(e.target.value)}
              className="mt-1 max-w-xs"
              placeholder="7000"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-muted rounded-lg p-3 border border-gold/30">
              <p className="text-xs text-muted-foreground">Valor do Serviço</p>
              <p className="text-lg font-bold text-primary">{formatBRL(calc.servicePrice)}</p>
              <p className="text-[10px] text-muted-foreground">{calc.appliedPercent ? `${(calc.appliedPercent * 100)}% da dívida` : "Valor fixo mínimo"}</p>
            </div>
            <div className="bg-muted rounded-lg p-3 border border-gold/30">
              <p className="text-xs text-muted-foreground">Crédito Previsto</p>
              <p className="text-lg font-bold text-primary">{formatBRL(calc.creditForecast)}</p>
              <p className="text-[10px] text-muted-foreground">10% do serviço</p>
            </div>
            <div className="bg-muted rounded-lg p-3 border border-gold/30">
              <p className="text-xs text-muted-foreground">Cashback Mensal</p>
              <p className="text-lg font-bold text-primary">{formatBRL(calc.monthlyCashback)}</p>
              <p className="text-[10px] text-muted-foreground">2% ao mês</p>
            </div>
            <div className="bg-muted rounded-lg p-3 border border-gold/30">
              <p className="text-xs text-muted-foreground">Cashback 6 Meses</p>
              <p className="text-lg font-bold text-primary">{formatBRL(calc.cashbackSixMonths)}</p>
              <p className="text-[10px] text-muted-foreground">Projeção acumulada</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicação */}
      <Card className="bg-card border-gold mt-6">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="font-heading font-bold">Indicação</p>
            <p className="text-sm text-muted-foreground">Compartilhe e ganhe bônus</p>
          </div>
          <Button variant="outline" className="border-primary text-primary"
            onClick={() => { navigator.clipboard.writeText(referralLink); toast.success("Link copiado!"); }}>
            <Link2 className="w-4 h-4 mr-2" /> Copiar Link
          </Button>
        </CardContent>
      </Card>

      {/* Pagamento placeholder */}
      <Card className="bg-card border-gold mt-6">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="font-heading font-bold">Pagamento de Serviço</p>
            <p className="text-sm text-muted-foreground">Pague seu serviço contratado</p>
          </div>
          <Button disabled className="opacity-60">Pagar — Em breve</Button>
        </CardContent>
      </Card>

      {/* Saque + Transações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <WithdrawalSimulator availableBalance={balance.available} />

        <Card className="bg-card border-gold">
          <CardHeader><CardTitle className="text-base">Últimas Transações</CardTitle></CardHeader>
          <CardContent>
            {transactions && transactions.length > 0 ? (
              <div className="space-y-2">
                {transactions.slice(0, 5).map((t: any) => (
                  <div key={t.id} className="flex justify-between items-center py-2 border-b border-gold last:border-0">
                    <div>
                      <p className="text-sm font-medium capitalize">{t.tipo}</p>
                      <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <p className="text-primary font-bold">{formatBRL(safeNumber(t.valor))}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma transação encontrada.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
