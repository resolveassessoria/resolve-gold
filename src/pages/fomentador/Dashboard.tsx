import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { fomentadorNav } from "@/components/dashboard/nav/fomentadorNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  const royaltiesTotal = transactions?.filter((t: any) => t.tipo === "royalty").reduce((s: number, t: any) => s + Number(t.valor), 0) || 0;
  const investido = transactions?.filter((t: any) => t.tipo === "investimento").reduce((s: number, t: any) => s + Number(t.valor), 0) || 0;

  if (loading) return null;

  return (
    <DashboardShell title="Painel Fomentador" userName={profile?.nome} onSignOut={signOut} navItems={fomentadorNav}>
      <h1 className="text-2xl font-heading font-bold mb-6">Painel do <span className="text-primary">Fomentador</span></h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-card border-gold">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Royalties Acumulados</CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-primary">R$ {royaltiesTotal.toFixed(2)}</p></CardContent>
        </Card>
        <Card className="bg-card border-gold">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Valor Investido</CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-primary">R$ {investido.toFixed(2)}</p></CardContent>
        </Card>
        <Card className="bg-card border-gold">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Previsão 12 Meses</CardTitle>
            <Calendar className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-primary">R$ {(investido * 0.05 * 12).toFixed(2)}</p></CardContent>
        </Card>
      </div>

      <Card className="bg-card border-gold mb-8">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="font-heading font-bold">Investir Mais</p>
            <p className="text-sm text-muted-foreground">Aumente seu aporte mensal</p>
          </div>
          <Button disabled className="opacity-60">Investir — Em breve</Button>
        </CardContent>
      </Card>

      <Card className="bg-card border-gold">
        <CardHeader><CardTitle>Últimas Transações</CardTitle></CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.slice(0, 5).map((t: any) => (
                <div key={t.id} className="flex justify-between items-center py-2 border-b border-gold last:border-0">
                  <div>
                    <p className="text-sm font-medium capitalize">{t.tipo}</p>
                    <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <p className="text-primary font-bold">R$ {Number(t.valor).toFixed(2)}</p>
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
