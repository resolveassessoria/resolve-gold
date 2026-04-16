import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { franqueadoNav } from "@/components/dashboard/nav/franqueadoNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store } from "lucide-react";

const services = [
  "Limpa Nome", "Conta Bancária", "Cartão Crédito", "Cheque Especial",
  "Financiamento", "Empréstimo", "Maquininha", "Consórcio", "Escrow",
  "Seguro", "Plano Médico", "Negociação Dívidas", "Dívidas Tributárias",
  "Recurso CNH", "Multas CNH", "Lei Seca CNH", "Pontos CNH",
  "Blindagem Permissão", "LOAS",
];

export default function FranqueadoOperacao() {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) return null;

  return (
    <DashboardShell title="Operação" userName={profile?.nome} onSignOut={signOut} navItems={franqueadoNav}>
      <h1 className="text-2xl font-heading font-bold mb-6"><span className="text-primary">Operação</span> da Franquia</h1>

      <Card className="bg-card border-gold mb-8">
        <CardHeader><CardTitle className="flex items-center gap-2"><Store className="w-5 h-5 text-primary" /> Serviços Ativos</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {services.map((s) => (
              <div key={s} className="bg-muted rounded-lg px-4 py-3 text-sm font-medium border border-gold text-center">{s}</div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-gold">
        <CardHeader><CardTitle>Status Operacional</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted rounded-lg p-4 border border-gold">
              <p className="text-sm text-muted-foreground">Status da Franquia</p>
              <p className="text-lg font-bold text-primary capitalize">{profile?.status || "pendente"}</p>
            </div>
            <div className="bg-muted rounded-lg p-4 border border-gold">
              <p className="text-sm text-muted-foreground">Serviços Disponíveis</p>
              <p className="text-lg font-bold text-primary">19</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
