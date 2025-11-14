export interface LocationSuggestion {
  name: string;
  type: 'state' | 'city' | 'neighborhood';
  state?: string;
  city?: string;
}

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

interface BrasilAPILocation {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
}

const cache = new Map<string, LocationSuggestion[]>();
const CACHE_DURATION = 1000 * 60 * 60;

async function fetchWithCache(
  key: string,
  fetcher: () => Promise<LocationSuggestion[]>
): Promise<LocationSuggestion[]> {
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }

  const data = await fetcher();
  cache.set(key, data);

  setTimeout(() => cache.delete(key), CACHE_DURATION);

  return data;
}

async function searchStates(query: string): Promise<LocationSuggestion[]> {
  return fetchWithCache(`states:${query}`, async () => {
    const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
    const states: IBGEState[] = await response.json();

    const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    return states
      .filter(state => {
        const normalizedName = state.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return normalizedName.includes(normalizedQuery);
      })
      .map(state => ({
        name: state.nome,
        type: 'state' as const,
      }))
      .slice(0, 5);
  });
}

async function searchCities(query: string): Promise<LocationSuggestion[]> {
  return fetchWithCache(`cities:${query}`, async () => {
    const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios');
    const cities: IBGECity[] = await response.json();

    const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    return cities
      .filter(city => {
        const normalizedName = city.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return normalizedName.includes(normalizedQuery);
      })
      .map(city => ({
        name: `${city.nome}, ${city.microrregiao.mesorregiao.UF.sigla}`,
        type: 'city' as const,
        state: city.microrregiao.mesorregiao.UF.nome,
        city: city.nome,
      }))
      .slice(0, 10);
  });
}

async function searchNeighborhoods(query: string): Promise<LocationSuggestion[]> {
  const cacheKey = `neighborhoods:${query}`;

  return fetchWithCache(cacheKey, async () => {
    try {
      const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/distritos');

      if (!response.ok) {
        return [];
      }

      interface IBGEDistrict {
        id: number;
        nome: string;
        municipio: {
          nome: string;
          microrregiao: {
            mesorregiao: {
              UF: {
                sigla: string;
              };
            };
          };
        };
      }

      const districts: IBGEDistrict[] = await response.json();

      const filteredDistricts = districts
        .filter(district => {
          const normalizedName = district.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return normalizedName.includes(normalizedQuery);
        })
        .map(district => ({
          name: `${district.nome}, ${district.municipio.nome} - ${district.municipio.microrregiao.mesorregiao.UF.sigla}`,
          type: 'neighborhood' as const,
          state: district.municipio.microrregiao.mesorregiao.UF.sigla,
          city: district.municipio.nome,
        }))
        .slice(0, 10);

      return filteredDistricts;
    } catch (error) {
      console.error('Error searching neighborhoods:', error);
      return [];
    }
  });
}

export async function searchLocations(query: string): Promise<LocationSuggestion[]> {
  if (query.length < 3) {
    return [];
  }

  const normalizedQuery = query.trim();

  try {
    const [states, cities, neighborhoods] = await Promise.all([
      searchStates(normalizedQuery),
      searchCities(normalizedQuery),
      searchNeighborhoods(normalizedQuery),
    ]);

    const allResults: LocationSuggestion[] = [
      ...states,
      ...cities,
      ...neighborhoods,
    ];

    const uniqueResults = Array.from(
      new Map(allResults.map(item => [item.name, item])).values()
    );

    return uniqueResults.slice(0, 15);
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
}
