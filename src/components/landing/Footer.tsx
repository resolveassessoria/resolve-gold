import { BrandLogo } from "@/components/BrandLogo";

export function Footer() {
  return (
    <footer className="border-t border-gold py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="mb-4">
              <BrandLogo imageClassName="h-16" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Assessoria e Soluções Financeiras com jornada mais clara para cliente, investidor, corretor e franqueado.
            </p>
          </div>
          <div>
            <h5 className="font-heading font-semibold mb-3 text-sm">Plataforma</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#beneficios" className="hover:text-primary transition-colors duration-300 link-underline">Perfis</a></li>
              <li><a href="#cliente" className="hover:text-primary transition-colors duration-300 link-underline">Cliente</a></li>
              <li><a href="#investidor" className="hover:text-primary transition-colors duration-300 link-underline">Investidor</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-heading font-semibold mb-3 text-sm">Perfis</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#beneficios" className="hover:text-primary transition-colors duration-300 link-underline">Cliente</a></li>
              <li><a href="#investidor" className="hover:text-primary transition-colors duration-300 link-underline">Fomentador</a></li>
              <li><a href="#beneficios" className="hover:text-primary transition-colors duration-300 link-underline">Corretor</a></li>
              <li><a href="#franquias" className="hover:text-primary transition-colors duration-300 link-underline">Franqueado</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-heading font-semibold mb-3 text-sm">Navegação</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#roadmap" className="hover:text-primary transition-colors duration-300 link-underline">Expansão</a></li>
              <li><a href="#faq" className="hover:text-primary transition-colors duration-300 link-underline">FAQ</a></li>
              <li><a href="#pre-cadastro" className="hover:text-primary transition-colors duration-300 link-underline">Pré-cadastro</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gold pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} RESOLVE Assessoria e Soluções Financeiras. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
