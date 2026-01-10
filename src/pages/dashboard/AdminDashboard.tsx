import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, CheckCircle, XCircle, Eye, Package, Edit, Trash2, Plus } from 'lucide-react';
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
import { DashboardWithSidebar } from '@/components/layout/DashboardLayout';

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
  const [activeTab, setActiveTab] = useState('pending');
  
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
      const { data: userData } = await supabase.auth.admin.getUserById(professional.user_id);
      const email = userData?.user?.email;
      
      if (!email) {
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
      toast({ title: 'Aprovado!', description: `${professional.full_name} foi aprovado.` });
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
      toast({ title: 'Rejeitado', description: `${selectedProfessional.full_name} foi rejeitado.` });
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

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const pendingProfessionals = professionals.filter(p => p.approval_status === 'pending');
  const approvedProfessionals = professionals.filter(p => p.approval_status === 'approved');

  const renderContent = () => {
    switch (activeTab) {
      case 'pending':
        return loading ? (
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
        );
      
      case 'approved':
        return approvedProfessionals.length === 0 ? (
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
        );
      
      case 'professions':
        return <ProfessionsManager />;
      
      case 'categories':
        return <CategoriesManager />;
      
      case 'contracts':
        return <ContractsManager />;
      
      case 'messages':
        return <MessagesManager />;
      
      case 'coupons':
        return <CouponsManager creatorType="admin" />;
      
      case 'plans':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Planos B2B</h2>
              <Button onClick={() => openPlanDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Plano
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className={!plan.is_active ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{plan.name}</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openPlanDialog(plan)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeletePlan(plan.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-4">
                      {plan.is_free ? 'Gratuito' : `R$ ${plan.price.toFixed(2)}/mês`}
                    </div>
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="text-sm flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 pt-4 border-t">
                      <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                        {plan.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingPlan ? 'Editar Plano' : 'Novo Plano'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSavePlan} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome do Plano</Label>
                    <Input
                      value={planForm.name}
                      onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea
                      value={planForm.description}
                      onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Preço (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={planForm.price}
                      onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Funcionalidades (uma por linha)</Label>
                    <Textarea
                      value={planForm.features}
                      onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={planForm.is_active}
                      onCheckedChange={(checked) => setPlanForm({ ...planForm, is_active: checked })}
                    />
                    <Label>Ativo</Label>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Salvar</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <DashboardWithSidebar
      userType="admin"
      userName="Administrador"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
    >
      <div className="container mx-auto px-4 py-8">
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

        {renderContent()}
      </div>
    </DashboardWithSidebar>
  );
};

export default AdminDashboard;
