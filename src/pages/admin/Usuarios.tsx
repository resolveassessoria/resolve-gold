import { useAuth } from "@/hooks/useAuth";
import { useAdminRoles } from "@/hooks/useAdminRoles";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminNavItems } from "@/components/admin/adminNav";
import { maskCPF, maskEmail } from "@/lib/utils/masks";
import { logAudit } from "@/lib/utils/audit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import type { Database } from "@/integrations/supabase/types";
import {
  adminPermissionOptions,
  normalizeAdminPermissions,
  type AdminPermission,
} from "@/lib/access-control";
import { Shield, Users } from "lucide-react";

type ProfileStatus = Database["public"]["Enums"]["status_type"];
type UserRole = Database["public"]["Enums"]["tipo_usuario"];

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type AdminRoleAssignment = Pick<Database["public"]["Tables"]["admin_roles"]["Row"], "role" | "user_id">;

async function syncAdminPermissions({
  userId,
  permissions,
  existingPermissions,
}: {
  userId: string;
  permissions: AdminPermission[];
  existingPermissions: AdminPermission[];
}) {
  const normalizedPermissions = normalizeAdminPermissions(permissions);

  if (normalizedPermissions.length === 0) {
    throw new Error("Selecione pelo menos uma permissão administrativa.");
  }

  const permissionsToAdd = normalizedPermissions.filter((permission) => !existingPermissions.includes(permission));
  const permissionsToRemove = existingPermissions.filter((permission) => !normalizedPermissions.includes(permission));

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ tipo_usuario: "admin", status: "aprovado" })
    .eq("id", userId);

  if (profileError) {
    throw profileError;
  }

  if (permissionsToAdd.length > 0) {
    const { error } = await supabase.from("admin_roles").insert(
      permissionsToAdd.map((permission) => ({
        user_id: userId,
        role: permission,
      })),
    );

    if (error) {
      throw error;
    }
  }

  if (permissionsToRemove.length > 0) {
    const { error } = await supabase
      .from("admin_roles")
      .delete()
      .eq("user_id", userId)
      .in("role", permissionsToRemove);

    if (error) {
      throw error;
    }
  }

  await logAudit({
    action: "admin_permissions_updated",
    targetTable: "admin_roles",
    targetId: userId,
    metadata: { permissions: normalizedPermissions },
  });
}

export default function AdminUsuarios() {
  const { user, profile, loading, signOut } = useAuth();
  const { roles, isFullAdmin } = useAdminRoles(user?.id);
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [tipoFilter, setTipoFilter] = useState("all");
  const [adminEmail, setAdminEmail] = useState("");
  const [newAdminPermissions, setNewAdminPermissions] = useState<AdminPermission[]>([]);
  const [permissionDrafts, setPermissionDrafts] = useState<Record<string, AdminPermission[]>>({});

  const { data: users } = useQuery({
    queryKey: ["admin-users", statusFilter, tipoFilter],
    queryFn: async () => {
      let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (statusFilter !== "all") query = query.eq("status", statusFilter as any);
      if (tipoFilter !== "all") query = query.eq("tipo_usuario", tipoFilter as any);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: adminRoleAssignments } = useQuery({
    queryKey: ["admin-role-assignments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("admin_roles").select("user_id, role");
      if (error) throw error;
      return (data || []) as AdminRoleAssignment[];
    },
    enabled: !!user,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: ProfileStatus }) => {
      const { error } = await supabase.from("profiles").update({ status }).eq("id", userId);
      if (error) throw error;
      await logAudit({ action: "user_status_change", targetTable: "profiles", targetId: userId, metadata: { new_status: status } });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Atualizado!"); },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: Exclude<UserRole, "admin"> }) => {
      const { error } = await supabase.from("profiles").update({ tipo_usuario: role }).eq("id", userId);
      if (error) throw error;
      await logAudit({ action: "role_change", targetTable: "profiles", targetId: userId, metadata: { new_role: role } });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Perfil atualizado!"); },
    onError: (error: Error) => toast.error(error.message),
  });

  const promoteAdminByEmail = useMutation({
    mutationFn: async ({ email, permissions }: { email: string; permissions: AdminPermission[] }) => {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) {
        throw new Error("Informe um email para promover.");
      }

      const { data: targetProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .ilike("email", normalizedEmail)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (!targetProfile) {
        throw new Error("Esse email ainda não tem cadastro na plataforma.");
      }

      const existingPermissions = ((adminRoleAssignments || [])
        .filter((assignment) => assignment.user_id === targetProfile.id)
        .map((assignment) => assignment.role)) as AdminPermission[];

      await syncAdminPermissions({
        userId: targetProfile.id,
        permissions,
        existingPermissions,
      });
    },
    onSuccess: () => {
      setAdminEmail("");
      setNewAdminPermissions([]);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-role-assignments"] });
      toast.success("Admin configurado com sucesso.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateAdminPermissions = useMutation({
    mutationFn: async ({
      userId,
      permissions,
      existingPermissions,
    }: {
      userId: string;
      permissions: AdminPermission[];
      existingPermissions: AdminPermission[];
    }) => {
      await syncAdminPermissions({ userId, permissions, existingPermissions });
    },
    onSuccess: (_, variables) => {
      setPermissionDrafts((current) => {
        const next = { ...current };
        delete next[variables.userId];
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-role-assignments"] });
      toast.success("Permissões administrativas atualizadas.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const adminPermissionsByUser = (adminRoleAssignments || []).reduce<Record<string, AdminPermission[]>>((acc, assignment) => {
    if (!acc[assignment.user_id]) {
      acc[assignment.user_id] = [];
    }

    acc[assignment.user_id].push(assignment.role);
    return acc;
  }, {});

  const userList = (users || []) as ProfileRow[];
  const adminUsers = userList.filter((item) => item.tipo_usuario === "admin");

  const getPermissionsForUser = (userId: string) =>
    permissionDrafts[userId] || normalizeAdminPermissions(adminPermissionsByUser[userId] || []);

  const togglePermission = (
    currentPermissions: AdminPermission[],
    permission: AdminPermission,
    checked: boolean,
  ) => {
    if (checked) {
      return normalizeAdminPermissions([...currentPermissions, permission]);
    }

    return currentPermissions.filter((item) => item !== permission);
  };

  if (loading) return null;

  return (
    <AdminShell userName={profile?.nome} onSignOut={signOut} navItems={adminNavItems} adminRoles={roles}>
      <h1 className="text-2xl font-heading font-bold mb-6">Gerenciar <span className="text-red-400">Usuários</span></h1>

      <div className="flex gap-2 mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 bg-[hsl(220,15%,10%)] border-[hsl(220,15%,15%)] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="aprovado">Aprovado</SelectItem>
            <SelectItem value="rejeitado">Rejeitado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-36 bg-[hsl(220,15%,10%)] border-[hsl(220,15%,15%)] text-xs"><SelectValue /></SelectTrigger>
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

      <Card className="bg-[hsl(220,18%,7%)] border-[hsl(220,15%,15%)]">
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-red-400" /> Usuários ({users?.length || 0})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {userList.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-3 border border-[hsl(220,15%,15%)] rounded-lg">
                <div>
                  <p className="text-sm font-medium">{u.nome}</p>
                  <p className="text-xs text-muted-foreground">{maskEmail(u.email)} — {maskCPF(u.cpf)}</p>
                  {u.tipo_usuario === "admin" && (
                    <p className="text-[11px] text-red-300 mt-1">Permissões administrativas gerenciadas na seção abaixo.</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {u.tipo_usuario === "admin" ? (
                    <Badge variant="secondary" className="bg-red-400/10 text-red-300 border border-red-400/20">Admin</Badge>
                  ) : (
                    <Select
                      value={u.tipo_usuario}
                      onValueChange={(val) => updateRole.mutate({ userId: u.id, role: val as Exclude<UserRole, "admin"> })}
                      disabled={!isFullAdmin}
                    >
                      <SelectTrigger className="w-32 bg-[hsl(220,15%,10%)] border-[hsl(220,15%,15%)] text-xs h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cliente">Cliente</SelectItem>
                        <SelectItem value="fomentador">Fomentador</SelectItem>
                        <SelectItem value="corretor">Corretor</SelectItem>
                        <SelectItem value="franqueado">Franqueado</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <Select value={u.status} onValueChange={(val) => updateStatus.mutate({ userId: u.id, status: val as any })}>
                    <SelectTrigger className="w-28 bg-[hsl(220,15%,10%)] border-[hsl(220,15%,15%)] text-xs h-8"><SelectValue /></SelectTrigger>
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

      <div className="grid gap-6 mt-6 xl:grid-cols-[1.1fr,1.4fr]">
        <Card className="bg-[hsl(220,18%,7%)] border-[hsl(220,15%,15%)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-400" />
              Administradores e permissões
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-xl border border-red-400/15 bg-red-400/5 p-4 text-sm text-muted-foreground">
              <p className="text-white font-medium mb-2">Como funciona agora</p>
              <p>
                <span className="font-mono text-white">admin_full</span> enxerga tudo no admin e também pode entrar nos painéis de cliente, fomentador, corretor e franqueado.
                Os demais admins ficam limitados aos módulos marcados abaixo.
              </p>
            </div>

            {isFullAdmin ? (
              <>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Adicionar admin por email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={adminEmail}
                      onChange={(event) => setAdminEmail(event.target.value)}
                      placeholder="email@empresa.com"
                      className="bg-[hsl(220,15%,10%)] border-[hsl(220,15%,15%)]"
                    />
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Permissões administrativas</p>
                    {adminPermissionOptions.map((permission) => {
                      const checked = newAdminPermissions.includes(permission.value);
                      return (
                        <label
                          key={permission.value}
                          className="flex items-start gap-3 rounded-xl border border-[hsl(220,15%,15%)] bg-[hsl(220,15%,10%)] p-3 cursor-pointer"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) =>
                              setNewAdminPermissions((current) =>
                                togglePermission(current, permission.value, value === true),
                              )
                            }
                            className="mt-0.5"
                          />
                          <div>
                            <p className="text-sm font-medium text-white">{permission.label}</p>
                            <p className="text-xs text-muted-foreground">{permission.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <Button
                    onClick={() => promoteAdminByEmail.mutate({ email: adminEmail, permissions: newAdminPermissions })}
                    disabled={promoteAdminByEmail.isPending}
                    className="w-full bg-red-500 hover:bg-red-400 text-black font-semibold"
                  >
                    Promover e configurar admin
                  </Button>
                </div>

                <Separator className="bg-[hsl(220,15%,15%)]" />

                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Permissões dos admins atuais</p>
                  {adminUsers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum admin encontrado.</p>
                  ) : (
                    adminUsers.map((adminUser) => {
                      const currentPermissions = normalizeAdminPermissions(adminPermissionsByUser[adminUser.id] || []);
                      const selectedPermissions = getPermissionsForUser(adminUser.id);
                      const isCurrentUser = adminUser.id === user?.id;

                      return (
                        <div key={adminUser.id} className="rounded-xl border border-[hsl(220,15%,15%)] bg-[hsl(220,15%,10%)] p-4 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-white">{adminUser.nome}</p>
                              <p className="text-xs text-muted-foreground">{adminUser.email}</p>
                            </div>
                            <div className="flex flex-wrap justify-end gap-2">
                              {currentPermissions.length > 0 ? currentPermissions.map((permission) => {
                                const option = adminPermissionOptions.find((item) => item.value === permission);
                                return (
                                  <Badge key={permission} variant="secondary" className="bg-red-400/10 text-red-300 border border-red-400/20">
                                    {option?.label || permission}
                                  </Badge>
                                );
                              }) : (
                                <Badge variant="secondary">Sem permissões</Badge>
                              )}
                            </div>
                          </div>

                          <div className="grid gap-2">
                            {adminPermissionOptions.map((permission) => {
                              const checked = selectedPermissions.includes(permission.value);

                              return (
                                <label
                                  key={permission.value}
                                  className={`flex items-start gap-3 rounded-lg border border-[hsl(220,15%,15%)] px-3 py-2 ${isCurrentUser ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                                >
                                  <Checkbox
                                    checked={checked}
                                    disabled={isCurrentUser}
                                    onCheckedChange={(value) =>
                                      setPermissionDrafts((current) => ({
                                        ...current,
                                        [adminUser.id]: togglePermission(
                                          current[adminUser.id] || currentPermissions,
                                          permission.value,
                                          value === true,
                                        ),
                                      }))
                                    }
                                    className="mt-0.5"
                                  />
                                  <div>
                                    <p className="text-sm font-medium text-white">{permission.label}</p>
                                    <p className="text-xs text-muted-foreground">{permission.description}</p>
                                  </div>
                                </label>
                              );
                            })}
                          </div>

                          {isCurrentUser ? (
                            <p className="text-xs text-muted-foreground">Sua própria permissão fica travada aqui para evitar perda acidental de acesso total.</p>
                          ) : (
                            <Button
                              variant="outline"
                              className="border-red-400/30 text-red-300 hover:bg-red-400/10 hover:text-red-200"
                              onClick={() =>
                                updateAdminPermissions.mutate({
                                  userId: adminUser.id,
                                  permissions: selectedPermissions,
                                  existingPermissions: currentPermissions,
                                })
                              }
                              disabled={updateAdminPermissions.isPending}
                            >
                              Salvar permissões
                            </Button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-[hsl(220,15%,15%)] bg-[hsl(220,15%,10%)] p-4 text-sm text-muted-foreground">
                Só admins com <span className="text-white font-medium">acesso total</span> podem promover novos admins ou alterar permissões administrativas.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[hsl(220,18%,7%)] border-[hsl(220,15%,15%)]">
          <CardHeader>
            <CardTitle>Resumo de acesso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-xl border border-[hsl(220,15%,15%)] bg-[hsl(220,15%,10%)] p-4">
              <p className="text-white font-medium mb-2">anovaistecnologia@gmail.com</p>
              <p>
                Como esse usuário está com <span className="text-white">admin_full</span>, ele agora pode usar o painel admin e
                também entrar nas áreas de cliente, fomentador, corretor e franqueado pela barra de acessos rápidos.
              </p>
            </div>

            <div className="rounded-xl border border-[hsl(220,15%,15%)] bg-[hsl(220,15%,10%)] p-4 space-y-2">
              <p className="text-white font-medium">Recomendação de uso</p>
              <p>
                Use <span className="text-white">admin_full</span> só para quem realmente precisa de acesso total.
                Para times operacionais, marque apenas o módulo correspondente.
              </p>
            </div>

            <div className="grid gap-2">
              {adminPermissionOptions.map((permission) => (
                <div key={permission.value} className="rounded-lg border border-[hsl(220,15%,15%)] px-3 py-2">
                  <p className="text-white font-medium">{permission.label}</p>
                  <p className="text-xs">{permission.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
