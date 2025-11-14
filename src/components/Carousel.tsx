import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { supabase, NewsHighlight } from '../lib/supabase';

export function Carousel() {
  const [items, setItems] = useState<NewsHighlight[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNewsHighlights();
  }, []);

  useEffect(() => {
    if (items.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [items.length]);

  const fetchNewsHighlights = async () => {
    try {
      const { data, error } = await supabase
        .from('news_highlights')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
        .limit(10);

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching news highlights:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  if (loading) {
    return (
      <div className="w-full h-[600px] bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse" />
    );
  }

  if (items.length === 0) {
    return null;
  }

  const currentItem = items[currentIndex];

  return (
    <div className="relative w-full h-[600px] overflow-hidden group">
      <img
        src={currentItem.image_url}
        alt={currentItem.title}
        className="w-full h-full object-cover transition-opacity duration-1000"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end">
        <div className="container mx-auto px-8 pb-24 text-center">
          <h2
            className="text-6xl text-white mb-4 leading-tight"
            style={{ fontFamily: 'Nelphin, serif' }}
          >
            {currentItem.title}
          </h2>
          <p
            className="text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed mb-4"
            style={{ fontFamily: 'Nelphin, serif' }}
          >
            {currentItem.subtitle}
          </p>
          {currentItem.article_url && (
            <a
              href={currentItem.article_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Matéria completa</span>
            </a>
          )}
        </div>
      </div>

      {items.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-8 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6 text-slate-800" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-8 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6 text-slate-800" />
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
