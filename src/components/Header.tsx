import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo centralizado em desktop */}
          <div className="flex-1 hidden md:flex justify-start">
            <nav className="flex gap-6">
              <a href="#como-funciona" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Como Funciona
              </a>
              <a href="#profissionais" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Para Profissionais
              </a>
            </nav>
          </div>
          
          <div className="flex-1 flex justify-center">
            <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Assine<span className="text-primary">Saúde</span>
            </h1>
          </div>
          
          <div className="flex-1 hidden md:flex justify-end items-center gap-4">
            <nav className="flex gap-6 mr-4">
              <a href="#testemunhos" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Testemunhos
              </a>
              <a href="#contato" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Contato
              </a>
            </nav>
            <Button variant="outline" size="sm">
              Entrar
            </Button>
            <Button size="sm">
              Cadastrar
            </Button>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <nav className="flex flex-col gap-4">
              <a href="#como-funciona" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Como Funciona
              </a>
              <a href="#profissionais" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Para Profissionais
              </a>
              <a href="#testemunhos" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Testemunhos
              </a>
              <a href="#contato" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Contato
              </a>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Entrar
                </Button>
                <Button size="sm" className="flex-1">
                  Cadastrar
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
