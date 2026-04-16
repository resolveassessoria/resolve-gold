import { useAuth } from "@/hooks/useAuth";
import { useAdminRoles } from "@/hooks/useAdminRoles";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminNavItems } from "@/components/admin/adminNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/utils/currency";

export default function AdminTransacoes() {
  const { user, profile, loading, signOut } = useAuth();
  const { roles } = useAdminRoles(user?.id);

  const { data: transactions } = useQuery({
    queryKey: ["admin-all-transactions"],
    queryFn: async () => {
      const { data } = await supabase.from("transactions").select("*, profiles(nome, tipo_usuario)").order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  if (loading) return null;

  return (
    <AdminShell userName={profile?.nome} onSignOut={signOut} navItems={adminNavItems} adminRoles={roles}>
      <h1 className="text-2xl font-heading font-bold mb-6">Todas as <span className="text-red-400">Transações</span></h1>

      <Card className="bg-[hsl(220,18%,7%)] border-[hsl(220,15%,15%)]">
        <CardHeader><CardTitle>Histórico Global</CardTitle></CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((t: any) => (
                <div key={t.id} className="flex justify-between items-center py-3 border-b border-[hsl(220,15%,12%)] last:border-0">
                  <div>
                    <p className="text-sm font-medium">{t.profiles?.nome || "—"}</p>
                    <p className="text-xs text-muted-foreground capitalize">{t.tipo} — {t.profiles?.tipo_usuario} — {new Date(t.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <p className="text-red-400 font-bold">{formatBRL(t.valor)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma transação.</p>
          )}
        </CardContent>
      </Card>
    </AdminShell>
  );
}
