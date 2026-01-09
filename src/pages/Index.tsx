import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import SearchSection from "@/components/SearchSection";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import AIChatWidget from "@/components/AIChatWidget";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Spacer for fixed header */}
      <div className="h-[72px]" />
      
      <main>
        <HeroCarousel />
        <SearchSection />
        <FeaturesSection />
        <CTASection />
        <TestimonialsSection />
      </main>
      
      <Footer />
      <AIChatWidget />
    </div>
  );
};

export default Index;
