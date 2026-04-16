import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CreditCard, TrendingUp, Link2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export default function ClienteDashboard() {
  const { user, profile, loading, signOut } = useAuth("cliente");

  const { data: transactions } = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const cashbackTotal = transactions
    ?.filter((t: any) => t.tipo === "cashback")
    .reduce((sum: number, t: any) => sum + Number(t.valor), 0) || 0;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const path = `${user.id}/${docType}_${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from("kyc-documents").upload(path, file);

    if (error) {
      toast.error("Erro no upload: " + error.message);
      return;
    }

    await supabase.from("kyc_documents").insert({
      user_id: user.id,
      document_type: docType,
      file_url: path,
      status: "pendente",
    });

    toast.success("Documento enviado para análise!");
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const referralLink = `${window.location.origin}/register?ref=${user?.id}`;

  return (
    <DashboardLayout title="Painel do Cliente" userName={profile?.nome} onSignOut={signOut}>
      <h1 className="text-2xl font-heading font-bold mb-6">Painel do <span className="text-primary">Cliente</span></h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-card border-gold">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Crédito Bancário</CardTitle>
            <CreditCard className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">10%</p>
            <p className="text-xs text-muted-foreground">do valor pago</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-gold">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Cashback Acumulado</CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">R$ {cashbackTotal.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">até 2%/mês por 6 meses</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-gold">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Link de Indicação</CardTitle>
            <Link2 className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              className="border-primary text-primary w-full text-xs"
              onClick={() => { navigator.clipboard.writeText(referralLink); toast.success("Link copiado!"); }}
            >
              Copiar Link
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Document Upload */}
      <Card className="bg-card border-gold mb-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" /> Documentos KYC
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["RG", "CPF", "Comprovante de Endereço"].map((doc) => (
            <div key={doc} className="space-y-2">
              <label className="text-sm font-medium">{doc}</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleUpload(e, doc.toLowerCase().replace(/ /g, '_'))}
                className="block w-full text-xs text-muted-foreground file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-primary file:text-primary-foreground file:cursor-pointer"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="bg-card border-gold">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Histórico de Cashback
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((t: any) => (
                <div key={t.id} className="flex justify-between items-center py-2 border-b border-gold last:border-0">
                  <div>
                    <p className="text-sm font-medium capitalize">{t.tipo}</p>
                    <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <p className="text-primary font-bold">R$ {Number(t.valor).toFixed(2)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma transação encontrada.</p>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
