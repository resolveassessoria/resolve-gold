import { AlertCircle, BadgeCheck, Clock, Landmark, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal, StaggerContainer, StaggerItem } from "./AnimationUtils";

const investorCards = [
  {
    icon: Landmark,
    title: "O que ele é",
    text: "O fomentador entra como investidor da expansão, não como cliente de varejo nem como promessa genérica de ganho.",
  },
  {
    icon: Clock,
    title: "Prazo-base",
    text: "As projeções atuais trabalham com janelas de 12 meses, então a página precisa mostrar ciclo e horizonte de retorno.",
  },
  {
    icon: TrendingUp,
    title: "Potencial",
    text: "A comunicação comercial fala em royalties projetados de até 5% ao mês, sempre com a ressalva correta de performance.",
  },
];

const investorSteps = [
  {
    step: "01",
    title: "Entende a tese",
    text: "Primeiro o visitante precisa entender em linguagem simples o que está financiando e como a operação cresce.",
  },
  {
    step: "02",
    title: "Enxerga a regra",
    text: "Depois entram prazo, ciclo, projeção, observações e o que depende da performance da rede.",
  },
  {
    step: "03",
    title: "Conecta risco e retorno",
    text: "A oferta fica mais forte quando a home mostra que projeção comercial não significa rentabilidade fixa garantida.",
  },
  {
    step: "04",
    title: "Parte para a conversa",
    text: "A CTA ideal para o investidor é falar com alguém, pedir apresentação e avançar para uma conversa consultiva.",
  },
];

export function InvestorSection() {
  return (
    <section id="investidor" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-gold opacity-25" />
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal className="mx-auto max-w-3xl text-center mb-16">
          <Badge className="bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em]">
            Fomentador / investidor
          </Badge>
          <h2 className="mt-5 text-3xl md:text-5xl font-heading font-bold">
            O INVESTIDOR PRECISA DE <span className="text-gold-gradient">MODELO, PRAZO E OBSERVAÇÃO DE RISCO</span>
          </h2>
          <p className="mt-4 text-base leading-8 text-muted-foreground md:text-lg">
            Se a landing quiser atrair fomentador de verdade, ela precisa explicar o que está sendo expandido,
            como a tese funciona e por que as projeções são comerciais, não garantias automáticas.
          </p>
        </ScrollReveal>

        <div className="grid gap-8 lg:grid-cols-[0.95fr,1.05fr] lg:items-start">
          <StaggerContainer className="grid gap-5">
            {investorCards.map((card) => (
              <StaggerItem key={card.title}>
                <div className="rounded-[1.75rem] border border-gold bg-card/85 p-6 transition-all duration-500 hover:-translate-y-1 hover:glow-gold">
                  <div className="flex items-center gap-3">
                    <card.icon className="h-6 w-6 text-primary" />
                    <h3 className="text-xl font-heading font-bold text-white">{card.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{card.text}</p>
                </div>
              </StaggerItem>
            ))}

            <ScrollReveal direction="up">
              <div className="rounded-[1.75rem] border border-primary/25 bg-primary/5 p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-1 h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-lg font-heading font-bold text-white">Mensagem que transmite seriedade</p>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      Retornos projetados dependem do desempenho da operação, da expansão das franquias e das regras do modelo.
                      Isso deve estar escrito de forma clara para o investidor confiar mais.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </StaggerContainer>

          <ScrollReveal direction="right">
            <div className="rounded-[2rem] border border-gold-strong bg-card/95 p-8 glow-gold-strong">
              <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80">Fluxo comercial sugerido para a home</p>
              <h3 className="mt-3 text-2xl font-heading font-bold text-white">Como vender melhor a tese do fomentador</h3>

              <div className="mt-8 space-y-4">
                {investorSteps.map((item) => (
                  <div key={item.step} className="relative rounded-2xl border border-gold bg-black/25 p-5 pl-20">
                    <div className="absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-bold text-primary">
                      {item.step}
                    </div>
                    <p className="text-lg font-heading font-bold text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                {["Até 5% ao mês", "Ciclo-base de 12 meses", "Expansão da rede", "Conversa consultiva"].map((pill) => (
                  <div key={pill} className="inline-flex items-center gap-2 rounded-full border border-gold bg-card px-3 py-2 text-sm text-muted-foreground">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                    {pill}
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
