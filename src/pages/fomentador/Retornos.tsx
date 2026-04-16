import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { fomentadorNav } from "@/components/dashboard/nav/fomentadorNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  const investido = transactions?.filter((t: any) => t.tipo === "investimento").reduce((s: number, t: any) => s + Number(t.valor), 0) || 0;
  const royalties = transactions?.filter((t: any) => t.tipo === "royalty").reduce((s: number, t: any) => s + Number(t.valor), 0) || 0;

  if (loading) return null;

  const simMonths = [3, 6, 12, 24];

  return (
    <DashboardShell title="Retornos" userName={profile?.nome} onSignOut={signOut} navItems={fomentadorNav}>
      <h1 className="text-2xl font-heading font-bold mb-6">Simulação de <span className="text-primary">Retornos</span></h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="bg-card border-gold">
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Total Investido</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-primary">R$ {investido.toFixed(2)}</p></CardContent>
        </Card>
        <Card className="bg-card border-gold">
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Royalties Recebidos</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-primary">R$ {royalties.toFixed(2)}</p></CardContent>
        </Card>
      </div>

      <Card className="bg-card border-gold">
        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Projeção de Retornos (5% a.m.)</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {simMonths.map((m) => (
              <div key={m} className="bg-muted rounded-lg p-4 text-center border border-gold">
                <p className="text-sm text-muted-foreground">{m} meses</p>
                <p className="text-xl font-bold text-primary mt-1">R$ {(investido * 0.05 * m).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
