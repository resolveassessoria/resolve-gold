import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileCheck, DollarSign, Settings, ShoppingBag, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function AdminDashboard() {
  const { user, profile, loading, signOut } = useAuth("admin");
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tipoFilter, setTipoFilter] = useState<string>("all");

  const { data: users } = useQuery({
    queryKey: ["admin-users", statusFilter, tipoFilter],
    queryFn: async () => {
      let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      if (tipoFilter !== "all") query = query.eq("tipo_usuario", tipoFilter);
      const { data } = await query;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: kycDocs } = useQuery({
    queryKey: ["admin-kyc"],
    queryFn: async () => {
      const { data } = await supabase.from("kyc_documents").select("*, profiles(nome, email)").eq("status", "pendente");
      return data || [];
    },
    enabled: !!user,
  });

  const { data: transactions } = useQuery({
    queryKey: ["admin-transactions"],
    queryFn: async () => {
      const { data } = await supabase.from("transactions").select("*, profiles(nome)").order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
    enabled: !!user,
  });

  const approveKYC = useMutation({
    mutationFn: async ({ docId, status }: { docId: string; status: string }) => {
      await supabase.from("kyc_documents").update({ status }).eq("id", docId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-kyc"] });
      toast.success("KYC atualizado!");
    },
  });

  const updateUserStatus = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      await supabase.from("profiles").update({ status }).eq("id", userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Status atualizado!");
    },
  });

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const navItems = [
    { label: "Visão Geral", href: "/admin", icon: Activity },
    { label: "Usuários", href: "/admin", icon: Users },
    { label: "KYC", href: "/admin", icon: FileCheck },
    { label: "Transações", href: "/admin", icon: DollarSign },
    { label: "Marketplace", href: "/admin", icon: ShoppingBag },
    { label: "Configurações", href: "/admin", icon: Settings },
  ];

  return (
    <DashboardLayout title="Painel Admin" userName={profile?.nome} onSignOut={signOut} navItems={navItems}>
      <h1 className="text-2xl font-heading font-bold mb-6">Painel <span className="text-primary">Admin</span></h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card border-gold">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Usuários</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-primary">{users?.length || 0}</p></CardContent>
        </Card>
        <Card className="bg-card border-gold">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">KYC Pendente</CardTitle>
            <FileCheck className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-primary">{kycDocs?.length || 0}</p></CardContent>
        </Card>
        <Card className="bg-card border-gold">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Transações</CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-primary">{transactions?.length || 0}</p></CardContent>
        </Card>
        <Card className="bg-card border-gold">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pendentes</CardTitle>
            <Activity className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-primary">{users?.filter((u: any) => u.status === "pendente").length || 0}</p></CardContent>
        </Card>
      </div>

      {/* KYC Review */}
      <Card className="bg-card border-gold mb-8">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileCheck className="w-5 h-5 text-primary" /> Revisão KYC</CardTitle></CardHeader>
        <CardContent>
          {kycDocs && kycDocs.length > 0 ? (
            <div className="space-y-3">
              {kycDocs.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border border-gold rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{doc.profiles?.nome || "Usuário"}</p>
                    <p className="text-xs text-muted-foreground capitalize">{doc.document_type} — {doc.profiles?.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => approveKYC.mutate({ docId: doc.id, status: "aprovado" })}>Aprovar</Button>
                    <Button size="sm" variant="outline" className="border-destructive text-destructive" onClick={() => approveKYC.mutate({ docId: doc.id, status: "rejeitado" })}>Rejeitar</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum KYC pendente.</p>
          )}
        </CardContent>
      </Card>

      {/* Users */}
      <Card className="bg-card border-gold mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Usuários</CardTitle>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 bg-input border-gold text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="rejeitado">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-32 bg-input border-gold text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Tipos</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="corretor">Corretor</SelectItem>
                  <SelectItem value="fomentador">Fomentador</SelectItem>
                  <SelectItem value="franqueado">Franqueado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users?.slice(0, 20).map((u: any) => (
              <div key={u.id} className="flex items-center justify-between p-3 border border-gold rounded-lg">
                <div>
                  <p className="text-sm font-medium">{u.nome}</p>
                  <p className="text-xs text-muted-foreground">{u.email} — {u.cpf}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-primary text-primary capitalize">{u.tipo_usuario}</Badge>
                  <Select value={u.status} onValueChange={(val) => updateUserStatus.mutate({ userId: u.id, status: val })}>
                    <SelectTrigger className="w-28 bg-input border-gold text-xs h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="aprovado">Aprovado</SelectItem>
                      <SelectItem value="rejeitado">Rejeitado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card className="bg-card border-gold">
        <CardHeader><CardTitle className="text-lg">Transações Recentes</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {transactions?.map((t: any) => (
              <div key={t.id} className="flex justify-between items-center py-2 border-b border-gold last:border-0">
                <div>
                  <p className="text-sm font-medium">{t.profiles?.nome || "—"}</p>
                  <p className="text-xs text-muted-foreground capitalize">{t.tipo} — {new Date(t.created_at).toLocaleDateString("pt-BR")}</p>
                </div>
                <p className="text-primary font-bold">R$ {Number(t.valor).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
