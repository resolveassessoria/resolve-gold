import { motion } from "framer-motion";
import { CreditCard, Wifi, Tv, MapPin, Gift, ShieldCheck, HeartPulse, GraduationCap, Sparkles } from "lucide-react";

const products = [
  { name: "Maquininha", commission: "5%", icon: CreditCard },
  { name: "Chip", commission: "4%", icon: Wifi },
  { name: "Streaming", commission: "3%", icon: Tv },
  { name: "Rastreador", commission: "3%", icon: MapPin },
  { name: "Clube", commission: "2%", icon: Gift },
  { name: "Seguro", commission: "2%", icon: ShieldCheck },
  { name: "Plano Médico", commission: "1%", icon: HeartPulse },
  { name: "Cursos EAD", commission: "1%", icon: GraduationCap },
  { name: "Perfumes", commission: "0.5%", icon: Sparkles },
];

export function MarketplaceSection() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-radial-gold opacity-30" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            <span className="text-gold-gradient">MARKETPLACE</span>
          </h2>
          <p className="text-muted-foreground">Infinitas possibilidades de ganhos</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {products.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-gold rounded-lg p-5 flex items-center gap-4 hover:glow-gold hover:scale-[1.02] transition-all"
            >
              <p.icon className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <p className="font-heading font-semibold text-sm">{p.name}</p>
                <p className="text-primary font-bold">{p.commission}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
