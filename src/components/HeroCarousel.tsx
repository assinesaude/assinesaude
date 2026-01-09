import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

const slides = [
  {
    image: hero1,
    title: "Crie Seus Planos de Benefícios",
    subtitle: "Médicos, dentistas e profissionais de saúde: cadastre-se grátis e aumente sua renda"
  },
  {
    image: hero2,
    title: "Gestão Completa do Consultório",
    subtitle: "Dashboard inteligente, CRM de pacientes e relatórios financeiros em um só lugar"
  },
  {
    image: hero3,
    title: "Fidelize Seus Pacientes",
    subtitle: "Ofereça planos personalizados e construa relacionamentos duradouros"
  }
];

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 10000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="relative w-full h-[600px] md:h-[700px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-foreground/40 z-10" />
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
            <h2 className="font-serif text-4xl md:text-6xl font-bold text-card mb-4 drop-shadow-lg">
              {slide.title}
            </h2>
            <p className="text-lg md:text-xl text-card/90 max-w-2xl drop-shadow-md">
              {slide.subtitle}
            </p>
          </div>
        </div>
      ))}

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-card/20 backdrop-blur-sm hover:bg-card/40 transition-colors"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="w-6 h-6 text-card" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-card/20 backdrop-blur-sm hover:bg-card/40 transition-colors"
        aria-label="Próximo slide"
      >
        <ChevronRight className="w-6 h-6 text-card" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? "bg-primary w-8" 
                : "bg-card/50 hover:bg-card/70"
            }`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
