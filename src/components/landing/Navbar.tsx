import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Início", href: "#inicio" },
  { label: "Benefícios", href: "#beneficios" },
  { label: "Preços", href: "#precos" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Franquias", href: "#franquias" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-gold"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between py-4 px-4">
        <a href="#inicio" className="text-2xl font-heading font-bold text-primary gold-shimmer px-2">
          RESOLVE
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="outline" asChild className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Cadastrar</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-primary" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-t border-gold px-4 pb-6 animate-fade-in">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block py-3 text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 mt-4">
            <Button variant="outline" asChild className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Cadastrar</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
