import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IBGEState {
  id: number;
  sigla: string;
  nome: string;
}

interface IBGECity {
  id: number;
  nome: string;
  microrregiao: {
    mesorregiao: {
      UF: {
        sigla: string;
        nome: string;
      };
    };
  };
}

interface LocationResult {
  id: string;
  type: 'city' | 'state';
  name: string;
  state?: string;
  stateAbbr?: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string, location?: LocationResult) => void;
  placeholder?: string;
  className?: string;
}

// Cache for IBGE data
let cachedStates: IBGEState[] | null = null;
let cachedCities: IBGECity[] | null = null;

const LocationAutocomplete = ({
  value,
  onChange,
  placeholder = "Cidade ou Estado",
  className
}: LocationAutocompleteProps) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch IBGE data on first use
  const fetchIBGEData = async () => {
    // Fetch states if not cached
    if (!cachedStates) {
      const statesRes = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
      cachedStates = await statesRes.json();
    }

    // Fetch all cities if not cached (this is cached for performance)
    if (!cachedCities) {
      const citiesRes = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome');
      cachedCities = await citiesRes.json();
    }

    return { states: cachedStates, cities: cachedCities };
  };

  // Fetch locations when query changes (min 2 chars)
  useEffect(() => {
    const searchLocations = async () => {
      if (query.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);

      try {
        const { states, cities } = await fetchIBGEData();
        const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        const locationResults: LocationResult[] = [];

        // Search states
        if (states) {
          const matchingStates = states.filter(state => {
            const normalizedName = state.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const normalizedAbbr = state.sigla.toLowerCase();
            return normalizedName.includes(normalizedQuery) || normalizedAbbr.includes(normalizedQuery);
          }).slice(0, 5);

          matchingStates.forEach(state => {
            locationResults.push({
              id: state.id.toString(),
              type: 'state',
              name: state.nome,
              stateAbbr: state.sigla
            });
          });
        }

        // Search cities
        if (cities) {
          const matchingCities = cities.filter(city => {
            const normalizedName = city.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return normalizedName.includes(normalizedQuery);
          }).slice(0, 15);

          matchingCities.forEach(city => {
            locationResults.push({
              id: city.id.toString(),
              type: 'city',
              name: city.nome,
              state: city.microrregiao.mesorregiao.UF.nome,
              stateAbbr: city.microrregiao.mesorregiao.UF.sigla
            });
          });
        }

        setResults(locationResults);
        setIsOpen(locationResults.length > 0);
      } catch (error) {
        console.error('Error fetching IBGE locations:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchLocations, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (location: LocationResult) => {
    const displayValue = location.type === 'city' 
      ? `${location.name}, ${location.stateAbbr}` 
      : location.name;
    setQuery(displayValue);
    onChange(displayValue, location);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={placeholder}
        className="pl-10 h-12 bg-background"
      />
      {loading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
      )}
      
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
          {results.map((location) => (
            <button
              key={`${location.type}-${location.id}`}
              onClick={() => handleSelect(location)}
              className="w-full px-4 py-3 text-left hover:bg-accent/50 flex items-center gap-3 transition-colors"
            >
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground truncate">
                  {location.name}
                </div>
                {location.type === 'city' && location.state && (
                  <div className="text-sm text-muted-foreground truncate">
                    {location.state}
                  </div>
                )}
              </div>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full flex-shrink-0",
                location.type === 'state' 
                  ? "bg-primary/10 text-primary" 
                  : "bg-secondary/20 text-secondary-foreground"
              )}>
                {location.type === 'state' ? 'Estado' : 'Cidade'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
