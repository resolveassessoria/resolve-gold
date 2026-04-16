import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { buildEnvUrl } from "@/lib/environment";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        toast.error("Confirme seu email antes de fazer login. Verifique sua caixa de entrada.");
      } else if (error.message.includes("Invalid login credentials")) {
        toast.error("Email ou senha incorretos.");
      } else {
        toast.error(error.message);
      }
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("tipo_usuario")
        .eq("id", user.id)
        .single();

      const role = profile?.tipo_usuario;

      if (role === "admin") {
        // Redirect to admin environment
        const adminUrl = buildEnvUrl("admin", "/admin/dashboard");
        if (adminUrl.startsWith("http")) {
          window.location.href = adminUrl;
        } else {
          navigate(adminUrl);
        }
      } else {
        const appRoutes: Record<string, string> = {
          cliente: "/cliente/dashboard",
          fomentador: "/fomentador/dashboard",
          corretor: "/corretor/dashboard",
          franqueado: "/franqueado/dashboard",
        };
        const path = role ? (appRoutes[role] || "/onboarding") : "/onboarding";
        const appUrl = buildEnvUrl("app", path);
        if (appUrl.startsWith("http")) {
          window.location.href = appUrl;
        } else {
          navigate(appUrl);
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-heading font-bold text-primary">RESOLVE</Link>
          <p className="text-muted-foreground mt-2">Acesse sua conta</p>
        </div>

        <div className="bg-card border border-gold rounded-lg p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="seu@email.com" className="bg-input border-gold" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl><Input type="password" placeholder="••••••" className="bg-input border-gold" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Entrar
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Não tem conta?{" "}
            <Link to="/register" className="text-primary hover:underline">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
