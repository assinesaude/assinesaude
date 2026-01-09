import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ValidateCouponRequest {
  code: string;
  targetAudience?: 'professionals' | 'patients' | 'all';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, targetAudience = 'professionals' } = await req.json() as ValidateCouponRequest;

    if (!code || typeof code !== 'string') {
      return new Response(
        JSON.stringify({ valid: false, error: 'Código do cupom é obrigatório' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Validate code format (alphanumeric, max 20 chars)
    const sanitizedCode = code.trim().toUpperCase().slice(0, 20);
    if (!/^[A-Z0-9]+$/.test(sanitizedCode)) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Formato de cupom inválido' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Query the coupon
    const { data: coupon, error } = await supabaseClient
      .from('discount_coupons')
      .select('*')
      .eq('code', sanitizedCode)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ valid: false, error: 'Erro ao verificar cupom' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (!coupon) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Cupom não encontrado ou inativo' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Check validity dates
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    
    if (now < validFrom) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Cupom ainda não está válido' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    if (coupon.valid_until) {
      const validUntil = new Date(coupon.valid_until);
      if (now > validUntil) {
        return new Response(
          JSON.stringify({ valid: false, error: 'Cupom expirado' }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    }

    // Check usage limits
    if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Cupom atingiu o limite de uso' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Check target audience
    if (coupon.target_audience !== 'all' && coupon.target_audience !== targetAudience) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Cupom não válido para este tipo de usuário' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Coupon is valid - return discount info
    return new Response(
      JSON.stringify({
        valid: true,
        coupon: {
          code: coupon.code,
          discountType: coupon.discount_type,
          discountValue: coupon.discount_value,
          description: coupon.description,
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error('Error validating coupon:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Erro interno do servidor' }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
