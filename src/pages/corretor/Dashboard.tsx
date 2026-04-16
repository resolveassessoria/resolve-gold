import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { corretorNav } from "@/components/dashboard/nav/corretorNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Target, Link2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { CommissionLevelsTable } from "@/components/dashboard/CommissionLevelsTable";
import { BreakdownTable } from "@/components/dashboard/BreakdownTable";
import { ExpansionProgressCard } from "@/components/dashboard/ExpansionProgressCard";
import { WithdrawalSimulator } from "@/components/dashboard/WithdrawalSimulator";
import { ProjectionBadge } from "@/components/dashboard/ProjectionBadge";
import { calculateCorretorDashboard } from "@/lib/calculations/corretor";
import { calculateBalance, calculateProfitShare } from "@/lib/calculations/finance";
import { formatBRL, safeNumber, sumByFilter } from "@/lib/utils/currency";

export default function CorretorDashboard() {
  const { user, profile, loading, signOut } = useAuth();

  const { data: transactions } = useQuery({
    queryKey: ["corr-transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: indications } = useQuery({
    queryKey: ["corr-indications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("indications").select("*").eq("indicador_id", user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: points } = useQuery({
    queryKey: ["corr-points", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("expansion_points").select("*").eq("user_id", user.id).order("mes", { ascending: false }).limit(1).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: marketplaceSales } = useQuery({
    queryKey: ["corr-marketplace", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("marketplace_sales").select("*").eq("corretor_id", user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const comissoesTotal = sumByFilter(transactions || [], (t) => t.tipo === "comissao");
  const grossValue = sumByFilter(transactions || [], () => true);
  const marketplaceTotal = (marketplaceSales || []).reduce((s: number, t: any) => s + safeNumber(t.comissao_recebida), 0);
  const balance = calculateBalance(transactions || []);

  const calc = calculateCorretorDashboard({
    grossValue,
    operationalCost: 0, // sem dado real de custo
    type: "client",
    marketplaceSalesTotal: marketplaceTotal,
    expansionPoints: points?.pontos || 0,
    comprou_conteudo: points?.comprou_conteudo ?? true,
  });

  const profitShare = calculateProfitShare(grossValue);
  const referralLink = `${window.location.origin}/register?ref=${user?.id}`;

  if (loading) return null;

  return (
    <DashboardShell title="Painel Corretor" userName={profile?.nome} onSignOut={signOut} navItems={corretorNav}>
      <h1 className="text-2xl font-heading font-bold mb-6">Painel do <span className="text-primary">Corretor</span></h1>

      <KPIGrid columns={4} items={[
        { title: "Comissões Recebidas", value: comissoesTotal, icon: DollarSign },
        { title: "Rede de Indicações", value: indications?.length || 0, icon: Users, format: "number" },
        { title: "Pontos de Expansão", value: points?.pontos || 0, icon: Target, format: "number" },
        { title: "Total Projetado", value: calc.totalProjected, icon: TrendingUp, isProjection: true },
      ]} />

      {/* Link de indicação */}
      <Card className="bg-card border-gold mt-6">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="font-heading font-bold">Link de Indicação</p>
            <p className="text-sm text-muted-foreground truncate max-w-md">{referralLink}</p>
          </div>
          <Button variant="outline" className="border-primary text-primary"
            onClick={() => { navigator.clipboard.writeText(referralLink); toast.success("Copiado!"); }}>
            <Link2 className="w-4 h-4 mr-2" /> Copiar
          </Button>
        </CardContent>
      </Card>

      {/* Comissões + Expansão */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <CommissionLevelsTable title="Comissão sobre Clientes" data={calc.commission} isProjection />
        <ExpansionProgressCard data={calc.expansion} />
      </div>

      {/* Marketplace comissões */}
      <CommissionLevelsTable title="Comissão Marketplace" data={calc.marketplace} isProjection />

      {/* Base líquida breakdown */}
      <BreakdownTable
        title="Resumo Financeiro"
        isProjection
        rows={[
          { label: "Valor Bruto", value: calc.grossValue },
          { label: "Custo Operacional", value: calc.operationalCost },
          { label: "Base Líquida", value: calc.base, highlight: true },
        ]}
      />

      {/* Participação nos lucros */}
      <Card className="bg-card border-gold mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            Participação nos Lucros
            <ProjectionBadge />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Live Bonus (4%)", value: profitShare.liveBonusPool },
              { label: "Champion Bonus (1%)", value: profitShare.championBonusPool },
              { label: "Divulgação (2%)", value: profitShare.divulgationBonusPool },
              { label: "Founder Bonus (3%)", value: profitShare.founderBonusPool },
            ].map((item) => (
              <div key={item.label} className="bg-muted rounded-lg p-3 border border-gold/30 text-center">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-lg font-bold text-primary mt-1">{formatBRL(item.value)}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">Pool global estimado: {formatBRL(profitShare.totalPool)} — elegibilidade sujeita a regras adicionais.</p>
        </CardContent>
      </Card>

      {/* Saque + Transações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <WithdrawalSimulator availableBalance={balance.available} />

        <Card className="bg-card border-gold">
          <CardHeader><CardTitle className="text-base">Últimas Comissões</CardTitle></CardHeader>
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
              <p className="text-sm text-muted-foreground">Nenhuma comissão encontrada.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
