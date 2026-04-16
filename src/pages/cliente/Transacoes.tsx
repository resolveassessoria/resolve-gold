import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { clienteNav } from "@/components/dashboard/nav/clienteNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function ClienteTransacoes() {
  const { user, profile, loading, signOut } = useAuth();

  const { data: transactions } = useQuery({
    queryKey: ["cliente-all-transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  if (loading) return null;

  return (
    <DashboardShell title="Transações" userName={profile?.nome} onSignOut={signOut} navItems={clienteNav}>
      <h1 className="text-2xl font-heading font-bold mb-6">Minhas <span className="text-primary">Transações</span></h1>

      <Card className="bg-card border-gold">
        <CardHeader><CardTitle>Histórico Completo</CardTitle></CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((t: any) => (
                <div key={t.id} className="flex justify-between items-center py-3 border-b border-gold last:border-0">
                  <div>
                    <p className="text-sm font-medium capitalize">{t.tipo}</p>
                    <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString("pt-BR")}</p>
                    {t.mes_referencia && <p className="text-xs text-muted-foreground">Ref: {t.mes_referencia}</p>}
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
