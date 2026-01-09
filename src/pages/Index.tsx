import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import SearchSection from "@/components/SearchSection";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import NativeRSSFeed from "@/components/NativeRSSFeed";
import Footer from "@/components/Footer";

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
        <NativeRSSFeed />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
