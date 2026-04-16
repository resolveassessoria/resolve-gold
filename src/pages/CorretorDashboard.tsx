import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Link2, Trophy, ShoppingBag, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const levels = [
  { name: "Consultor", prize: "R$ 200", vml: "2.8K" },
  { name: "Assessor", prize: "R$ 500", vml: "7K" },
  { name: "Especialista", prize: "Cruzeiro R$ 4K", vml: "30K" },
  { name: "Gestor", prize: "Caribe R$ 12K", vml: "100K" },
  { name: "Elite", prize: "Moto R$ 35K", vml: "300K" },
  { name: "Premium", prize: "Carro R$ 160K", vml: "900K" },
  { name: "Supremo", prize: "Super Carro R$ 400K", vml: "2M" },
];

export default function CorretorDashboard() {
  const { user, profile, loading, signOut } = useAuth("corretor");

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
    queryKey: ["indications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("indications").select("*, indicado:indicado_id(nome, email)").eq("indicador_id", user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: points } = useQuery({
    queryKey: ["points", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("expansion_points").select("*").eq("user_id", user.id).order("mes", { ascending: false }).limit(1).single();
      return data;
    },
    enabled: !!user,
  });

  const comissoesTotal = transactions?.filter((t: any) => t.tipo === "comissao").reduce((s: number, t: any) => s + Number(t.valor), 0) || 0;

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const referralLink = `${window.location.origin}/register?ref=${user?.id}`;

  return (
    <DashboardLayout title="Painel do Corretor" userName={profile?.nome} onSignOut={signOut}>
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
            <CardTitle className="text-sm text-muted-foreground">Rede (7 níveis)</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-primary">{indications?.length || 0}</p></CardContent>
        </Card>

        <Card className="bg-card border-gold">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pontos Expansão</CardTitle>
            <Target className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-primary">{points?.pontos || 0}</p></CardContent>
        </Card>

        <Card className="bg-card border-gold">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Link Indicação</CardTitle>
            <Link2 className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" className="border-primary text-primary w-full text-xs"
              onClick={() => { navigator.clipboard.writeText(referralLink); toast.success("Copiado!"); }}>
              Copiar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Metas */}
      <Card className="bg-card border-gold mb-8">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Trophy className="w-5 h-5 text-primary" /> Metas e Prêmios</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {levels.map((l) => (
              <div key={l.name} className="bg-muted rounded-lg p-3 text-center border border-gold hover:glow-gold transition-all">
                <p className="font-heading font-bold text-xs">{l.name}</p>
                <p className="text-primary font-bold text-xs mt-1">{l.prize}</p>
                <p className="text-[10px] text-muted-foreground mt-1">VML: {l.vml}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card className="bg-card border-gold">
        <CardHeader><CardTitle className="text-lg">Histórico de Comissões</CardTitle></CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.slice(0, 10).map((t: any) => (
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
    </DashboardLayout>
  );
}
