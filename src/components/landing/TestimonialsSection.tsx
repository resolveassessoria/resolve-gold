import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            O QUE DIZEM <span className="text-gold-gradient">NOSSOS PARCEIROS</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-card border border-gold rounded-lg p-6 hover:glow-gold transition-all"
            >
              <Quote className="w-6 h-6 text-primary/30 mb-3" />
              <p className="text-sm text-muted-foreground mb-4 italic">"{t.text}"</p>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-3 h-3 fill-primary text-primary" />
                ))}
              </div>
              <p className="font-heading font-bold text-sm">{t.name}</p>
              <p className="text-xs text-primary">{t.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
