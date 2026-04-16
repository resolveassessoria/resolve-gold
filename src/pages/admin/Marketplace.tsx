import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { adminNav } from "@/components/dashboard/nav/adminNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminMarketplace() {
  const { user, profile, loading, signOut } = useAuth();

  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await supabase.from("marketplace_products").select("*").order("nome");
      return data || [];
    },
    enabled: !!user,
  });

  const { data: sales } = useQuery({
    queryKey: ["admin-sales"],
    queryFn: async () => {
      const { data } = await supabase.from("marketplace_sales").select("*, marketplace_products(nome), profiles:corretor_id(nome)").order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  if (loading) return null;

  return (
    <DashboardShell title="Marketplace" userName={profile?.nome} onSignOut={signOut} navItems={adminNav}>
      <h1 className="text-2xl font-heading font-bold mb-6"><span className="text-primary">Marketplace</span></h1>

      <Card className="bg-card border-gold mb-8">
        <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-primary" /> Produtos ({products?.length || 0})</CardTitle></CardHeader>
        <CardContent>
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p: any) => (
                <div key={p.id} className="bg-muted rounded-lg p-4 border border-gold">
                  <p className="font-heading font-bold">{p.nome}</p>
                  <p className="text-primary font-bold mt-1">R$ {Number(p.preco).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Comissão: {p.comissao_percentual}%</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum produto cadastrado.</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-gold">
        <CardHeader><CardTitle>Vendas Recentes</CardTitle></CardHeader>
        <CardContent>
          {sales && sales.length > 0 ? (
            <div className="space-y-2">
              {sales.map((s: any) => (
                <div key={s.id} className="flex justify-between items-center py-2 border-b border-gold last:border-0">
                  <div>
                    <p className="text-sm font-medium">{(s as any).marketplace_products?.nome || "Produto"}</p>
                    <p className="text-xs text-muted-foreground">Corretor: {(s as any).profiles?.nome || "—"} — {new Date(s.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <p className="text-primary font-bold">R$ {Number(s.valor).toFixed(2)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma venda registrada.</p>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
