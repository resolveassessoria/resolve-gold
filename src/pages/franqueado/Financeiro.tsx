import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { franqueadoNav } from "@/components/dashboard/nav/franqueadoNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function FranqueadoFinanceiro() {
  const { user, profile, loading, signOut } = useAuth();

  const { data: transactions } = useQuery({
    queryKey: ["franq-financeiro", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("transactions").select("*").eq("user_id", user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const comissaoTotal = transactions?.filter((t: any) => t.tipo === "comissao").reduce((s: number, t: any) => s + Number(t.valor), 0) || 0;

  if (loading) return null;

  return (
    <DashboardShell title="Financeiro" userName={profile?.nome} onSignOut={signOut} navItems={franqueadoNav}>
      <h1 className="text-2xl font-heading font-bold mb-6"><span className="text-primary">Financeiro</span></h1>

      <Card className="bg-card border-gold mb-8">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Comissões Acumuladas (40%)</p>
          <p className="text-4xl font-bold text-primary">R$ {comissaoTotal.toFixed(2)}</p>
        </CardContent>
      </Card>

      <Card className="bg-card border-gold mb-8">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="font-heading font-bold">Receber Repasse</p>
            <p className="text-sm text-muted-foreground">Solicite o repasse mensal</p>
          </div>
          <Button disabled className="opacity-60">Solicitar — Em breve</Button>
        </CardContent>
      </Card>

      <Card className="bg-card border-gold">
        <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-primary" /> Relatório Financeiro</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted rounded-lg p-4 border border-gold text-center">
              <p className="text-xs text-muted-foreground">Total Comissões</p>
              <p className="text-xl font-bold text-primary">R$ {comissaoTotal.toFixed(2)}</p>
            </div>
            <div className="bg-muted rounded-lg p-4 border border-gold text-center">
              <p className="text-xs text-muted-foreground">Transações</p>
              <p className="text-xl font-bold text-primary">{transactions?.length || 0}</p>
            </div>
            <div className="bg-muted rounded-lg p-4 border border-gold text-center">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-xl font-bold text-primary capitalize">{profile?.status || "pendente"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
