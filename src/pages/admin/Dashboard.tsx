import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { adminNav } from "@/components/dashboard/nav/adminNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileCheck, DollarSign, Activity, TrendingUp, ShoppingBag, Percent } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { BreakdownTable } from "@/components/dashboard/BreakdownTable";
import { ProjectionBadge } from "@/components/dashboard/ProjectionBadge";
import { calculateAdminDashboard } from "@/lib/calculations/admin";
import { formatBRL, safeNumber } from "@/lib/utils/currency";

export default function AdminDashboard() {
  const { user, profile, loading, signOut } = useAuth();

  const { data: users } = useQuery({
    queryKey: ["admin-users-count"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*");
      return data || [];
    },
    enabled: !!user,
  });

  const { data: kycPending } = useQuery({
    queryKey: ["admin-kyc-pending"],
    queryFn: async () => {
      const { data } = await supabase.from("kyc_documents").select("*").eq("status", "pendente");
      return data || [];
    },
    enabled: !!user,
  });

  const { data: transactions } = useQuery({
    queryKey: ["admin-transactions-all"],
    queryFn: async () => {
      const { data } = await supabase.from("transactions").select("*, profiles(nome)").order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: marketplaceSales } = useQuery({
    queryKey: ["admin-marketplace-sales"],
    queryFn: async () => {
      const { data } = await supabase.from("marketplace_sales").select("*");
      return data || [];
    },
    enabled: !!user,
  });

  if (loading) return null;

  const pendingUsers = users?.filter((u: any) => u.status === "pendente").length || 0;
  const adminCalc = calculateAdminDashboard({
    transactions: transactions || [],
    marketplaceSales: marketplaceSales || [],
    globalProfit: (transactions || []).reduce((s: number, t: any) => s + safeNumber(t.valor), 0),
  });

  return (
    <DashboardShell title="Painel Admin" userName={profile?.nome} onSignOut={signOut} navItems={adminNav}>
      <h1 className="text-2xl font-heading font-bold mb-6">Painel <span className="text-primary">Admin</span></h1>

      <KPIGrid columns={4} items={[
        { title: "Usuários", value: users?.length || 0, icon: Users, format: "number" },
        { title: "KYC Pendente", value: kycPending?.length || 0, icon: FileCheck, format: "number" },
        { title: "Transações", value: transactions?.length || 0, icon: Activity, format: "number" },
        { title: "Pendentes", value: pendingUsers, icon: Activity, format: "number" },
      ]} />

      {/* Financial overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <BreakdownTable
          title="Resumo Financeiro Global"
          rows={[
            { label: "Total Cashback", value: adminCalc.totalCashback },
            { label: "Total Royalties", value: adminCalc.totalRoyalties },
            { label: "Total Comissões", value: adminCalc.totalComissoes },
            { label: "Total Investimentos", value: adminCalc.totalInvestimentos },
            { label: "Total Marketplace", value: adminCalc.totalMarketplace },
          ]}
        />

        <Card className="bg-card border-gold">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              Participação nos Lucros
              <ProjectionBadge />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { label: "Live Bonus (4%)", value: adminCalc.profitShare.liveBonusPool },
                { label: "Champion Bonus (1%)", value: adminCalc.profitShare.championBonusPool },
                { label: "Divulgação (2%)", value: adminCalc.profitShare.divulgationBonusPool },
                { label: "Founder Bonus (3%)", value: adminCalc.profitShare.founderBonusPool },
                { label: "Total Pool (9%)", value: adminCalc.profitShare.totalPool },
              ].map((item, i, arr) => (
                <div key={item.label} className={`flex justify-between items-center py-1.5 ${i === arr.length - 1 ? 'border-t border-primary/30 pt-2 font-bold' : 'border-b border-gold/50'}`}>
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm text-primary">{formatBRL(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card className="bg-card border-gold mt-6">
        <CardHeader><CardTitle className="text-base">Transações Recentes</CardTitle></CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.slice(0, 10).map((t: any) => (
                <div key={t.id} className="flex justify-between items-center py-2 border-b border-gold last:border-0">
                  <div>
                    <p className="text-sm font-medium">{t.profiles?.nome || "—"}</p>
                    <p className="text-xs text-muted-foreground capitalize">{t.tipo} — {new Date(t.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <p className="text-primary font-bold">{formatBRL(safeNumber(t.valor))}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma transação.</p>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
