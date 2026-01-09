import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CheckCircle, Tag, Loader2, X, Check, AlertCircle, CreditCard, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PlatformPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  features: string[];
  is_free: boolean;
}

interface ValidCoupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  description: string | null;
}

interface SubscriptionStatus {
  subscribed: boolean;
  tier: string | null;
  subscription_end: string | null;
  billing_interval: string | null;
}

interface PricingPlansProps {
  plans: PlatformPlan[];
  onSubscriptionChange?: (status: SubscriptionStatus) => void;
}

// Map plan names to tier keys
const PLAN_TO_TIER: Record<string, string> = {
  '50 pacientes': '50',
  '100 pacientes': '100',
  '500 pacientes': '500',
};

const ANNUAL_DISCOUNT = 0.26;

const PricingPlans = ({ plans, onSubscriptionChange }: PricingPlansProps) => {
  const { toast } = useToast();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [couponCode, setCouponCode] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [validatedCoupon, setValidatedCoupon] = useState<ValidCoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [openingPortal, setOpeningPortal] = useState(false);

  const checkSubscription = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }
      
      setSubscription(data);
      onSubscriptionChange?.(data);
    } catch (err) {
      console.error('Failed to check subscription:', err);
    } finally {
      setLoadingSubscription(false);
    }
  }, [onSubscriptionChange]);

  useEffect(() => {
    checkSubscription();
    
    // Check on URL params for checkout result
    const urlParams = new URLSearchParams(window.location.search);
    const checkoutResult = urlParams.get('checkout');
    
    if (checkoutResult === 'success') {
      toast({
        title: 'Assinatura realizada!',
        description: 'Bem-vindo ao seu novo plano.',
      });
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
      // Refresh subscription status
      setTimeout(checkSubscription, 2000);
    } else if (checkoutResult === 'canceled') {
      toast({
        variant: 'destructive',
        title: 'Checkout cancelado',
        description: 'Você pode tentar novamente a qualquer momento.',
      });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [checkSubscription, toast]);

  const getAnnualPrice = (monthlyPrice: number) => {
    const annualTotal = monthlyPrice * 12;
    const discountedTotal = annualTotal * (1 - ANNUAL_DISCOUNT);
    return discountedTotal / 12;
  };

  const getAnnualSavings = (monthlyPrice: number) => {
    const annualTotal = monthlyPrice * 12;
    return annualTotal * ANNUAL_DISCOUNT;
  };

  const applyDiscountToPrice = (price: number) => {
    if (!validatedCoupon) return price;
    
    if (validatedCoupon.discountType === 'percentage') {
      return price * (1 - validatedCoupon.discountValue / 100);
    } else {
      return Math.max(0, price - validatedCoupon.discountValue);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Digite um código de cupom');
      return;
    }

    setValidatingCoupon(true);
    setCouponError(null);

    try {
      const { data, error } = await supabase.functions.invoke('validate-coupon', {
        body: { 
          code: couponCode.trim(),
          targetAudience: 'professionals'
        },
      });

      if (error) throw new Error(error.message);

      if (data.valid) {
        setValidatedCoupon(data.coupon);
        toast({
          title: 'Cupom aplicado!',
          description: data.coupon.discountType === 'percentage' 
            ? `Desconto de ${data.coupon.discountValue}% aplicado`
            : `Desconto de R$ ${formatPrice(data.coupon.discountValue)} aplicado`,
        });
      } else {
        setCouponError(data.error || 'Cupom inválido');
        setValidatedCoupon(null);
      }
    } catch (error: any) {
      console.error('Error validating coupon:', error);
      setCouponError('Erro ao validar cupom. Tente novamente.');
      setValidatedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setValidatedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  };

  const handleSubscribe = async (plan: PlatformPlan) => {
    const tierKey = PLAN_TO_TIER[plan.name.toLowerCase()] || plan.name;
    const planKey = `${tierKey}-${billingCycle}`;
    
    setCheckingOut(plan.id);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          planKey,
          couponCode: validatedCoupon?.code,
        },
      });

      if (error) throw new Error(error.message);
      if (!data?.url) throw new Error('No checkout URL returned');

      // Open in new tab
      window.open(data.url, '_blank');
      
      toast({
        title: 'Redirecionando...',
        description: 'Uma nova aba foi aberta para você completar o pagamento.',
      });
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao criar checkout',
        description: error.message || 'Tente novamente.',
      });
    } finally {
      setCheckingOut(null);
    }
  };

  const handleManageSubscription = async () => {
    setOpeningPortal(true);

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw new Error(error.message);
      if (!data?.url) throw new Error('No portal URL returned');

      window.open(data.url, '_blank');
      
      toast({
        title: 'Portal aberto',
        description: 'Gerencie sua assinatura na nova aba.',
      });
    } catch (error: any) {
      console.error('Error opening portal:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao abrir portal',
        description: error.message || 'Tente novamente.',
      });
    } finally {
      setOpeningPortal(false);
    }
  };

  const getDiscountLabel = () => {
    if (!validatedCoupon) return null;
    
    if (validatedCoupon.discountType === 'percentage') {
      return `-${validatedCoupon.discountValue}%`;
    } else {
      return `-R$ ${formatPrice(validatedCoupon.discountValue)}`;
    }
  };

  const isCurrentTier = (planName: string) => {
    if (!subscription?.subscribed || !subscription.tier) return false;
    const planTier = PLAN_TO_TIER[planName.toLowerCase()];
    return subscription.tier.includes(planTier);
  };

  return (
    <div className="space-y-8">
      {/* Current Subscription Info */}
      {subscription?.subscribed && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-primary/10 border border-primary/20 rounded-lg animate-fade-in">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">
                Plano {subscription.tier?.replace('-patients', ' pacientes')} ativo
              </p>
              <p className="text-sm text-muted-foreground">
                Renovação: {subscription.subscription_end 
                  ? new Date(subscription.subscription_end).toLocaleDateString('pt-BR')
                  : 'N/A'
                }
                {subscription.billing_interval && ` • ${subscription.billing_interval === 'month' ? 'Mensal' : 'Anual'}`}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleManageSubscription}
            disabled={openingPortal}
          >
            {openingPortal ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Settings className="w-4 h-4 mr-2" />
            )}
            Gerenciar Assinatura
          </Button>
        </div>
      )}

      {/* Billing Toggle */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative inline-flex items-center p-1 bg-muted rounded-full">
          <div
            className={cn(
              "absolute h-[calc(100%-8px)] top-1 rounded-full bg-primary transition-all duration-300 ease-out",
              billingCycle === 'monthly' ? 'left-1 w-[calc(50%-4px)]' : 'left-[calc(50%+2px)] w-[calc(50%-4px)]'
            )}
          />
          
          <button
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              "relative z-10 px-6 py-2.5 rounded-full text-sm font-medium transition-colors duration-200",
              billingCycle === 'monthly'
                ? 'text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Mensal
          </button>
          
          <button
            onClick={() => setBillingCycle('annual')}
            className={cn(
              "relative z-10 px-6 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-2",
              billingCycle === 'annual'
                ? 'text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Anual
            <Badge 
              variant="secondary" 
              className={cn(
                "text-xs font-bold transition-all duration-300",
                billingCycle === 'annual' 
                  ? 'bg-green-500 text-white hover:bg-green-500' 
                  : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              )}
            >
              -26%
            </Badge>
          </button>
        </div>

        {billingCycle === 'annual' && (
          <p className="text-sm text-green-600 dark:text-green-400 font-medium animate-fade-in">
            ✨ Economize 26% com o plano anual!
          </p>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.filter(plan => !plan.is_free).map((plan, index) => {
          const isCurrent = isCurrentTier(plan.name);
          let displayPrice = billingCycle === 'annual' ? getAnnualPrice(plan.price) : plan.price;
          const originalPrice = displayPrice;
          displayPrice = applyDiscountToPrice(displayPrice);
          const annualSavings = getAnnualSavings(plan.price);
          const isPopular = index === 1;
          const hasCouponDiscount = validatedCoupon && originalPrice !== displayPrice;
          const isLoading = checkingOut === plan.id;

          return (
            <Card 
              key={plan.id} 
              className={cn(
                "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
                isCurrent && 'border-primary ring-2 ring-primary',
                isPopular && !isCurrent && 'border-primary/50'
              )}
            >
              {isPopular && !isCurrent && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                  POPULAR
                </div>
              )}
              
              {isCurrent && (
                <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-xs font-bold text-center py-1">
                  SEU PLANO ATUAL
                </div>
              )}

              <CardHeader className={cn(isCurrent && 'pt-8')}>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price Display */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-muted-foreground">R$</span>
                    <span className="text-4xl font-bold">{formatPrice(displayPrice)}</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                  
                  {hasCouponDiscount && (
                    <p className="text-sm text-muted-foreground line-through">
                      R$ {formatPrice(originalPrice)}/mês
                    </p>
                  )}
                  
                  {billingCycle === 'annual' && !hasCouponDiscount && (
                    <p className="text-sm text-muted-foreground line-through">
                      R$ {formatPrice(plan.price)}/mês
                    </p>
                  )}

                  {hasCouponDiscount && (
                    <Badge className="bg-green-500 text-white hover:bg-green-500 animate-fade-in">
                      <Tag className="w-3 h-3 mr-1" />
                      Cupom {getDiscountLabel()}
                    </Badge>
                  )}
                  
                  {billingCycle === 'annual' && (
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center gap-1 animate-fade-in">
                      <CheckCircle className="w-4 h-4" />
                      Economize R$ {formatPrice(annualSavings)}/ano
                    </p>
                  )}

                  {billingCycle === 'annual' && (
                    <p className="text-xs text-muted-foreground">
                      Cobrado R$ {formatPrice(applyDiscountToPrice(getAnnualPrice(plan.price)) * 12)} anualmente
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Subscribe Button */}
                <Button 
                  className="w-full" 
                  variant={isCurrent ? 'outline' : (isPopular ? 'default' : 'outline')}
                  disabled={isCurrent || isLoading || loadingSubscription}
                  onClick={() => handleSubscribe(plan)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : isCurrent ? (
                    'Plano Atual'
                  ) : subscription?.subscribed ? (
                    'Alterar Plano'
                  ) : (
                    'Assinar'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Free Plan Card */}
      {plans.filter(plan => plan.is_free).map((plan) => (
        <Card key={plan.id} className="border-dashed max-w-md mx-auto">
          <CardContent className="py-6 text-center">
            <h3 className="font-semibold mb-2">{plan.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
            <Badge variant="secondary">Gratuito</Badge>
          </CardContent>
        </Card>
      ))}

      {/* Coupon Section - Only show if not subscribed */}
      {!subscription?.subscribed && (
        <div className="flex flex-col items-center gap-3 pt-4 border-t">
          {validatedCoupon ? (
            <div className="flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-fade-in">
              <Check className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Cupom <span className="font-bold">{validatedCoupon.code}</span> aplicado!
                </p>
                <p className="text-xs text-green-600 dark:text-green-500">
                  {validatedCoupon.discountType === 'percentage' 
                    ? `${validatedCoupon.discountValue}% de desconto`
                    : `R$ ${formatPrice(validatedCoupon.discountValue)} de desconto`
                  }
                  {validatedCoupon.description && ` - ${validatedCoupon.description}`}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={removeCoupon}
                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : !showCouponInput ? (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowCouponInput(true)}
              className="text-muted-foreground hover:text-primary"
            >
              <Tag className="w-4 h-4 mr-2" />
              Tem um cupom de desconto?
            </Button>
          ) : (
            <div className="space-y-2 animate-fade-in w-full max-w-sm">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Digite seu cupom"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      validateCoupon();
                    }
                  }}
                  className={cn(
                    "uppercase",
                    couponError && "border-destructive focus-visible:ring-destructive"
                  )}
                  maxLength={20}
                />
                <Button 
                  variant="secondary" 
                  onClick={validateCoupon}
                  disabled={validatingCoupon}
                >
                  {validatingCoupon ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Aplicar'
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    setShowCouponInput(false);
                    setCouponCode('');
                    setCouponError(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {couponError && (
                <p className="text-sm text-destructive flex items-center gap-1 animate-fade-in">
                  <AlertCircle className="w-4 h-4" />
                  {couponError}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PricingPlans;
