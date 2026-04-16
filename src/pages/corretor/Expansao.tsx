import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { corretorNav } from "@/components/dashboard/nav/corretorNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const levels = [
  { name: "Consultor", prize: "R$ 200", vml: "2.8K" },
  { name: "Assessor", prize: "R$ 500", vml: "7K" },
  { name: "Especialista", prize: "Cruzeiro R$ 4K", vml: "30K" },
  { name: "Gestor", prize: "Caribe R$ 12K", vml: "100K" },
  { name: "Elite", prize: "Moto R$ 35K", vml: "300K" },
  { name: "Premium", prize: "Carro R$ 160K", vml: "900K" },
  { name: "Supremo", prize: "Super Carro R$ 400K", vml: "2M" },
];

export default function CorretorExpansao() {
  const { user, profile, loading, signOut } = useAuth();

  const { data: points } = useQuery({
    queryKey: ["corr-expansion", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("expansion_points").select("*").eq("user_id", user.id).order("mes", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const currentPoints = points?.[0]?.pontos || 0;

  if (loading) return null;

  return (
    <DashboardShell title="Expansão" userName={profile?.nome} onSignOut={signOut} navItems={corretorNav}>
      <h1 className="text-2xl font-heading font-bold mb-6">Pontos de <span className="text-primary">Expansão</span></h1>

      <Card className="bg-card border-gold mb-8">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Pontos Atuais</p>
          <p className="text-4xl font-bold text-primary">{currentPoints}</p>
        </CardContent>
      </Card>

      <Card className="bg-card border-gold mb-8">
        <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5 text-primary" /> Metas e Prêmios</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {levels.map((l) => (
              <div key={l.name} className="bg-muted rounded-lg p-3 text-center border border-gold">
                <p className="font-heading font-bold text-xs">{l.name}</p>
                <p className="text-primary font-bold text-xs mt-1">{l.prize}</p>
                <p className="text-[10px] text-muted-foreground mt-1">VML: {l.vml}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-gold">
        <CardHeader><CardTitle>Histórico de Pontos</CardTitle></CardHeader>
        <CardContent>
          {points && points.length > 0 ? (
            <div className="space-y-2">
              {points.map((p: any) => (
                <div key={p.id} className="flex justify-between items-center py-2 border-b border-gold last:border-0">
                  <p className="text-sm">{new Date(p.mes).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</p>
                  <p className="text-primary font-bold">{p.pontos} pts</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum registro de pontos.</p>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
