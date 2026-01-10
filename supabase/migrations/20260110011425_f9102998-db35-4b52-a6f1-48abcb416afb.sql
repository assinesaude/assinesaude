-- Drop the anonymous access policy
DROP POLICY IF EXISTS "Anyone can view active coupons" ON public.discount_coupons;

-- Create authenticated-only policy for viewing active coupons
CREATE POLICY "Authenticated users can view active coupons"
ON public.discount_coupons FOR SELECT
TO authenticated
USING (
  is_active = true 
  AND valid_from <= now()
  AND (valid_until IS NULL OR valid_until > now())
  AND (max_uses IS NULL OR current_uses < max_uses)
);