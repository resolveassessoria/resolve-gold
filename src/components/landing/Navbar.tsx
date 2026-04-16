import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

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
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        backgroundColor: scrolled ? "rgba(0,0,0,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(198,164,63,0.15)" : "1px solid transparent",
      }}
    >
      <div className="container mx-auto flex items-center justify-between py-4 px-4">
        <a href="#inicio" className="text-2xl font-heading font-bold text-primary tracking-wide">
          RESOLVE
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300 link-underline"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="outline" asChild className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild className="bg-gold-gradient hover:opacity-90 transition-opacity duration-300">
            <Link to="/register">Cadastrar</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-primary" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-t border-gold px-4 pb-6 overflow-hidden"
          >
            {navItems.map((item, i) => (
              <motion.a
                key={item.href}
                href={item.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="block py-3 text-muted-foreground hover:text-primary transition-colors duration-300"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </motion.a>
            ))}
            <div className="flex flex-col gap-3 mt-4">
              <Button variant="outline" asChild className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="bg-gold-gradient">
                <Link to="/register">Cadastrar</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
