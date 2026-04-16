import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { corretorNav } from "@/components/dashboard/nav/corretorNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Target, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  const comissoesTotal = transactions?.filter((t: any) => t.tipo === "comissao").reduce((s: number, t: any) => s + Number(t.valor), 0) || 0;
  const referralLink = `${window.location.origin}/register?ref=${user?.id}`;

  if (loading) return null;

  return (
    <DashboardShell title="Painel Corretor" userName={profile?.nome} onSignOut={signOut} navItems={corretorNav}>
      <h1 className="text-2xl font-heading font-bold mb-6">Painel do <span className="text-primary">Corretor</span></h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card border-gold">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Comissões</CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-primary">R$ {comissoesTotal.toFixed(2)}</p></CardContent>
        </Card>
        <Card className="bg-card border-gold">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Rede</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-primary">{indications?.length || 0}</p></CardContent>
        </Card>
        <Card className="bg-card border-gold">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pontos</CardTitle>
            <Target className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-primary">{points?.pontos || 0}</p></CardContent>
        </Card>
        <Card className="bg-card border-gold">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Indicação</CardTitle>
            <Link2 className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" className="border-primary text-primary w-full text-xs"
              onClick={() => { navigator.clipboard.writeText(referralLink); toast.success("Copiado!"); }}>
              Copiar Link
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-gold mb-8">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="font-heading font-bold">Solicitar Saque</p>
            <p className="text-sm text-muted-foreground">Retire suas comissões acumuladas</p>
          </div>
          <Button disabled className="opacity-60">Solicitar — Em breve</Button>
        </CardContent>
      </Card>

      <Card className="bg-card border-gold">
        <CardHeader><CardTitle>Últimas Comissões</CardTitle></CardHeader>
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
            <p className="text-sm text-muted-foreground">Nenhuma comissão encontrada.</p>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
