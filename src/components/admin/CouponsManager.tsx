import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Ticket, Percent, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface DiscountCoupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  target_audience: string;
  is_active: boolean;
  created_by_type: string;
}

interface CouponsManagerProps {
  creatorType?: 'admin' | 'professional';
  professionalId?: string;
}

const CouponsManager = ({ creatorType = 'admin', professionalId }: CouponsManagerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<DiscountCoupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    maxUses: '',
    validUntil: '',
    targetAudience: 'patients',
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    let query = supabase.from('discount_coupons').select('*').order('created_at', { ascending: false });

    if (creatorType === 'professional' && professionalId) {
      query = query.eq('professional_id', professionalId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching coupons:', error);
    } else {
      setCoupons(data || []);
    }
    setLoading(false);
  };

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCouponForm({ ...couponForm, code });
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!couponForm.code.trim() || !couponForm.discountValue) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Preencha o código e valor do desconto.' });
      return;
    }

    const { error } = await supabase.from('discount_coupons').insert({
      code: couponForm.code.toUpperCase(),
      description: couponForm.description || null,
      discount_type: couponForm.discountType,
      discount_value: parseFloat(couponForm.discountValue),
      max_uses: couponForm.maxUses ? parseInt(couponForm.maxUses) : null,
      valid_until: couponForm.validUntil || null,
      target_audience: couponForm.targetAudience,
      created_by: user?.id,
      created_by_type: creatorType,
      professional_id: creatorType === 'professional' ? professionalId : null,
    });

    if (error) {
      if (error.code === '23505') {
        toast({ variant: 'destructive', title: 'Erro', description: 'Já existe um cupom com esse código.' });
      } else {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível criar o cupom.' });
      }
    } else {
      toast({ title: 'Sucesso', description: 'Cupom criado!' });
      setCouponForm({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        maxUses: '',
        validUntil: '',
        targetAudience: 'patients',
      });
      fetchCoupons();
    }
  };

  const handleToggleActive = async (coupon: DiscountCoupon) => {
    const { error } = await supabase
      .from('discount_coupons')
      .update({ is_active: !coupon.is_active })
      .eq('id', coupon.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar o cupom.' });
    } else {
      fetchCoupons();
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    const { error } = await supabase.from('discount_coupons').delete().eq('id', id);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir o cupom.' });
    } else {
      toast({ title: 'Sucesso', description: 'Cupom excluído!' });
      fetchCoupons();
    }
  };

  const getTargetAudienceLabel = (audience: string) => {
    const audiences: Record<string, string> = {
      patients: 'Pacientes',
      professionals: 'Profissionais',
      all: 'Todos',
    };
    return audiences[audience] || audience;
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create new coupon */}
      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Cupom</CardTitle>
          <CardDescription>Gere cupons de desconto para seus {creatorType === 'admin' ? 'usuários' : 'pacientes'}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código do Cupom</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    placeholder="Ex: DESCONTO20"
                    required
                  />
                  <Button type="button" variant="outline" onClick={generateCouponCode}>
                    Gerar
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Desconto</Label>
                <Select
                  value={couponForm.discountType}
                  onValueChange={(value) => setCouponForm({ ...couponForm, discountType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                    <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountValue">
                  Valor do Desconto {couponForm.discountType === 'percentage' ? '(%)' : '(R$)'}
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  step={couponForm.discountType === 'percentage' ? '1' : '0.01'}
                  max={couponForm.discountType === 'percentage' ? '100' : undefined}
                  value={couponForm.discountValue}
                  onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                  placeholder={couponForm.discountType === 'percentage' ? '20' : '50.00'}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxUses">Limite de Usos (opcional)</Label>
                <Input
                  id="maxUses"
                  type="number"
                  value={couponForm.maxUses}
                  onChange={(e) => setCouponForm({ ...couponForm, maxUses: e.target.value })}
                  placeholder="Ilimitado"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validUntil">Válido Até (opcional)</Label>
                <Input
                  id="validUntil"
                  type="datetime-local"
                  value={couponForm.validUntil}
                  onChange={(e) => setCouponForm({ ...couponForm, validUntil: e.target.value })}
                />
              </div>

              {creatorType === 'admin' && (
                <div className="space-y-2">
                  <Label>Público-alvo</Label>
                  <Select
                    value={couponForm.targetAudience}
                    onValueChange={(value) => setCouponForm({ ...couponForm, targetAudience: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patients">Pacientes</SelectItem>
                      <SelectItem value="professionals">Profissionais</SelectItem>
                      <SelectItem value="all">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  placeholder="Ex: Desconto de boas-vindas"
                />
              </div>
            </div>

            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              Criar Cupom
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Coupons list */}
      <Card>
        <CardHeader>
          <CardTitle>Cupons Criados</CardTitle>
          <CardDescription>Gerencie seus cupons de desconto</CardDescription>
        </CardHeader>
        <CardContent>
          {coupons.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum cupom criado ainda.</p>
          ) : (
            <div className="space-y-4">
              {coupons.map((coupon) => (
                <div key={coupon.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Ticket className="w-5 h-5 text-primary" />
                      <span className="font-mono font-bold text-lg">{coupon.code}</span>
                      <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                        {coupon.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(coupon)}
                      >
                        {coupon.is_active ? 'Desativar' : 'Ativar'}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Cupom</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir este cupom? Essa ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteCoupon(coupon.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Desconto:</span>
                      <p className="font-medium flex items-center gap-1">
                        {coupon.discount_type === 'percentage' ? (
                          <>
                            <Percent className="w-4 h-4" />
                            {coupon.discount_value}%
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-4 h-4" />
                            R$ {coupon.discount_value.toFixed(2)}
                          </>
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Usos:</span>
                      <p className="font-medium">
                        {coupon.current_uses} / {coupon.max_uses || '∞'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Público:</span>
                      <p className="font-medium">{getTargetAudienceLabel(coupon.target_audience)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Validade:</span>
                      <p className="font-medium">
                        {coupon.valid_until
                          ? new Date(coupon.valid_until).toLocaleDateString('pt-BR')
                          : 'Sem limite'}
                      </p>
                    </div>
                  </div>

                  {coupon.description && (
                    <p className="text-sm text-muted-foreground mt-2">{coupon.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CouponsManager;