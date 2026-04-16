import { LayoutDashboard, Users, FileText, FileCheck, ShoppingBag } from "lucide-react";
import type { NavItem } from "@/components/dashboard/DashboardShell";

export const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Usuários", href: "/admin/usuarios", icon: Users },
  { label: "Transações", href: "/admin/transacoes", icon: FileText },
  { label: "KYC", href: "/admin/kyc", icon: FileCheck },
  { label: "Marketplace", href: "/admin/marketplace", icon: ShoppingBag },
];
