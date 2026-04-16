import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/BrandLogo";

export interface NavItem {
  label: string;
  href: string;
  icon: any;
}

interface DashboardShellProps {
  children: ReactNode;
  title: string;
  userName?: string;
  onSignOut: () => void;
  navItems: NavItem[];
}

export function DashboardShell({ children, title, userName, onSignOut, navItems }: DashboardShellProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="border-b border-gold bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/" className="shrink-0">
              <BrandLogo imageClassName="h-10" />
            </Link>
            <span className="text-xs text-muted-foreground hidden sm:inline">| {title}</span>
          </div>
          <div className="flex items-center gap-3">
            {userName && <span className="text-sm text-muted-foreground hidden sm:inline">Olá, {userName}</span>}
            <Button variant="outline" size="sm" onClick={onSignOut} className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <LogOut className="w-4 h-4 mr-1" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar desktop */}
        <aside className="w-56 border-r border-gold min-h-[calc(100vh-57px)] p-4 hidden md:block bg-card/30">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  location.pathname === item.href
                    ? "bg-primary/10 text-primary font-medium border border-gold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Sidebar mobile overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
            <div className="absolute inset-0 bg-black/60" />
            <aside className="absolute left-0 top-[57px] bottom-0 w-64 bg-card border-r border-gold p-4" onClick={(e) => e.stopPropagation()}>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                      location.pathname === item.href
                        ? "bg-primary/10 text-primary font-medium border border-gold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
