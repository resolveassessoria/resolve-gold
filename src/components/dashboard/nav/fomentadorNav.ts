import { LayoutDashboard, FileText, TrendingUp } from "lucide-react";
import type { NavItem } from "@/components/dashboard/DashboardShell";

export const fomentadorNav: NavItem[] = [
  { label: "Dashboard", href: "/fomentador/dashboard", icon: LayoutDashboard },
  { label: "Transações", href: "/fomentador/transacoes", icon: FileText },
  { label: "Retornos", href: "/fomentador/retornos", icon: TrendingUp },
];
