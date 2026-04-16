import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { clienteNav } from "@/components/dashboard/nav/clienteNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Link2, ShieldCheck, DollarSign, TrendingUp, Calculator, Gift, Store, Landmark, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { ProjectionBadge } from "@/components/dashboard/ProjectionBadge";
import { WithdrawalSimulator } from "@/components/dashboard/WithdrawalSimulator";
import { calculateClientDashboard } from "@/lib/calculations/client";
import { calculateBalance } from "@/lib/calculations/finance";
import { formatBRL } from "@/lib/utils/currency";
import { safeNumber } from "@/lib/utils/currency";
import { sumByFilter } from "@/lib/utils/currency";
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

  const { data: marketplaceProducts } = useQuery({
    queryKey: ["marketplace-products"],
    queryFn: async () => {
      const { data } = await supabase.from("marketplace_products").select("*").order("nome");
      return data || [];
    },
  });

  const debtValue = safeNumber(debtInput);
  const calc = calculateClientDashboard(debtValue);
  const balance = calculateBalance(transactions || []);
  const cashbackReal = sumByFilter(transactions || [], (t: any) => t.tipo === "cashback");
  const referralLink = `${window.location.origin}/register?ref=${user?.id}`;
  const kycComplete = kycDocs && kycDocs.length >= 3 && kycDocs.every((d: any) => d.status === "aprovado");

  if (loading) return null;

  const benefits = [
    { icon: Landmark, label: "Conta Bancária", desc: "Conta digital gratuita" },
    { icon: CreditCard, label: "Cartão de Crédito", desc: "Sujeito à análise" },
    { icon: Wallet, label: "Cartão Pré-Pago", desc: "Sem análise de crédito" },
    { icon: TrendingUp, label: "Crédito Bancário", desc: "Estimativa: 10% do serviço" },
    { icon: Gift, label: "Cashback 6 Meses", desc: `Projeção: ${formatBRL(calc.cashbackSixMonths)}` },
  ];

  return (
    <DashboardShell title="Painel do Cliente" userName={profile?.nome} onSignOut={signOut} navItems={clienteNav}>
      <h1 className="text-2xl font-heading font-bold mb-6">Painel do <span className="text-primary">Cliente</span></h1>

      {/* KPIs */}
      <KPIGrid columns={4} items={[
        { title: "Cashback Recebido", value: cashbackReal, icon: DollarSign, subtitle: "Valor real em transactions" },
        { title: "Crédito Bancário", value: 0.10, icon: CreditCard, format: "percent", subtitle: "Estimativa — sujeito à análise", isProjection: true },
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
              <p className="text-xs text-muted-foreground flex items-center gap-1">Crédito Previsto <ProjectionBadge label="Estimativa" /></p>
              <p className="text-lg font-bold text-primary">{formatBRL(calc.creditForecast)}</p>
              <p className="text-[10px] text-muted-foreground">10% do serviço — sujeito à análise</p>
            </div>
            <div className="bg-muted rounded-lg p-3 border border-gold/30">
              <p className="text-xs text-muted-foreground flex items-center gap-1">Cashback Mensal <ProjectionBadge label="Projeção" /></p>
              <p className="text-lg font-bold text-primary">{formatBRL(calc.monthlyCashback)}</p>
              <p className="text-[10px] text-muted-foreground">2% ao mês — projeção</p>
            </div>
            <div className="bg-muted rounded-lg p-3 border border-gold/30">
              <p className="text-xs text-muted-foreground flex items-center gap-1">Cashback 6 Meses <ProjectionBadge label="Projeção" /></p>
              <p className="text-lg font-bold text-primary">{formatBRL(calc.cashbackSixMonths)}</p>
              <p className="text-[10px] text-muted-foreground">Projeção acumulada</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefícios */}
      <Card className="bg-card border-gold mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Gift className="w-5 h-5 text-primary" />
            Benefícios Inclusos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {benefits.map((b) => (
              <div key={b.label} className="bg-muted rounded-lg p-3 border border-gold/30 text-center">
                <b.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">{b.label}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{b.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Serviços Disponíveis */}
      <Card className="bg-card border-gold mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Store className="w-5 h-5 text-primary" />
            Serviços Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4 border border-gold/30">
            <p className="font-heading font-bold text-primary">🧹 Limpe e Ganhe</p>
            <p className="text-sm text-muted-foreground mt-1">Limpe seu nome e ganhe cashback + crédito bancário</p>
          </div>
          {marketplaceProducts && marketplaceProducts.length > 0 ? (
            <div>
              <p className="text-sm font-medium mb-2">Marketplace</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {marketplaceProducts.map((p: any) => (
                  <div key={p.id} className="bg-muted rounded-lg px-3 py-2 text-xs font-medium border border-gold/30 flex justify-between items-center">
                    <span>{p.nome}</span>
                    <span className="text-primary font-bold">{formatBRL(safeNumber(p.preco))}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum produto disponível no marketplace.</p>
          )}
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
