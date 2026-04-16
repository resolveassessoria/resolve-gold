import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { ScrollReveal } from "./AnimationUtils";

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
        <ScrollReveal>
          <div className="bg-card border border-gold rounded-lg p-8 md:p-12 text-center max-w-2xl mx-auto transition-all duration-500 hover:glow-gold">
            <h3 className="text-2xl font-heading font-bold mb-2">Fique por dentro das <span className="text-primary">novidades</span></h3>
            <p className="text-muted-foreground text-sm mb-6">Receba atualizações sobre a plataforma RESOLVE</p>
            <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
              <Input
                placeholder="Seu melhor email"
                className="bg-input border-gold input-focus-glow transition-all duration-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
              <Button type="submit" className="bg-gold-gradient hover:opacity-90 hover:scale-[1.02] transition-all duration-300">
                Inscrever
              </Button>
            </form>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
