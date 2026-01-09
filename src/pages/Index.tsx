import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import SearchSection from "@/components/SearchSection";
import ActivityCategories from "@/components/ActivityCategories";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import NativeRSSFeed from "@/components/NativeRSSFeed";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AssineSaúde | Plataforma para Profissionais de Saúde Criarem Planos</title>
        <meta name="description" content="Profissionais de saúde: cadastre-se grátis e crie seus próprios planos de benefícios. Médicos, dentistas e nutricionistas aumentam sua renda com AssineSaúde." />
        <link rel="canonical" href="https://assinesaude.com.br" />
      </Helmet>
      
      <Header />
      
      {/* Spacer for fixed header */}
      <div className="h-[72px]" />
      
      <main>
        <HeroCarousel />
        <SearchSection />
        <ActivityCategories />
        <FeaturesSection />
        <CTASection />
        <TestimonialsSection />
        <NativeRSSFeed />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
