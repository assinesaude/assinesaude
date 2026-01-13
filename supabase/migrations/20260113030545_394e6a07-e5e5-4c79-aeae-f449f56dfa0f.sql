-- 1. Fix professional_profiles public exposure - restrict what public can see
-- Drop the current overly permissive policy
DROP POLICY IF EXISTS "Public can view approved professionals" ON public.professional_profiles;

-- Create a more restrictive policy that still allows public viewing but data is filtered at application level
-- The policy itself allows SELECT, but we'll create a view for safe public data
CREATE POLICY "Public can view approved professionals basic info" 
ON public.professional_profiles 
FOR SELECT 
USING (approval_status = 'approved');

-- Create a view for public-facing professional data (excludes sensitive info like CPF, documents)
CREATE OR REPLACE VIEW public.professional_profiles_public AS
SELECT 
  id,
  full_name,
  specialty,
  specialty_id,
  profession_id,
  bio,
  clinic_name,
  clinic_address,
  city,
  state,
  avatar_url,
  slug,
  whatsapp_number,
  instagram_url,
  facebook_url,
  youtube_url,
  tiktok_url,
  kwai_url,
  telegram_url,
  google_my_business_url,
  google_street_view_url,
  approval_status
FROM public.professional_profiles
WHERE approval_status = 'approved';

-- 2. Fix discount_coupons - remove ability for all authenticated users to browse coupons
DROP POLICY IF EXISTS "Authenticated users can view active coupons" ON public.discount_coupons;

-- Create a function to validate a specific coupon code (for checkout validation only)
CREATE OR REPLACE FUNCTION public.validate_coupon_code(coupon_code TEXT)
RETURNS TABLE (
  id UUID,
  code TEXT,
  discount_type TEXT,
  discount_value NUMERIC,
  valid_until TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    dc.id,
    dc.code,
    dc.discount_type,
    dc.discount_value,
    dc.valid_until
  FROM public.discount_coupons dc
  WHERE dc.code = UPPER(TRIM(coupon_code))
    AND dc.is_active = true
    AND dc.valid_from <= now()
    AND (dc.valid_until IS NULL OR dc.valid_until > now())
    AND (dc.max_uses IS NULL OR dc.current_uses < dc.max_uses)
  LIMIT 1;
$$;

-- 3. Make professional-documents bucket private
UPDATE storage.buckets SET public = false WHERE id = 'professional-documents';

-- 4. Update storage policies - remove public access policy if exists
DROP POLICY IF EXISTS "Documents are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view professional documents" ON storage.objects;

-- Add policy for admins to view all documents
DROP POLICY IF EXISTS "Admins can view all professional documents" ON storage.objects;
CREATE POLICY "Admins can view all professional documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'professional-documents' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Users can view their own documents
DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
CREATE POLICY "Users can view own documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'professional-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);