import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Newspaper, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
}

const NativeRSSFeed = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

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
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Newspaper className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold">Últimas Notícias em Saúde</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Fique por dentro das novidades e tendências do mundo da saúde
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
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

          {/* News Card */}
          <Card className="overflow-hidden border-border/50 shadow-xl bg-gradient-to-br from-background to-muted/20">
            <CardContent className="p-8 md:p-12">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6 mx-auto" />
                  <Skeleton className="h-4 w-4/5 mx-auto" />
                </div>
              ) : currentNews ? (
                <div
                  className={`transition-all duration-300 ${
                    isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
                  }`}
                >
                  <h3 className="text-2xl md:text-3xl font-bold text-center mb-6 text-foreground leading-tight">
                    {currentNews.title}
                  </h3>
                  <p className="text-muted-foreground text-center text-lg leading-relaxed mb-8">
                    {currentNews.description}
                  </p>
                  <div className="flex justify-center">
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
              ) : (
                <p className="text-center text-muted-foreground">
                  Nenhuma notícia disponível no momento.
                </p>
              )}
            </CardContent>
          </Card>

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
