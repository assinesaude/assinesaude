import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface Category {
  id: string;
  name: string;
  icon_url: string;
  display_order: number;
}

const ActivityCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('activity_categories' as any)
          .select('id, name, icon_url, display_order')
          .eq('is_active', true)
          .order('display_order');
        
        if (error) {
          console.error('Error fetching categories:', error);
          return;
        }
        
        if (data) setCategories(data as unknown as Category[]);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <Skeleton className="w-24 h-24 rounded-full" />
                <Skeleton className="w-16 h-4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="group flex flex-col items-center gap-3 cursor-pointer"
            >
              <div className="rounded-full p-6 flex items-center justify-center border border-primary/50 transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-primary/70 group-hover:border-transparent group-hover:shadow-lg">
                <img 
                  src={category.icon_url} 
                  alt={category.name} 
                  className="size-16 md:size-20 max-w-[80px] object-contain transition-all duration-300 group-hover:brightness-0 group-hover:invert" 
                  loading="lazy"
                />
              </div>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                {category.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ActivityCategories;