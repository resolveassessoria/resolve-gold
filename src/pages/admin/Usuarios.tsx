import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { adminNav } from "@/components/dashboard/nav/adminNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export default function AdminUsuarios() {
  const { user, profile, loading, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [tipoFilter, setTipoFilter] = useState("all");

  const { data: users } = useQuery({
    queryKey: ["admin-users", statusFilter, tipoFilter],
    queryFn: async () => {
      let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (statusFilter !== "all") query = query.eq("status", statusFilter as any);
      if (tipoFilter !== "all") query = query.eq("tipo_usuario", tipoFilter as any);
      const { data } = await query;
      return data || [];
    },
    enabled: !!user,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: "pendente" | "aprovado" | "rejeitado" }) => {
      await supabase.from("profiles").update({ status }).eq("id", userId);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Atualizado!"); },
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: any }) => {
      await supabase.from("profiles").update({ tipo_usuario: role }).eq("id", userId);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Role atualizado!"); },
  });

  if (loading) return null;

  return (
    <DashboardShell title="Usuários" userName={profile?.nome} onSignOut={signOut} navItems={adminNav}>
      <h1 className="text-2xl font-heading font-bold mb-6">Gerenciar <span className="text-primary">Usuários</span></h1>

      <div className="flex gap-2 mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 bg-input border-gold text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="aprovado">Aprovado</SelectItem>
            <SelectItem value="rejeitado">Rejeitado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-36 bg-input border-gold text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Tipos</SelectItem>
            <SelectItem value="cliente">Cliente</SelectItem>
            <SelectItem value="fomentador">Fomentador</SelectItem>
            <SelectItem value="corretor">Corretor</SelectItem>
            <SelectItem value="franqueado">Franqueado</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-card border-gold">
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Usuários ({users?.length || 0})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users?.map((u: any) => (
              <div key={u.id} className="flex items-center justify-between p-3 border border-gold rounded-lg">
                <div>
                  <p className="text-sm font-medium">{u.nome}</p>
                  <p className="text-xs text-muted-foreground">{u.email} — {u.cpf || "Sem CPF"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={u.tipo_usuario} onValueChange={(val) => updateRole.mutate({ userId: u.id, role: val })}>
                    <SelectTrigger className="w-28 bg-input border-gold text-xs h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cliente">Cliente</SelectItem>
                      <SelectItem value="fomentador">Fomentador</SelectItem>
                      <SelectItem value="corretor">Corretor</SelectItem>
                      <SelectItem value="franqueado">Franqueado</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={u.status} onValueChange={(val) => updateStatus.mutate({ userId: u.id, status: val as any })}>
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
    </DashboardShell>
  );
}
