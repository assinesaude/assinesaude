import { Shield, Clock, Users, Sparkles, CreditCard, HeartPulse } from "lucide-react";

const features = [
  {
    icon: HeartPulse,
    title: "Cadastro Gratuito",
    description: "Profissionais de saúde se cadastram sem custo e começam a criar planos imediatamente"
  },
  {
    icon: Shield,
    title: "Verificação Profissional",
    description: "Selo de confiança com validação de documentos e registro em conselhos"
  },
  {
    icon: Clock,
    title: "Autonomia Total",
    description: "Defina seus próprios preços, serviços e condições de atendimento"
  },
  {
    icon: Users,
    title: "Fidelização de Pacientes",
    description: "CRM integrado para gestão de relacionamento e retenção de pacientes"
  },
  {
    icon: CreditCard,
    title: "Receita Recorrente",
    description: "Planos de assinatura garantem fluxo de caixa previsível todo mês"
  },
  {
    icon: Sparkles,
    title: "Dashboard Profissional",
    description: "Relatórios financeiros, agenda e métricas de desempenho em tempo real"
  }
];

const FeaturesSection = () => {
  return (
    <section id="como-funciona" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Vantagens
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Por que escolher AssineSaúde?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Uma plataforma completa que conecta profissionais de saúde qualificados 
            a pacientes que buscam cuidado personalizado e acessível.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-7 h-7 text-accent-foreground" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
