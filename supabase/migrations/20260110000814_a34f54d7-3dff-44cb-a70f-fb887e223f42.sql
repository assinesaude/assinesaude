-- Add avatar_url column to professional_profiles
ALTER TABLE public.professional_profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add avatar_url column to patient_profiles
ALTER TABLE public.patient_profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;