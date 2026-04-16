import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { adminNav } from "@/components/dashboard/nav/adminNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileCheck, DollarSign, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminDashboard() {
  const { user, profile, loading, signOut } = useAuth();

  const { data: users } = useQuery({
    queryKey: ["admin-users-count"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*");
      return data || [];
    },
    enabled: !!user,
  });

  const { data: kycPending } = useQuery({
    queryKey: ["admin-kyc-pending"],
    queryFn: async () => {
      const { data } = await supabase.from("kyc_documents").select("*").eq("status", "pendente");
      return data || [];
    },
    enabled: !!user,
  });

  const { data: transactions } = useQuery({
    queryKey: ["admin-transactions-recent"],
    queryFn: async () => {
      const { data } = await supabase.from("transactions").select("*, profiles(nome)").order("created_at", { ascending: false }).limit(10);
      return data || [];
    },
    enabled: !!user,
  });

  if (loading) return null;

  const pendingUsers = users?.filter((u: any) => u.status === "pendente").length || 0;

  return (
    <DashboardShell title="Painel Admin" userName={profile?.nome} onSignOut={signOut} navItems={adminNav}>
      <h1 className="text-2xl font-heading font-bold mb-6">Painel <span className="text-primary">Admin</span></h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card border-gold">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Usuários</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-primary">{users?.length || 0}</p></CardContent>
        </Card>
        <Card className="bg-card border-gold">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">KYC Pendente</CardTitle>
            <FileCheck className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-primary">{kycPending?.length || 0}</p></CardContent>
        </Card>
        <Card className="bg-card border-gold">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Transações</CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-primary">{transactions?.length || 0}</p></CardContent>
        </Card>
        <Card className="bg-card border-gold">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pendentes</CardTitle>
            <Activity className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-primary">{pendingUsers}</p></CardContent>
        </Card>
      </div>

      <Card className="bg-card border-gold">
        <CardHeader><CardTitle>Transações Recentes</CardTitle></CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((t: any) => (
                <div key={t.id} className="flex justify-between items-center py-2 border-b border-gold last:border-0">
                  <div>
                    <p className="text-sm font-medium">{t.profiles?.nome || "—"}</p>
                    <p className="text-xs text-muted-foreground capitalize">{t.tipo} — {new Date(t.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <p className="text-primary font-bold">R$ {Number(t.valor).toFixed(2)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma transação.</p>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
