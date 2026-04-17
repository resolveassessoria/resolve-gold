import type { Database } from "@/integrations/supabase/types";

export type UserRole = Database["public"]["Enums"]["tipo_usuario"];
export type AdminPermission = Database["public"]["Enums"]["admin_role"];

export const FULL_ADMIN_PERMISSION: AdminPermission = "admin_full";

export const roleRouteMap: Record<UserRole, string> = {
  cliente: "/cliente/dashboard",
  fomentador: "/fomentador/dashboard",
  corretor: "/corretor/dashboard",
  franqueado: "/franqueado/dashboard",
  admin: "/admin/dashboard",
};

export const adminPermissionOptions: Array<{
  value: AdminPermission;
  label: string;
  description: string;
}> = [
  {
    value: "admin_full",
    label: "Acesso total",
    description: "Libera todas as seções administrativas e os demais painéis do sistema.",
  },
  {
    value: "admin_suporte",
    label: "Usuários e suporte",
    description: "Libera a área de usuários e atendimento operacional.",
  },
  {
    value: "admin_kyc",
    label: "KYC",
    description: "Libera a revisão de documentos e validação cadastral.",
  },
  {
    value: "admin_financeiro",
    label: "Financeiro e marketplace",
    description: "Libera transações, financeiro e marketplace.",
  },
];

export const fullAdminPortalLinks = [
  { label: "Cliente", href: "/cliente/dashboard" },
  { label: "Fomentador", href: "/fomentador/dashboard" },
  { label: "Corretor", href: "/corretor/dashboard" },
  { label: "Franqueado", href: "/franqueado/dashboard" },
] as const;

export function getRoleRoute(role: UserRole): string {
  return roleRouteMap[role] || "/onboarding";
}

export function normalizeAdminPermissions(permissions: AdminPermission[]): AdminPermission[] {
  const uniquePermissions = [...new Set(permissions)];

  if (uniquePermissions.includes(FULL_ADMIN_PERMISSION)) {
    return [FULL_ADMIN_PERMISSION];
  }

  return uniquePermissions;
}

export function hasAdminPermission(
  permissions: AdminPermission[],
  requiredPermissions: AdminPermission[],
): boolean {
  return (
    permissions.includes(FULL_ADMIN_PERMISSION) ||
    requiredPermissions.some((permission) => permissions.includes(permission))
  );
}

export function canAccessAllowedRoles(
  userRole: UserRole,
  allowedRoles?: UserRole[],
  adminPermissions: AdminPermission[] = [],
): boolean {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  if (allowedRoles.includes(userRole)) {
    return true;
  }

  return userRole === "admin" && adminPermissions.includes(FULL_ADMIN_PERMISSION);
}
