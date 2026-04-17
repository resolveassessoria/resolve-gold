import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Home, LayoutDashboard, FileText, Users, ShoppingBag, Settings } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  userName?: string;
  onSignOut: () => void;
  navItems?: { label: string; href: string; icon: any }[];
}

export function DashboardLayout({ children, title, userName, onSignOut, navItems = [] }: DashboardLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-gold bg-card/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-4">
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

      <div className="flex">
        {/* Sidebar */}
        {navItems.length > 0 && (
          <aside className="w-56 border-r border-gold min-h-[calc(100vh-57px)] p-4 hidden md:block">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    location.pathname === item.href
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        )}

        {/* Content */}
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
