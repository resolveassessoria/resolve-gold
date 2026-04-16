import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { corretorNav } from "@/components/dashboard/nav/corretorNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DollarSign, Users, Target, Link2, TrendingUp, CheckCircle, Clock,
  Calculator, ShoppingBag, Banknote, BarChart3, Share2, Trophy, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { CommissionLevelsTable } from "@/components/dashboard/CommissionLevelsTable";
import { BreakdownTable } from "@/components/dashboard/BreakdownTable";
import { ExpansionProgressCard } from "@/components/dashboard/ExpansionProgressCard";
import { WithdrawalSimulator } from "@/components/dashboard/WithdrawalSimulator";
import { ProjectionBadge } from "@/components/dashboard/ProjectionBadge";
import {
  calculateCorretorDashboard,
  calculateBrokerClientCommission,
  calculateBrokerFomentadorCommission,
  calculateMarketplaceCommission,
  calculateNetBase,
} from "@/lib/calculations/corretor";
import { calculateBalance, calculateProfitShare } from "@/lib/calculations/finance";
import { formatBRL, roundCurrency, safeNumber, sumByFilter } from "@/lib/utils/currency";
import { EXPANSION_LEVELS } from "@/lib/calculations/expansion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const CLIENT_PERCENTAGES = ["30%", "5%", "4%", "3%", "3%", "2%", "2%", "1%"];
const FOMENTADOR_PERCENTAGES = ["15%", "2,5%", "2%", "1,5%", "1,5%", "1%", "1%", "0,5%"];

export default function CorretorDashboard() {
  const { user, profile, loading, signOut } = useAuth();

  const { data: transactions } = useQuery({
    queryKey: ["corr-transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("transactions").select("*").eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: indications } = useQuery({
    queryKey: ["corr-indications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("indications").select("*").eq("indicador_id", user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: points } = useQuery({
    queryKey: ["corr-points", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("expansion_points").select("*").eq("user_id", user.id)
        .order("mes", { ascending: false }).limit(1).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: marketplaceSales } = useQuery({
    queryKey: ["corr-marketplace-sales", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("marketplace_sales").select("*").eq("corretor_id", user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: marketplaceProducts } = useQuery({
    queryKey: ["marketplace-products"],
    queryFn: async () => {
      const { data } = await supabase.from("marketplace_products").select("*");
      return data || [];
    },
  });

  // ── Derived calculations ──
  const comissaoPaga = sumByFilter(transactions || [], (t) => t.tipo === "comissao");
  const grossValue = sumByFilter(transactions || [], () => true);
  const marketplaceTotal = (marketplaceSales || []).reduce(
    (s: number, t: any) => s + safeNumber(t.valor), 0
  );
  const marketplaceCommissionTotal = (marketplaceSales || []).reduce(
    (s: number, t: any) => s + safeNumber(t.comissao_recebida), 0
  );
  const balance = calculateBalance(transactions || []);

  const calc = calculateCorretorDashboard({
    grossValue,
    operationalCost: 0,
    type: "client",
    marketplaceSalesTotal: marketplaceTotal,
    expansionPoints: points?.pontos || 0,
    comprou_conteudo: points?.comprou_conteudo ?? true,
  });

  // Commission states
  const comissaoPrevista = calc.totalProjected;
  const comissaoGerada = comissaoPaga;
  const profitShare = calculateProfitShare(grossValue);

  // Network stats
  const networkByLevel = Array.from({ length: 7 }, (_, i) => {
    const level = i + 1;
    return {
      level,
      count: (indications || []).filter((ind: any) => ind.nivel === level).length,
      value: 0, // placeholder — no per-level revenue data yet
    };
  });
  const totalIndicados = indications?.length || 0;

  // Sales breakdown (placeholder for client vs fomentador split — no field in transactions yet)
  const totalVendas = (transactions || []).filter((t) => t.tipo === "comissao" || t.tipo === "investimento").length;
  const ticketMedio = totalVendas > 0 ? roundCurrency(grossValue / totalVendas) : 0;

  // Referral link
  const referralLink = `${window.location.origin}/register?ref=${user?.id}`;

  if (loading) return null;

  return (
    <DashboardShell title="Painel Corretor" userName={profile?.nome} onSignOut={signOut} navItems={corretorNav}>
      <h1 className="text-2xl font-heading font-bold mb-6">
        Painel do <span className="text-primary">Corretor</span>
      </h1>

      {/* ═══════════════ TOPO — 4 KPIs ═══════════════ */}
      <KPIGrid columns={4} items={[
        {
          title: "Comissão direta",
          value: calc.commission.directCommission,
          icon: DollarSign,
          subtitle: "Cliente: 30% | Fomentador: 15%",
        },
        {
          title: "Comissão por níveis",
          value: calc.commission.levels.reduce((a, b) => a + b, 0),
          icon: Users,
          subtitle: "Ganhos gerados pela sua rede até o 7º nível",
        },
        {
          title: "Pontos de expansão",
          value: points?.pontos || 0,
          icon: Target,
          format: "number",
          subtitle: "Pontuação acumulada na sua trajetória",
        },
        {
          title: "Seu nível",
          value: 0,
          format: "text" as const,
          textValue: calc.expansion.currentLevel,
          icon: Trophy,
          subtitle: "Posição atual no plano de expansão",
        },
      ]} />

      {/* ═══════════════ COMISSÃO: Prevista / Gerada / Paga ═══════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Calculator className="w-4 h-4 text-primary" />
              Comissão Prevista
              <ProjectionBadge label="Projeção" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{formatBRL(comissaoPrevista)}</p>
            <p className="text-xs text-muted-foreground mt-1">Base de cálculo sobre operações</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              Comissão Gerada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{formatBRL(comissaoGerada)}</p>
            <p className="text-xs text-muted-foreground mt-1">Registrada em transações</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Comissão Paga
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{formatBRL(comissaoPaga)}</p>
            <p className="text-xs text-muted-foreground mt-1">Valor efetivamente creditado</p>
          </CardContent>
        </Card>
      </div>

      {/* ═══════════════ MINHAS VENDAS ═══════════════ */}
      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="w-5 h-5 text-primary" />
            Resumo das Vendas
          </CardTitle>
          <CardDescription>Visão geral da sua performance comercial</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[
              { label: "Total vendido", val: formatBRL(grossValue) },
              { label: "Vendas clientes", val: formatBRL(grossValue) },
              { label: "Vendas fomentadores", val: formatBRL(0) },
              { label: "Qtd. vendas", val: totalVendas.toString() },
              { label: "Ticket médio", val: formatBRL(ticketMedio) },
            ].map((item) => (
              <div key={item.label} className="bg-muted rounded-lg p-3 border border-border text-center">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-lg font-bold text-primary mt-1">{item.val}</p>
              </div>
            ))}
          </div>

          {/* Memória de cálculo */}
          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-primary" />
              Cálculo da Comissão
              <ProjectionBadge />
            </h4>
            <div className="space-y-2">
              {[
                { label: "Valor bruto", value: calc.grossValue },
                { label: "Custo operacional", value: calc.operationalCost },
                { label: "Base líquida", value: calc.base, highlight: true },
                { label: "Comissão direta", value: calc.commission.directCommission },
                { label: "Comissão da rede", value: calc.commission.levels.reduce((a, b) => a + b, 0) },
                { label: "Total gerado", value: calc.totalProjected, highlight: true },
              ].map((row) => (
                <div
                  key={row.label}
                  className={`flex justify-between items-center py-1.5 ${
                    row.highlight ? "border-t border-primary/30 pt-2 font-bold" : "border-b border-border"
                  }`}
                >
                  <span className={`text-sm ${row.highlight ? "" : "text-muted-foreground"}`}>{row.label}</span>
                  <span className={`text-sm text-primary ${row.highlight ? "font-bold" : ""}`}>{formatBRL(row.value)}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3">
              As bonificações são calculadas sobre a base líquida após desconto dos custos operacionais.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════ COMISSÃO SOBRE CLIENTES + FOMENTADORES ═══════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Clientes */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Comissão sobre Clientes</CardTitle>
            <CardDescription>
              Nas vendas para clientes, o corretor recebe 30% sobre a base líquida, além da comissão comercial distribuída por níveis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {["Comissão direta", ...Array.from({ length: 7 }, (_, i) => `${i + 1}º nível`)].map((label, idx) => (
                <div key={label} className={`flex justify-between items-center py-1.5 ${idx === 0 ? "border-b border-border font-semibold" : "border-b border-border/50"}`}>
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm text-primary font-medium">{CLIENT_PERCENTAGES[idx]}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3">
              Exemplo do PDF: cliente pagou R$ 1.000, custos operacionais R$ 200, base de cálculo R$ 800.
            </p>
          </CardContent>
        </Card>

        {/* Fomentadores */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Comissão sobre Fomentadores</CardTitle>
            <CardDescription>
              Nas vendas para fomentadores, o corretor recebe 15% sobre a base líquida, além da comissão comercial da rede.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {["Comissão direta", ...Array.from({ length: 7 }, (_, i) => `${i + 1}º nível`)].map((label, idx) => (
                <div key={label} className={`flex justify-between items-center py-1.5 ${idx === 0 ? "border-b border-border font-semibold" : "border-b border-border/50"}`}>
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm text-primary font-medium">{FOMENTADOR_PERCENTAGES[idx]}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 bg-primary/5 rounded-lg p-3 border border-primary/20">
              <p className="text-xs text-muted-foreground">
                <strong className="text-primary">Observação:</strong> Quando o corretor cadastra fomentador, os bônus de rede são divididos pela metade.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══════════════ MINHA REDE ═══════════════ */}
      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-5 h-5 text-primary" />
            Minha Rede
          </CardTitle>
          <CardDescription>Acompanhe o crescimento da sua rede comercial</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Link de indicação */}
          <div className="bg-muted rounded-lg p-4 border border-border">
            <p className="text-sm font-semibold mb-1">Meu link de indicação</p>
            <p className="text-xs text-muted-foreground mb-3">Compartilhe seu link para expandir sua rede comercial.</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-background rounded px-3 py-2 truncate border border-border">
                {referralLink}
              </code>
              <Button
                variant="outline"
                size="sm"
                className="border-primary/40 text-primary"
                onClick={() => { navigator.clipboard.writeText(referralLink); toast.success("Link copiado!"); }}
              >
                <Link2 className="w-4 h-4 mr-1" /> Copiar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-primary/40 text-primary"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: "Meu link RESOLVE", url: referralLink });
                  } else {
                    navigator.clipboard.writeText(referralLink);
                    toast.success("Link copiado!");
                  }
                }}
              >
                <Share2 className="w-4 h-4 mr-1" /> Compartilhar
              </Button>
            </div>
          </div>

          {/* Indicadores da rede */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Indicadores da rede</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: "Indicados", val: totalIndicados },
                { label: "Clientes", val: totalIndicados },
                { label: "Fomentadores", val: 0 },
                { label: "Corretores", val: 0 },
                { label: "Comissão rede", val: formatBRL(calc.commission.levels.reduce((a, b) => a + b, 0)) },
              ].map((item) => (
                <div key={item.label} className="bg-muted rounded-lg p-3 border border-border text-center">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-lg font-bold text-primary mt-1">
                    {typeof item.val === "number" ? item.val.toLocaleString("pt-BR") : item.val}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Ganhos por nível */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Ganhos por nível</h4>
            <p className="text-xs text-muted-foreground mb-3">Acompanhe quanto cada nível da sua rede gerou para você.</p>
            <div className="space-y-2">
              {networkByLevel.map((lvl) => (
                <div key={lvl.level} className="flex justify-between items-center py-1.5 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Nível {lvl.level}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">{lvl.count} indicados</span>
                    <span className="text-sm text-primary font-medium">{formatBRL(calc.commission.levels[lvl.level - 1] || 0)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════ EXPANSÃO ═══════════════ */}
      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-5 h-5 text-primary" />
            Plano de Expansão
          </CardTitle>
          <CardDescription>Acompanhe sua evolução, prêmios e pontos necessários para avançar ao próximo nível.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Pontos atuais", val: (calc.expansion.currentPoints).toLocaleString("pt-BR") },
              { label: "Nível atual", val: calc.expansion.currentLevel },
              { label: "Próximo nível", val: calc.expansion.nextLevel || "—" },
              { label: "Pontos faltantes", val: calc.expansion.pointsToNextLevel.toLocaleString("pt-BR") },
              { label: "Prêmio desbloqueado", val: calc.expansion.unlockedReward || "—" },
              { label: "Bônus avanço", val: calc.expansion.advanceBonus > 0 ? formatBRL(calc.expansion.advanceBonus) : "—" },
            ].map((item) => (
              <div key={item.label} className="bg-muted rounded-lg p-3 border border-border text-center">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-base font-bold text-primary mt-1">{item.val}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          {calc.expansion.nextLevel && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Progresso para {calc.expansion.nextLevel}</span>
                <span className="text-primary font-medium">{calc.expansion.progressPercent}%</span>
              </div>
              <Progress value={calc.expansion.progressPercent} className="h-3" />
            </div>
          )}

          {/* All levels */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Todos os níveis</h4>
            <div className="space-y-2">
              {EXPANSION_LEVELS.map((lvl) => {
                const isCurrentOrPast = (points?.pontos || 0) >= lvl.threshold;
                return (
                  <div
                    key={lvl.name}
                    className={`flex flex-col md:flex-row md:items-center justify-between py-2 px-3 rounded-lg border ${
                      isCurrentOrPast
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isCurrentOrPast ? (
                        <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                      )}
                      <span className={`text-sm font-medium ${isCurrentOrPast ? "text-primary" : "text-muted-foreground"}`}>
                        {lvl.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        — {lvl.threshold >= 1000000
                          ? `${(lvl.threshold / 1000000).toFixed(0)}M`
                          : lvl.threshold >= 1000
                            ? `${(lvl.threshold / 1000).toFixed(lvl.threshold % 1000 === 0 ? 0 : 1)}K`
                            : lvl.threshold} pts
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 md:mt-0">
                      <span className="text-xs text-muted-foreground">{lvl.reward}</span>
                      {lvl.advanceBonus > 0 && (
                        <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">
                          + {formatBRL(lvl.advanceBonus)}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3">
              Os pontos podem zerar após 3 meses sem aquisição de conteúdo. Pedidos no marketplace não zeram os pontos do bônus expansão.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════ PARTICIPAÇÃO NOS LUCROS ═══════════════ */}
      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-5 h-5 text-primary" />
            Participação nos Lucros
            <ProjectionBadge />
          </CardTitle>
          <CardDescription>
            Pools globais de bonificação do sistema. Valores exibidos como estimativa, não como pagamento garantido individual.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Bônus Live", pct: "4%", value: profitShare.liveBonusPool },
              { label: "Bônus Campeão", pct: "1%", value: profitShare.championBonusPool },
              { label: "Bônus Divulgação", pct: "2%", value: profitShare.divulgationBonusPool },
              { label: "Bônus Founder", pct: "3%", value: profitShare.founderBonusPool },
              { label: "Total", pct: "9%", value: profitShare.totalPool },
            ].map((item) => (
              <div key={item.label} className="bg-muted rounded-lg p-3 border border-border text-center">
                <p className="text-xs text-muted-foreground">{item.label} ({item.pct})</p>
                <p className="text-lg font-bold text-primary mt-1">{formatBRL(item.value)}</p>
                <Badge variant="outline" className="text-[9px] border-primary/40 text-primary mt-1">Estimativa</Badge>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">
            Pool global estimado — elegibilidade sujeita a regras adicionais.
          </p>
        </CardContent>
      </Card>

      {/* ═══════════════ MARKETPLACE ═══════════════ */}
      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Marketplace
          </CardTitle>
          <CardDescription>
            Ganhe também sobre vendas realizadas no marketplace. Total do marketplace é 50%, sendo 30% para o corretor e comissão comercial por níveis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Marketplace stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Vendas marketplace", val: formatBRL(marketplaceTotal) },
              { label: "Comissão direta", val: formatBRL(marketplaceCommissionTotal) },
              { label: "Comissão rede", val: formatBRL(calc.marketplace.levels.reduce((a, b) => a + b, 0)) },
              { label: "Total gerado", val: formatBRL(roundCurrency(marketplaceCommissionTotal + calc.marketplace.levels.reduce((a, b) => a + b, 0))) },
            ].map((item) => (
              <div key={item.label} className="bg-muted rounded-lg p-3 border border-border text-center">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-lg font-bold text-primary mt-1">{item.val}</p>
              </div>
            ))}
          </div>

          {/* Products grid */}
          {marketplaceProducts && marketplaceProducts.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Produtos disponíveis</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {marketplaceProducts.map((p: any) => (
                  <div key={p.id} className="bg-muted rounded-lg p-4 border border-border">
                    <p className="text-sm font-semibold">{p.nome}</p>
                    <p className="text-primary font-bold mt-1">{formatBRL(safeNumber(p.preco))}</p>
                    <p className="text-xs text-muted-foreground mt-1">Comissão: {p.comissao_percentual}%</p>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="text-xs border-primary/40 text-primary flex-1">
                        Ver produto
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs border-primary/40 text-primary flex-1" disabled>
                        Registrar venda
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══════════════ FINANCEIRO ═══════════════ */}
      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Banknote className="w-5 h-5 text-primary" />
            Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Saldo disponível", val: formatBRL(balance.available) },
              { label: "Saldo pendente", val: formatBRL(balance.pending) },
              { label: "Comissão gerada", val: formatBRL(comissaoGerada) },
              { label: "Comissão paga", val: formatBRL(comissaoPaga) },
            ].map((item) => (
              <div key={item.label} className="bg-muted rounded-lg p-3 border border-border text-center">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-lg font-bold text-primary mt-1">{item.val}</p>
              </div>
            ))}
          </div>

          <WithdrawalSimulator availableBalance={balance.available} />
        </CardContent>
      </Card>

      {/* ═══════════════ HISTÓRICO ═══════════════ */}
      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <CardTitle className="text-base">Últimas Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.slice(0, 10).map((t: any) => (
                <div key={t.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium capitalize">{t.tipo}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(t.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    {t.tipo === "comissao" && (
                      <Badge variant="outline" className="text-[10px] border-green-500/40 text-green-500">Paga</Badge>
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
    </DashboardShell>
  );
}
