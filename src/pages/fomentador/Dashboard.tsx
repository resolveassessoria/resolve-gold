import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { fomentadorNav } from "@/components/dashboard/nav/fomentadorNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DollarSign, TrendingUp, Calendar, BarChart3, CheckCircle,
  FileText, Upload, Clock, Shield, Activity, PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { ProjectionBadge } from "@/components/dashboard/ProjectionBadge";
import { calculateFomentadorDashboard } from "@/lib/calculations/fomentador";
import { formatBRL, safeNumber, sumByFilter } from "@/lib/utils/currency";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const INVESTMENT_STATUSES = [
  { key: "aguardando", label: "Aguardando confirmação", icon: Clock },
  { key: "ativo", label: "Ativo", icon: Activity },
  { key: "analise", label: "Em análise", icon: Shield },
  { key: "finalizado", label: "Finalizado", icon: CheckCircle },
];

export default function FomentadorDashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: transactions } = useQuery({
    queryKey: ["fom-transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: kycDocs } = useQuery({
    queryKey: ["fom-kyc", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("kyc_documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const investido = sumByFilter(transactions || [], (t) => t.tipo === "investimento");
  const royaltiesReal = sumByFilter(transactions || [], (t) => t.tipo === "royalty");
  const calc = calculateFomentadorDashboard(investido);

  // Determine investment status based on data
  const hasInvestment = investido > 0;
  const currentStatus = !hasInvestment ? "aguardando" : "ativo";

  // First investment date
  const investmentTxs = (transactions || []).filter((t) => t.tipo === "investimento");
  const firstInvestmentDate = investmentTxs.length > 0
    ? new Date(investmentTxs[investmentTxs.length - 1].created_at).toLocaleDateString("pt-BR")
    : "—";

  // KYC status
  const kycStatus = kycDocs && kycDocs.length > 0 ? kycDocs[0].status : "pendente";
  const kycLabel = kycStatus === "aprovado" ? "Aprovado" : kycStatus === "rejeitado" ? "Rejeitado" : kycStatus === "pendente" ? "Pendente" : "Em análise";

  const simMonths = [3, 6, 12, 24];

  if (loading) return null;

  return (
    <DashboardShell title="Painel Fomentador" userName={profile?.nome} onSignOut={signOut} navItems={fomentadorNav}>
      <h1 className="text-2xl font-heading font-bold mb-6">
        Painel do <span className="text-primary">Fomentador</span>
      </h1>

      {/* ── KPI Cards ── */}
      <KPIGrid columns={4} items={[
        {
          title: "Capital aportado",
          value: investido,
          icon: DollarSign,
          subtitle: "Total investido no ecossistema",
        },
        {
          title: "Retorno mensal previsto",
          value: calc.monthlyRoyalty,
          icon: Calendar,
          isProjection: true,
          subtitle: "Até 5% ao mês sobre o valor aportado",
        },
        {
          title: "Retorno anual projetado",
          value: calc.annualRoyalty,
          icon: BarChart3,
          isProjection: true,
          subtitle: "Projeção acumulada em 12 meses",
        },
        {
          title: "Status do investimento",
          value: 0,
          format: "text" as const,
          textValue: INVESTMENT_STATUSES.find((s) => s.key === currentStatus)?.label || "—",
          icon: Activity,
          subtitle: hasInvestment ? "Investimento ativo" : "Aguardando primeiro aporte",
        },
      ]} />

      {/* ── Meu Investimento ── */}
      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="w-5 h-5 text-primary" />
            Meu Investimento
          </CardTitle>
          <CardDescription>Detalhes do seu aporte no ecossistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Valor aportado</span>
            <span className="text-primary font-bold">{formatBRL(investido)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Percentual projetado</span>
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold">Até 5% a.m.</span>
              <ProjectionBadge />
            </div>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Retorno mensal</span>
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold">{formatBRL(calc.monthlyRoyalty)}</span>
              <ProjectionBadge />
            </div>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Retorno anual</span>
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold">{formatBRL(calc.annualRoyalty)}</span>
              <ProjectionBadge />
            </div>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Data de início</span>
            <span className="text-foreground font-medium">{firstInvestmentDate}</span>
          </div>
          <p className="text-[10px] text-muted-foreground pt-2">
            Valores projetados com base no aporte atual. Resultados reais podem variar.
          </p>
        </CardContent>
      </Card>

      {/* ── Status do Investimento ── */}
      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="w-5 h-5 text-primary" />
            Status do Investimento
          </CardTitle>
          <CardDescription>Acompanhe o andamento do seu investimento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3">
            {INVESTMENT_STATUSES.map((status, idx) => {
              const Icon = status.icon;
              const isActive = status.key === currentStatus;
              const isPast = INVESTMENT_STATUSES.findIndex((s) => s.key === currentStatus) > idx;
              return (
                <div
                  key={status.key}
                  className={`flex-1 flex items-center gap-3 rounded-lg p-3 border transition-colors ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : isPast
                        ? "border-green-500/40 bg-green-500/5 text-green-500"
                        : "border-border bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">{status.label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Projeção por período ── */}
      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-5 h-5 text-primary" />
            Projeção de Retornos (até 5% a.m.)
            <ProjectionBadge />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {simMonths.map((m) => (
              <div key={m} className="bg-muted rounded-lg p-4 text-center border border-border">
                <p className="text-sm text-muted-foreground">{m} meses</p>
                <p className="text-xl font-bold text-primary mt-1">{formatBRL(calc.monthlyRoyalty * m)}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">
            Projeção estimada. Resultados passados não garantem retornos futuros.
          </p>
        </CardContent>
      </Card>

      {/* ── Documentação / KYC ── */}
      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-5 h-5 text-primary" />
            Verificação (KYC)
          </CardTitle>
          <CardDescription>Envie seus documentos para liberar todos os benefícios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge
              variant="outline"
              className={`text-xs ${
                kycStatus === "aprovado"
                  ? "border-green-500/40 text-green-500"
                  : kycStatus === "rejeitado"
                    ? "border-destructive/40 text-destructive"
                    : "border-primary/40 text-primary"
              }`}
            >
              {kycLabel}
            </Badge>
          </div>
          {kycDocs && kycDocs.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Documentos enviados</span>
              <span className="text-sm font-medium text-foreground">{kycDocs.length}</span>
            </div>
          )}
          <Button
            variant="outline"
            className="w-full border-primary/40 text-primary hover:bg-primary/10"
            onClick={() => navigate("/cliente/documentos")}
          >
            <Upload className="w-4 h-4 mr-2" />
            {kycDocs && kycDocs.length > 0 ? "Reenviar documentos" : "Enviar documentos"}
          </Button>
        </CardContent>
      </Card>

      {/* ── Histórico Financeiro + Investir Mais ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Histórico */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-5 h-5 text-primary" />
              Histórico Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Summary */}
            <div className="space-y-2 mb-4 pb-4 border-b border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total de aportes</span>
                <span className="text-primary font-bold">{formatBRL(investido)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Royalties recebidos</span>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">{formatBRL(royaltiesReal)}</span>
                  {royaltiesReal > 0 && (
                    <Badge variant="outline" className="text-[10px] border-green-500/40 text-green-500">Real</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Transaction list */}
            {transactions && transactions.length > 0 ? (
              <div className="space-y-2">
                {transactions.slice(0, 6).map((t: any) => (
                  <div key={t.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-sm font-medium capitalize">{t.tipo}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(t.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      {t.tipo === "royalty" && (
                        <Badge variant="outline" className="text-[10px] border-green-500/40 text-green-500">Real</Badge>
                      )}
                    </div>
                    <p className="text-primary font-bold">{formatBRL(safeNumber(t.valor))}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma transação encontrada.</p>
            )}
          </CardContent>
        </Card>

        {/* Investir Mais */}
        <Card className="bg-card border-border flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PlusCircle className="w-5 h-5 text-primary" />
              Investir Mais
            </CardTitle>
            <CardDescription>Aumente seu aporte e potencialize seus retornos</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="space-y-3 mb-6">
              <div className="bg-muted rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Aporte atual</p>
                <p className="text-2xl font-bold text-primary">{formatBRL(investido)}</p>
              </div>
              <div className="bg-muted rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Retorno mensal projetado</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-primary">{formatBRL(calc.monthlyRoyalty)}</p>
                  <ProjectionBadge />
                </div>
              </div>
            </div>
            <Button disabled className="w-full opacity-60">
              Investir — Em breve
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
