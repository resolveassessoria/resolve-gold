import { Award, Gift, Car, Ship, Bike } from "lucide-react";
import { ScrollReveal, StaggerContainer, StaggerItem } from "./AnimationUtils";

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
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            BÔNUS E <span className="text-gold-gradient">RECOMPENSAS</span>
          </h2>
          <p className="text-muted-foreground">Expansão que premia seu crescimento</p>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4" staggerDelay={0.07}>
          {rewards.map((r) => (
            <StaggerItem key={r.title}>
              <div className="bg-card border border-gold rounded-lg p-4 text-center h-full transition-all duration-400 hover:glow-gold-strong hover:-translate-y-2 hover:border-gold-strong group cursor-default">
                <r.icon className="w-8 h-8 text-primary mx-auto mb-2 transition-transform duration-400 group-hover:scale-110" />
                <h4 className="font-heading font-bold text-sm mb-1">{r.title}</h4>
                <p className="text-primary font-bold text-xs">{r.prize}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
