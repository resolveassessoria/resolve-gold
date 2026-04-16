import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface MfaEnrollProps {
  onEnrolled: () => void;
}

export function MfaEnroll({ onEnrolled }: MfaEnrollProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"start" | "verify">("start");

  const handleEnroll = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator App",
      });
      if (error) {
        toast.error("Erro ao configurar MFA. Tente novamente.");
        return;
      }
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setStep("verify");
    } catch {
      toast.error("Erro ao configurar MFA.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!factorId || verifyCode.length !== 6) return;
    setLoading(true);
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) {
        toast.error("Erro na verificação. Tente novamente.");
        return;
      }

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verifyCode,
      });
      if (verify.error) {
        toast.error("Código inválido. Tente novamente.");
        return;
      }

      toast.success("MFA ativado com sucesso!");
      onEnrolled();
    } catch {
      toast.error("Erro na verificação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card border-gold max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Autenticação em Duas Etapas (MFA)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === "start" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Como administrador, você precisa ativar a autenticação em duas etapas para acessar o painel.
            </p>
            <Button onClick={handleEnroll} disabled={loading} className="w-full">
              {loading ? "Configurando..." : "Configurar MFA"}
            </Button>
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Escaneie o QR Code com seu aplicativo autenticador (Google Authenticator, Authy, etc.)
            </p>
            {qrCode && (
              <div className="flex justify-center">
                <img src={qrCode} alt="QR Code MFA" className="w-48 h-48 rounded-lg" />
              </div>
            )}
            {secret && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Chave manual:</p>
                <p className="text-xs font-mono break-all select-all">{secret}</p>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Código de verificação</label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                className="text-center text-lg tracking-widest"
              />
            </div>
            <Button onClick={handleVerify} disabled={loading || verifyCode.length !== 6} className="w-full">
              {loading ? "Verificando..." : "Verificar e Ativar"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface MfaVerifyProps {
  onVerified: () => void;
}

export function MfaVerify({ onVerified }: MfaVerifyProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totp = factors?.totp?.[0];
      if (!totp) {
        toast.error("Nenhum fator MFA encontrado.");
        return;
      }

      const challenge = await supabase.auth.mfa.challenge({ factorId: totp.id });
      if (challenge.error) {
        toast.error("Erro na verificação. Tente novamente.");
        return;
      }

      const verify = await supabase.auth.mfa.verify({
        factorId: totp.id,
        challengeId: challenge.data.id,
        code,
      });
      if (verify.error) {
        toast.error("Código inválido. Tente novamente.");
        return;
      }

      onVerified();
    } catch {
      toast.error("Erro na verificação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="bg-card border-gold max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Verificação MFA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Abra seu aplicativo autenticador e insira o código de 6 dígitos.
          </p>
          <Input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="text-center text-lg tracking-widest"
            autoFocus
          />
          <Button onClick={handleVerify} disabled={loading || code.length !== 6} className="w-full">
            {loading ? "Verificando..." : "Verificar"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
