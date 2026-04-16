import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { getRoleRoute } from "@/components/ProtectedRoute";
import { Users, DollarSign, Briefcase, Store, Loader2 } from "lucide-react";

const roles = [
  { value: "cliente", label: "Cliente", desc: "Acesse serviços financeiros com cashback", icon: Users },
  { value: "fomentador", label: "Fomentador", desc: "Invista e receba royalties mensais", icon: DollarSign },
  { value: "corretor", label: "Corretor", desc: "Indique clientes e ganhe comissões", icon: Briefcase },
  { value: "franqueado", label: "Franqueado", desc: "Opere uma franquia com 19 serviços", icon: Store },
];

export default function Onboarding() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (!selected || !user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ tipo_usuario: selected as any })
      .eq("id", user.id);

    if (error) {
      toast.error("Erro ao salvar perfil: " + error.message);
      setSaving(false);
      return;
    }

    toast.success("Perfil configurado!");
    navigate(getRoleRoute(selected));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 bg-radial-gold">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">
            Bem-vindo à <span className="text-primary">RESOLVE</span>
          </h1>
          <p className="text-muted-foreground">Selecione seu perfil para continuar</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {roles.map((role) => (
            <Card
              key={role.value}
              className={`cursor-pointer transition-all hover:glow-gold ${
                selected === role.value
                  ? "border-primary glow-gold-strong bg-primary/5"
                  : "bg-card border-gold hover:border-primary/50"
              }`}
              onClick={() => setSelected(role.value)}
            >
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <role.icon className={`w-10 h-10 ${selected === role.value ? "text-primary" : "text-muted-foreground"}`} />
                <h3 className="font-heading font-bold text-lg">{role.label}</h3>
                <p className="text-sm text-muted-foreground">{role.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            size="lg"
            disabled={!selected || saving}
            onClick={handleConfirm}
            className="min-w-[200px]"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Confirmar Perfil
          </Button>
        </div>
      </div>
    </div>
  );
}
