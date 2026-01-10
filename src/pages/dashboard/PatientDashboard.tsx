import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, MapPin, Clock, User, CheckCircle2, CreditCard, Package } from 'lucide-react';
import ProfessionalSearch from '@/components/ProfessionalSearch';
import { DashboardWithSidebar } from '@/components/layout/DashboardLayout';

interface PatientProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

interface ServiceOffering {
  id: string;
  title: string;
  description: string | null;
  price: number;
  duration_minutes: number | null;
  professional: {
    id: string;
    full_name: string;
    specialty: string;
    city: string | null;
    state: string | null;
    approval_status: 'approved' | 'pending' | 'rejected';
  };
}

interface Subscription {
  id: string;
  started_at: string;
  expires_at: string | null;
  is_active: boolean;
  plan: {
    name: string;
    description: string | null;
    price: number;
  };
  professional: {
    full_name: string;
    specialty: string;
  };
}

const PatientDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [offerings, setOfferings] = useState<ServiceOffering[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('search');

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
      .select('id, full_name, avatar_url')
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
          id,
          full_name,
          specialty,
          city,
          state,
          approval_status
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

  const handleSelectProfessional = (professionalId: string) => {
    setSelectedProfessionalId(professionalId);
    setActiveTab('offerings');
  };

  const filteredOfferings = selectedProfessionalId
    ? offerings.filter(o => o.professional.id === selectedProfessionalId)
    : offerings;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'search':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Buscar Profissionais</CardTitle>
              <CardDescription>
                Encontre profissionais de saúde verificados por localização, profissão ou especialidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfessionalSearch onSelectProfessional={handleSelectProfessional} />
            </CardContent>
          </Card>
        );
      
      case 'offerings':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Programas de Atendimento</CardTitle>
                  <CardDescription>
                    {selectedProfessionalId 
                      ? 'Programas do profissional selecionado'
                      : 'Todos os programas disponíveis de profissionais verificados'}
                  </CardDescription>
                </div>
                {selectedProfessionalId && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedProfessionalId(null)}
                  >
                    Ver Todos
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {filteredOfferings.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  Nenhum programa disponível no momento.
                </div>
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
                          {offering.professional.approval_status === 'approved' && (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          )}
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
                          <Button>Contratar</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      
      case 'subscriptions':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Meus Programas</CardTitle>
              <CardDescription>
                Programas de atendimento que você assina
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptions.length === 0 ? (
                <div className="py-12 text-center">
                  <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum programa ativo</h3>
                  <p className="text-muted-foreground mb-4">
                    Você ainda não possui programas de atendimento. Explore nossos profissionais e encontre o programa ideal para você.
                  </p>
                  <Button onClick={() => setActiveTab('search')}>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar Profissionais
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subscriptions.map((subscription) => (
                    <Card key={subscription.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{subscription.plan.name}</CardTitle>
                          <Badge variant={subscription.is_active ? "default" : "secondary"}>
                            {subscription.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <CardDescription>{subscription.plan.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{subscription.professional.full_name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {subscription.professional.specialty}
                        </div>
                        <div className="pt-3 border-t">
                          <div className="text-xl font-bold text-primary">
                            R$ {subscription.plan.price.toFixed(2)}/mês
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <DashboardWithSidebar
      userType="patient"
      userName={profile?.full_name}
      userAvatar={profile?.avatar_url}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
    >
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Programa de Benefícios</h1>
        <p className="text-muted-foreground mb-8">
          Encontre profissionais de saúde e gerencie seus programas de atendimento
        </p>
        {renderContent()}
      </div>
    </DashboardWithSidebar>
  );
};

export default PatientDashboard;
