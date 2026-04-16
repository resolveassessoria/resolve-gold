import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { clienteNav } from "@/components/dashboard/nav/clienteNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CreditCard, Link2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function ClienteDashboard() {
  const { user, profile, loading, signOut } = useAuth();

  const { data: transactions } = useQuery({
    queryKey: ["cliente-transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: kycDocs } = useQuery({
    queryKey: ["cliente-kyc", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("kyc_documents").select("*").eq("user_id", user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const cashbackTotal = transactions?.filter((t: any) => t.tipo === "cashback").reduce((s: number, t: any) => s + Number(t.valor), 0) || 0;
  const referralLink = `${window.location.origin}/register?ref=${user?.id}`;
  const kycComplete = kycDocs && kycDocs.length >= 3 && kycDocs.every((d: any) => d.status === "aprovado");

  if (loading) return null;

  return (
    <DashboardShell title="Painel do Cliente" userName={profile?.nome} onSignOut={signOut} navItems={clienteNav}>
      <h1 className="text-2xl font-heading font-bold mb-6">Painel do <span className="text-primary">Cliente</span></h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card border-gold">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Crédito Bancário</CardTitle>
            <CreditCard className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">10%</p>
            <p className="text-xs text-muted-foreground">do valor pago</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-gold">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Cashback</CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">R$ {cashbackTotal.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-gold">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Status KYC</CardTitle>
            <ShieldCheck className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <Badge variant={kycComplete ? "default" : "outline"} className={kycComplete ? "" : "border-primary text-primary"}>
              {kycComplete ? "Aprovado" : "Pendente"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-card border-gold">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Indicação</CardTitle>
            <Link2 className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" className="border-primary text-primary w-full text-xs"
              onClick={() => { navigator.clipboard.writeText(referralLink); toast.success("Link copiado!"); }}>
              Copiar Link
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder pagamento */}
      <Card className="bg-card border-gold mb-8">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="font-heading font-bold">Pagamento de Serviço</p>
            <p className="text-sm text-muted-foreground">Pague seu serviço contratado</p>
          </div>
          <Button disabled className="opacity-60">
            Pagar — Em breve
          </Button>
        </CardContent>
      </Card>

      {/* Recent transactions */}
      <Card className="bg-card border-gold">
        <CardHeader><CardTitle className="text-lg">Últimas Transações</CardTitle></CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((t: any) => (
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
