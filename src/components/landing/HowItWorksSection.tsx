import { TrendingUp, Users, Store, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal, StaggerContainer, StaggerItem } from "./AnimationUtils";

const profiles = [
  {
    icon: ShieldCheck,
    title: "Cliente",
    summary: "Para quem quer organizar a vida financeira com processo e regra mais visíveis.",
    audience: "Pessoa física que precisa de orientação e quer entender preço, etapas e benefício.",
    entry: "Entrada pelo serviço de regularização, com faixa de preço definida no topo da home.",
    upside: "Cashback em janela definida e acompanhamento da jornada.",
    caution: "Benefícios dependem de análise, elegibilidade e condições do serviço.",
  },
  {
    icon: TrendingUp,
    title: "Fomentador",
    summary: "Para quem enxerga a operação como tese de expansão e quer clareza no racional econômico.",
    audience: "Investidor que busca entender prazo, projeção e dinâmica da receita.",
    entry: "Entrada vinculada ao modelo de expansão apresentado pela operação.",
    upside: "Royalties projetados em ciclos comerciais de até 12 meses.",
    caution: "Projeção não é promessa de rentabilidade fixa; depende da performance da rede.",
  },
  {
    icon: Users,
    title: "Corretor",
    summary: "Para quem quer vender, indicar e construir rede com comissionamento escalável.",
    audience: "Profissional comercial, parceiro ou influenciador de relacionamento.",
    entry: "Onboarding como parceiro comercial e ativação na estrutura de indicação.",
    upside: "Comissão direta, níveis e campanhas de crescimento.",
    caution: "O ganho depende de produção, ativação e consistência comercial.",
  },
  {
    icon: Store,
    title: "Franqueado",
    summary: "Para quem quer operar uma frente local da marca com produtos e serviços financeiros.",
    audience: "Operador comercial que busca uma tese de unidade e portfólio de serviços.",
    entry: "Aquisição da franquia e ativação operacional conforme o modelo da empresa.",
    upside: "Comissão sobre serviços e participação na expansão local.",
    caution: "É uma operação comercial, não um produto passivo.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="beneficios" className="py-24 relative">
      <div className="absolute inset-0 bg-radial-gold opacity-35" />
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal className="mx-auto max-w-3xl text-center mb-16">
          <Badge className="bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em]">
            A home precisa explicar o modelo logo cedo
          </Badge>
          <h2 className="mt-5 text-3xl md:text-5xl font-heading font-bold">
            QUEM ENTRA, <span className="text-gold-gradient">COMO ENTRA</span> E COMO PODE GANHAR
          </h2>
          <p className="mt-4 text-base leading-8 text-muted-foreground md:text-lg">
            Em vez de apresentar só benefícios soltos, a landing agora precisa mostrar a lógica de cada perfil:
            para quem ele existe, como começa e o que precisa ser entendido antes da decisão.
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6" staggerDelay={0.12}>
          {profiles.map((profile) => (
            <StaggerItem key={profile.title}>
              <div className="h-full rounded-[1.75rem] border border-gold bg-card/80 p-7 transition-all duration-500 hover:-translate-y-1 hover:border-gold-strong hover:glow-gold-strong">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <profile.icon className="w-11 h-11 text-primary mb-5" />
                    <h3 className="text-2xl font-heading font-bold text-white">{profile.title}</h3>
                  </div>
                  <Badge variant="outline" className="border-primary/25 text-primary bg-primary/5">
                    Perfil
                  </Badge>
                </div>

                <p className="mt-3 text-sm leading-7 text-white/90">{profile.summary}</p>

                <div className="mt-6 space-y-4">
                  {[
                    { label: "Para quem é", text: profile.audience },
                    { label: "Como entra", text: profile.entry },
                    { label: "Como monetiza", text: profile.upside },
                    { label: "O que precisa saber", text: profile.caution },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-gold bg-black/20 p-4">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80">{item.label}</p>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
