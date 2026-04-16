import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Store, Briefcase, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const services = [
  "Limpa Nome", "Conta Bancária", "Cartão Crédito", "Cheque Especial",
  "Financiamento", "Empréstimo", "Maquininha", "Consórcio", "Escrow",
  "Seguro", "Plano Médico", "Negociação Dívidas", "Dívidas Tributárias",
  "Recurso CNH", "Multas CNH", "Lei Seca CNH", "Pontos CNH",
  "Blindagem Permissão", "LOAS",
];

export default function FranqueadoDashboard() {
  const { user, profile, loading, signOut } = useAuth("franqueado");

  const { data: transactions } = useQuery({
    queryKey: ["franq-transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const comissaoTotal = transactions?.filter((t: any) => t.tipo === "comissao").reduce((s: number, t: any) => s + Number(t.valor), 0) || 0;

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <DashboardLayout title="Painel do Franqueado" userName={profile?.nome} onSignOut={signOut}>
      <h1 className="text-2xl font-heading font-bold mb-6">Painel do <span className="text-primary">Franqueado</span></h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-card border-gold">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Comissão 40%</CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-primary">R$ {comissaoTotal.toFixed(2)}</p></CardContent>
        </Card>

        <Card className="bg-card border-gold">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Serviços Disponíveis</CardTitle>
            <Briefcase className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-primary">19</p></CardContent>
        </Card>

        <Card className="bg-card border-gold">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Status</CardTitle>
            <ShieldCheck className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-lg font-bold text-primary capitalize">{profile?.status || "pendente"}</p></CardContent>
        </Card>
      </div>

      <Card className="bg-card border-gold mb-8">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Store className="w-5 h-5 text-primary" /> 19 Serviços Financeiros</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {services.map((s) => (
              <div key={s} className="bg-muted rounded-lg px-3 py-2 text-xs font-medium border border-gold">
                {s}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-gold">
        <CardHeader><CardTitle className="text-lg">Histórico</CardTitle></CardHeader>
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
            <p className="text-sm text-muted-foreground">Nenhuma transação encontrada.</p>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
