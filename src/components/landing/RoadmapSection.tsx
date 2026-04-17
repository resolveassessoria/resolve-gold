import { ScrollReveal, StaggerContainer, StaggerItem } from "./AnimationUtils";

const steps = [
  { label: "START", value: "R$ 1.8 Milhão", desc: "Projeção inicial com 100 franquias + 1000 corretores" },
  { label: "EXPANSÃO", value: "300 Franquias", desc: "R$ 30 milhões/mês com 300 franquias ativas" },
  { label: "META ANUAL", value: "R$ 492 Milhões", desc: "41 mil clientes/mês com ticket médio R$1.000" },
];

export function RoadmapSection() {
  return (
    <section id="roadmap" className="py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            <span className="text-gold-gradient">ROAD MAP</span>
          </h2>
        </ScrollReveal>

        <div className="relative max-w-4xl mx-auto">
          {/* Connecting line */}
          <div className="absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent hidden md:block" />

          <StaggerContainer className="grid md:grid-cols-3 gap-8" staggerDelay={0.2}>
            {steps.map((step) => (
              <StaggerItem key={step.label} className="text-center relative">
                {/* Pulsing dot */}
                <div className="w-4 h-4 bg-primary rounded-full mx-auto mb-6 animate-pulse-soft hidden md:block" />
                <div className="bg-card border border-gold rounded-lg p-6 transition-all duration-400 hover:glow-gold hover:-translate-y-1">
                  <span className="text-xs font-bold text-primary tracking-widest">{step.label}</span>
                  <p className="text-2xl font-heading font-bold text-primary mt-2">{step.value}</p>
                  <p className="text-sm text-muted-foreground mt-2">{step.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
