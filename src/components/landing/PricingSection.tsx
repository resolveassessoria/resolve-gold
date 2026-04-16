import { motion } from "framer-motion";
import { Check } from "lucide-react";

export function PricingSection() {
  return (
    <section id="precos" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            LIMPE E GANHE — <span className="text-gold-gradient">Valores Premium</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-gold rounded-lg p-8 hover:glow-gold transition-all"
          >
            <h3 className="text-xl font-heading font-bold text-primary mb-2">Dívida até R$ 7.000</h3>
            <p className="text-4xl font-heading font-bold mb-6">R$ 700</p>
            <ul className="space-y-3">
              {["Cashback 2% por 6 meses", "Conta bancária", "Cartão de crédito", "Crédito bancário 10%"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card border-2 border-primary rounded-lg p-8 glow-gold relative"
          >
            <div className="absolute -top-3 right-6 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
              POPULAR
            </div>
            <h3 className="text-xl font-heading font-bold text-primary mb-2">Dívida acima de R$ 7.001</h3>
            <p className="text-4xl font-heading font-bold mb-6">10% <span className="text-lg text-muted-foreground">do valor</span></p>
            <ul className="space-y-3">
              {["Cashback 2% por 6 meses", "Cartão pré-pago", "Conta bancária", "Crédito bancário 10%"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
