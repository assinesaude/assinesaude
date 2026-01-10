import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Clock, User, CheckCircle2, Stethoscope } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LocationAutocomplete from '@/components/LocationAutocomplete';

interface Professional {
  id: string;
  full_name: string;
  specialty: string;
  city: string | null;
  state: string | null;
  approval_status: 'approved' | 'pending' | 'rejected';
  profession?: {
    name: string;
  } | null;
}

interface ServiceOffering {
  id: string;
  title: string;
  description: string | null;
  price: number;
  duration_minutes: number | null;
  professional_id: string;
}

interface Profession {
  id: string;
  name: string;
}

interface ProfessionalSearchProps {
  onSelectProfessional?: (professionalId: string) => void;
}

const ProfessionalSearch = ({ onSelectProfessional }: ProfessionalSearchProps) => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [offerings, setOfferings] = useState<ServiceOffering[]>([]);
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [professionFilter, setProfessionFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // Fetch professions for filter
    const { data: professionsData } = await supabase
      .from('professions')
      .select('id, name')
      .eq('is_active', true)
      .order('name');

    if (professionsData) {
      setProfessions(professionsData);
    }

    // Fetch ALL professionals (not just approved)
    const { data: professionalsData } = await supabase
      .from('professional_profiles')
      .select(`
        id,
        full_name,
        specialty,
        city,
        state,
        approval_status,
        profession:professions (name)
      `)
      .in('approval_status', ['approved', 'pending']);

    if (professionalsData) {
      const formattedProfessionals = professionalsData.map(p => ({
        ...p,
        profession: Array.isArray(p.profession) ? p.profession[0] : p.profession
      }));
      setProfessionals(formattedProfessionals);
    }

    // Fetch service offerings
    const { data: offeringsData } = await supabase
      .from('service_offerings')
      .select('id, title, description, price, duration_minutes, professional_id')
      .eq('is_active', true);

    if (offeringsData) {
      setOfferings(offeringsData);
    }

    setLoading(false);
  };

  const filteredProfessionals = professionals.filter(professional => {
    const matchesSearch = searchTerm === '' || 
      professional.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.specialty.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation = locationFilter === '' ||
      (professional.city?.toLowerCase().includes(locationFilter.toLowerCase())) ||
      (professional.state?.toLowerCase().includes(locationFilter.toLowerCase()));

    const matchesProfession = professionFilter === '' || professionFilter === 'all' ||
      professional.profession?.name?.toLowerCase() === professionFilter.toLowerCase();

    return matchesSearch && matchesLocation && matchesProfession;
  });

  const getOfferingsForProfessional = (professionalId: string) => {
    return offerings.filter(o => o.professional_id === professionalId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Nome ou especialidade"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        <LocationAutocomplete
          value={locationFilter}
          onChange={(value) => setLocationFilter(value)}
          placeholder="Cidade ou Estado"
        />

        <Select value={professionFilter} onValueChange={setProfessionFilter}>
          <SelectTrigger className="h-12">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-muted-foreground" />
              <SelectValue placeholder="Profissão" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as profissões</SelectItem>
            {professions.map((prof) => (
              <SelectItem key={prof.id} value={prof.name.toLowerCase()}>
                {prof.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button 
          onClick={() => {
            setSearchTerm('');
            setLocationFilter('');
            setProfessionFilter('');
          }}
          variant="outline"
          className="h-12"
        >
          Limpar Filtros
        </Button>
      </div>

      {/* Results */}
      {filteredProfessionals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum profissional encontrado com os filtros selecionados.
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfessionals.map((professional) => {
            const professionalOfferings = getOfferingsForProfessional(professional.id);
            const lowestPrice = professionalOfferings.length > 0
              ? Math.min(...professionalOfferings.map(o => o.price))
              : null;
            const isApproved = professional.approval_status === 'approved';

            return (
              <Card key={professional.id} className={`hover:shadow-lg transition-shadow ${!isApproved ? 'border-amber-300/50' : 'border-primary/30'}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{professional.full_name}</CardTitle>
                      </div>
                      <CardDescription>
                        {professional.profession?.name}
                      </CardDescription>
                    </div>
                  </div>
                  {/* Status Badge */}
                  {isApproved ? (
                    <Badge className="bg-primary text-primary-foreground gap-1 w-fit">
                      <CheckCircle2 className="w-3 h-3" />
                      Verificado
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-500 text-amber-600 gap-1 w-fit">
                      <Clock className="w-3 h-3" />
                      Aguardando Verificação
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <Badge variant="secondary">{professional.specialty}</Badge>

                  {professional.city && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{professional.city}, {professional.state}</span>
                    </div>
                  )}

                  {isApproved && professionalOfferings.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">{professionalOfferings.length}</span> serviço(s) disponível(is)
                    </div>
                  )}

                  <div className="pt-4 border-t flex items-center justify-between">
                    {isApproved ? (
                      <>
                        {lowestPrice !== null ? (
                          <div>
                            <div className="text-xs text-muted-foreground">A partir de</div>
                            <div className="text-xl font-bold text-primary">
                              R$ {lowestPrice.toFixed(2)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            Consulte valores
                          </div>
                        )}
                        <Button 
                          size="sm"
                          onClick={() => onSelectProfessional?.(professional.id)}
                        >
                          Ver Serviços
                        </Button>
                      </>
                    ) : (
                      <div className="text-sm text-amber-600 italic">
                        Profissional em processo de verificação
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProfessionalSearch;
