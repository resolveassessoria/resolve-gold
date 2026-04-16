import { useAuth } from "@/hooks/useAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { clienteNav } from "@/components/dashboard/nav/clienteNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validateUploadFile, generateSafeFilename } from "@/lib/utils/fileValidation";
import { logAudit } from "@/lib/utils/audit";

export default function ClienteDocumentos() {
  const { user, profile, loading, signOut } = useAuth();
  const queryClient = useQueryClient();

  const { data: docs } = useQuery({
    queryKey: ["cliente-docs", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("kyc_documents").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file before upload
    const validation = validateUploadFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      e.target.value = "";
      return;
    }

    // Generate safe filename (no personal data in path)
    const path = generateSafeFilename(user.id, docType, file.name);
    
    const { error } = await supabase.storage.from("kyc-documents").upload(path, file);
    if (error) { toast.error("Erro: " + error.message); return; }
    
    await supabase.from("kyc_documents").insert({ user_id: user.id, document_type: docType, file_url: path, status: "pendente" });
    await logAudit({ action: "kyc_upload", targetTable: "kyc_documents", metadata: { document_type: docType } });
    
    toast.success("Documento enviado!");
    queryClient.invalidateQueries({ queryKey: ["cliente-docs"] });
  };

  if (loading) return null;

  const statusColor = (s: string) => s === "aprovado" ? "bg-green-600/20 text-green-400" : s === "rejeitado" ? "bg-red-600/20 text-red-400" : "bg-yellow-600/20 text-yellow-400";

  return (
    <DashboardShell title="Documentos KYC" userName={profile?.nome} onSignOut={signOut} navItems={clienteNav}>
      <h1 className="text-2xl font-heading font-bold mb-6">Documentos <span className="text-primary">KYC</span></h1>

      <Card className="bg-card border-gold mb-8">
        <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5 text-primary" /> Enviar Documentos</CardTitle></CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-4">Formatos aceitos: PDF, JPG, PNG, WEBP. Tamanho máximo: 10MB.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["RG", "CPF", "Comprovante de Endereço"].map((doc) => (
              <div key={doc} className="space-y-2">
                <label className="text-sm font-medium">{doc}</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => handleUpload(e, doc.toLowerCase().replace(/ /g, '_'))}
                  className="block w-full text-xs text-muted-foreground file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-primary file:text-primary-foreground file:cursor-pointer"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-gold">
        <CardHeader><CardTitle>Documentos Enviados</CardTitle></CardHeader>
        <CardContent>
          {docs && docs.length > 0 ? (
            <div className="space-y-2">
              {docs.map((d: any) => (
                <div key={d.id} className="flex justify-between items-center py-3 border-b border-gold last:border-0">
                  <div>
                    <p className="text-sm font-medium capitalize">{d.document_type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <Badge className={statusColor(d.status)}>{d.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum documento enviado.</p>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
