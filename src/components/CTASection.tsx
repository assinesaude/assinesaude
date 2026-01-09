import { Button } from "@/components/ui/button";
import { ArrowRight, UserPlus, Building2 } from "lucide-react";

import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section id="profissionais" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              Profissionais de Saúde
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-secondary-foreground mt-2 mb-6">
              Aumente sua renda com planos próprios
            </h2>
            <p className="text-secondary-foreground/80 mb-8 text-lg leading-relaxed">
              Cadastre-se gratuitamente e comece hoje mesmo. Defina seus serviços, 
              preços e condições. Fidelize pacientes e garanta receita recorrente 
              com planos de benefícios personalizados.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-secondary-foreground/90">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-sm">✓</span>
                </div>
                Cadastro 100% gratuito para profissionais
              </li>
              <li className="flex items-center gap-3 text-secondary-foreground/90">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-sm">✓</span>
                </div>
                Crie ofertas e planos de benefícios ilimitados
              </li>
              <li className="flex items-center gap-3 text-secondary-foreground/90">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-sm">✓</span>
                </div>
                Dashboard com CRM e relatórios financeiros
              </li>
            </ul>
            <Button size="lg" className="gap-2" asChild>
              <Link to="/cadastro/profissional">
                Cadastrar Grátis Agora
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl p-6 border border-border">
              <UserPlus className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                Sou Paciente
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Encontre profissionais verificados e assine planos com preços acessíveis.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/cadastro/paciente">Buscar Profissionais</Link>
              </Button>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-border border-primary/50 shadow-lg">
              <Building2 className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                Sou Profissional
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Cadastre-se grátis e comece a oferecer seus planos hoje mesmo.
              </p>
              <Button className="w-full" asChild>
                <Link to="/cadastro/profissional">Começar Grátis</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
