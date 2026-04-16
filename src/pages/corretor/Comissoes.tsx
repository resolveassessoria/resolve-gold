import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { corretorNav } from "@/components/dashboard/nav/corretorNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function CorretorComissoes() {
  const { user, profile, loading, signOut } = useAuth();

  const { data: transactions } = useQuery({
    queryKey: ["corr-comissoes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("transactions").select("*").eq("user_id", user.id).eq("tipo", "comissao").order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const total = transactions?.reduce((s: number, t: any) => s + Number(t.valor), 0) || 0;

  if (loading) return null;

  return (
    <DashboardShell title="Comissões" userName={profile?.nome} onSignOut={signOut} navItems={corretorNav}>
      <h1 className="text-2xl font-heading font-bold mb-6">Minhas <span className="text-primary">Comissões</span></h1>

      <Card className="bg-card border-gold mb-8">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Total Acumulado</p>
          <p className="text-3xl font-bold text-primary">R$ {total.toFixed(2)}</p>
        </CardContent>
      </Card>

      <Card className="bg-card border-gold">
        <CardHeader><CardTitle>Histórico</CardTitle></CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((t: any) => (
                <div key={t.id} className="flex justify-between items-center py-3 border-b border-gold last:border-0">
                  <div>
                    <p className="text-sm font-medium capitalize">{t.tipo}</p>
                    <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <p className="text-primary font-bold">R$ {Number(t.valor).toFixed(2)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma comissão encontrada.</p>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
