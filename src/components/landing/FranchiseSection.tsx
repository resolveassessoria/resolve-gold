import { Building2, DollarSign, BadgeCheck } from "lucide-react";
import { ScrollReveal, StaggerContainer, StaggerItem } from "./AnimationUtils";

const features = [
  { icon: Building2, title: "EXCLUSIVIDADE", desc: "100 primeiras franquias com isenção de royalties" },
  { icon: BadgeCheck, title: "FULL SERVIÇOS", desc: "19 serviços financeiros disponíveis para franqueados" },
  { icon: DollarSign, title: "COMISSÃO 40%", desc: "Receba 40% sobre todos os serviços vendidos" },
];

export function FranchiseSection() {
  return (
    <section id="franquias" className="py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            <span className="text-gold-gradient">FRANQUIAS</span>
          </h2>
          <p className="text-muted-foreground">Por que ser franqueado da RESOLVE agora?</p>
        </ScrollReveal>

        <StaggerContainer className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12" staggerDelay={0.15}>
          {features.map((f) => (
            <StaggerItem key={f.title}>
              <div className="bg-card border border-gold rounded-lg p-6 text-center h-full transition-all duration-400 hover:glow-gold hover:-translate-y-1 group">
                <f.icon className="w-10 h-10 text-primary mx-auto mb-4 transition-transform duration-400 group-hover:scale-110" />
                <h3 className="font-heading font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <ScrollReveal>
          <div className="bg-card border-2 border-primary/40 rounded-lg p-8 max-w-md mx-auto text-center glow-gold transition-all duration-400 hover:glow-gold-strong">
            <p className="text-sm text-muted-foreground line-through">De R$ 97.000</p>
            <p className="text-4xl font-heading font-bold text-primary mt-2">R$ 9.700</p>
            <p className="text-xs text-primary mt-1 tracking-widest">PREÇO PROMOCIONAL</p>
            <p className="text-sm text-muted-foreground mt-4">
              Aproveite os benefícios exclusivos para os primeiros franqueados
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
