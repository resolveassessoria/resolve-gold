import { motion } from "framer-motion";
import { Award, Gift, Car, Ship, Bike } from "lucide-react";

const rewards = [
  { title: "Consultor", prize: "R$ 200", icon: Gift },
  { title: "Assessor", prize: "R$ 500", icon: Gift },
  { title: "Especialista", prize: "Cruzeiro R$ 4K", icon: Ship },
  { title: "Gestor", prize: "Caribe R$ 12K", icon: Ship },
  { title: "Elite", prize: "Moto R$ 35K", icon: Bike },
  { title: "Premium", prize: "Carro R$ 160K", icon: Car },
  { title: "Supremo", prize: "Super Carro R$ 400K", icon: Award },
];

export function RewardsSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-gold opacity-30" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            BÔNUS E <span className="text-gold-gradient">RECOMPENSAS</span>
          </h2>
          <p className="text-muted-foreground">Expansão que premia seu crescimento</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {rewards.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-card border border-gold rounded-lg p-4 text-center hover:glow-gold-strong hover:scale-105 transition-all duration-300"
            >
              <r.icon className="w-8 h-8 text-primary mx-auto mb-2" />
              <h4 className="font-heading font-bold text-sm mb-1">{r.title}</h4>
              <p className="text-primary font-bold text-xs">{r.prize}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
