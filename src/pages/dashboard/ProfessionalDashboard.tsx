import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Clock, CheckCircle, AlertCircle, Plus, Ticket, Sparkles } from 'lucide-react';
import logoAssinesaude from '@/assets/logo-assinesaude.png';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import CouponsManager from '@/components/admin/CouponsManager';
import PricingPlans from '@/components/PricingPlans';

interface ProfessionalProfile {
  id: string;
  full_name: string;
  specialty: string;
  clinic_name: string | null;
  approval_status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
}

interface ServiceOffering {
  id: string;
  title: string;
  description: string | null;
  price: number;
  duration_minutes: number | null;
  is_active: boolean;
}

interface PlatformPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  features: string[];
  is_free: boolean;
}

interface AISuggestion {
  title: string;
  description: string;
  price: number;
  duration_minutes: number;
}

const ProfessionalDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [offerings, setOfferings] = useState<ServiceOffering[]>([]);
  const [plans, setPlans] = useState<PlatformPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  
  const [newOffering, setNewOffering] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);

    // Fetch professional profile
    const { data: profData, error: profError } = await supabase
      .from('professional_profiles')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();

    if (profError) {
      console.error('Error fetching profile:', profError);
    } else {
      setProfile(profData);

      if (profData) {
        // Fetch service offerings
        const { data: offeringsData, error: offeringsError } = await supabase
          .from('service_offerings')
          .select('*')
          .eq('professional_id', profData.id)
          .order('created_at', { ascending: false });

        if (!offeringsError) {
          setOfferings(offeringsData || []);
        }
      }
    }

    // Fetch available plans (only visible after login)
    const { data: planData, error: planError } = await supabase
      .from('platform_plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (!planError) {
      setPlans(planData?.map(p => ({
        ...p,
        features: Array.isArray(p.features) ? p.features : JSON.parse(p.features as string || '[]')
      })) || []);
    }

    setLoading(false);
  };

  const handleCreateOffering = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) return;

    const { error } = await supabase
      .from('service_offerings')
      .insert({
        professional_id: profile.id,
        title: newOffering.title,
        description: newOffering.description,
        price: parseFloat(newOffering.price),
        duration_minutes: parseInt(newOffering.duration) || null,
      });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível criar a oferta de serviço.',
      });
    } else {
      toast({
        title: 'Oferta criada!',
        description: 'Sua oferta de serviço foi criada com sucesso.',
      });
      setNewOffering({ title: '', description: '', price: '', duration: '' });
      fetchData();
    }
  };

  const handleAISuggestions = async () => {
    if (!profile) return;
    
    setAiLoading(true);
    try {
      const response = await supabase.functions.invoke('ai-suggest-offerings', {
        body: {
          specialty: profile.specialty,
          clinicName: profile.clinic_name,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.offerings) {
        setAiSuggestions(response.data.offerings);
        toast({
          title: 'Sugestões geradas!',
          description: 'Clique em uma sugestão para usá-la como base.',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao gerar sugestões',
        description: error.message || 'Tente novamente mais tarde.',
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isPending = profile?.approval_status === 'pending';
  const isRejected = profile?.approval_status === 'rejected';
  const isApproved = profile?.approval_status === 'approved';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logoAssinesaude} alt="AssineSaúde" className="h-12" />
            <Badge variant="outline">Profissional</Badge>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Olá, {profile?.full_name}</h1>
        <p className="text-muted-foreground mb-8">{profile?.specialty}</p>

        {/* Status Card */}
        {isPending && (
          <Card className="mb-8 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="flex items-center gap-4 py-6">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <h3 className="font-semibold">Cadastro em Análise</h3>
                <p className="text-sm text-muted-foreground">
                  Seus documentos estão sendo verificados. Você será notificado quando seu cadastro for aprovado.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {isRejected && (
          <Card className="mb-8 border-destructive bg-destructive/10">
            <CardContent className="flex items-center gap-4 py-6">
              <AlertCircle className="w-8 h-8 text-destructive" />
              <div>
                <h3 className="font-semibold">Cadastro Rejeitado</h3>
                <p className="text-sm text-muted-foreground">
                  Motivo: {profile?.rejection_reason || 'Não especificado'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {isApproved && (
          <Card className="mb-8 border-primary bg-primary/10">
            <CardContent className="flex items-center gap-4 py-6">
              <CheckCircle className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-semibold">Cadastro Aprovado</h3>
                <p className="text-sm text-muted-foreground">
                  Suas ofertas de serviços estão visíveis para os pacientes.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="offerings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="offerings">Minhas Ofertas</TabsTrigger>
            <TabsTrigger value="coupons"><Ticket className="w-4 h-4 mr-1" />Meus Cupons</TabsTrigger>
            <TabsTrigger value="plans">Planos da Plataforma</TabsTrigger>
          </TabsList>

          <TabsContent value="offerings">
            <div className="space-y-6">
              {/* AI Suggestion Button */}
              {isApproved && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-primary" />
                          Assistente IA
                        </CardTitle>
                        <CardDescription>
                          Use inteligência artificial para criar ofertas de serviços
                        </CardDescription>
                      </div>
                      <Button 
                        onClick={handleAISuggestions} 
                        disabled={aiLoading}
                        variant="outline"
                      >
                        {aiLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary mr-2"></div>
                            Gerando...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Gerar Sugestões com IA
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  {aiSuggestions.length > 0 && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Sugestões geradas pela IA. Clique em uma para usar como base:
                      </p>
                      <div className="grid md:grid-cols-3 gap-4">
                        {aiSuggestions.map((suggestion, index) => (
                          <Card 
                            key={index} 
                            className="cursor-pointer hover:border-primary transition-colors"
                            onClick={() => {
                              setNewOffering({
                                title: suggestion.title,
                                description: suggestion.description,
                                price: suggestion.price.toString(),
                                duration: suggestion.duration_minutes.toString(),
                              });
                              setAiSuggestions([]);
                              toast({ title: "Sugestão aplicada!", description: "Revise e ajuste os dados conforme necessário." });
                            }}
                          >
                            <CardHeader className="p-4">
                              <CardTitle className="text-sm">{suggestion.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{suggestion.description}</p>
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold">R$ {suggestion.price.toFixed(2)}</span>
                                <span>{suggestion.duration_minutes} min</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}

              {/* Create new offering */}
              {isApproved && (
                <Card>
                  <CardHeader>
                    <CardTitle>Nova Oferta de Serviço</CardTitle>
                    <CardDescription>
                      Adicione uma nova oferta para seus pacientes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateOffering} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Título do Serviço</Label>
                          <Input
                            id="title"
                            value={newOffering.title}
                            onChange={(e) => setNewOffering({ ...newOffering, title: e.target.value })}
                            placeholder="Ex: Consulta Inicial"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="price">Preço (R$)</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={newOffering.price}
                            onChange={(e) => setNewOffering({ ...newOffering, price: e.target.value })}
                            placeholder="150.00"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          value={newOffering.description}
                          onChange={(e) => setNewOffering({ ...newOffering, description: e.target.value })}
                          placeholder="Descreva o serviço..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duração (minutos)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={newOffering.duration}
                          onChange={(e) => setNewOffering({ ...newOffering, duration: e.target.value })}
                          placeholder="60"
                        />
                      </div>
                      <Button type="submit">
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Oferta
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Existing offerings */}
              {offerings.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    {isApproved 
                      ? 'Você ainda não tem ofertas de serviços. Crie sua primeira oferta acima!'
                      : 'Suas ofertas de serviços aparecerão aqui após a aprovação do seu cadastro.'}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {offerings.map((offering) => (
                    <Card key={offering.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{offering.title}</CardTitle>
                          <Badge variant={offering.is_active ? 'default' : 'secondary'}>
                            {offering.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <CardDescription>{offering.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          R$ {offering.price.toFixed(2)}
                        </div>
                        {offering.duration_minutes && (
                          <p className="text-sm text-muted-foreground">
                            Duração: {offering.duration_minutes} min
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="coupons">
            {profile ? (
              <CouponsManager creatorType="professional" professionalId={profile.id} />
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Carregando...
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="plans">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Escolha o plano ideal para sua prática</h2>
                <p className="text-muted-foreground">
                  Gerencie pacientes e expanda seu consultório com nossas ferramentas
                </p>
              </div>
              
              <PricingPlans 
                plans={plans}
                onSubscribe={(planId, billingCycle, couponCode) => {
                  console.log('Subscribe:', { planId, billingCycle, couponCode });
                  toast({
                    title: 'Em breve!',
                    description: 'O sistema de pagamentos será ativado em breve.',
                  });
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ProfessionalDashboard;
