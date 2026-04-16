import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { adminNav } from "@/components/dashboard/nav/adminNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Users, FileCheck, DollarSign, Activity, TrendingUp, ShoppingBag,
  AlertTriangle, Settings, BarChart3, Trophy, Link2, Shield, Eye,
  CheckCircle, XCircle, Clock, Search, Filter
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { ProjectionBadge } from "@/components/dashboard/ProjectionBadge";
import { calculateAdminDashboard } from "@/lib/calculations/admin";
import { calculateProfitShare } from "@/lib/calculations/finance";
import { EXPANSION_LEVELS } from "@/lib/calculations/expansion";
import { formatBRL, roundCurrency, safeNumber, sumByFilter } from "@/lib/utils/currency";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminDashboard() {
  const { user, profile, loading, signOut } = useAuth();

  // Filters
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");
  const [txTypeFilter, setTxTypeFilter] = useState<string>("all");
  const [userSearch, setUserSearch] = useState("");

  // ── Queries ──
  const { data: users } = useQuery({
    queryKey: ["admin-all-users"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: kycDocs } = useQuery({
    queryKey: ["admin-all-kyc"],
    queryFn: async () => {
      const { data } = await supabase.from("kyc_documents").select("*, profiles(nome, email)").order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: transactions } = useQuery({
    queryKey: ["admin-all-transactions"],
    queryFn: async () => {
      const { data } = await supabase.from("transactions").select("*, profiles(nome, email, tipo_usuario)").order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: marketplaceProducts } = useQuery({
    queryKey: ["admin-marketplace-products"],
    queryFn: async () => {
      const { data } = await supabase.from("marketplace_products").select("*").order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: marketplaceSales } = useQuery({
    queryKey: ["admin-marketplace-sales"],
    queryFn: async () => {
      const { data } = await supabase.from("marketplace_sales").select("*, marketplace_products(nome), profiles:corretor_id(nome)").order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: indications } = useQuery({
    queryKey: ["admin-all-indications"],
    queryFn: async () => {
      const { data } = await supabase.from("indications").select("*, indicador:indicador_id(nome, tipo_usuario), indicado:indicado_id(nome, tipo_usuario)");
      return data || [];
    },
    enabled: !!user,
  });

  const { data: expansionPoints } = useQuery({
    queryKey: ["admin-all-expansion"],
    queryFn: async () => {
      const { data } = await supabase.from("expansion_points").select("*, profiles(nome)").order("pontos", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  if (loading) return null;

  // ── Derived data ──
  const allTx = transactions || [];
  const allUsers = users || [];
  const totalRevenue = allTx.reduce((s: number, t: any) => s + safeNumber(t.valor), 0);

  const adminCalc = calculateAdminDashboard({
    transactions: allTx,
    marketplaceSales: marketplaceSales || [],
    globalProfit: totalRevenue,
  });

  // User counts by role
  const countByRole = (role: string) => allUsers.filter((u: any) => u.tipo_usuario === role).length;

  // KYC counts
  const kycPending = (kycDocs || []).filter((d: any) => d.status === "pendente").length;
  const kycApproved = (kycDocs || []).filter((d: any) => d.status === "aprovado").length;
  const kycRejected = (kycDocs || []).filter((d: any) => d.status === "rejeitado").length;

  // Filtered users
  const filteredUsers = allUsers
    .filter((u: any) => userRoleFilter === "all" || u.tipo_usuario === userRoleFilter)
    .filter((u: any) => {
      if (!userSearch) return true;
      const q = userSearch.toLowerCase();
      return u.nome?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    });

  // Filtered transactions
  const filteredTx = allTx.filter((t: any) => txTypeFilter === "all" || t.tipo === txTypeFilter);

  // Expansion level distribution
  const levelDistribution = EXPANSION_LEVELS.map((lvl) => {
    const count = (expansionPoints || []).filter(
      (ep: any) => ep.pontos >= lvl.threshold &&
        (EXPANSION_LEVELS.indexOf(lvl) === EXPANSION_LEVELS.length - 1 ||
          ep.pontos < EXPANSION_LEVELS[EXPANSION_LEVELS.indexOf(lvl) + 1].threshold)
    ).length;
    return { ...lvl, count };
  });

  // Top corretores by indications
  const corretorIndicationCounts: Record<string, { nome: string; count: number }> = {};
  (indications || []).forEach((ind: any) => {
    const id = ind.indicador_id;
    if (!corretorIndicationCounts[id]) {
      corretorIndicationCounts[id] = { nome: ind.indicador?.nome || "—", count: 0 };
    }
    corretorIndicationCounts[id].count++;
  });
  const topCorretores = Object.values(corretorIndicationCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Alerts
  const inactiveUsers = allUsers.filter((u: any) => u.status === "pendente").length;
  const profitShare = adminCalc.profitShare;

  return (
    <DashboardShell title="Painel Admin" userName={profile?.nome} onSignOut={signOut} navItems={adminNav}>
      <h1 className="text-2xl font-heading font-bold mb-6">
        Painel <span className="text-primary">Admin</span>
      </h1>

      {/* ═══════════════ 1. TOPO — KPIs ═══════════════ */}
      <KPIGrid columns={4} items={[
        {
          title: "Receita total",
          value: totalRevenue,
          icon: DollarSign,
          subtitle: "Total movimentado no sistema",
        },
        {
          title: "Usuários cadastrados",
          value: allUsers.length,
          icon: Users,
          format: "number",
          subtitle: `C:${countByRole("cliente")} Cor:${countByRole("corretor")} Fom:${countByRole("fomentador")} Fra:${countByRole("franqueado")}`,
        },
        {
          title: "Comissões pagas",
          value: adminCalc.totalComissoes,
          icon: TrendingUp,
          subtitle: "Total distribuído para rede",
        },
        {
          title: "Royalties",
          value: adminCalc.totalRoyalties,
          icon: BarChart3,
          subtitle: "Total pago aos fomentadores",
        },
      ]} />

      {/* ═══════════════ 2. VISÃO FINANCEIRA ═══════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Receita por Tipo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Investimentos (fomentadores)", value: adminCalc.totalInvestimentos },
              { label: "Cashback (clientes)", value: adminCalc.totalCashback },
              { label: "Comissões (corretores)", value: adminCalc.totalComissoes },
              { label: "Royalties", value: adminCalc.totalRoyalties },
              { label: "Marketplace", value: adminCalc.totalMarketplace },
              { label: "Total", value: totalRevenue, highlight: true },
            ].map((row) => (
              <div key={row.label} className={`flex justify-between items-center py-1.5 ${row.highlight ? "border-t border-primary/30 pt-2 font-bold" : "border-b border-border"}`}>
                <span className={`text-sm ${row.highlight ? "" : "text-muted-foreground"}`}>{row.label}</span>
                <span className={`text-sm text-primary ${row.highlight ? "font-bold" : ""}`}>{formatBRL(row.value)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Distribuição de Ganhos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Total comissão corretor", value: adminCalc.totalComissoes },
              { label: "Total royalties fomentador", value: adminCalc.totalRoyalties },
              { label: "Total marketplace", value: adminCalc.totalMarketplace },
              { label: "Total cashback clientes", value: adminCalc.totalCashback },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-border">
                <span className="text-sm text-muted-foreground">{row.label}</span>
                <span className="text-sm text-primary">{formatBRL(row.value)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ═══════════════ 3. USUÁRIOS ═══════════════ */}
      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-5 h-5 text-primary" />
            Usuários
          </CardTitle>
          <CardDescription>Gerenciamento de todos os usuários do sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Buscar por nome ou email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="h-9"
              />
            </div>
            <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Filtrar role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="cliente">Clientes</SelectItem>
                <SelectItem value="corretor">Corretores</SelectItem>
                <SelectItem value="fomentador">Fomentadores</SelectItem>
                <SelectItem value="franqueado">Franqueados</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User counts */}
          <div className="grid grid-cols-5 gap-2">
            {[
              { label: "Clientes", val: countByRole("cliente") },
              { label: "Corretores", val: countByRole("corretor") },
              { label: "Fomentadores", val: countByRole("fomentador") },
              { label: "Franqueados", val: countByRole("franqueado") },
              { label: "Admins", val: countByRole("admin") },
            ].map((item) => (
              <div key={item.label} className="bg-muted rounded-lg p-2 border border-border text-center">
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
                <p className="text-lg font-bold text-primary">{item.val}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 font-medium">Nome</th>
                  <th className="text-left py-2 font-medium">Email</th>
                  <th className="text-left py-2 font-medium">Tipo</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-left py-2 font-medium">Cadastro</th>
                  <th className="text-right py-2 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.slice(0, 20).map((u: any) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-2 font-medium">{u.nome || "—"}</td>
                    <td className="py-2 text-muted-foreground">{u.email}</td>
                    <td className="py-2">
                      <Badge variant="outline" className="text-[10px] border-primary/40 text-primary capitalize">
                        {u.tipo_usuario}
                      </Badge>
                    </td>
                    <td className="py-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          u.status === "aprovado" ? "border-green-500/40 text-green-500"
                            : u.status === "rejeitado" ? "border-destructive/40 text-destructive"
                            : "border-primary/40 text-primary"
                        }`}
                      >
                        {u.status}
                      </Badge>
                    </td>
                    <td className="py-2 text-muted-foreground text-xs">
                      {new Date(u.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-2 text-right">
                      <Button variant="ghost" size="sm" className="text-xs text-primary h-7">
                        <Eye className="w-3 h-3 mr-1" /> Ver
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length > 20 && (
              <p className="text-xs text-muted-foreground mt-2">
                Mostrando 20 de {filteredUsers.length} usuários
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════ 4. KYC ═══════════════ */}
      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileCheck className="w-5 h-5 text-primary" />
            Verificação de Usuários (KYC)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Pendentes", val: kycPending, color: "text-primary" },
              { label: "Aprovados", val: kycApproved, color: "text-green-500" },
              { label: "Rejeitados", val: kycRejected, color: "text-destructive" },
            ].map((item) => (
              <div key={item.label} className="bg-muted rounded-lg p-3 border border-border text-center">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className={`text-2xl font-bold ${item.color} mt-1`}>{item.val}</p>
              </div>
            ))}
          </div>

          {(kycDocs || []).filter((d: any) => d.status === "pendente").length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Pendentes de aprovação</h4>
              <div className="space-y-2">
                {(kycDocs || [])
                  .filter((d: any) => d.status === "pendente")
                  .slice(0, 10)
                  .map((d: any) => (
                    <div key={d.id} className="flex justify-between items-center py-2 border-b border-border">
                      <div>
                        <p className="text-sm font-medium">{d.profiles?.nome || "—"}</p>
                        <p className="text-xs text-muted-foreground">{d.document_type} — {new Date(d.created_at).toLocaleDateString("pt-BR")}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs border-green-500/40 text-green-500 h-7">
                          <CheckCircle className="w-3 h-3 mr-1" /> Aprovar
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs border-destructive/40 text-destructive h-7">
                          <XCircle className="w-3 h-3 mr-1" /> Rejeitar
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══════════════ 5. TRANSAÇÕES ═══════════════ */}
      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="w-5 h-5 text-primary" />
            Transações
          </CardTitle>
          <CardDescription>Todas as transações do sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Select value={txTypeFilter} onValueChange={setTxTypeFilter}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="cashback">Cashback</SelectItem>
                <SelectItem value="royalty">Royalty</SelectItem>
                <SelectItem value="comissao">Comissão</SelectItem>
                <SelectItem value="investimento">Investimento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 font-medium">Usuário</th>
                  <th className="text-left py-2 font-medium">Tipo</th>
                  <th className="text-left py-2 font-medium">Origem</th>
                  <th className="text-right py-2 font-medium">Valor</th>
                  <th className="text-right py-2 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {filteredTx.slice(0, 20).map((t: any) => (
                  <tr key={t.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-2">
                      <p className="font-medium">{t.profiles?.nome || "—"}</p>
                      <p className="text-xs text-muted-foreground">{t.profiles?.email}</p>
                    </td>
                    <td className="py-2">
                      <Badge variant="outline" className="text-[10px] capitalize border-primary/40 text-primary">
                        {t.tipo}
                      </Badge>
                    </td>
                    <td className="py-2 text-muted-foreground capitalize text-xs">
                      {t.profiles?.tipo_usuario || "—"}
                    </td>
                    <td className="py-2 text-right text-primary font-bold">
                      {formatBRL(safeNumber(t.valor))}
                    </td>
                    <td className="py-2 text-right text-muted-foreground text-xs">
                      {new Date(t.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTx.length > 20 && (
              <p className="text-xs text-muted-foreground mt-2">
                Mostrando 20 de {filteredTx.length} transações
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════ 6. MARKETPLACE ═══════════════ */}
      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Marketplace
          </CardTitle>
          <CardDescription>Produtos, vendas e receita do marketplace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: "Total vendas marketplace", val: formatBRL(adminCalc.totalMarketplace) },
              { label: "Total comissões marketplace", val: formatBRL(adminCalc.totalMarketplaceComissoes) },
              { label: "Produtos cadastrados", val: (marketplaceProducts || []).length.toString() },
            ].map((item) => (
              <div key={item.label} className="bg-muted rounded-lg p-3 border border-border text-center">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-lg font-bold text-primary mt-1">{item.val}</p>
              </div>
            ))}
          </div>

          {marketplaceProducts && marketplaceProducts.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 font-medium">Produto</th>
                    <th className="text-right py-2 font-medium">Preço</th>
                    <th className="text-right py-2 font-medium">Comissão %</th>
                    <th className="text-right py-2 font-medium">Vendas</th>
                  </tr>
                </thead>
                <tbody>
                  {marketplaceProducts.map((p: any) => {
                    const salesCount = (marketplaceSales || []).filter((s: any) => s.produto_id === p.id).length;
                    const salesRevenue = (marketplaceSales || [])
                      .filter((s: any) => s.produto_id === p.id)
                      .reduce((sum: number, s: any) => sum + safeNumber(s.valor), 0);
                    return (
                      <tr key={p.id} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="py-2 font-medium">{p.nome}</td>
                        <td className="py-2 text-right text-primary">{formatBRL(safeNumber(p.preco))}</td>
                        <td className="py-2 text-right text-muted-foreground">{p.comissao_percentual}%</td>
                        <td className="py-2 text-right">
                          <span className="text-primary font-medium">{salesCount}</span>
                          <span className="text-muted-foreground text-xs ml-1">({formatBRL(salesRevenue)})</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══════════════ 7. EXPANSÃO ═══════════════ */}
      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-5 h-5 text-primary" />
            Expansão
          </CardTitle>
          <CardDescription>Distribuição de usuários por nível no plano de expansão</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
            <div className="bg-muted rounded-lg p-3 border border-border text-center col-span-full md:col-span-1">
              <p className="text-xs text-muted-foreground">Total de pontos</p>
              <p className="text-xl font-bold text-primary">
                {(expansionPoints || []).reduce((s: number, ep: any) => s + safeNumber(ep.pontos), 0).toLocaleString("pt-BR")}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {levelDistribution.map((lvl) => (
              <div key={lvl.name} className="flex justify-between items-center py-2 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{lvl.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({lvl.threshold >= 1000000
                      ? `${(lvl.threshold / 1000000).toFixed(0)}M`
                      : lvl.threshold >= 1000
                        ? `${(lvl.threshold / 1000).toFixed(lvl.threshold % 1000 === 0 ? 0 : 1)}K`
                        : lvl.threshold} pts)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{lvl.reward}</span>
                  <Badge variant="outline" className="text-xs border-primary/40 text-primary min-w-[40px] justify-center">
                    {lvl.count}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════ 8. REDE ═══════════════ */}
      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Link2 className="w-5 h-5 text-primary" />
            Rede
          </CardTitle>
          <CardDescription>Indicações e crescimento da rede</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-muted rounded-lg p-3 border border-border text-center">
              <p className="text-xs text-muted-foreground">Total de indicações</p>
              <p className="text-2xl font-bold text-primary">{(indications || []).length}</p>
            </div>
          </div>

          {topCorretores.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Top Corretores (por indicações)</h4>
              <div className="space-y-2">
                {topCorretores.map((c, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-bold w-5">#{idx + 1}</span>
                      <span className="text-sm font-medium">{c.nome}</span>
                    </div>
                    <Badge variant="outline" className="text-xs border-primary/40 text-primary">
                      {c.count} indicações
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══════════════ 9. PARTICIPAÇÃO NOS LUCROS ═══════════════ */}
      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-5 h-5 text-primary" />
            Participação nos Lucros — Pool Global
            <ProjectionBadge />
          </CardTitle>
          <CardDescription>
            Pools globais de bonificação. Valores exibidos como estimativa do pool — não distribuição individual automática.
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
        </CardContent>
      </Card>

      {/* ═══════════════ 10. CONFIGURAÇÕES ═══════════════ */}
      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="w-5 h-5 text-primary" />
            Controle do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Taxa de saque", value: "5%", desc: "Aplicada para contas externas" },
              { label: "Saque mínimo", value: "R$ 100,00", desc: "Valor mínimo para solicitação" },
              { label: "Marketplace", value: "Ativo", desc: "Sistema de produtos e vendas" },
            ].map((item) => (
              <div key={item.label} className="bg-muted rounded-lg p-4 border border-border">
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-xl font-bold text-primary mt-1">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════ 11. ALERTAS ═══════════════ */}
      <Card className="bg-card border-border mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Alertas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {kycPending > 0 && (
              <div className="flex items-center gap-3 bg-primary/5 rounded-lg p-3 border border-primary/20">
                <FileCheck className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium">KYC Pendente</p>
                  <p className="text-xs text-muted-foreground">{kycPending} documento(s) aguardando revisão</p>
                </div>
              </div>
            )}
            {inactiveUsers > 0 && (
              <div className="flex items-center gap-3 bg-primary/5 rounded-lg p-3 border border-primary/20">
                <Users className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium">Usuários Pendentes</p>
                  <p className="text-xs text-muted-foreground">{inactiveUsers} usuário(s) com status pendente</p>
                </div>
              </div>
            )}
            {kycPending === 0 && inactiveUsers === 0 && (
              <div className="flex items-center gap-3 bg-green-500/5 rounded-lg p-3 border border-green-500/20">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                <p className="text-sm text-muted-foreground">Nenhum alerta no momento</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
