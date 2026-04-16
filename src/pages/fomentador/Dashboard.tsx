import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { fomentadorNav } from "@/components/dashboard/nav/fomentadorNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Calendar, BarChart3, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { WithdrawalSimulator } from "@/components/dashboard/WithdrawalSimulator";
import { ProjectionBadge } from "@/components/dashboard/ProjectionBadge";
import { calculateFomentadorDashboard } from "@/lib/calculations/fomentador";
import { calculateBalance } from "@/lib/calculations/finance";
import { formatBRL, safeNumber, sumByFilter } from "@/lib/utils/currency";
import { Badge } from "@/components/ui/badge";

export default function FomentadorDashboard() {
  const { user, profile, loading, signOut } = useAuth();

  const { data: transactions } = useQuery({
    queryKey: ["fom-transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const investido = sumByFilter(transactions || [], (t) => t.tipo === "investimento");
  const royaltiesReal = sumByFilter(transactions || [], (t) => t.tipo === "royalty");
  const calc = calculateFomentadorDashboard(investido);
  const balance = calculateBalance(transactions || []);

  const simMonths = [3, 6, 12, 24];

  if (loading) return null;

  return (
    <DashboardShell title="Painel Fomentador" userName={profile?.nome} onSignOut={signOut} navItems={fomentadorNav}>
      <h1 className="text-2xl font-heading font-bold mb-6">Painel do <span className="text-primary">Fomentador</span></h1>

      <KPIGrid columns={4} items={[
        { title: "Valor Investido", value: calc.investedAmount, icon: DollarSign, subtitle: "Valor real aportado" },
        { title: "Royalties Recebidos", value: royaltiesReal, icon: CheckCircle, subtitle: "Valor real em transactions" },
        { title: "Retorno Mensal", value: calc.monthlyRoyalty, icon: Calendar, isProjection: true, subtitle: calc.projectionLabel },
        { title: "Retorno Anual", value: calc.annualRoyalty, icon: BarChart3, isProjection: true, subtitle: "Projeção 12 meses" },
      ]} />

      {/* Separação Real vs Projeção */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="bg-card border-gold">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Valores Reais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gold/30">
              <span className="text-sm text-muted-foreground">Total Investido</span>
              <span className="text-primary font-bold">{formatBRL(investido)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Royalties Recebidos</span>
              <span className="text-primary font-bold">{formatBRL(royaltiesReal)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-gold">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-5 h-5 text-primary" />
              Projeções
              <ProjectionBadge />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gold/30">
              <span className="text-sm text-muted-foreground">Retorno Mensal (até 5%)</span>
              <span className="text-primary font-bold">{formatBRL(calc.monthlyRoyalty)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Retorno Anual</span>
              <span className="text-primary font-bold">{formatBRL(calc.annualRoyalty)}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Valores projetados com base no aporte atual. Resultados reais podem variar.</p>
          </CardContent>
        </Card>
      </div>

      {/* Projeção por período */}
      <Card className="bg-card border-gold mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-5 h-5 text-primary" />
            Projeção de Retornos ({(calc.projectedPercent * 100)}% a.m.)
            <ProjectionBadge />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {simMonths.map((m) => (
              <div key={m} className="bg-muted rounded-lg p-4 text-center border border-gold/30">
                <p className="text-sm text-muted-foreground">{m} meses</p>
                <p className="text-xl font-bold text-primary mt-1">{formatBRL(calc.monthlyRoyalty * m)}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">Projeção estimada. Resultados passados não garantem retornos futuros.</p>
        </CardContent>
      </Card>

      {/* Investir placeholder */}
      <Card className="bg-card border-gold mt-6">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="font-heading font-bold">Investir Mais</p>
            <p className="text-sm text-muted-foreground">Aumente seu aporte mensal</p>
          </div>
          <Button disabled className="opacity-60">Investir — Em breve</Button>
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
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-sm font-medium capitalize">{t.tipo}</p>
                        <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString("pt-BR")}</p>
                      </div>
                      {t.tipo === "royalty" && <Badge variant="outline" className="text-[10px] border-green-500/40 text-green-500">Real</Badge>}
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
