import { AlertCircle, BadgeCheck, Calculator, FileText, Gift, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "./AnimationUtils";

const pricingCards = [
  {
    title: "Dívida até R$ 7.000",
    price: "R$ 700",
    detail: "Entrada fixa para o serviço",
    bullets: [
      "Preço comunicado com clareza desde o início",
      "Ideal para reduzir a fricção do primeiro contato",
      "Ajuda o cliente a entender a porta de entrada sem conta escondida",
    ],
  },
  {
    title: "Dívida acima de R$ 7.001",
    price: "10%",
    detail: "Aplicado sobre o valor da dívida",
    bullets: [
      "Modelo proporcional para casos maiores",
      "Precisa aparecer como regra objetiva e não como surpresa comercial",
      "Facilita a conversa de fechamento com transparência",
    ],
  },
];

const clientRules = [
  {
    icon: Gift,
    title: "Cashback em janela definida",
    description: "Apresente sempre como benefício condicionado às regras do serviço, com linguagem de estimativa e prazo claro.",
  },
  {
    icon: ShieldCheck,
    title: "Análise e elegibilidade",
    description: "O cliente precisa enxergar que parte do fluxo depende de análise, validação de perfil e evolução da jornada.",
  },
  {
    icon: FileText,
    title: "Acompanhamento por etapas",
    description: "Quanto mais a página mostrar o passo a passo do processo, menor a ansiedade de quem está entrando.",
  },
  {
    icon: Calculator,
    title: "Regra antes da promessa",
    description: "Mostre primeiro custo, condição e etapa. O benefício vem depois, com mais credibilidade comercial.",
  },
];

export function PricingSection() {
  return (
    <section id="cliente" className="py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal className="mx-auto max-w-3xl text-center mb-14">
          <Badge className="bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em]">
            Cliente: regras resumidas e bem visíveis
          </Badge>
          <h2 className="mt-5 text-3xl md:text-5xl font-heading font-bold">
            O CLIENTE PRECISA ENTENDER <span className="text-gold-gradient">O CUSTO, O PROCESSO E O BENEFÍCIO</span>
          </h2>
          <p className="mt-4 text-base leading-8 text-muted-foreground md:text-lg">
            A página inicial tem mais força comercial quando a regra aparece com clareza: quanto custa, quando muda de faixa
            e como o cashback entra dentro da jornada.
          </p>
        </ScrollReveal>

        <div className="grid gap-8 xl:grid-cols-[1.05fr,0.95fr]">
          <div className="grid gap-6 md:grid-cols-2">
            {pricingCards.map((card, index) => (
              <ScrollReveal key={card.title} delay={index * 0.08} direction={index % 2 === 0 ? "left" : "right"}>
                <div className="h-full rounded-[1.75rem] border border-gold bg-card p-8 transition-all duration-500 hover:-translate-y-1 hover:glow-gold-strong">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80">{card.title}</p>
                  <p className="mt-4 text-5xl font-heading font-bold text-primary">{card.price}</p>
                  <p className="mt-2 text-sm text-white/85">{card.detail}</p>
                  <div className="mt-6 space-y-3">
                    {card.bullets.map((bullet) => (
                      <div key={bullet} className="flex gap-3 rounded-2xl border border-gold bg-black/20 p-4">
                        <BadgeCheck className="w-4 h-4 text-primary mt-1 shrink-0" />
                        <p className="text-sm leading-7 text-muted-foreground">{bullet}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal direction="up">
            <div className="rounded-[1.9rem] border border-gold-strong bg-card/90 p-8 glow-gold-strong">
              <h3 className="text-2xl font-heading font-bold text-white">Como transformar preço em confiança</h3>
              <p className="mt-3 text-sm leading-8 text-muted-foreground md:text-base">
                Hoje a home ainda deixa muita coisa implícita. Para cliente, isso reduz conversão. O ideal é bater sempre nestes quatro pontos:
              </p>

              <div className="mt-7 space-y-4">
                {clientRules.map((rule) => (
                  <div key={rule.title} className="rounded-2xl border border-gold bg-black/25 p-5">
                    <div className="flex items-center gap-3">
                      <rule.icon className="h-5 w-5 text-primary" />
                      <h4 className="font-heading text-lg font-bold text-white">{rule.title}</h4>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{rule.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-7 rounded-2xl border border-primary/25 bg-primary/5 p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Texto que não pode faltar na landing</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      Benefícios, condições e liberações dependem de análise, contratação e cumprimento das regras do serviço.
                      Isso deixa a oferta mais séria e mais confiável.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
