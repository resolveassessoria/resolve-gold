import { ScrollReveal } from "./AnimationUtils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "Como funciona o cashback?", a: "Ao limpar seu nome através da RESOLVE, você recebe cashback de até 2% ao mês sobre o valor pago, durante 6 meses, creditado em limite do cartão de crédito." },
  { q: "Quanto custa para limpar o nome?", a: "Para dívidas até R$7.000, o valor é fixo de R$700. Para dívidas acima de R$7.001, o valor é 10% do total da dívida." },
  { q: "O que é um fomentador?", a: "O fomentador é um investidor que participa da expansão das franquias RESOLVE, recebendo royalties de até 5% ao mês por 12 meses sobre o valor investido." },
  { q: "Como funciona a comissão do corretor?", a: "O corretor recebe 30% sobre vendas de clientes e 15% sobre fomentadores, além de comissões em 7 níveis de indicação e participação nos bônus de expansão." },
  { q: "Quais os benefícios da franquia?", a: "O franqueado tem acesso a 19 serviços financeiros, comissão de 40% sobre serviços e pode ter franquias arrendadas com divisão de 30% operador e 10% fomentador." },
  { q: "Os pontos de expansão expiram?", a: "Os pontos de expansão acumulam mediante aquisição mensal de conteúdo. Se ficar 3 meses sem compra, os pontos zeram. Compras no marketplace mantêm os pontos." },
];

export function FaqSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            PERGUNTAS <span className="text-gold-gradient">FREQUENTES</span>
          </h2>
        </ScrollReveal>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <ScrollReveal key={i} delay={i * 0.05}>
              <AccordionItem
                value={`faq-${i}`}
                className="bg-card border border-gold rounded-lg px-6 data-[state=open]:glow-gold transition-all duration-300"
              >
                <AccordionTrigger className="text-left font-heading font-semibold text-sm hover:text-primary py-5 transition-colors duration-300 [&[data-state=open]>svg]:rotate-180">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm pb-5 leading-relaxed">
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
