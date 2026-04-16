import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { AnimatedCounter } from "./AnimationUtils";

const ease: [number, number, number, number] = [0.4, 0, 0.2, 1];

const wordVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease },
  }),
};

function AnimatedWords({ text, className }: { text: string; className?: string }) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  if (reduce) return <span className={className}>{text}</span>;

  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={wordVariants}
          initial="hidden"
          animate="visible"
          className="inline-block mr-[0.3em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

export function HeroSection() {
  const reduce = useReducedMotion();

  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background glow */}
      <div className="absolute inset-0 bg-radial-gold" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-primary/3 blur-[150px]" />

      <div className="container mx-auto px-4 text-center relative z-10">
        <div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 leading-tight">
            <AnimatedWords text="A SOLUÇÃO NA PALMA" />
            <br />
            <span className="text-gold-gradient inline-block">
              <AnimatedWords text="DE SUAS MÃOS" />
            </span>
          </h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4"
          >
            Devolvemos seu poder de compra com cashback, royalties e comissões exponenciais
          </motion.p>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45, ease }}
            className="text-xl md:text-2xl font-heading font-bold text-primary mb-8"
          >
            RESOLVA A SUA VIDA COM A RESOLVE
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6, ease }}
          >
            <Button size="lg" className="text-lg px-8 py-6 bg-gold-gradient hover:opacity-90 transition-all duration-300 group" asChild>
              <a href="#pre-cadastro">
                QUERO RESOLVER MINHA VIDA
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </Button>
          </motion.div>
        </div>

        {/* Counters */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8, ease }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto"
        >
          <div className="text-center">
            <AnimatedCounter target={1.8} prefix="R$" suffix=" MILHÃO" />
            <p className="text-sm text-muted-foreground mt-1">Projeção Start</p>
          </div>
          <div className="text-center">
            <AnimatedCounter target={300} prefix="+" />
            <p className="text-sm text-muted-foreground mt-1">Franquias Planejadas</p>
          </div>
          <div className="text-center">
            <AnimatedCounter target={1000} prefix="+" />
            <p className="text-sm text-muted-foreground mt-1">Corretores</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
