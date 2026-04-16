import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { franqueadoNav } from "@/components/dashboard/nav/franqueadoNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Store, Briefcase, ShieldCheck, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { CommissionLevelsTable } from "@/components/dashboard/CommissionLevelsTable";
import { BreakdownTable } from "@/components/dashboard/BreakdownTable";
import { WithdrawalSimulator } from "@/components/dashboard/WithdrawalSimulator";
import { ProjectionBadge } from "@/components/dashboard/ProjectionBadge";
import { calculateFranqueadoDashboard } from "@/lib/calculations/franqueado";
import { calculateBalance } from "@/lib/calculations/finance";
import { formatBRL, safeNumber, sumByFilter } from "@/lib/utils/currency";

const services = [
  "Limpa Nome", "Conta Bancária", "Cartão Crédito", "Cheque Especial",
  "Financiamento", "Empréstimo", "Maquininha", "Consórcio", "Escrow",
  "Seguro", "Plano Médico", "Negociação Dívidas", "Dívidas Tributárias",
  "Recurso CNH", "Multas CNH", "Lei Seca CNH", "Pontos CNH",
  "Blindagem Permissão", "LOAS",
];

export default function FranqueadoDashboard() {
  const { user, profile, loading, signOut } = useAuth();

  const { data: transactions } = useQuery({
    queryKey: ["franq-transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const comissaoTotal = sumByFilter(transactions || [], (t) => t.tipo === "comissao");
  const grossValue = sumByFilter(transactions || [], () => true);
  const balance = calculateBalance(transactions || []);

  const calc = calculateFranqueadoDashboard({
    grossValue,
    operationalCost: 0,
    rentedGrossValue: 0,
  });

  if (loading) return null;

  return (
    <DashboardShell title="Painel Franqueado" userName={profile?.nome} onSignOut={signOut} navItems={franqueadoNav}>
      <h1 className="text-2xl font-heading font-bold mb-6">Painel do <span className="text-primary">Franqueado</span></h1>

      <KPIGrid columns={4} items={[
        { title: "Comissão 40%", value: calc.ownOperation.directCommission, icon: DollarSign, isProjection: true },
        { title: "Royalties (5%)", value: calc.royalties.royalty, icon: TrendingUp, isProjection: true },
        { title: "Serviços", value: 19, icon: Briefcase, format: "number" },
        { title: "Status", value: 0, icon: ShieldCheck, format: "text", textValue: profile?.status || "pendente" },
      ]} />

      {/* Comissões + Royalties */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <CommissionLevelsTable title="Comissão Operação Própria" data={calc.ownOperation} isProjection />
        <BreakdownTable
          title="Royalties & Financeiro"
          isProjection
          rows={[
            { label: "Valor Bruto", value: calc.royalties.grossValue },
            { label: "Royalties (5%)", value: calc.royalties.royalty },
            { label: "Líquido após Royalties", value: calc.royalties.netAfterRoyalty, highlight: true },
            { label: "Comissão Arrendada (30%)", value: calc.rentedOperationCommission },
          ]}
        />
      </div>

      {/* Repasse placeholder */}
      <Card className="bg-card border-gold mt-6">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="font-heading font-bold">Receber Repasse</p>
            <p className="text-sm text-muted-foreground">Solicite o repasse de comissões</p>
          </div>
          <Button disabled className="opacity-60">Solicitar — Em breve</Button>
        </CardContent>
      </Card>

      {/* Saque + Serviços */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <WithdrawalSimulator availableBalance={balance.available} />

        <Card className="bg-card border-gold">
          <CardHeader><CardTitle className="flex items-center gap-2"><Store className="w-5 h-5 text-primary" /> 19 Serviços Financeiros</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {services.map((s) => (
                <div key={s} className="bg-muted rounded-lg px-3 py-2 text-xs font-medium border border-gold/30">{s}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transações */}
      <Card className="bg-card border-gold mt-6">
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
    </DashboardShell>
  );
}
