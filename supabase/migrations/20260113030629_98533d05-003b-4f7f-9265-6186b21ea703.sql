-- Fix the security definer view warning by dropping and recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.professional_profiles_public;

CREATE VIEW public.professional_profiles_public 
WITH (security_invoker = true)
AS
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