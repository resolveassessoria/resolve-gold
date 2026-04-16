import { motion } from "framer-motion";

const steps = [
  { label: "START", value: "R$ 1.8 Milhão", desc: "Projeção inicial com 100 franquias + 1000 corretores" },
  { label: "EXPANSÃO", value: "300 Franquias", desc: "R$ 30 milhões/mês com 300 franquias ativas" },
  { label: "META ANUAL", value: "R$ 492 Milhões", desc: "41 mil clientes/mês com ticket médio R$1.000" },
];

export function RoadmapSection() {
  return (
    <section id="roadmap" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            <span className="text-gold-gradient">ROAD MAP</span>
          </h2>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Line */}
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent hidden md:block" />

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="text-center relative"
              >
                <div className="w-4 h-4 bg-primary rounded-full mx-auto mb-6 animate-pulse-gold hidden md:block" />
                <div className="bg-card border border-gold rounded-lg p-6 hover:glow-gold transition-all">
                  <span className="text-xs font-bold text-primary tracking-widest">{step.label}</span>
                  <p className="text-2xl font-heading font-bold text-primary mt-2">{step.value}</p>
                  <p className="text-sm text-muted-foreground mt-2">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
