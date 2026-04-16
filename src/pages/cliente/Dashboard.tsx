import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { clienteNav } from "@/components/dashboard/nav/clienteNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CreditCard, ShieldCheck, DollarSign, TrendingUp, Calculator,
  Gift, Store, Landmark, Wallet, Link2, FileText, CheckCircle,
  Clock, Loader2, PlayCircle, BadgeCheck, AlertCircle, ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ProjectionBadge } from "@/components/dashboard/ProjectionBadge";
import { WithdrawalSimulator } from "@/components/dashboard/WithdrawalSimulator";
import { calculateClientDashboard } from "@/lib/calculations/client";
import { calculateBalance } from "@/lib/calculations/finance";
import { formatBRL, safeNumber, sumByFilter } from "@/lib/utils/currency";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const SERVICE_STATUSES = [
  { key: "aguardando", label: "Aguardando pagamento", icon: Clock, color: "text-yellow-500" },
  { key: "pago", label: "Pagamento confirmado", icon: CheckCircle, color: "text-green-500" },
  { key: "analise", label: "Em análise", icon: Loader2, color: "text-blue-400" },
  { key: "andamento", label: "Em andamento", icon: PlayCircle, color: "text-primary" },
  { key: "concluido", label: "Concluído", icon: BadgeCheck, color: "text-green-500" },
];

const MARKETPLACE_ITEMS = [
  { nome: "Maquininha de cartão", desc: "Facilite seus recebimentos", icon: CreditCard },
  { nome: "Chip de celular", desc: "Conectividade com vantagens", icon: ShoppingBag },
  { nome: "Streaming", desc: "Acesso a entretenimento", icon: PlayCircle },
  { nome: "Rastreador veicular", desc: "Segurança para seu veículo", icon: ShieldCheck },
  { nome: "Seguro de vida", desc: "Proteção para você e sua família", icon: ShieldCheck },
  { nome: "Plano médico", desc: "Cuide da sua saúde", icon: BadgeCheck },
  { nome: "Cursos EAD", desc: "Capacitação profissional", icon: FileText },
];

export default function ClienteDashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const [debtInput, setDebtInput] = useState("7000");

  const { data: transactions } = useQuery({
    queryKey: ["cliente-transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: kycDocs } = useQuery({
    queryKey: ["cliente-kyc", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("kyc_documents").select("*").eq("user_id", user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: marketplaceProducts } = useQuery({
    queryKey: ["marketplace-products"],
    queryFn: async () => {
      const { data } = await supabase.from("marketplace_products").select("*").order("nome");
      return data || [];
    },
  });

  const debtValue = safeNumber(debtInput);
  const calc = calculateClientDashboard(debtValue);
  const balance = calculateBalance(transactions || []);
  const cashbackReal = sumByFilter(transactions || [], (t: any) => t.tipo === "cashback");
  const referralLink = `${window.location.origin}/register?ref=${user?.id}`;

  // KYC status
  const kycCount = kycDocs?.length || 0;
  const kycApproved = kycDocs?.filter((d: any) => d.status === "aprovado").length || 0;
  const kycStatus = kycCount === 0 ? "Pendente" : kycApproved >= 3 ? "Aprovado" : kycDocs?.some((d: any) => d.status === "rejeitado") ? "Rejeitado" : "Em análise";
  const kycStatusColor = kycStatus === "Aprovado" ? "text-green-500" : kycStatus === "Rejeitado" ? "text-destructive" : "text-yellow-500";

  // Service status (mock - no real field yet)
  const currentServiceStatus = "aguardando";
  const currentStatusIndex = SERVICE_STATUSES.findIndex(s => s.key === currentServiceStatus);

  if (loading) return null;

  return (
    <DashboardShell title="Painel do Cliente" userName={profile?.nome} onSignOut={signOut} navItems={clienteNav}>
      <h1 className="text-2xl font-heading font-bold mb-6">
        Painel do <span className="text-primary">Cliente</span>
      </h1>

      {/* ====== SEÇÃO 1: LIMPE E GANHE ====== */}
      <Card className="bg-card border-gold overflow-hidden">
        <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-heading font-bold text-primary">🧹 Limpe e Ganhe</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Regularize seu nome e desbloqueie benefícios financeiros exclusivos.
              </p>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Contratar serviço
            </Button>
          </div>

          {/* Benefícios inclusos */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">
            {[
              { icon: Landmark, label: "Conta bancária" },
              { icon: CreditCard, label: "Cartão de crédito" },
              { icon: Wallet, label: "Cartão pré-pago" },
              { icon: TrendingUp, label: "Crédito bancário até 10%" },
              { icon: Gift, label: "Cashback por 6 meses" },
            ].map((b) => (
              <div key={b.label} className="bg-card/60 backdrop-blur rounded-lg p-3 border border-gold/30 text-center">
                <b.icon className="w-5 h-5 text-primary mx-auto mb-1.5" />
                <p className="text-xs font-medium">{b.label}</p>
              </div>
            ))}
          </div>

          {/* Preço */}
          <div className="mt-4 bg-card/60 backdrop-blur rounded-lg p-3 border border-gold/30">
            <p className="text-xs text-muted-foreground">Preço do serviço:</p>
            <p className="text-sm mt-1">
              Até <strong className="text-primary">R$ 7.000</strong> de dívida → <strong className="text-primary">R$ 700</strong>
            </p>
            <p className="text-sm">
              Acima de <strong className="text-primary">R$ 7.001</strong> → <strong className="text-primary">10%</strong> do valor da dívida
            </p>
          </div>
        </div>
      </Card>

      {/* ====== SEÇÃO 2: SIMULADOR + CARDS DE RESULTADO ====== */}
      <Card className="bg-card border-gold mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calculator className="w-5 h-5 text-primary" />
            Simulador de Serviço
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">Valor da Dívida (R$)</Label>
            <Input
              type="number"
              value={debtInput}
              onChange={(e) => setDebtInput(e.target.value)}
              className="mt-1 max-w-xs"
              placeholder="7000"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {/* Valor do Serviço */}
        <Card className="bg-card border-gold">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Valor do serviço
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{formatBRL(calc.servicePrice)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {calc.appliedPercent ? `${(calc.appliedPercent * 100)}% da dívida` : "Valor fixo mínimo"}
            </p>
          </CardContent>
        </Card>

        {/* Crédito Bancário */}
        <Card className="bg-card border-gold">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Crédito disponível
              <ProjectionBadge label="Estimativa" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{formatBRL(calc.creditForecast)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Até 10% do valor pago</p>
            <p className="text-[10px] text-yellow-500 mt-0.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Sujeito à análise
            </p>
          </CardContent>
        </Card>

        {/* Cashback Mensal */}
        <Card className="bg-card border-gold">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Gift className="w-4 h-4 text-primary" />
              Cashback mensal
              <ProjectionBadge label="Estimativa" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{formatBRL(calc.monthlyCashback)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Até 2% ao mês sobre o valor pago</p>
          </CardContent>
        </Card>

        {/* Cashback Total */}
        <Card className="bg-card border-gold">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Gift className="w-4 h-4 text-primary" />
              Cashback total
              <ProjectionBadge label="Estimativa" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{formatBRL(calc.cashbackSixMonths)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Acumulado em até 6 meses</p>
          </CardContent>
        </Card>
      </div>

      {/* ====== SEÇÃO 3: STATUS DO SERVIÇO ====== */}
      <Card className="bg-card border-gold mt-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Status do seu processo
          </CardTitle>
          <p className="text-sm text-muted-foreground">Acompanhe aqui o andamento do seu serviço</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {SERVICE_STATUSES.map((status, idx) => {
              const isActive = idx === currentStatusIndex;
              const isDone = idx < currentStatusIndex;
              const StatusIcon = status.icon;
              return (
                <div
                  key={status.key}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    isActive
                      ? "border-primary bg-primary/10"
                      : isDone
                        ? "border-green-500/30 bg-green-500/5"
                        : "border-gold/20 bg-muted/30 opacity-50"
                  }`}
                >
                  <StatusIcon className={`w-5 h-5 shrink-0 ${isActive ? status.color : isDone ? "text-green-500" : "text-muted-foreground"}`} />
                  <span className={`text-sm font-medium ${isActive ? "text-foreground" : isDone ? "text-green-500" : "text-muted-foreground"}`}>
                    {status.label}
                  </span>
                  {isActive && (
                    <Badge className="ml-auto bg-primary/20 text-primary border-primary/30 text-[10px]">Atual</Badge>
                  )}
                  {isDone && (
                    <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ====== SEÇÃO 4: KYC ====== */}
      <Card className="bg-card border-gold mt-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Verificação (KYC)
          </CardTitle>
          <p className="text-sm text-muted-foreground">Envie seus documentos para liberar todos os benefícios</p>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm">Status:</span>
            <Badge variant="outline" className={`${kycStatusColor} border-current`}>
              {kycStatus}
            </Badge>
          </div>
          <Button variant="outline" className="border-primary text-primary">
            <FileText className="w-4 h-4 mr-2" /> Enviar documentos
          </Button>
        </CardContent>
      </Card>

      {/* ====== SEÇÃO 5: PAGAMENTO ====== */}
      <Card className="bg-card border-gold mt-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Pagamento do serviço
          </CardTitle>
          <p className="text-sm text-muted-foreground">Finalize o pagamento para iniciar seu processo</p>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Badge variant="outline" className="text-yellow-500 border-yellow-500/40">
            Pagamento pendente
          </Badge>
          <Button disabled className="opacity-60">Pagar — Em breve</Button>
        </CardContent>
      </Card>

      {/* ====== SEÇÃO 6: MARKETPLACE ====== */}
      <Card className="bg-card border-gold mt-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            Outros serviços disponíveis
          </CardTitle>
          <p className="text-sm text-muted-foreground">Explore produtos e serviços disponíveis no ecossistema</p>
        </CardHeader>
        <CardContent>
          {/* Real products from DB */}
          {marketplaceProducts && marketplaceProducts.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
              {marketplaceProducts.map((p: any) => (
                <div key={p.id} className="bg-muted rounded-lg p-3 border border-gold/30 flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-medium">{p.nome}</p>
                    <p className="text-primary font-bold mt-1">{formatBRL(safeNumber(p.preco))}</p>
                  </div>
                  <Button variant="outline" size="sm" className="mt-2 border-primary/40 text-primary text-xs w-full">
                    Ver produto
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Fallback showcase items */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {MARKETPLACE_ITEMS.map((item) => (
              <div key={item.nome} className="bg-muted rounded-lg p-3 border border-gold/30 text-center">
                <item.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">{item.nome}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{item.desc}</p>
                <Button variant="outline" size="sm" className="mt-2 border-primary/40 text-primary text-xs w-full">
                  Ver produto
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ====== SEÇÃO 7: TRANSAÇÕES ====== */}
      <Card className="bg-card border-gold mt-6">
        <CardHeader>
          <CardTitle className="text-base">Histórico</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.slice(0, 8).map((t: any) => (
                <div key={t.id} className="flex justify-between items-center py-2 border-b border-gold last:border-0">
                  <div>
                    <p className="text-sm font-medium capitalize">{t.tipo}</p>
                    <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString("pt-BR")}</p>
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

      {/* ====== INDICAÇÃO (ÁREA SECUNDÁRIA) ====== */}
      <Separator className="my-6 bg-gold/20" />
      <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Área secundária</p>
      <Card className="bg-card border-gold/40">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Indicação</p>
            <p className="text-xs text-muted-foreground">Compartilhe e ganhe bônus</p>
          </div>
          <Button variant="ghost" size="sm" className="text-primary text-xs"
            onClick={() => { navigator.clipboard.writeText(referralLink); toast.success("Link copiado!"); }}>
            <Link2 className="w-3.5 h-3.5 mr-1" /> Copiar Link
          </Button>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
