import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Search, MapPin, Clock, User } from 'lucide-react';
import logoAssinesaude from '@/assets/logo-assinesaude.png';

interface PatientProfile {
  id: string;
  full_name: string;
}

interface ServiceOffering {
  id: string;
  title: string;
  description: string | null;
  price: number;
  duration_minutes: number | null;
  professional: {
    full_name: string;
    specialty: string;
    city: string | null;
    state: string | null;
  };
}

const PatientDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [offerings, setOfferings] = useState<ServiceOffering[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);

    // Fetch patient profile
    const { data: patientData, error: patientError } = await supabase
      .from('patient_profiles')
      .select('id, full_name')
      .eq('user_id', user?.id)
      .maybeSingle();

    if (!patientError) {
      setProfile(patientData);
    }

    // Fetch available service offerings from approved professionals
    const { data: offeringsData, error: offeringsError } = await supabase
      .from('service_offerings')
      .select(`
        id,
        title,
        description,
        price,
        duration_minutes,
        professional:professional_profiles!inner (
          full_name,
          specialty,
          city,
          state
        )
      `)
      .eq('is_active', true);

    if (!offeringsError && offeringsData) {
      const formattedOfferings = offeringsData.map(o => ({
        ...o,
        professional: Array.isArray(o.professional) ? o.professional[0] : o.professional
      }));
      setOfferings(formattedOfferings);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const filteredOfferings = offerings.filter(offering => 
    offering.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offering.professional.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offering.professional.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logoAssinesaude} alt="AssineSaúde" className="h-12" />
            <Badge variant="outline">Paciente</Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:block">
              Olá, {profile?.full_name}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Programa de Benefícios</h1>
        <p className="text-muted-foreground mb-8">
          Encontre profissionais de saúde e agende seus atendimentos
        </p>

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por especialidade, serviço ou profissional..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Offerings Grid */}
        {filteredOfferings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {searchTerm 
                ? 'Nenhuma oferta encontrada para sua busca.'
                : 'Nenhuma oferta de serviço disponível no momento.'}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOfferings.map((offering) => (
              <Card key={offering.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{offering.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {offering.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{offering.professional.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">{offering.professional.specialty}</Badge>
                  </div>
                  {offering.professional.city && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{offering.professional.city}, {offering.professional.state}</span>
                    </div>
                  )}
                  {offering.duration_minutes && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{offering.duration_minutes} min</span>
                    </div>
                  )}
                  <div className="pt-4 border-t flex items-center justify-between">
                    <div className="text-2xl font-bold text-primary">
                      R$ {offering.price.toFixed(2)}
                    </div>
                    <Button>Agendar</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientDashboard;
