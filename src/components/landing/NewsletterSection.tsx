import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export function NewsletterSection() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Inscrito com sucesso!");
      setEmail("");
    }
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card border border-gold rounded-lg p-8 md:p-12 text-center max-w-2xl mx-auto glow-gold"
        >
          <h3 className="text-2xl font-heading font-bold mb-2">Fique por dentro das <span className="text-primary">novidades</span></h3>
          <p className="text-muted-foreground text-sm mb-6">Receba atualizações sobre a plataforma RESOLVE</p>
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
            <Input
              placeholder="Seu melhor email"
              className="bg-input border-gold"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
            <Button type="submit">Inscrever</Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
