import { Star, Quote } from "lucide-react";

const professionalTestimonials = [
  {
    name: "Dra. Marina Alves",
    role: "Dermatologista",
    location: "São Paulo, SP",
    content: "A AssineSaúde revolucionou a gestão do meu consultório. Consigo criar planos personalizados e fidelizar meus pacientes.",
    rating: 5
  },
  {
    name: "Dr. Ricardo Santos",
    role: "Cardiologista",
    location: "Rio de Janeiro, RJ",
    content: "Excelente plataforma! O sistema de pagamentos e contratos é muito seguro e profissional.",
    rating: 5
  },
  {
    name: "Dra. Camila Ferreira",
    role: "Nutricionista",
    location: "Curitiba, PR",
    content: "Meus pacientes adoram a facilidade de agendar e gerenciar seus planos online.",
    rating: 5
  }
];

const patientTestimonials = [
  {
    name: "Ana Clara Mendes",
    location: "Belo Horizonte, MG",
    content: "Finalmente encontrei uma forma acessível de cuidar da minha saúde com profissionais de qualidade.",
    rating: 5
  },
  {
    name: "Pedro Oliveira",
    location: "Florianópolis, SC",
    content: "O atendimento é excepcional e os planos são muito mais acessíveis que convênios tradicionais.",
    rating: 5
  },
  {
    name: "Juliana Costa",
    location: "Brasília, DF",
    content: "A plataforma é muito fácil de usar e o suporte sempre me ajuda quando preciso.",
    rating: 5
  }
];

interface TestimonialCardProps {
  name: string;
  role?: string;
  location: string;
  content: string;
  rating: number;
}

const TestimonialCard = ({ name, role, location, content, rating }: TestimonialCardProps) => (
  <div className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-shadow duration-300">
    <Quote className="w-8 h-8 text-primary/30 mb-4" />
    <p className="text-foreground mb-6 leading-relaxed italic">
      "{content}"
    </p>
    <div className="flex gap-1 mb-4">
      {Array.from({ length: rating }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
      ))}
    </div>
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
        <span className="text-accent-foreground font-semibold text-lg">
          {name.split(" ").map(n => n[0]).join("").slice(0, 2)}
        </span>
      </div>
      <div>
        <h4 className="font-semibold text-foreground">{name}</h4>
        {role && <p className="text-sm text-primary">{role}</p>}
        <p className="text-sm text-muted-foreground">{location}</p>
      </div>
    </div>
  </div>
);

const TestimonialsSection = () => {
  return (
    <section id="testemunhos" className="py-20 bg-accent/30">
      <div className="container mx-auto px-4">
        {/* Profissionais */}
        <div className="text-center mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Depoimentos
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            O que dizem nossos Profissionais
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {professionalTestimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>

        {/* Pacientes */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            O que dizem nossos Pacientes
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {patientTestimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
