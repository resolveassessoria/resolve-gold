import { Check } from "lucide-react";
import { ScrollReveal } from "./AnimationUtils";

export function PricingSection() {
  return (
    <section id="precos" className="py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            LIMPE E GANHE — <span className="text-gold-gradient">Valores Premium</span>
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <ScrollReveal direction="left">
            <div className="bg-card border border-gold rounded-lg p-8 h-full transition-all duration-400 hover:glow-gold hover:-translate-y-1">
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
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right">
            <div className="bg-card border-2 border-primary/50 rounded-lg p-8 glow-gold relative h-full transition-all duration-400 hover:glow-gold-strong hover:-translate-y-1">
              <div className="absolute -top-3 right-6 bg-gold-gradient text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
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
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
