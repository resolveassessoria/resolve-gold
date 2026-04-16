import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { buildEnvUrl } from "@/lib/environment";
import { toast } from "@/components/ui/sonner";
import { getLoginErrorMessage } from "@/lib/auth";
import { BrandLogo } from "@/components/BrandLogo";

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
      toast.error("Falha no login", {
        description: getLoginErrorMessage(error),
        duration: 6000,
      });
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
          <Link to="/" className="inline-flex justify-center">
            <BrandLogo imageClassName="h-24 md:h-28" />
          </Link>
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
