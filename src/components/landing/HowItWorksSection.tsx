import { motion } from "framer-motion";
import { Shield, TrendingUp, Users, Store } from "lucide-react";

const cards = [
  {
    icon: Shield,
    title: "CLIENTE",
    subtitle: "Limpe seu nome",
    features: ["Cashback 2% por 6 meses", "Crédito bancário 10%", "Conta bancária + Cartão"],
  },
  {
    icon: TrendingUp,
    title: "FOMENTADOR",
    subtitle: "Invista e ganhe",
    features: ["Royalties até 5%/mês", "Período de 12 meses", "Participação nas franquias"],
  },
  {
    icon: Users,
    title: "CORRETOR",
    subtitle: "Comissões em 7 níveis",
    features: ["Até 50% em bônus", "Bônus exclusivos", "Marketplace com comissões"],
  },
  {
    icon: Store,
    title: "FRANQUEADO",
    subtitle: "Full serviços",
    features: ["Comissão 40%", "19 serviços financeiros", "Franquias arrendadas"],
  },
];

export function HowItWorksSection() {
  return (
    <section id="beneficios" className="py-24 relative">
      <div className="absolute inset-0 bg-radial-gold opacity-50" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            COMO <span className="text-gold-gradient">FUNCIONA</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Quatro perfis, infinitas possibilidades de ganhos
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-gold rounded-lg p-6 hover:glow-gold transition-all duration-300 hover:scale-[1.02] group"
            >
              <card.icon className="w-10 h-10 text-primary mb-4 group-hover:animate-float" />
              <h3 className="text-xl font-heading font-bold text-primary mb-1">{card.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{card.subtitle}</p>
              <ul className="space-y-2">
                {card.features.map((f) => (
                  <li key={f} className="text-sm text-foreground/80 flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
