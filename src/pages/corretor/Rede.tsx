import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { corretorNav } from "@/components/dashboard/nav/corretorNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function CorretorRede() {
  const { user, profile, loading, signOut } = useAuth();

  const { data: indications } = useQuery({
    queryKey: ["corr-rede", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("indications").select("*, indicado:indicado_id(nome, email)").eq("indicador_id", user.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  if (loading) return null;

  const byLevel = [1, 2, 3, 4, 5, 6, 7].map(n => ({
    level: n,
    count: indications?.filter((i: any) => i.nivel === n).length || 0,
  }));

  return (
    <DashboardShell title="Minha Rede" userName={profile?.nome} onSignOut={signOut} navItems={corretorNav}>
      <h1 className="text-2xl font-heading font-bold mb-6">Minha <span className="text-primary">Rede</span></h1>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {byLevel.map((l) => (
          <Card key={l.level} className="bg-card border-gold text-center">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Nível {l.level}</p>
              <p className="text-2xl font-bold text-primary">{l.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-gold">
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Indicados</CardTitle></CardHeader>
        <CardContent>
          {indications && indications.length > 0 ? (
            <div className="space-y-2">
              {indications.map((i: any) => (
                <div key={i.id} className="flex justify-between items-center py-2 border-b border-gold last:border-0">
                  <div>
                    <p className="text-sm font-medium">{(i as any).indicado?.nome || "—"}</p>
                    <p className="text-xs text-muted-foreground">{(i as any).indicado?.email}</p>
                  </div>
                  <span className="text-xs text-primary font-medium">Nível {i.nivel}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma indicação encontrada.</p>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
