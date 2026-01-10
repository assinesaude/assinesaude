-- Add social media and bio fields to professional_profiles
ALTER TABLE public.professional_profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS tiktok_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS kwai_url TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
ADD COLUMN IF NOT EXISTS telegram_url TEXT,
ADD COLUMN IF NOT EXISTS google_street_view_url TEXT,
ADD COLUMN IF NOT EXISTS google_my_business_url TEXT,
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create index for slug lookup (for SEO-friendly URLs)
CREATE INDEX IF NOT EXISTS idx_professional_profiles_slug ON public.professional_profiles(slug);

-- Create function to generate unique slug from name
CREATE OR REPLACE FUNCTION public.generate_professional_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base slug from full_name
  base_slug := lower(regexp_replace(unaccent(NEW.full_name), '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  final_slug := base_slug;
  
  -- Check for uniqueness and append counter if needed
  WHILE EXISTS (SELECT 1 FROM public.professional_profiles WHERE slug = final_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to auto-generate slug on insert/update
DROP TRIGGER IF EXISTS generate_slug_trigger ON public.professional_profiles;
CREATE TRIGGER generate_slug_trigger
BEFORE INSERT OR UPDATE OF full_name ON public.professional_profiles
FOR EACH ROW
WHEN (NEW.slug IS NULL OR NEW.slug = '')
EXECUTE FUNCTION public.generate_professional_slug();

-- Enable unaccent extension for proper slug generation
CREATE EXTENSION IF NOT EXISTS unaccent;