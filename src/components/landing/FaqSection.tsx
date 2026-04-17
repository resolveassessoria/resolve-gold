import { ScrollReveal } from "./AnimationUtils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "A Resolve é uma assessoria, uma plataforma ou uma oportunidade de investimento?",
    a: "A home precisa mostrar que a Resolve combina assessoria financeira para cliente, estrutura comercial para parceiros e tese de expansão para fomentadores e franqueados. Cada perfil entra por uma regra diferente.",
  },
  {
    q: "Quanto custa para o cliente entrar?",
    a: "A comunicação atual trabalha com R$ 700 para dívidas de até R$ 7.000 e 10% do valor para faixas acima disso. Isso deve aparecer de forma objetiva logo no topo da jornada do cliente.",
  },
  {
    q: "O cashback é automático e garantido?",
    a: "Não. A comunicação da página precisa deixar claro que cashback e demais benefícios dependem de regras do serviço, análise, elegibilidade e cumprimento das condições da jornada.",
  },
  {
    q: "Como o fomentador ganha?",
    a: "O fomentador entra na tese de expansão da operação. A home deve explicar o racional do modelo, o ciclo comercial e que royalties de até 5% ao mês são apresentados como projeção, não como promessa fixa.",
  },
  {
    q: "Por que o corretor e o franqueado entram nesse ecossistema?",
    a: "Porque a proposta não é só cadastro: é estrutura comercial. O corretor entra para vender, indicar e escalar comissão; o franqueado entra para operar uma frente comercial com portfólio de serviços.",
  },
  {
    q: "O que está faltando hoje na home para converter melhor?",
    a: "Mais clareza de regra, menos promessa solta, mais prova de processo, mais observação sobre análise e mais explicação direta para cliente e investidor logo nas primeiras dobras da página.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            PERGUNTAS <span className="text-gold-gradient">QUE A HOME PRECISA RESPONDER</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-7">
            Uma landing mais forte antecipa dúvida comercial e reduz objeção antes mesmo do clique no WhatsApp ou no cadastro.
          </p>
        </ScrollReveal>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <ScrollReveal key={i} delay={i * 0.04}>
              <AccordionItem
                value={`faq-${i}`}
                className="rounded-[1.5rem] border border-gold bg-card px-6 data-[state=open]:glow-gold transition-all duration-300"
              >
                <AccordionTrigger className="text-left font-heading font-semibold text-sm hover:text-primary py-5 transition-colors duration-300 [&[data-state=open]>svg]:rotate-180">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm pb-5 leading-7">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            </ScrollReveal>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
