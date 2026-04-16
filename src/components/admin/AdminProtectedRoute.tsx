import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { MfaEnroll, MfaVerify } from "@/components/auth/MfaComponents";
import { Shield } from "lucide-react";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requiredSubRoles?: string[];
}

export function AdminProtectedRoute({ children, requiredSubRoles }: AdminProtectedRouteProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [adminRoles, setAdminRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [mfaStatus, setMfaStatus] = useState<"loading" | "needs_enroll" | "needs_verify" | "verified">("loading");
  const location = useLocation();

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }
      setUser(session.user);

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      setProfile(prof);

      if (prof?.tipo_usuario === "admin") {
        const { data: roles } = await supabase
          .from("admin_roles")
          .select("role")
          .eq("user_id", session.user.id);
        setAdminRoles(roles?.map((r) => r.role) || []);
      }

      setLoading(false);
    };
    check();
  }, []);

  // MFA check
  useEffect(() => {
    const checkMfa = async () => {
      if (!profile || profile.tipo_usuario !== "admin") {
        setMfaStatus("loading");
        return;
      }
      try {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const verified = factors?.totp?.filter((f) => f.status === "verified") || [];
        if (verified.length === 0) {
          setMfaStatus("needs_enroll");
          return;
        }
        const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        setMfaStatus(aal?.currentLevel === "aal2" ? "verified" : "needs_verify");
      } catch {
        setMfaStatus("needs_verify");
      }
    };
    if (!loading && profile) checkMfa();
  }, [loading, profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(220,20%,4%)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Not an admin
  if (!profile || profile.tipo_usuario !== "admin") {
    return (
      <div className="min-h-screen bg-[hsl(220,20%,4%)] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-heading font-bold text-white mb-2">Acesso Restrito</h1>
          <p className="text-muted-foreground">Você não tem permissão para acessar esta área.</p>
        </div>
      </div>
    );
  }

  // MFA gate
  if (mfaStatus === "loading") {
    return (
      <div className="min-h-screen bg-[hsl(220,20%,4%)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (mfaStatus === "needs_enroll") {
    return (
      <div className="min-h-screen bg-[hsl(220,20%,4%)] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <Shield className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Para acessar a área administrativa, ative a verificação em duas etapas.</p>
          </div>
          <MfaEnroll onEnrolled={() => setMfaStatus("verified")} />
        </div>
      </div>
    );
  }

  if (mfaStatus === "needs_verify") {
    return (
      <div className="min-h-screen bg-[hsl(220,20%,4%)] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <Shield className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Verificação em duas etapas necessária.</p>
          </div>
          <MfaVerify onVerified={() => setMfaStatus("verified")} />
        </div>
      </div>
    );
  }

  // Sub-role check
  if (requiredSubRoles && requiredSubRoles.length > 0) {
    const isFullAdmin = adminRoles.includes("admin_full");
    const hasRequiredRole = isFullAdmin || requiredSubRoles.some((r) => adminRoles.includes(r));
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen bg-[hsl(220,20%,4%)] flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-heading font-bold text-white mb-2">Permissão Insuficiente</h1>
            <p className="text-muted-foreground">Sua sub-role administrativa não permite acesso a esta seção.</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
