import { LayoutDashboard, Users, DollarSign, Target, ShoppingBag } from "lucide-react";
import type { NavItem } from "@/components/dashboard/DashboardShell";

export const corretorNav: NavItem[] = [
  { label: "Dashboard", href: "/corretor/dashboard", icon: LayoutDashboard },
  { label: "Rede", href: "/corretor/rede", icon: Users },
  { label: "Comissões", href: "/corretor/comissoes", icon: DollarSign },
  { label: "Expansão", href: "/corretor/expansao", icon: Target },
  { label: "Marketplace", href: "/corretor/marketplace", icon: ShoppingBag },
];
