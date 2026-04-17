import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { ScrollReveal } from "./AnimationUtils";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const schema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  cpf: z.string().min(11, "CPF inválido"),
  telefone: z.string().min(10, "Telefone inválido"),
  tipo_usuario: z.string().min(1, "Selecione um tipo"),
});

type FormData = z.infer<typeof schema>;

export function PreRegistrationSection() {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { nome: "", email: "", cpf: "", telefone: "", tipo_usuario: "" },
  });

  const onSubmit = (data: FormData) => {
    setLoading(true);
    setTimeout(() => {
      console.log(data);
      toast.success("Pré-cadastro realizado com sucesso! Entraremos em contato em breve.");
      form.reset();
      setLoading(false);
    }, 800);
  };

  return (
    <section id="pre-cadastro" className="py-24 relative">
      <div className="absolute inset-0 bg-radial-gold opacity-30" />
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
            <span className="text-gold-gradient">PRÉ-CADASTRO</span>
          </h2>
          <p className="text-muted-foreground">Garanta seu lugar na plataforma RESOLVE</p>
        </ScrollReveal>

        <ScrollReveal>
          <div className="max-w-lg mx-auto bg-card border border-gold rounded-lg p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField control={form.control} name="nome" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl><Input placeholder="Seu nome" className="bg-input border-gold input-focus-glow transition-all duration-300" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="seu@email.com" className="bg-input border-gold input-focus-glow transition-all duration-300" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="cpf" render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl><Input placeholder="000.000.000-00" className="bg-input border-gold input-focus-glow transition-all duration-300" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="telefone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl><Input placeholder="(00) 00000-0000" className="bg-input border-gold input-focus-glow transition-all duration-300" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="tipo_usuario" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Usuário</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-input border-gold">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cliente">Cliente</SelectItem>
                        <SelectItem value="fomentador">Fomentador</SelectItem>
                        <SelectItem value="corretor">Corretor</SelectItem>
                        <SelectItem value="franqueado">Franqueado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full bg-gold-gradient hover:opacity-90 transition-all duration-300" size="lg" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  QUERO ME CADASTRAR
                </Button>
              </form>
            </Form>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
