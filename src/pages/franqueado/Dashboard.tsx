import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { franqueadoNav } from "@/components/dashboard/nav/franqueadoNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DollarSign, TrendingUp, CheckCircle, Clock, Calculator, Users,
  ShoppingBag, Banknote, BarChart3, ArrowRightLeft, Building2, Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { ProjectionBadge } from "@/components/dashboard/ProjectionBadge";
import { WithdrawalSimulator } from "@/components/dashboard/WithdrawalSimulator";
import { calculateFranqueadoDashboard } from "@/lib/calculations/franqueado";
import { calculateBalance } from "@/lib/calculations/finance";
import { formatBRL, roundCurrency, safeNumber, sumByFilter } from "@/lib/utils/currency";
import { Badge } from "@/components/ui/badge";

const FRANCHISE_PERCENTAGES = ["2,5%", "2%", "1,5%", "1,5%", "1%", "1%", "0,5%"];

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

  const { data: indications } = useQuery({
    queryKey: ["franq-indications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("indications").select("*").eq("indicador_id", user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: marketplaceSales } = useQuery({
    queryKey: ["franq-marketplace-sales", user?.id],
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

  // ── Calculations ──
  const grossValue = sumByFilter(transactions || [], () => true);
  const comissaoPaga = sumByFilter(transactions || [], (t) => t.tipo === "comissao");
  const balance = calculateBalance(transactions || []);
  const marketplaceTotal = (marketplaceSales || []).reduce((s: number, t: any) => s + safeNumber(t.valor), 0);
  const marketplaceCommission = (marketplaceSales || []).reduce((s: number, t: any) => s + safeNumber(t.comissao_recebida), 0);

  const calc = calculateFranqueadoDashboard({
    grossValue,
    operationalCost: 0,
    rentedGrossValue: 0,
  });

  const comissaoFranquia = calc.ownOperation.directCommission;
  const comissaoNiveis = calc.ownOperation.levels.reduce((a, b) => a + b, 0);
  const comissaoPrevista = roundCurrency(comissaoFranquia + comissaoNiveis);
  const resultadoLiquido = roundCurrency(calc.royalties.netAfterRoyalty - calc.ownOperation.directCommission);

  // Rented comparison
  const rentedGross = 0; // placeholder
  const rentedCommission = roundCurrency(rentedGross * 0.30);

  const totalIndicados = indications?.length || 0;

  if (loading) return null;

  return (
    <DashboardShell title="Painel Franqueado" userName={profile?.nome} onSignOut={signOut} navItems={franqueadoNav}>
      <h1 className="text-2xl font-heading font-bold mb-6">
        Painel do <span className="text-primary">Franqueado</span>
      </h1>

      {/* ═══════════════ TOPO — 4 KPIs ═══════════════ */}
      <KPIGrid columns={4} items={[
        {
          title: "Receita da operação",
          value: grossValue,
          icon: DollarSign,
          subtitle: "Total gerado pela sua unidade",
        },
        {
          title: "Comissão da franquia",
          value: comissaoFranquia,
          icon: Building2,
          subtitle: "40% sobre a base da operação",
        },
        {
          title: "Royalties",
          value: calc.royalties.royalty,
          icon: TrendingUp,
          subtitle: "5% sobre o valor bruto",
        },
        {
          title: "Resultado líquido",
          value: calc.royalties.netAfterRoyalty,
          icon: BarChart3,
          subtitle: "Valor após desconto de royalties",
        },
      ]} />

      {/* ═══════════════ OPERAÇÃO PRÓPRIA ═══════════════ */}
      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Briefcase className="w-5 h-5 text-primary" />
            Operação Própria
          </CardTitle>
          <CardDescription>Resumo da operação e memória de cálculo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Breakdown */}
          <div className="space-y-2">
            {[
              { label: "Valor bruto", value: calc.royalties.grossValue },
              { label: "Custo operacional", value: 0 },
              { label: "Base líquida", value: calc.base, highlight: true },
              { label: "Comissão da franquia (40%)", value: comissaoFranquia },
              { label: "Comissão por níveis", value: comissaoNiveis },
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
          <p className="text-[10px] text-muted-foreground">
            As bonificações são calculadas após os custos operacionais.
          </p>

          {/* Comissão por níveis */}
          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-semibold mb-3">Comissão por níveis</h4>
            <div className="space-y-2">
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} className="flex justify-between items-center py-1.5 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">{i + 1}º nível</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">{FRANCHISE_PERCENTAGES[i]}</span>
                    <span className="text-sm text-primary font-medium">{formatBRL(calc.ownOperation.levels[i])}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════ ROYALTIES ═══════════════ */}
      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-5 h-5 text-primary" />
            Royalties da Franquia
          </CardTitle>
          <CardDescription>Os royalties pagos são destinados ao retorno dos fomentadores.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { label: "Valor bruto da operação", value: calc.royalties.grossValue },
              { label: "Percentual aplicado", text: "5%" },
              { label: "Valor de royalties", value: calc.royalties.royalty },
              { label: "Valor líquido após royalties", value: calc.royalties.netAfterRoyalty, highlight: true },
            ].map((row) => (
              <div
                key={row.label}
                className={`flex justify-between items-center py-1.5 ${
                  row.highlight ? "border-t border-primary/30 pt-2 font-bold" : "border-b border-border"
                }`}
              >
                <span className={`text-sm ${row.highlight ? "" : "text-muted-foreground"}`}>{row.label}</span>
                <span className={`text-sm text-primary ${row.highlight ? "font-bold" : ""}`}>
                  {"value" in row ? formatBRL(row.value!) : row.text}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════ FRANQUIA ARRENDADA ═══════════════ */}
      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ArrowRightLeft className="w-5 h-5 text-primary" />
            Operação Arrendada
          </CardTitle>
          <CardDescription>Comparação entre operação própria e arrendada</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted rounded-lg p-4 border border-border text-center">
              <p className="text-xs text-muted-foreground mb-1">Receita arrendada</p>
              <p className="text-xl font-bold text-primary">{formatBRL(rentedGross)}</p>
            </div>
            <div className="bg-muted rounded-lg p-4 border border-border text-center">
              <p className="text-xs text-muted-foreground mb-1">Comissão (30%)</p>
              <p className="text-xl font-bold text-primary">{formatBRL(rentedCommission)}</p>
              <p className="text-[10px] text-muted-foreground mt-1">40% - 10% = 30%</p>
            </div>
          </div>

          {/* Comparison table */}
          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-semibold mb-3">Operação própria vs arrendada</h4>
            <div className="space-y-2">
              {[
                { label: "Receita", own: grossValue, rented: rentedGross },
                { label: "Comissão", own: comissaoFranquia, rented: rentedCommission },
                { label: "Lucro líquido", own: calc.royalties.netAfterRoyalty, rented: roundCurrency(rentedGross - rentedCommission) },
              ].map((row) => (
                <div key={row.label} className="grid grid-cols-3 items-center py-1.5 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">{row.label}</span>
                  <span className="text-sm text-primary font-medium text-center">{formatBRL(row.own)}</span>
                  <span className="text-sm text-muted-foreground text-center">{formatBRL(row.rented)}</span>
                </div>
              ))}
              <div className="grid grid-cols-3 text-xs text-muted-foreground pt-1">
                <span></span>
                <span className="text-center font-medium text-primary">Própria</span>
                <span className="text-center">Arrendada</span>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
            <p className="text-xs text-muted-foreground">
              <strong className="text-primary">Regra:</strong> Na franquia arrendada a comissão é de 30% (40% - 10%) sobre a base da operação.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════ EQUIPE E REDE ═══════════════ */}
      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-5 h-5 text-primary" />
            Equipe e Rede
          </CardTitle>
          <CardDescription>Acompanhe a produção da sua equipe e rede</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Corretores vinculados", val: totalIndicados },
              { label: "Produção da equipe", val: formatBRL(grossValue) },
              { label: "Volume de vendas", val: (transactions || []).length },
              { label: "Total vendido", val: formatBRL(grossValue) },
              { label: "Comissão da rede", val: formatBRL(comissaoNiveis) },
            ].map((item) => (
              <div key={item.label} className="bg-muted rounded-lg p-3 border border-border text-center">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-lg font-bold text-primary mt-1">
                  {typeof item.val === "number" ? item.val.toLocaleString("pt-BR") : item.val}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════ MARKETPLACE ═══════════════ */}
      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Marketplace
          </CardTitle>
          <CardDescription>Produtos e serviços disponíveis na sua unidade</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: "Total vendido marketplace", val: formatBRL(marketplaceTotal) },
              { label: "Comissão da franquia", val: formatBRL(marketplaceCommission) },
              { label: "Vendas realizadas", val: (marketplaceSales || []).length.toString() },
            ].map((item) => (
              <div key={item.label} className="bg-muted rounded-lg p-3 border border-border text-center">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-lg font-bold text-primary mt-1">{item.val}</p>
              </div>
            ))}
          </div>

          {/* Products */}
          {marketplaceProducts && marketplaceProducts.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Produtos disponíveis</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {marketplaceProducts.map((p: any) => (
                  <div key={p.id} className="bg-muted rounded-lg p-4 border border-border">
                    <p className="text-sm font-semibold">{p.nome}</p>
                    <p className="text-primary font-bold mt-1">{formatBRL(safeNumber(p.preco))}</p>
                    <p className="text-xs text-muted-foreground mt-1">Comissão: {p.comissao_percentual}%</p>
                    <Button variant="outline" size="sm" className="text-xs border-primary/40 text-primary w-full mt-3">
                      Ver produto
                    </Button>
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
              { label: "Receita total", val: formatBRL(grossValue) },
              { label: "Comissão acumulada", val: formatBRL(comissaoPaga) },
            ].map((item) => (
              <div key={item.label} className="bg-muted rounded-lg p-3 border border-border text-center">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-lg font-bold text-primary mt-1">{item.val}</p>
              </div>
            ))}
          </div>

          {/* Simulador de repasse */}
          <WithdrawalSimulator availableBalance={balance.available} />

          <div className="flex justify-end">
            <Button disabled className="opacity-60">Receber repasse — Em breve</Button>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════ HISTÓRICO ═══════════════ */}
      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <CardTitle className="text-base">Histórico Financeiro</CardTitle>
          <CardDescription>Transações, vendas, comissões e royalties</CardDescription>
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
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        t.tipo === "comissao"
                          ? "border-green-500/40 text-green-500"
                          : t.tipo === "royalty"
                            ? "border-primary/40 text-primary"
                            : "border-muted-foreground/40 text-muted-foreground"
                      }`}
                    >
                      {t.tipo === "comissao" ? "Comissão" : t.tipo === "royalty" ? "Royalty" : t.tipo}
                    </Badge>
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
