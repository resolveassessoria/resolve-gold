import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BadgeCheck, Building2, Calculator, Gift, Store, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/BrandLogo";

type AudienceKey = "cliente" | "fomentador" | "corretor" | "franqueado";

const audienceContent: Record<
  AudienceKey,
  {
    label: string;
    icon: typeof Calculator;
    eyebrow: string;
    headline: string;
    description: string;
    primaryHref: string;
    primaryLabel: string;
    secondaryHref: string;
    secondaryLabel: string;
    quickFacts: string[];
    panelTitle: string;
    panelSummary: string;
    highlights: Array<{ title: string; value: string; note: string }>;
  }
> = {
  cliente: {
    label: "Cliente",
    icon: Calculator,
    eyebrow: "Para quem quer regularizar a vida financeira com regra clara",
    headline: "Entenda o custo, o processo e o cashback antes de contratar.",
    description:
      "A home precisa deixar claro o que a Resolve faz: assessoria financeira com jornada estruturada, preço definido por faixa e benefícios condicionados ao perfil e à elegibilidade do cliente.",
    primaryHref: "#cliente",
    primaryLabel: "Ver regras do cliente",
    secondaryHref: "#pre-cadastro",
    secondaryLabel: "Quero atendimento",
    quickFacts: [
      "Preço fixo até R$ 7.000 de dívida",
      "Cashback de até 2% ao mês por até 6 meses",
      "Processo acompanhado em etapas",
    ],
    panelTitle: "Resumo do cliente",
    panelSummary: "A promessa fica mais forte quando a regra aparece logo no topo e reduz a sensação de risco para quem está entrando.",
    highlights: [
      { title: "Entrada", value: "R$ 700", note: "Para dívidas até R$ 7 mil." },
      { title: "Faixa acima", value: "10%", note: "Aplicado sobre o valor da dívida." },
      { title: "Cashback", value: "Até 6 meses", note: "Condição vinculada às regras do serviço." },
    ],
  },
  fomentador: {
    label: "Fomentador",
    icon: TrendingUp,
    eyebrow: "Para quem quer entrar como investidor da expansão",
    headline: "Mostre o modelo, o prazo e o que é projeção antes de falar em retorno.",
    description:
      "O investidor precisa enxergar lógica econômica, não só promessa. A landing deve explicar que o fomentador aporta na expansão, acompanha o ciclo do modelo e visualiza projeções com observações claras.",
    primaryHref: "#investidor",
    primaryLabel: "Ver área do investidor",
    secondaryHref: "#pre-cadastro",
    secondaryLabel: "Quero falar sobre aporte",
    quickFacts: [
      "Royalties projetados de até 5% ao mês",
      "Ciclos comerciais apresentados em 12 meses",
      "Performance vinculada à expansão da operação",
    ],
    panelTitle: "Resumo do investidor",
    panelSummary: "Quanto mais clara a regra de entrada, de prazo e de risco, mais confiável a página fica para quem pensa em aportar.",
    highlights: [
      { title: "Modelo", value: "Expansão", note: "Participação na tese comercial da rede." },
      { title: "Prazo-base", value: "12 meses", note: "Janela usada nas projeções do material." },
      { title: "Retorno", value: "Até 5%/mês", note: "Projeção comercial, não promessa fixa." },
    ],
  },
  corretor: {
    label: "Corretor",
    icon: Users,
    eyebrow: "Para quem quer vender, indicar e escalar comissão",
    headline: "Explique a estrutura de comissão e o plano de crescimento com menos neblina.",
    description:
      "O corretor compra a ideia quando entende rapidamente como entra, como monetiza e onde a expansão aumenta o ganho. A home precisa deixar isso mais tangível.",
    primaryHref: "#beneficios",
    primaryLabel: "Ver perfis e ganhos",
    secondaryHref: "#pre-cadastro",
    secondaryLabel: "Quero atuar como corretor",
    quickFacts: [
      "Comissão direta sobre vendas",
      "Níveis de indicação e campanhas",
      "Marketplace como apoio de monetização",
    ],
    panelTitle: "Resumo do corretor",
    panelSummary: "Quem vende precisa enxergar oportunidade, regra e escada de crescimento em poucos segundos.",
    highlights: [
      { title: "Comissão", value: "Direta + níveis", note: "Modelo comercial de crescimento." },
      { title: "Escala", value: "Rede", note: "Expansão com indicação estruturada." },
      { title: "Apoio", value: "Marketplace", note: "Produtos que ampliam a conversa comercial." },
    ],
  },
  franqueado: {
    label: "Franqueado",
    icon: Store,
    eyebrow: "Para quem quer operar uma frente comercial da marca",
    headline: "Posicione a franquia como operação, não só como preço promocional.",
    description:
      "A franquia ganha força quando a página mostra claramente o que inclui, como se monetiza e por que o timing de entrada é relevante para o operador.",
    primaryHref: "#franquias",
    primaryLabel: "Ver franquias",
    secondaryHref: "#pre-cadastro",
    secondaryLabel: "Quero avaliar a operação",
    quickFacts: [
      "19 serviços financeiros no ecossistema",
      "Comissão operacional sobre serviços",
      "Tese de expansão com exclusividade inicial",
    ],
    panelTitle: "Resumo da franquia",
    panelSummary: "O franqueado quer enxergar estrutura operacional, potencial de receita e o que diferencia essa entrada das demais.",
    highlights: [
      { title: "Portfólio", value: "19 serviços", note: "Amplia a operação comercial." },
      { title: "Comissão", value: "40%", note: "Sobre serviços vendidos, conforme modelo." },
      { title: "Oferta", value: "Lote inicial", note: "Condição promocional para primeiras entradas." },
    ],
  },
};

const heroStats = [
  { value: "4", label: "portas de entrada", note: "cliente, investidor, corretor e franqueado" },
  { value: "R$ 700", label: "ticket inicial do cliente", note: "para dívidas até R$ 7 mil" },
  { value: "Até 5%/mês", label: "projeção do fomentador", note: "em janelas comerciais apresentadas" },
];

export function HeroSection() {
  const reduceMotion = useReducedMotion();
  const audienceKeys = useMemo(() => Object.keys(audienceContent) as AudienceKey[], []);
  const [activeAudience, setActiveAudience] = useState<AudienceKey>("cliente");

  useEffect(() => {
    if (reduceMotion) return;

    const interval = window.setInterval(() => {
      setActiveAudience((current) => {
        const currentIndex = audienceKeys.indexOf(current);
        return audienceKeys[(currentIndex + 1) % audienceKeys.length];
      });
    }, 5500);

    return () => window.clearInterval(interval);
  }, [audienceKeys, reduceMotion]);

  const content = audienceContent[activeAudience];
  const ActiveIcon = content.icon;

  return (
    <section id="inicio" className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
      <div className="absolute inset-0 bg-radial-gold" />
      <div className="absolute inset-0 bg-ambient-glow opacity-70" />
      <div className="absolute left-1/2 top-20 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary/6 blur-[140px]" />
      <div className="absolute inset-x-6 top-8 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid gap-12 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
          <div>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-5"
            >
              <Badge className="bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em]">
                Plataforma financeira com discurso mais claro para cliente e investidor
              </Badge>
            </motion.div>

            <motion.h1
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="max-w-4xl text-4xl font-heading font-bold leading-[1.02] md:text-6xl lg:text-[4.4rem]"
            >
              A plataforma precisa vender
              <span className="block text-gold-gradient"> entendimento antes de prometer ganho.</span>
            </motion.h1>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeAudience}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="mt-6 space-y-4"
              >
                <div className="flex items-center gap-3 text-primary">
                  <ActiveIcon className="h-5 w-5" />
                  <p className="text-sm font-semibold uppercase tracking-[0.26em]">{content.eyebrow}</p>
                </div>
                <p className="max-w-2xl text-lg text-white/95 md:text-2xl">{content.headline}</p>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">{content.description}</p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex flex-wrap gap-3">
              {audienceKeys.map((audienceKey) => {
                const audience = audienceContent[audienceKey];
                const Icon = audience.icon;
                const isActive = audienceKey === activeAudience;

                return (
                  <button
                    key={audienceKey}
                    type="button"
                    onClick={() => setActiveAudience(audienceKey)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all ${
                      isActive
                        ? "border-primary/40 bg-primary/10 text-primary glow-gold"
                        : "border-gold bg-card/60 text-muted-foreground hover:border-primary/30 hover:text-primary"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {audience.label}
                  </button>
                );
              })}
            </div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Button
                asChild
                size="lg"
                className="bg-gold-gradient px-8 text-base font-semibold text-primary-foreground hover:opacity-90"
              >
                <a href={content.primaryHref}>
                  {content.primaryLabel}
                  <ArrowRight className="ml-1" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary/35 bg-transparent px-8 text-base text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <a href={content.secondaryHref}>{content.secondaryLabel}</a>
              </Button>
            </motion.div>

            <div className="mt-8 flex flex-wrap gap-3">
              {content.quickFacts.map((fact) => (
                <div
                  key={fact}
                  className="inline-flex items-center gap-2 rounded-full border border-gold bg-card/55 px-3 py-2 text-sm text-muted-foreground"
                >
                  <BadgeCheck className="h-4 w-4 text-primary" />
                  {fact}
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, delay: 0.12 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-gold-strong bg-[linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-6 glow-gold-strong backdrop-blur-xl md:p-8">
              <div className="absolute inset-x-0 top-0 h-1 bg-gold-gradient" />

              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-primary/80">Leitura rápida da oferta</p>
                  <h3 className="mt-3 text-2xl font-heading font-bold text-white">{content.panelTitle}</h3>
                </div>
                <BrandLogo imageClassName="h-16 border-primary/20 md:h-20" />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeAudience}-panel`}
                  initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="mt-6"
                >
                  <p className="max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
                    {content.panelSummary}
                  </p>

                  <div className="mt-6 grid gap-3 md:grid-cols-3">
                    {content.highlights.map((highlight, index) => (
                      <motion.div
                        key={highlight.title}
                        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: index * 0.08 }}
                        className="rounded-2xl border border-gold bg-black/35 p-4"
                      >
                        <p className="text-xs uppercase tracking-[0.22em] text-primary/80">{highlight.title}</p>
                        <p className="mt-2 text-2xl font-heading font-bold text-white">{highlight.value}</p>
                        <p className="mt-2 text-xs leading-6 text-muted-foreground">{highlight.note}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/6 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-primary/80">Importante</p>
                <p className="mt-2 text-sm leading-7 text-white/90">
                  Projeções comerciais e benefícios dependem do perfil, da análise, da operação e das condições contratuais.
                  Quanto mais clara essa regra na landing, maior a confiança do visitante.
                </p>
              </div>
            </div>

            {!reduceMotion && (
              <>
                <motion.div
                  animate={{ y: [0, -14, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -left-3 top-10 hidden rounded-2xl border border-gold bg-card/85 px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.35)] md:block"
                >
                  <p className="text-[11px] uppercase tracking-[0.18em] text-primary/80">Clareza</p>
                  <p className="mt-1 text-sm font-semibold text-white">Regra + benefício + prova</p>
                </motion.div>
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                  className="absolute -right-3 bottom-10 hidden rounded-2xl border border-gold bg-card/85 px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.35)] md:block"
                >
                  <p className="text-[11px] uppercase tracking-[0.18em] text-primary/80">Conversão</p>
                  <p className="mt-1 text-sm font-semibold text-white">Menos promessa vaga, mais entendimento</p>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-14 grid gap-4 md:grid-cols-3"
        >
          {heroStats.map((stat) => (
            <div key={stat.label} className="rounded-[1.5rem] border border-gold bg-card/55 p-5 backdrop-blur">
              <p className="text-3xl font-heading font-bold text-primary">{stat.value}</p>
              <p className="mt-2 text-sm font-semibold text-white">{stat.label}</p>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">{stat.note}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
