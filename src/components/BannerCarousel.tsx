import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, BannerCarousel as BannerCarouselType } from '../lib/supabase';

export function BannerCarousel() {
  const [banners, setBanners] = useState<BannerCarouselType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banner_carousel')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
        .limit(10);

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (loading) {
    return (
      <div className="w-full h-[300px] bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse" />
    );
  }

  if (banners.length === 0) {
    return (
      <div className="w-full h-[300px] bg-slate-100 flex items-center justify-center">
        <p className="text-slate-400">Nenhum banner disponível</p>
      </div>
    );
  }

  const currentBanner = banners[currentIndex];

  const BannerContent = () => (
    <>
      {currentBanner.media_type === 'video' ? (
        <video
          src={currentBanner.media_url}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <img
          src={currentBanner.media_url}
          alt={currentBanner.title}
          className="w-full h-full object-cover"
        />
      )}
    </>
  );

  return (
    <div className="relative w-full h-[300px] overflow-hidden group bg-slate-900">
      {currentBanner.link_url ? (
        <a
          href={currentBanner.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-full"
        >
          <BannerContent />
        </a>
      ) : (
        <BannerContent />
      )}

      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-5 h-5 text-slate-800" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
            aria-label="Next banner"
          >
            <ChevronRight className="w-5 h-5 text-slate-800" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-6'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
