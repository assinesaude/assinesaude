import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  // Fetch locations when query changes (min 3 chars)
  useEffect(() => {
    const fetchLocations = async () => {
      if (query.length < 3) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);

      try {
        // Fetch states matching query
        const { data: states } = await supabase
          .from('brazilian_states')
          .select('id, name, abbreviation')
          .ilike('name', `%${query}%`)
          .limit(5);

        // Fetch cities matching query
        const { data: cities } = await supabase
          .from('brazilian_cities')
          .select('id, name, state_id')
          .ilike('name', `%${query}%`)
          .limit(10);

        const locationResults: LocationResult[] = [];

        // Add states
        if (states) {
          states.forEach(state => {
            locationResults.push({
              id: state.id,
              type: 'state',
              name: state.name,
              stateAbbr: state.abbreviation
            });
          });
        }

        // Add cities with state info
        if (cities && cities.length > 0) {
          // Get state info for cities
          const stateIds = [...new Set(cities.map(c => c.state_id))];
          const { data: cityStates } = await supabase
            .from('brazilian_states')
            .select('id, name, abbreviation')
            .in('id', stateIds);

          const stateMap = new Map(cityStates?.map(s => [s.id, s]) || []);

          cities.forEach(city => {
            const stateInfo = stateMap.get(city.state_id);
            locationResults.push({
              id: city.id,
              type: 'city',
              name: city.name,
              state: stateInfo?.name,
              stateAbbr: stateInfo?.abbreviation
            });
          });
        }

        setResults(locationResults);
        setIsOpen(locationResults.length > 0);
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchLocations, 300);
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
