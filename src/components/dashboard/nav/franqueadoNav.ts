import { LayoutDashboard, Store, ShoppingBag, DollarSign } from "lucide-react";
import type { NavItem } from "@/components/dashboard/DashboardShell";

export const franqueadoNav: NavItem[] = [
  { label: "Dashboard", href: "/franqueado/dashboard", icon: LayoutDashboard },
  { label: "Operação", href: "/franqueado/operacao", icon: Store },
  { label: "Vendas", href: "/franqueado/vendas", icon: ShoppingBag },
  { label: "Financeiro", href: "/franqueado/financeiro", icon: DollarSign },
];
