import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

function AnimatedCounter({ target, prefix = "", suffix = "" }: { target: string; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}>
      <p className="text-3xl md:text-4xl font-heading font-bold text-primary">{prefix}{target}{suffix}</p>
    </div>
  );
}

export function HeroSection() {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-radial-gold" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-6">
            A SOLUÇÃO NA PALMA{" "}
            <span className="text-gold-gradient">DE SUAS MÃOS</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            Devolvemos seu poder de compra com cashback, royalties e comissões exponenciais
          </p>
          <p className="text-xl md:text-2xl font-heading font-bold text-primary mb-8">
            RESOLVA A SUA VIDA COM A RESOLVE
          </p>

          <Button size="lg" className="text-lg px-8 py-6 group" asChild>
            <a href="#pre-cadastro">
              QUERO RESOLVER MINHA VIDA
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>
        </motion.div>

        {/* Counters */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto"
        >
          <div className="text-center">
            <AnimatedCounter target="1.8" prefix="R$" suffix=" MILHÃO" />
            <p className="text-sm text-muted-foreground mt-1">Projeção Start</p>
          </div>
          <div className="text-center">
            <AnimatedCounter target="300" prefix="+" suffix="" />
            <p className="text-sm text-muted-foreground mt-1">Franquias Planejadas</p>
          </div>
          <div className="text-center">
            <AnimatedCounter target="1000" prefix="+" suffix="" />
            <p className="text-sm text-muted-foreground mt-1">Corretores</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
