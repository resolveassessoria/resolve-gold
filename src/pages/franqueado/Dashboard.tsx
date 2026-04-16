import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { franqueadoNav } from "@/components/dashboard/nav/franqueadoNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Store, Briefcase, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const { user, profile, loading, signOut } = useAuth();

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

  if (loading) return null;

  return (
    <DashboardShell title="Painel Franqueado" userName={profile?.nome} onSignOut={signOut} navItems={franqueadoNav}>
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
            <CardTitle className="text-sm text-muted-foreground">Serviços</CardTitle>
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
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="font-heading font-bold">Receber Repasse</p>
            <p className="text-sm text-muted-foreground">Solicite o repasse de comissões</p>
          </div>
          <Button disabled className="opacity-60">Solicitar — Em breve</Button>
        </CardContent>
      </Card>

      <Card className="bg-card border-gold mb-8">
        <CardHeader><CardTitle className="flex items-center gap-2"><Store className="w-5 h-5 text-primary" /> 19 Serviços Financeiros</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {services.map((s) => (
              <div key={s} className="bg-muted rounded-lg px-3 py-2 text-xs font-medium border border-gold">{s}</div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
