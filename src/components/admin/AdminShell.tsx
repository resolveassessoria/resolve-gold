import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { fullAdminPortalLinks } from "@/lib/access-control";
import { BrandLogo } from "@/components/BrandLogo";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: any;
  requiredRoles?: string[]; // admin_roles that can see this item
}

interface AdminShellProps {
  children: ReactNode;
  userName?: string;
  onSignOut: () => void;
  navItems: AdminNavItem[];
  adminRoles?: string[];
}

export function AdminShell({ children, userName, onSignOut, navItems, adminRoles = [] }: AdminShellProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isFullAdmin = adminRoles.includes("admin_full");
  const visibleItems = navItems.filter((item) => {
    if (!item.requiredRoles || item.requiredRoles.length === 0) return true;
    if (isFullAdmin) return true;
    return item.requiredRoles.some((r) => adminRoles.includes(r));
  });

  return (
    <div className="min-h-screen bg-[hsl(220,20%,4%)] flex flex-col">
      {/* Top bar — distinct admin look */}
      <header className="border-b border-[hsl(220,15%,15%)] bg-[hsl(220,18%,7%)]/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-400" />
              <BrandLogo imageClassName="h-10 border-red-400/25" />
              <span className="text-[10px] font-mono text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">ADMIN</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {userName && <span className="text-sm text-muted-foreground hidden sm:inline">👤 {userName}</span>}
            <Button variant="outline" size="sm" onClick={onSignOut} className="border-red-400/40 text-red-400 hover:bg-red-400/10 hover:text-red-300">
              <LogOut className="w-4 h-4 mr-1" /> Sair
            </Button>
          </div>
        </div>
        {isFullAdmin && (
          <div className="px-4 pb-3">
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-red-400/15 bg-red-400/5 px-3 py-2">
              <span className="text-[11px] uppercase tracking-[0.2em] text-red-300/80">Acessos rápidos</span>
              {fullAdminPortalLinks.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="rounded-md border border-[hsl(220,15%,15%)] bg-[hsl(220,15%,10%)] px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-red-400/30 hover:text-red-300"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="flex flex-1">
        {/* Sidebar desktop */}
        <aside className="w-56 border-r border-[hsl(220,15%,12%)] min-h-[calc(100vh-57px)] p-4 hidden md:block bg-[hsl(220,18%,6%)]">
          <p className="text-[10px] font-mono uppercase text-muted-foreground mb-4 tracking-wider">Painel Administrativo</p>
          <nav className="space-y-1">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  location.pathname === item.href
                    ? "bg-red-400/10 text-red-400 font-medium border border-red-400/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-[hsl(220,15%,10%)]"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Mobile sidebar */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
            <div className="absolute inset-0 bg-black/70" />
            <aside className="absolute left-0 top-[57px] bottom-0 w-64 bg-[hsl(220,18%,6%)] border-r border-[hsl(220,15%,12%)] p-4" onClick={(e) => e.stopPropagation()}>
              <p className="text-[10px] font-mono uppercase text-muted-foreground mb-4 tracking-wider">Painel Administrativo</p>
              <nav className="space-y-1">
                {visibleItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                      location.pathname === item.href
                        ? "bg-red-400/10 text-red-400 font-medium border border-red-400/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-[hsl(220,15%,10%)]"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </aside>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto bg-[hsl(220,20%,4%)]">
          {children}
        </main>
      </div>
    </div>
  );
}
