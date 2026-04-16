import { CreditCard, Wifi, Tv, MapPin, Gift, ShieldCheck, HeartPulse, GraduationCap, Sparkles } from "lucide-react";
import { ScrollReveal, StaggerContainer, StaggerItem } from "./AnimationUtils";

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
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            <span className="text-gold-gradient">MARKETPLACE</span>
          </h2>
          <p className="text-muted-foreground">Infinitas possibilidades de ganhos</p>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto" staggerDelay={0.06}>
          {products.map((p) => (
            <StaggerItem key={p.name}>
              <div className="bg-card border border-gold rounded-lg p-5 flex items-center gap-4 transition-all duration-400 hover:glow-gold hover:-translate-y-1 hover:border-gold-strong group cursor-default">
                <p.icon className="w-8 h-8 text-primary flex-shrink-0 transition-transform duration-400 group-hover:rotate-[5deg] group-hover:scale-105" />
                <div>
                  <p className="font-heading font-semibold text-sm">{p.name}</p>
                  <p className="text-primary font-bold">{p.commission}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
