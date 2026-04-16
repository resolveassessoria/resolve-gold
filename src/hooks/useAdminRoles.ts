import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAdminRoles(userId: string | undefined) {
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      const { data } = await supabase
        .from("admin_roles")
        .select("role")
        .eq("user_id", userId);
      setRoles(data?.map((r) => r.role) || []);
      setLoading(false);
    };

    fetchRoles();
  }, [userId]);

  const hasRole = (role: string) => roles.includes(role) || roles.includes("admin_full");
  const isFullAdmin = roles.includes("admin_full");

  return { roles, loading, hasRole, isFullAdmin };
}
