import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mapping of plan tiers to Stripe price IDs
const PRICE_IDS = {
  '50-monthly': 'price_1SnnwkGkdCMrcNFStMFm9v6T',
  '50-annual': 'price_1SnnymGkdCMrcNFS9cMgasFR',
  '100-monthly': 'price_1SnnzUGkdCMrcNFS30T5AJV5',
  '100-annual': 'price_1SnnzeGkdCMrcNFS5ENfdfe7',
  '500-monthly': 'price_1SnnzuGkdCMrcNFSbAY4xf5V',
  '500-annual': 'price_1Sno0HGkdCMrcNFSX3yZBTMT',
} as const;

type PlanKey = keyof typeof PRICE_IDS;

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const body = await req.json();
    const { planKey, couponCode } = body as { planKey: string; couponCode?: string };

    if (!planKey || !(planKey in PRICE_IDS)) {
      throw new Error(`Invalid plan key: ${planKey}`);
    }

    const priceId = PRICE_IDS[planKey as PlanKey];
    logStep("Plan selected", { planKey, priceId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // Validate coupon if provided
    let stripeDiscounts: Stripe.Checkout.SessionCreateParams['discounts'] = undefined;
    
    if (couponCode) {
      logStep("Validating coupon", { couponCode });
      
      // Validate coupon in our database first
      const { data: coupon, error: couponError } = await supabaseClient
        .from('discount_coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (couponError) {
        logStep("Coupon DB error", { error: couponError.message });
      } else if (coupon) {
        // Check validity
        const now = new Date();
        const validFrom = new Date(coupon.valid_from);
        const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;
        
        const isValidDate = now >= validFrom && (!validUntil || now <= validUntil);
        const isUnderLimit = coupon.max_uses === null || coupon.current_uses < coupon.max_uses;
        const isForProfessionals = coupon.target_audience === 'all' || coupon.target_audience === 'professionals';

        if (isValidDate && isUnderLimit && isForProfessionals) {
          logStep("Coupon valid in DB", { coupon: coupon.code, discount: coupon.discount_value });
          
          // Create or find Stripe coupon
          try {
            // Try to find existing Stripe coupon with this code
            let stripeCoupon: Stripe.Coupon | null = null;
            
            try {
              stripeCoupon = await stripe.coupons.retrieve(coupon.code);
              logStep("Found existing Stripe coupon", { couponId: stripeCoupon.id });
            } catch {
              // Coupon doesn't exist in Stripe, create it
              logStep("Creating new Stripe coupon");
              
              if (coupon.discount_type === 'percentage') {
                stripeCoupon = await stripe.coupons.create({
                  id: coupon.code,
                  percent_off: coupon.discount_value,
                  currency: 'brl',
                  name: coupon.description || `Desconto ${coupon.discount_value}%`,
                  duration: 'once',
                });
              } else {
                stripeCoupon = await stripe.coupons.create({
                  id: coupon.code,
                  amount_off: Math.round(coupon.discount_value * 100), // Convert to cents
                  currency: 'brl',
                  name: coupon.description || `Desconto R$ ${coupon.discount_value}`,
                  duration: 'once',
                });
              }
              logStep("Created Stripe coupon", { couponId: stripeCoupon.id });
            }

            stripeDiscounts = [{ coupon: stripeCoupon.id }];
          } catch (stripeError: any) {
            logStep("Error with Stripe coupon", { error: stripeError.message });
            // Continue without coupon if there's an error
          }
        } else {
          logStep("Coupon invalid", { isValidDate, isUnderLimit, isForProfessionals });
        }
      } else {
        logStep("Coupon not found in DB");
      }
    }

    const origin = req.headers.get("origin") || "https://lovable.dev";
    
    // Create checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/dashboard/professional?checkout=success`,
      cancel_url: `${origin}/dashboard/professional?checkout=canceled`,
      metadata: {
        user_id: user.id,
        plan_key: planKey,
        coupon_code: couponCode || '',
      },
    };

    if (stripeDiscounts) {
      sessionParams.discounts = stripeDiscounts;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    // If coupon was used, increment usage count
    if (couponCode && stripeDiscounts) {
      const { error: updateError } = await supabaseClient
        .from('discount_coupons')
        .update({ current_uses: supabaseClient.rpc('increment_coupon_uses', { coupon_code: couponCode.toUpperCase() }) })
        .eq('code', couponCode.toUpperCase());
      
      if (updateError) {
        logStep("Error updating coupon uses", { error: updateError.message });
        // Non-blocking error, continue
      }
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
