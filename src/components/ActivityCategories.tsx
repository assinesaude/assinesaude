import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Stethoscope, 
  SmilePlus, 
  Brain, 
  Apple, 
  Accessibility, 
  HeartPulse, 
  PawPrint, 
  Pill,
  Baby,
  Eye,
  Ear,
  Bone,
  Syringe,
  Microscope,
  Activity,
  Heart
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon_url: string;
  display_order: number;
}

// Mapeamento de nomes de ícones para componentes Lucide
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'stethoscope': Stethoscope,
  'smile-plus': SmilePlus,
  'brain': Brain,
  'apple': Apple,
  'accessibility': Accessibility,
  'heart-pulse': HeartPulse,
  'paw-print': PawPrint,
  'pill': Pill,
  'baby': Baby,
  'eye': Eye,
  'ear': Ear,
  'bone': Bone,
  'syringe': Syringe,
  'microscope': Microscope,
  'activity': Activity,
  'heart': Heart,
};

// Mapeamento padrão por nome de categoria
const categoryIconMap: Record<string, string> = {
  'medicina': 'stethoscope',
  'odontologia': 'smile-plus',
  'psicologia': 'brain',
  'nutrição': 'apple',
  'fisioterapia': 'accessibility',
  'enfermagem': 'heart-pulse',
  'veterinária': 'paw-print',
  'farmácia': 'pill',
  'pediatria': 'baby',
  'oftalmologia': 'eye',
  'otorrinolaringologia': 'ear',
  'ortopedia': 'bone',
  'dermatologia': 'syringe',
  'patologia': 'microscope',
  'cardiologia': 'heart',
};

const ActivityCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('activity_categories')
          .select('id, name, icon_url, display_order')
          .eq('is_active', true)
          .order('display_order');
        
        if (error) {
          console.error('Error fetching categories:', error);
          return;
        }
        
        if (data) setCategories(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getIconComponent = (category: Category) => {
    // Primeiro tenta usar o icon_url como nome de ícone Lucide
    if (category.icon_url && iconMap[category.icon_url]) {
      return iconMap[category.icon_url];
    }
    
    // Fallback: usa o nome da categoria para encontrar um ícone
    const normalizedName = category.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const iconName = categoryIconMap[normalizedName];
    
    if (iconName && iconMap[iconName]) {
      return iconMap[iconName];
    }
    
    // Ícone padrão
    return Activity;
  };

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
          {categories.map((category) => {
            const IconComponent = getIconComponent(category);
            
            return (
              <div 
                key={category.id} 
                className="group flex flex-col items-center gap-3 cursor-pointer"
              >
                <div className="rounded-full p-6 flex items-center justify-center border border-primary/50 bg-card transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-primary/70 group-hover:border-transparent group-hover:shadow-lg group-hover:scale-105">
                  <IconComponent className="size-12 md:size-14 text-primary transition-all duration-300 group-hover:text-primary-foreground" />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ActivityCategories;
