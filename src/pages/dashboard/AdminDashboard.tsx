import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Users, CheckCircle, XCircle, Eye, Package, Briefcase, MessageSquare, Ticket, Edit, Trash2, Plus, Grid3X3, FileText } from 'lucide-react';
import logoAssinesaude from '@/assets/logo-assinesaude.png';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import ProfessionsManager from '@/components/admin/ProfessionsManager';
import MessagesManager from '@/components/admin/MessagesManager';
import CouponsManager from '@/components/admin/CouponsManager';
import CategoriesManager from '@/components/admin/CategoriesManager';
import ContractsManager from '@/components/admin/ContractsManager';

interface ProfessionalProfile {
  id: string;
  user_id: string;
  full_name: string;
  cpf: string;
  professional_registration: string;
  specialty: string;
  phone: string | null;
  clinic_name: string | null;
  clinic_address: string | null;
  city: string | null;
  state: string | null;
  document_front_url: string | null;
  document_back_url: string | null;
  approval_status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  created_at: string;
}

interface PlatformPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  features: string[];
  is_free: boolean;
  is_active: boolean;
}

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([]);
  const [plans, setPlans] = useState<PlatformPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [editingPlan, setEditingPlan] = useState<PlatformPlan | null>(null);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    price: '',
    features: '',
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    const { data: profData } = await supabase
      .from('professional_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profData) setProfessionals(profData);

    const { data: planData } = await supabase
      .from('platform_plans')
      .select('*')
      .order('price', { ascending: true });

    if (planData) {
      setPlans(planData.map(p => ({
        ...p,
        features: Array.isArray(p.features) ? p.features : JSON.parse(p.features as string || '[]')
      })));
    }

    setLoading(false);
  };

  const sendApprovalEmail = async (professional: ProfessionalProfile, isApproved: boolean, reason?: string) => {
    try {
      // Get user email from auth
      const { data: userData } = await supabase.auth.admin.getUserById(professional.user_id);
      const email = userData?.user?.email;
      
      if (!email) {
        // Try to get from the user's metadata or use a placeholder
        console.log('Could not get user email, skipping notification');
        return;
      }

      const { error } = await supabase.functions.invoke('send-approval-email', {
        body: {
          professionalName: professional.full_name,
          professionalEmail: email,
          isApproved,
          rejectionReason: reason,
        },
      });

      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent successfully');
      }
    } catch (error) {
      console.error('Error in sendApprovalEmail:', error);
    }
  };

  const handleApprove = async (professional: ProfessionalProfile) => {
    const { error } = await supabase
      .from('professional_profiles')
      .update({
        approval_status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user?.id,
      })
      .eq('id', professional.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível aprovar.' });
    } else {
      toast({ title: 'Aprovado!', description: `${professional.full_name} foi aprovado. E-mail de notificação enviado.` });
      // Send approval email
      await sendApprovalEmail(professional, true);
      fetchData();
    }
  };

  const handleReject = async () => {
    if (!selectedProfessional || !rejectionReason) return;

    const { error } = await supabase
      .from('professional_profiles')
      .update({
        approval_status: 'rejected',
        rejection_reason: rejectionReason,
      })
      .eq('id', selectedProfessional.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível rejeitar.' });
    } else {
      toast({ title: 'Rejeitado', description: `${selectedProfessional.full_name} foi rejeitado. E-mail de notificação enviado.` });
      // Send rejection email
      await sendApprovalEmail(selectedProfessional, false, rejectionReason);
      setSelectedProfessional(null);
      setRejectionReason('');
      fetchData();
    }
  };

  const openPlanDialog = (plan?: PlatformPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({
        name: plan.name,
        description: plan.description || '',
        price: plan.price.toString(),
        features: plan.features.join('\n'),
        is_active: plan.is_active,
      });
    } else {
      setEditingPlan(null);
      setPlanForm({ name: '', description: '', price: '', features: '', is_active: true });
    }
    setShowPlanDialog(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const features = planForm.features.split('\n').filter(f => f.trim());
    const price = parseFloat(planForm.price) || 0;

    if (editingPlan) {
      const { error } = await supabase
        .from('platform_plans')
        .update({
          name: planForm.name,
          description: planForm.description,
          price: price,
          features: features,
          is_free: price === 0,
          is_active: planForm.is_active,
        })
        .eq('id', editingPlan.id);

      if (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar o plano.' });
      } else {
        toast({ title: 'Plano atualizado!', description: `O plano ${planForm.name} foi atualizado.` });
        setShowPlanDialog(false);
        fetchData();
      }
    } else {
      const { error } = await supabase.from('platform_plans').insert({
        name: planForm.name,
        description: planForm.description,
        price: price,
        features: features,
        is_free: price === 0,
        is_active: planForm.is_active,
      });

      if (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível criar o plano.' });
      } else {
        toast({ title: 'Plano criado!', description: `O plano ${planForm.name} foi criado.` });
        setShowPlanDialog(false);
        fetchData();
      }
    }
  };

  const handleDeletePlan = async (planId: string) => {
    const { error } = await supabase
      .from('platform_plans')
      .delete()
      .eq('id', planId);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir o plano.' });
    } else {
      toast({ title: 'Plano excluído!', description: 'O plano foi removido.' });
      fetchData();
    }
  };

  const handleTogglePlanStatus = async (plan: PlatformPlan) => {
    const { error } = await supabase
      .from('platform_plans')
      .update({ is_active: !plan.is_active })
      .eq('id', plan.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível alterar o status.' });
    } else {
      fetchData();
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const pendingProfessionals = professionals.filter(p => p.approval_status === 'pending');
  const approvedProfessionals = professionals.filter(p => p.approval_status === 'approved');

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logoAssinesaude} alt="AssineSaúde" className="h-12" />
            <Badge variant="secondary">Admin</Badge>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard Administrativo</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingProfessionals.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
              <CheckCircle className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedProfessionals.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Planos B2B</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{plans.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="flex-wrap h-auto gap-2">
            <TabsTrigger value="pending">Pendentes ({pendingProfessionals.length})</TabsTrigger>
            <TabsTrigger value="approved">Aprovados</TabsTrigger>
            <TabsTrigger value="professions"><Briefcase className="w-4 h-4 mr-1" />Profissões</TabsTrigger>
            <TabsTrigger value="categories"><Grid3X3 className="w-4 h-4 mr-1" />Vetores</TabsTrigger>
            <TabsTrigger value="contracts"><FileText className="w-4 h-4 mr-1" />Contratos</TabsTrigger>
            <TabsTrigger value="messages"><MessageSquare className="w-4 h-4 mr-1" />Mensagens</TabsTrigger>
            <TabsTrigger value="coupons"><Ticket className="w-4 h-4 mr-1" />Cupons</TabsTrigger>
            <TabsTrigger value="plans">Planos B2B</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {loading ? (
              <div className="text-center py-12">Carregando...</div>
            ) : pendingProfessionals.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhum profissional pendente</CardContent></Card>
            ) : (
              <div className="space-y-4">
                {pendingProfessionals.map((professional) => (
                  <Card key={professional.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg">{professional.full_name}</h3>
                          <p className="text-sm text-muted-foreground">{professional.specialty} • {professional.professional_registration}</p>
                          <p className="text-sm text-muted-foreground">{professional.city}, {professional.state}</p>
                        </div>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm"><Eye className="w-4 h-4 mr-2" />Ver Documentos</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Documentos de {professional.full_name}</DialogTitle>
                              </DialogHeader>
                              <div className="grid grid-cols-2 gap-4 py-4">
                                <div>
                                  <p className="text-sm font-medium mb-2">Frente</p>
                                  {professional.document_front_url ? (
                                    <img src={professional.document_front_url} alt="Frente" className="w-full rounded-lg border" />
                                  ) : (
                                    <div className="bg-muted rounded-lg p-8 text-center text-sm">Não enviado</div>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium mb-2">Verso</p>
                                  {professional.document_back_url ? (
                                    <img src={professional.document_back_url} alt="Verso" className="w-full rounded-lg border" />
                                  ) : (
                                    <div className="bg-muted rounded-lg p-8 text-center text-sm">Não enviado</div>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button size="sm" onClick={() => handleApprove(professional)}><CheckCircle className="w-4 h-4 mr-2" />Aprovar</Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="destructive" size="sm" onClick={() => setSelectedProfessional(professional)}><XCircle className="w-4 h-4 mr-2" />Rejeitar</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Rejeitar Profissional</DialogTitle>
                                <DialogDescription>Informe o motivo da rejeição</DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <Label>Motivo</Label>
                                <Textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className="mt-2" />
                              </div>
                              <DialogFooter>
                                <Button variant="destructive" onClick={handleReject}>Confirmar</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved">
            {approvedProfessionals.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhum profissional aprovado</CardContent></Card>
            ) : (
              <div className="space-y-4">
                {approvedProfessionals.map((professional) => (
                  <Card key={professional.id}>
                    <CardContent className="p-6 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{professional.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{professional.specialty}</p>
                      </div>
                      <Badge>Ativo</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="professions">
            <ProfessionsManager />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesManager />
          </TabsContent>

          <TabsContent value="contracts">
            <ContractsManager />
          </TabsContent>

          <TabsContent value="messages">
            <MessagesManager />
          </TabsContent>

          <TabsContent value="coupons">
            <CouponsManager creatorType="admin" />
          </TabsContent>

          <TabsContent value="plans">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gerenciar Planos B2B</CardTitle>
                  <CardDescription>Crie e edite os planos disponíveis para profissionais</CardDescription>
                </div>
                <Button onClick={() => openPlanDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Plano
                </Button>
              </CardHeader>
              <CardContent>
                {plans.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Nenhum plano cadastrado. Crie o primeiro plano.
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                      <Card key={plan.id} className={!plan.is_active ? 'opacity-60' : ''}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                {plan.name}
                                {plan.is_free && <Badge variant="secondary">Gratuito</Badge>}
                              </CardTitle>
                              <CardDescription>{plan.description}</CardDescription>
                            </div>
                            <div className="flex items-center gap-1">
                              <Switch
                                checked={plan.is_active}
                                onCheckedChange={() => handleTogglePlanStatus(plan)}
                              />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="text-3xl font-bold text-primary">
                            {plan.is_free ? 'Grátis' : `R$ ${plan.price.toFixed(2)}`}
                            {!plan.is_free && <span className="text-sm font-normal text-muted-foreground">/mês</span>}
                          </div>
                          
                          <ul className="space-y-2">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>

                          <div className="flex gap-2 pt-4 border-t">
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => openPlanDialog(plan)}>
                              <Edit className="w-4 h-4 mr-1" />
                              Editar
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeletePlan(plan.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Plan Dialog */}
            <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingPlan ? 'Editar Plano' : 'Novo Plano'}</DialogTitle>
                  <DialogDescription>
                    {editingPlan ? 'Atualize as informações do plano' : 'Preencha as informações do novo plano'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSavePlan} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome do Plano</Label>
                      <Input 
                        value={planForm.name} 
                        onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} 
                        placeholder="Ex: Plano Premium"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Preço Mensal (R$)</Label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        value={planForm.price} 
                        onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })} 
                        placeholder="0.00 para gratuito"
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea 
                      value={planForm.description} 
                      onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })} 
                      placeholder="Descreva os benefícios do plano..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Recursos (um por linha)</Label>
                    <Textarea 
                      value={planForm.features} 
                      onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })} 
                      rows={5}
                      placeholder="Perfil verificado&#10;Cupons ilimitados&#10;Suporte prioritário"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={planForm.is_active}
                      onCheckedChange={(checked) => setPlanForm({ ...planForm, is_active: checked })}
                    />
                    <Label>Plano ativo</Label>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowPlanDialog(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingPlan ? 'Atualizar' : 'Criar Plano'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
