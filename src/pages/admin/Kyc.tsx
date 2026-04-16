import { useAuth } from "@/hooks/useAuth";
import { useAdminRoles } from "@/hooks/useAdminRoles";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminNavItems } from "@/components/admin/adminNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getKycSignedUrl } from "@/lib/utils/kycStorage";
import { useState } from "react";
import { maskEmail, maskCPF } from "@/lib/utils/masks";

export default function AdminKyc() {
  const { user, profile, loading, signOut } = useAuth();
  const { roles } = useAdminRoles(user?.id);
  const queryClient = useQueryClient();
  const [viewingDoc, setViewingDoc] = useState<string | null>(null);

  const { data: docs } = useQuery({
    queryKey: ["admin-all-kyc"],
    queryFn: async () => {
      const { data } = await supabase.from("kyc_documents").select("*, profiles(nome, email, cpf)").order("created_at", { ascending: false });
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

  const handleViewDocument = async (docId: string) => {
    setViewingDoc(docId);
    try {
      const url = await getKycSignedUrl(docId);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setViewingDoc(null);
    }
  };

  if (loading) return null;

  const statusColor = (s: string) => s === "aprovado" ? "bg-green-600/20 text-green-400" : s === "rejeitado" ? "bg-red-600/20 text-red-400" : "bg-yellow-600/20 text-yellow-400";

  return (
    <AdminShell userName={profile?.nome} onSignOut={signOut} navItems={adminNavItems} adminRoles={roles}>
      <h1 className="text-2xl font-heading font-bold mb-6">Revisão <span className="text-red-400">KYC</span></h1>

      <Card className="bg-[hsl(220,18%,7%)] border-[hsl(220,15%,15%)]">
        <CardHeader><CardTitle className="flex items-center gap-2"><FileCheck className="w-5 h-5 text-red-400" /> Documentos</CardTitle></CardHeader>
        <CardContent>
          {docs && docs.length > 0 ? (
            <div className="space-y-3">
              {docs.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border border-[hsl(220,15%,15%)] rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{doc.profiles?.nome || "Usuário"}</p>
                    <p className="text-xs text-muted-foreground">
                      {maskEmail(doc.profiles?.email)} — {maskCPF(doc.profiles?.cpf)} — {doc.document_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{new Date(doc.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" disabled={viewingDoc === doc.id} onClick={() => handleViewDocument(doc.id)}>
                      {viewingDoc === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Badge className={statusColor(doc.status)}>{doc.status}</Badge>
                    {doc.status === "pendente" && (
                      <>
                        <Button size="sm" onClick={() => updateKyc.mutate({ docId: doc.id, status: "aprovado" })} className="bg-green-600 hover:bg-green-700 text-white">Aprovar</Button>
                        <Button size="sm" variant="outline" className="border-red-400/40 text-red-400" onClick={() => updateKyc.mutate({ docId: doc.id, status: "rejeitado" })}>Rejeitar</Button>
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
    </AdminShell>
  );
}
