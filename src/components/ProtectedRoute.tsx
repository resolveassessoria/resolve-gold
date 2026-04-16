import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { buildEnvUrl } from "@/lib/environment";
import type { AdminPermission, UserRole } from "@/lib/access-control";
import { canAccessAllowedRoles, getRoleRoute } from "@/lib/access-control";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [adminPermissions, setAdminPermissions] = useState<AdminPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const loadUserAccess = async (sessionUser: User) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", sessionUser.id)
        .single();

      setProfile(data);

      if (data?.tipo_usuario === "admin") {
        const { data: roles } = await supabase
          .from("admin_roles")
          .select("role")
          .eq("user_id", sessionUser.id);

        setAdminPermissions((roles?.map((item) => item.role) || []) as AdminPermission[]);
        return;
      }

      setAdminPermissions([]);
    };

    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setLoading(false);
        return;
      }

      setUser(session.user);
      await loadUserAccess(session.user);
      setLoading(false);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session?.user) {
          setUser(null);
          setProfile(null);
          setAdminPermissions([]);
          setLoading(false);
          return;
        }

        setUser(session.user);
        await loadUserAccess(session.user);
        setLoading(false);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

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

  const userRole = profile?.tipo_usuario as UserRole | undefined;

  if (!profile || !userRole) {
    if (location.pathname !== "/onboarding") {
      return <Navigate to="/onboarding" replace />;
    }
    return <>{children}</>;
  }

  const canAccessCurrentRoute = canAccessAllowedRoles(userRole, allowedRoles, adminPermissions);

  if (userRole === "admin" && !canAccessCurrentRoute) {
    const adminUrl = buildEnvUrl("admin", "/admin/dashboard");
    if (adminUrl.startsWith("http")) {
      window.location.href = adminUrl;
      return null;
    }
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (!canAccessCurrentRoute) {
    return <Navigate to={getRoleRoute(userRole)} replace />;
  }

  return <>{children}</>;
}
