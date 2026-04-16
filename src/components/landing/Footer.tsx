export function Footer() {
  return (
    <footer className="border-t border-gold py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-xl font-heading font-bold text-primary mb-4">RESOLVE</h4>
            <p className="text-sm text-muted-foreground">
              Assessoria e Soluções Financeiras. Devolvemos seu poder de compra.
            </p>
          </div>
          <div>
            <h5 className="font-heading font-semibold mb-3 text-sm">Plataforma</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#beneficios" className="hover:text-primary transition-colors">Benefícios</a></li>
              <li><a href="#precos" className="hover:text-primary transition-colors">Preços</a></li>
              <li><a href="#roadmap" className="hover:text-primary transition-colors">Roadmap</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-heading font-semibold mb-3 text-sm">Perfis</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#beneficios" className="hover:text-primary transition-colors">Cliente</a></li>
              <li><a href="#beneficios" className="hover:text-primary transition-colors">Corretor</a></li>
              <li><a href="#franquias" className="hover:text-primary transition-colors">Franqueado</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-heading font-semibold mb-3 text-sm">Legal</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacidade</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
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
