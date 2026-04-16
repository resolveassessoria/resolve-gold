import { Star, Quote } from "lucide-react";
import { ScrollReveal, StaggerContainer, StaggerItem } from "./AnimationUtils";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Carlos M.",
    role: "Corretor",
    text: "Em apenas 3 meses, já construí uma rede de 50 indicados e triplicou minha renda mensal. A plataforma RESOLVE mudou minha vida!",
  },
  {
    name: "Ana S.",
    role: "Cliente",
    text: "Limpei meu nome e recebi cashback por 6 meses. Nunca imaginei que resolver minha situação financeira pudesse ser tão vantajoso.",
  },
  {
    name: "Roberto F.",
    role: "Franqueado",
    text: "Investi na franquia e em 6 meses já recuperei o valor investido. O modelo de negócio é sólido e transparente.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            O QUE DIZEM <span className="text-gold-gradient">NOSSOS PARCEIROS</span>
          </h2>
        </ScrollReveal>

        <StaggerContainer className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto" staggerDelay={0.15}>
          {testimonials.map((t) => (
            <StaggerItem key={t.name}>
              <div className="bg-card border border-gold rounded-lg p-6 h-full transition-all duration-400 hover:glow-gold hover:-translate-y-1">
                <Quote className="w-6 h-6 text-primary/20 mb-3" />
                <p className="text-sm text-muted-foreground mb-4 italic leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, j) => (
                    <motion.div
                      key={j}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + j * 0.1 }}
                    >
                      <Star className="w-3 h-3 fill-primary text-primary" />
                    </motion.div>
                  ))}
                </div>
                <p className="font-heading font-bold text-sm">{t.name}</p>
                <p className="text-xs text-primary">{t.role}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
