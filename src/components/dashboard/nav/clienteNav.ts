import { LayoutDashboard, FileText, Upload, CreditCard } from "lucide-react";
import type { NavItem } from "@/components/dashboard/DashboardShell";

export const clienteNav: NavItem[] = [
  { label: "Dashboard", href: "/cliente/dashboard", icon: LayoutDashboard },
  { label: "Transações", href: "/cliente/transacoes", icon: FileText },
  { label: "Documentos", href: "/cliente/documentos", icon: Upload },
];
