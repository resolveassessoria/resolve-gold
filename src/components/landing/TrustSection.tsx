import { BadgeCheck, FileText, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal, StaggerContainer, StaggerItem } from "./AnimationUtils";

const pillars = [
  {
    icon: ShieldCheck,
    title: "Assessoria e execução",
    text: "Para o cliente, a Resolve precisa aparecer como jornada orientada, com regra de entrada, análise e acompanhamento do processo.",
  },
  {
    icon: Users,
    title: "Rede comercial e expansão",
    text: "Para corretor, fomentador e franqueado, a home deve explicar que existe uma estrutura comercial por trás, não apenas uma promessa isolada.",
  },
  {
    icon: FileText,
    title: "Regras e observações",
    text: "Preço, prazo, projeção, etapas e condições precisam estar em bloco visível. Isso aumenta a percepção de seriedade e reduz objeção.",
  },
];

const trustPills = [
  "Regras resumidas por perfil",
  "Projeções identificadas como projeções",
  "Onboarding e análise",
  "Acompanhamento da jornada",
];

export function TrustSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal className="mx-auto max-w-3xl text-center mb-14">
          <Badge className="bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em]">
            O que a home precisa comunicar com confiança
          </Badge>
          <h2 className="mt-5 text-3xl md:text-5xl font-heading font-bold">
            A RESOLVE NÃO PODE PARECER SÓ <span className="text-gold-gradient">UMA PROMESSA BONITA</span>
          </h2>
          <p className="mt-4 text-base leading-8 text-muted-foreground md:text-lg">
            A página inicial precisa explicar o que a empresa é, como o modelo opera e onde entram as regras.
            Isso torna a oferta mais premium, mais séria e mais convertível.
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid gap-6 md:grid-cols-3" staggerDelay={0.12}>
          {pillars.map((pillar) => (
            <StaggerItem key={pillar.title}>
              <div className="h-full rounded-[1.75rem] border border-gold bg-card p-7 transition-all duration-500 hover:-translate-y-1 hover:glow-gold">
                <pillar.icon className="h-10 w-10 text-primary" />
                <h3 className="mt-5 text-2xl font-heading font-bold text-white">{pillar.title}</h3>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{pillar.text}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <ScrollReveal direction="up" className="mt-8">
          <div className="rounded-[1.75rem] border border-gold bg-card/75 p-6">
            <div className="flex flex-wrap gap-3">
              {trustPills.map((pill) => (
                <div key={pill} className="inline-flex items-center gap-2 rounded-full border border-gold bg-black/20 px-3 py-2 text-sm text-muted-foreground">
                  <BadgeCheck className="h-4 w-4 text-primary" />
                  {pill}
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
