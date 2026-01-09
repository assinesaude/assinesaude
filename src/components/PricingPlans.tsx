import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CheckCircle, Tag, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlatformPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  features: string[];
  is_free: boolean;
}

interface PricingPlansProps {
  plans: PlatformPlan[];
  onSubscribe?: (planId: string, billingCycle: 'monthly' | 'annual', couponCode?: string) => void;
  loading?: boolean;
  currentPlanId?: string;
}

const ANNUAL_DISCOUNT = 0.26; // 26% discount

const PricingPlans = ({ plans, onSubscribe, loading, currentPlanId }: PricingPlansProps) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [couponCode, setCouponCode] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);

  const getAnnualPrice = (monthlyPrice: number) => {
    const annualTotal = monthlyPrice * 12;
    const discountedTotal = annualTotal * (1 - ANNUAL_DISCOUNT);
    return discountedTotal / 12; // Show monthly equivalent
  };

  const getAnnualSavings = (monthlyPrice: number) => {
    const annualTotal = monthlyPrice * 12;
    return annualTotal * ANNUAL_DISCOUNT;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative inline-flex items-center p-1 bg-muted rounded-full">
          {/* Background slider */}
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
          const isCurrentPlan = plan.id === currentPlanId;
          const displayPrice = billingCycle === 'annual' ? getAnnualPrice(plan.price) : plan.price;
          const annualSavings = getAnnualSavings(plan.price);
          const isPopular = index === 1; // Middle plan is popular

          return (
            <Card 
              key={plan.id} 
              className={cn(
                "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
                isCurrentPlan && 'border-primary ring-2 ring-primary',
                isPopular && !isCurrentPlan && 'border-primary/50'
              )}
            >
              {isPopular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                  POPULAR
                </div>
              )}
              
              {isCurrentPlan && (
                <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-xs font-bold text-center py-1">
                  SEU PLANO ATUAL
                </div>
              )}

              <CardHeader className={cn(isCurrentPlan && 'pt-8')}>
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
                  
                  {billingCycle === 'annual' && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground line-through">
                        R$ {formatPrice(plan.price)}/mês
                      </p>
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center gap-1 animate-fade-in">
                        <CheckCircle className="w-4 h-4" />
                        Economize R$ {formatPrice(annualSavings)}/ano
                      </p>
                    </div>
                  )}

                  {billingCycle === 'annual' && (
                    <p className="text-xs text-muted-foreground">
                      Cobrado R$ {formatPrice(displayPrice * 12)} anualmente
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
                  variant={isCurrentPlan ? 'outline' : (isPopular ? 'default' : 'outline')}
                  disabled={isCurrentPlan || loading}
                  onClick={() => onSubscribe?.(plan.id, billingCycle, couponCode || undefined)}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : isCurrentPlan ? (
                    'Plano Atual'
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

      {/* Coupon Section */}
      <div className="flex flex-col items-center gap-3 pt-4 border-t">
        {!showCouponInput ? (
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
          <div className="flex items-center gap-2 animate-fade-in w-full max-w-xs">
            <Input
              placeholder="Digite seu cupom"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="uppercase"
            />
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => {
                if (!couponCode) {
                  setShowCouponInput(false);
                }
              }}
            >
              {couponCode ? 'Aplicar' : 'Fechar'}
            </Button>
          </div>
        )}
        
        {couponCode && (
          <p className="text-sm text-muted-foreground animate-fade-in">
            Cupom <span className="font-semibold text-primary">{couponCode}</span> será aplicado na assinatura
          </p>
        )}
      </div>
    </div>
  );
};

export default PricingPlans;
