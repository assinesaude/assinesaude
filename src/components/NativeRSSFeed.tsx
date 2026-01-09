import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import healthNewsLogo from '@/assets/healthnewstoday-logo.png';

interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  image: string;
}

const NativeRSSFeed = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const browserLanguage = navigator.language.split('-')[0];
        
        const { data, error } = await supabase.functions.invoke('translate-rss', {
          body: { targetLanguage: browserLanguage },
        });

        if (error) {
          console.error('Error fetching news:', error);
          return;
        }

        if (data?.news) {
          setNews(data.news);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Autoplay effect
  useEffect(() => {
    if (news.length === 0 || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => (prev + 1) % news.length);
      setTimeout(() => setIsTransitioning(false), 300);
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [news.length, isPaused]);

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % news.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToPrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const currentNews = news[currentIndex];

  return (
    <section 
      className="py-12"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4">
        {/* Logo */}
        <div className="max-w-6xl mx-auto mb-6">
          <a 
            href="https://www.healthnews.today" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block hover:opacity-80 transition-opacity"
          >
            <img 
              src={healthNewsLogo} 
              alt="HYNews Today" 
              className="h-10 md:h-12 object-contain"
            />
          </a>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border-border/50 shadow-lg hover:bg-background hover:scale-110 transition-all duration-200"
            onClick={goToPrevious}
            disabled={isLoading || news.length === 0}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border-border/50 shadow-lg hover:bg-background hover:scale-110 transition-all duration-200"
            onClick={goToNext}
            disabled={isLoading || news.length === 0}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* News Content */}
          <div className="overflow-hidden rounded-2xl border border-border/50 shadow-xl bg-card">
            {isLoading ? (
              <div className="flex flex-col md:flex-row">
                <Skeleton className="w-full md:w-1/2 h-64 md:h-80" />
                <div className="p-8 flex-1 space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            ) : currentNews ? (
              <div
                className={`flex flex-col md:flex-row transition-all duration-300 ${
                  isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
                }`}
              >
                {/* Image */}
                <div className="w-full md:w-1/2 h-64 md:h-80 overflow-hidden">
                  <img
                    src={currentNews.image}
                    alt={currentNews.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Content */}
                <div className="flex-1 p-8 flex flex-col justify-center">
                  <h3 className="text-xl md:text-2xl font-bold mb-4 text-foreground leading-tight">
                    {currentNews.title}
                  </h3>
                  <p className="text-muted-foreground text-base leading-relaxed mb-6">
                    {currentNews.description}
                  </p>
                  <div>
                    <Button
                      variant="outline"
                      className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => window.open(currentNews.link, '_blank')}
                    >
                      Ler mais
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground p-8">
                Nenhuma notícia disponível no momento.
              </p>
            )}
          </div>

          {/* Pagination Dots */}
          {news.length > 0 && (
            <div className="flex justify-center gap-2 mt-6">
              {news.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!isTransitioning) {
                      setIsTransitioning(true);
                      setCurrentIndex(index);
                      setTimeout(() => setIsTransitioning(false), 300);
                    }
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'w-8 bg-primary'
                      : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`Ir para notícia ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NativeRSSFeed;
