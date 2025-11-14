          import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

interface NewsArticle {
  title: string;
  titlePt: string;
  description: string;
  descriptionPt: string;
  image: string;
  url: string;
  publishedAt: string;
  source?: string;
}

export function NewsCarousel() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    if (articles.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [articles.length]);

  const fetchNews = async () => {
    try {
      // First, trigger sync to update latest news
      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-health-news`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      ).catch(() => {}); // Ignore errors from sync

      // Then fetch from database
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/news_highlights?is_active=eq.true&order=display_order.asc`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch news');

      const data = await response.json();

      // Transform database records to NewsArticle format
      const newsArticles = data.map((item: any) => ({
        title: item.title,
        titlePt: item.title,
        description: item.subtitle,
        descriptionPt: item.subtitle,
        image: item.image_url,
        url: item.article_url,
        publishedAt: item.created_at,
        source: item.source || 'healthnews',
      }));

      setArticles(newsArticles);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? articles.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === articles.length - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <div className="w-full h-[600px] bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse" />
    );
  }

  if (articles.length === 0) {
    return null;
  }

  const currentArticle = articles[currentIndex];

  return (
    <div className="relative w-full h-[600px] overflow-hidden group">
      <img
        src={currentArticle.image}
        alt={currentArticle.titlePt}
        className="w-full h-full object-cover transition-opacity duration-1000"
      />

      <div className="absolute top-8 left-8 z-10">
        <img
          src="/healthnewslogopermitidouso.png"
          alt="Health News Today"
          className="h-16 object-contain drop-shadow-lg"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end">
        <div className="container mx-auto px-8 pb-24 text-center">
          <h2 className="text-5xl text-white mb-4 leading-tight font-bold">
            {currentArticle.titlePt}
          </h2>
          <p className="text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed mb-6">
            {currentArticle.descriptionPt}
          </p>
          <a
            href={currentArticle.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Leia no site</span>
          </a>
        </div>
      </div>

      {currentArticle.source === 'healthnews' && (
        <div className="absolute bottom-8 right-8 z-10 text-white text-xs text-right max-w-xs">
          Conteúdo de propriedade da: HEALTHNEWSTODAY LTD - ALL RIGHTS RESERVED - UNITED KINGDOM
        </div>
      )}

      {articles.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-8 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
            aria-label="Notícia anterior"
          >
            <ChevronLeft className="w-6 h-6 text-slate-800" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-8 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
            aria-label="Próxima notícia"
          >
            <ChevronRight className="w-6 h-6 text-slate-800" />
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {articles.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Ir para notícia ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
