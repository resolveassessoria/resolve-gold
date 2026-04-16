import { motion } from "framer-motion";
import { Building2, DollarSign, BadgeCheck } from "lucide-react";

const features = [
  { icon: Building2, title: "EXCLUSIVIDADE", desc: "100 primeiras franquias com isenção de royalties" },
  { icon: BadgeCheck, title: "FULL SERVIÇOS", desc: "19 serviços financeiros disponíveis para franqueados" },
  { icon: DollarSign, title: "COMISSÃO 40%", desc: "Receba 40% sobre todos os serviços vendidos" },
];

export function FranchiseSection() {
  return (
    <section id="franquias" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            <span className="text-gold-gradient">FRANQUIAS</span>
          </h2>
          <p className="text-muted-foreground">Por que ser franqueado da RESOLVE agora?</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-card border border-gold rounded-lg p-6 text-center hover:glow-gold transition-all"
            >
              <f.icon className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-heading font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-card border-2 border-primary rounded-lg p-8 max-w-md mx-auto text-center glow-gold-strong"
        >
          <p className="text-sm text-muted-foreground line-through">De R$ 97.000</p>
          <p className="text-4xl font-heading font-bold text-primary mt-2">R$ 9.700</p>
          <p className="text-xs text-primary mt-1">PREÇO PROMOCIONAL</p>
          <p className="text-sm text-muted-foreground mt-4">
            Aproveite os benefícios exclusivos para os primeiros franqueados
          </p>
        </motion.div>
      </div>
    </section>
  );
}
