import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { fomentadorNav } from "@/components/dashboard/nav/fomentadorNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { ProjectionBadge } from "@/components/dashboard/ProjectionBadge";
import { calculateFomentadorDashboard } from "@/lib/calculations/fomentador";
import { formatBRL, sumByFilter } from "@/lib/utils/currency";
import { DollarSign, BarChart3 } from "lucide-react";

export default function FomentadorRetornos() {
  const { user, profile, loading, signOut } = useAuth();

  const { data: transactions } = useQuery({
    queryKey: ["fom-retornos", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("transactions").select("*").eq("user_id", user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const investido = sumByFilter(transactions || [], (t) => t.tipo === "investimento");
  const royalties = sumByFilter(transactions || [], (t) => t.tipo === "royalty");
  const calc = calculateFomentadorDashboard(investido);
  const simMonths = [3, 6, 12, 24];

  if (loading) return null;

  return (
    <DashboardShell title="Retornos" userName={profile?.nome} onSignOut={signOut} navItems={fomentadorNav}>
      <h1 className="text-2xl font-heading font-bold mb-6">Simulação de <span className="text-primary">Retornos</span></h1>

      <KPIGrid columns={2} items={[
        { title: "Total Investido", value: investido, icon: DollarSign },
        { title: "Royalties Recebidos", value: royalties, icon: BarChart3 },
      ]} />

      <Card className="bg-card border-gold mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
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
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
