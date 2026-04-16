import { useAuth } from "@/hooks/useAuth";
import { useAdminRoles } from "@/hooks/useAdminRoles";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminNavItems } from "@/components/admin/adminNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminAuditoria() {
  const { user, profile, loading, signOut } = useAuth();
  const { roles } = useAdminRoles(user?.id);

  const { data: logs } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: async () => {
      const { data } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100);
      return data || [];
    },
    enabled: !!user,
  });

  if (loading) return null;

  return (
    <AdminShell userName={profile?.nome} onSignOut={signOut} navItems={adminNavItems} adminRoles={roles}>
      <h1 className="text-2xl font-heading font-bold mb-6">
        <span className="text-red-400">Auditoria</span>
      </h1>

      <Card className="bg-[hsl(220,18%,7%)] border-[hsl(220,15%,15%)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="w-5 h-5 text-red-400" /> Logs de Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs && logs.length > 0 ? (
            <div className="space-y-2">
              {logs.map((log: any) => (
                <div key={log.id} className="flex justify-between items-start py-3 border-b border-[hsl(220,15%,12%)] last:border-0">
                  <div>
                    <Badge variant="outline" className="text-[10px] border-red-400/30 text-red-400 mb-1">
                      {log.action}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {log.target_table && `${log.target_table}`}
                      {log.target_id && ` → ${log.target_id.slice(0, 8)}...`}
                    </p>
                    {log.metadata && (
                      <pre className="text-[10px] text-muted-foreground/70 mt-1 max-w-md truncate">
                        {JSON.stringify(log.metadata)}
                      </pre>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString("pt-BR")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum log de auditoria encontrado.</p>
          )}
        </CardContent>
      </Card>
    </AdminShell>
  );
}
