import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { adminNav } from "@/components/dashboard/nav/adminNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminKyc() {
  const { user, profile, loading, signOut } = useAuth();
  const queryClient = useQueryClient();

  const { data: docs } = useQuery({
    queryKey: ["admin-all-kyc"],
    queryFn: async () => {
      const { data } = await supabase.from("kyc_documents").select("*, profiles(nome, email)").order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const updateKyc = useMutation({
    mutationFn: async ({ docId, status }: { docId: string; status: "aprovado" | "rejeitado" }) => {
      await supabase.from("kyc_documents").update({ status }).eq("id", docId);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-all-kyc"] }); toast.success("KYC atualizado!"); },
  });

  if (loading) return null;

  const statusColor = (s: string) => s === "aprovado" ? "bg-green-600/20 text-green-400" : s === "rejeitado" ? "bg-red-600/20 text-red-400" : "bg-yellow-600/20 text-yellow-400";

  return (
    <DashboardShell title="KYC" userName={profile?.nome} onSignOut={signOut} navItems={adminNav}>
      <h1 className="text-2xl font-heading font-bold mb-6">Revisão <span className="text-primary">KYC</span></h1>

      <Card className="bg-card border-gold">
        <CardHeader><CardTitle className="flex items-center gap-2"><FileCheck className="w-5 h-5 text-primary" /> Documentos</CardTitle></CardHeader>
        <CardContent>
          {docs && docs.length > 0 ? (
            <div className="space-y-3">
              {docs.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border border-gold rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{doc.profiles?.nome || "Usuário"}</p>
                    <p className="text-xs text-muted-foreground capitalize">{doc.document_type.replace(/_/g, ' ')} — {doc.profiles?.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColor(doc.status)}>{doc.status}</Badge>
                    {doc.status === "pendente" && (
                      <>
                        <Button size="sm" onClick={() => updateKyc.mutate({ docId: doc.id, status: "aprovado" })}>Aprovar</Button>
                        <Button size="sm" variant="outline" className="border-destructive text-destructive" onClick={() => updateKyc.mutate({ docId: doc.id, status: "rejeitado" })}>Rejeitar</Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum documento encontrado.</p>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
