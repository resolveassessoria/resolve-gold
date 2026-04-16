import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { MfaEnroll, MfaVerify } from "@/components/auth/MfaComponents";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const roleRouteMap: Record<string, string> = {
  cliente: "/cliente/dashboard",
  fomentador: "/fomentador/dashboard",
  corretor: "/corretor/dashboard",
  franqueado: "/franqueado/dashboard",
  admin: "/admin/dashboard",
};

export function getRoleRoute(role: string): string {
  return roleRouteMap[role] || "/onboarding";
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mfaStatus, setMfaStatus] = useState<"loading" | "needs_enroll" | "needs_verify" | "verified" | "not_required">("loading");
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }
      setUser(session.user);

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setProfile(data);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session?.user) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        setUser(session.user);
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setProfile(data);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Check MFA status for admins
  useEffect(() => {
    const checkMfa = async () => {
      if (!profile || profile.tipo_usuario !== "admin") {
        setMfaStatus("not_required");
        return;
      }

      try {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const verifiedTotps = factors?.totp?.filter((f) => f.status === "verified") || [];

        if (verifiedTotps.length === 0) {
          setMfaStatus("needs_enroll");
          return;
        }

        // Check if current session has AAL2 (MFA verified)
        const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aal?.currentLevel === "aal2") {
          setMfaStatus("verified");
        } else {
          setMfaStatus("needs_verify");
        }
      } catch {
        setMfaStatus("needs_verify");
      }
    };

    if (!loading && profile) {
      checkMfa();
    }
  }, [loading, profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = profile?.tipo_usuario;

  if (!profile || !userRole) {
    if (location.pathname !== "/onboarding") {
      return <Navigate to="/onboarding" replace />;
    }
    return <>{children}</>;
  }

  // Check if user has required role
  if (allowedRoles && !allowedRoles.includes(userRole) && userRole !== "admin") {
    return <Navigate to={getRoleRoute(userRole)} replace />;
  }

  // MFA gate for admins
  if (userRole === "admin" && mfaStatus === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (userRole === "admin" && mfaStatus === "needs_enroll") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <MfaEnroll onEnrolled={() => setMfaStatus("verified")} />
      </div>
    );
  }

  if (userRole === "admin" && mfaStatus === "needs_verify") {
    return <MfaVerify onVerified={() => setMfaStatus("verified")} />;
  }

  return <>{children}</>;
}
