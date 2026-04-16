import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminRoles } from "@/hooks/useAdminRoles";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminNavItems } from "@/components/admin/adminNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Users, FileCheck, DollarSign, Activity, TrendingUp, ShoppingBag,
  AlertTriangle, BarChart3, Eye, CheckCircle, XCircle, Search
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { calculateAdminDashboard } from "@/lib/calculations/admin";
import { EXPANSION_LEVELS } from "@/lib/calculations/expansion";
import { formatBRL, safeNumber } from "@/lib/utils/currency";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminDashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const { roles } = useAdminRoles(user?.id);

  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");
  const [txTypeFilter, setTxTypeFilter] = useState<string>("all");
  const [userSearch, setUserSearch] = useState("");

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

  const { data: marketplaceSales } = useQuery({
    queryKey: ["admin-marketplace-sales"],
    queryFn: async () => {
      const { data } = await supabase.from("marketplace_sales").select("*, marketplace_products(nome), profiles:corretor_id(nome)").order("created_at", { ascending: false });
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

  const { data: indications } = useQuery({
    queryKey: ["admin-all-indications"],
    queryFn: async () => {
      const { data } = await supabase.from("indications").select("*, indicador:indicador_id(nome, tipo_usuario), indicado:indicado_id(nome, tipo_usuario)");
      return data || [];
    },
    enabled: !!user,
  });

  if (loading) return null;

  const allTx = transactions || [];
  const allUsers = users || [];
  const totalRevenue = allTx.reduce((s: number, t: any) => s + safeNumber(t.valor), 0);

  const adminCalc = calculateAdminDashboard({
    transactions: allTx,
    marketplaceSales: marketplaceSales || [],
    globalProfit: totalRevenue,
  });

  const countByRole = (role: string) => allUsers.filter((u: any) => u.tipo_usuario === role).length;
  const kycPending = (kycDocs || []).filter((d: any) => d.status === "pendente").length;
  const kycApproved = (kycDocs || []).filter((d: any) => d.status === "aprovado").length;
  const kycRejected = (kycDocs || []).filter((d: any) => d.status === "rejeitado").length;

  const filteredUsers = allUsers
    .filter((u: any) => userRoleFilter === "all" || u.tipo_usuario === userRoleFilter)
    .filter((u: any) => {
      if (!userSearch) return true;
      const q = userSearch.toLowerCase();
      return u.nome?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    });

  const filteredTx = allTx.filter((t: any) => txTypeFilter === "all" || t.tipo === txTypeFilter);

  const inactiveUsers = allUsers.filter((u: any) => u.status === "pendente").length;

  return (
    <AdminShell userName={profile?.nome} onSignOut={signOut} navItems={adminNavItems} adminRoles={roles}>
      <h1 className="text-2xl font-heading font-bold mb-6">
        Painel <span className="text-red-400">Admin</span>
      </h1>

      <KPIGrid columns={4} items={[
        { title: "Receita total", value: totalRevenue, icon: DollarSign, subtitle: "Total movimentado no sistema" },
        { title: "Usuários cadastrados", value: allUsers.length, icon: Users, format: "number", subtitle: `C:${countByRole("cliente")} Cor:${countByRole("corretor")} Fom:${countByRole("fomentador")} Fra:${countByRole("franqueado")}` },
        { title: "Comissões pagas", value: adminCalc.totalComissoes, icon: TrendingUp, subtitle: "Total distribuído para rede" },
        { title: "Royalties", value: adminCalc.totalRoyalties, icon: BarChart3, subtitle: "Total pago aos fomentadores" },
      ]} />

      {/* Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="bg-[hsl(220,18%,7%)] border-[hsl(220,15%,15%)]">
          <CardHeader><CardTitle className="text-base">Receita por Tipo</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Investimentos", value: adminCalc.totalInvestimentos },
              { label: "Cashback", value: adminCalc.totalCashback },
              { label: "Comissões", value: adminCalc.totalComissoes },
              { label: "Royalties", value: adminCalc.totalRoyalties },
              { label: "Marketplace", value: adminCalc.totalMarketplace },
              { label: "Total", value: totalRevenue, highlight: true },
            ].map((row) => (
              <div key={row.label} className={`flex justify-between items-center py-1.5 ${row.highlight ? "border-t border-red-400/30 pt-2 font-bold" : "border-b border-[hsl(220,15%,12%)]"}`}>
                <span className={`text-sm ${row.highlight ? "" : "text-muted-foreground"}`}>{row.label}</span>
                <span className={`text-sm text-red-400 ${row.highlight ? "font-bold" : ""}`}>{formatBRL(row.value)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-[hsl(220,18%,7%)] border-[hsl(220,15%,15%)]">
          <CardHeader><CardTitle className="text-base">KYC</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Pendentes", val: kycPending, color: "text-yellow-400" },
                { label: "Aprovados", val: kycApproved, color: "text-green-400" },
                { label: "Rejeitados", val: kycRejected, color: "text-red-400" },
              ].map((item) => (
                <div key={item.label} className="bg-[hsl(220,15%,10%)] rounded-lg p-3 border border-[hsl(220,15%,15%)] text-center">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className={`text-2xl font-bold ${item.color} mt-1`}>{item.val}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      <Card className="bg-[hsl(220,18%,7%)] border-[hsl(220,15%,15%)] mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="w-5 h-5 text-yellow-400" /> Alertas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {kycPending > 0 && (
            <div className="flex items-center gap-2 text-sm text-yellow-400">
              <FileCheck className="w-4 h-4" /> {kycPending} documento(s) KYC pendente(s)
            </div>
          )}
          {inactiveUsers > 0 && (
            <div className="flex items-center gap-2 text-sm text-yellow-400">
              <Users className="w-4 h-4" /> {inactiveUsers} usuário(s) com status pendente
            </div>
          )}
          {kycPending === 0 && inactiveUsers === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum alerta no momento.</p>
          )}
        </CardContent>
      </Card>

      {/* Transações recentes */}
      <Card className="bg-[hsl(220,18%,7%)] border-[hsl(220,15%,15%)] mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="w-5 h-5 text-red-400" /> Transações Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-4">
            <Select value={txTypeFilter} onValueChange={setTxTypeFilter}>
              <SelectTrigger className="w-[160px] h-9 bg-[hsl(220,15%,10%)] border-[hsl(220,15%,15%)]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="cashback">Cashback</SelectItem>
                <SelectItem value="comissao">Comissão</SelectItem>
                <SelectItem value="royalty">Royalty</SelectItem>
                <SelectItem value="investimento">Investimento</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            {filteredTx.slice(0, 15).map((t: any) => (
              <div key={t.id} className="flex justify-between items-center py-2 border-b border-[hsl(220,15%,12%)] last:border-0">
                <div>
                  <p className="text-sm font-medium">{t.profiles?.nome || "—"}</p>
                  <p className="text-xs text-muted-foreground capitalize">{t.tipo} — {new Date(t.created_at).toLocaleDateString("pt-BR")}</p>
                </div>
                <p className="text-red-400 font-bold text-sm">{formatBRL(t.valor)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
