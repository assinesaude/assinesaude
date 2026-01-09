import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { LogOut, Search, MapPin, Clock, User, CheckCircle2, CreditCard, Package } from 'lucide-react';
import logoAssinesaude from '@/assets/logo-assinesaude.png';
import ProfessionalSearch from '@/components/ProfessionalSearch';

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

    // Note: Patient subscriptions would need a patient_subscriptions table
    // For now we'll show a placeholder

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
          Encontre profissionais de saúde e gerencie suas assinaturas
        </p>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="search" className="gap-2">
              <Search className="w-4 h-4" />
              Buscar Profissionais
            </TabsTrigger>
            <TabsTrigger value="offerings" className="gap-2">
              <Package className="w-4 h-4" />
              Serviços
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Minhas Assinaturas
            </TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search">
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
          </TabsContent>

          {/* Offerings Tab */}
          <TabsContent value="offerings">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Serviços Disponíveis</CardTitle>
                    <CardDescription>
                      {selectedProfessionalId 
                        ? 'Serviços do profissional selecionado'
                        : 'Todos os serviços disponíveis de profissionais verificados'}
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
                    Nenhum serviço disponível no momento.
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
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Minhas Assinaturas</CardTitle>
                <CardDescription>
                  Programas e serviços que você assina
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subscriptions.length === 0 ? (
                  <div className="py-12 text-center">
                    <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma assinatura ativa</h3>
                    <p className="text-muted-foreground mb-4">
                      Você ainda não possui assinaturas. Explore nossos profissionais e encontre o serviço ideal para você.
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
                              {subscription.is_active ? 'Ativa' : 'Inativa'}
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PatientDashboard;
