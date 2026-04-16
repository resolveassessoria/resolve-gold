import { LayoutDashboard, Users, FileText, FileCheck, ShoppingBag, Activity, Settings, Shield } from "lucide-react";
import type { AdminNavItem } from "./AdminShell";

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Usuários", href: "/admin/usuarios", icon: Users, requiredRoles: ["admin_suporte", "admin_full"] },
  { label: "KYC", href: "/admin/kyc", icon: FileCheck, requiredRoles: ["admin_kyc", "admin_full"] },
  { label: "Transações", href: "/admin/transacoes", icon: FileText, requiredRoles: ["admin_financeiro", "admin_full"] },
  { label: "Marketplace", href: "/admin/marketplace", icon: ShoppingBag, requiredRoles: ["admin_financeiro", "admin_full"] },
  { label: "Auditoria", href: "/admin/auditoria", icon: Shield, requiredRoles: ["admin_full"] },
];
