-- Create table for activity categories/vectors
CREATE TABLE public.activity_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_categories ENABLE ROW LEVEL SECURITY;

-- Public can view active categories
CREATE POLICY "Anyone can view active categories"
ON public.activity_categories
FOR SELECT
USING (is_active = true);

-- Admins can manage categories
CREATE POLICY "Admins can manage categories"
ON public.activity_categories
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Insert default categories from YesConsulta
INSERT INTO public.activity_categories (name, icon_url, display_order) VALUES
('Medicina', 'https://yesconsulta.com/storage/uploads/areas-of-activities/01K7589A8CBQW93ZVRJQ5EPV42.png', 1),
('Odontologia', 'https://yesconsulta.com/storage/uploads/areas-of-activities/01K758AJAHVJH5VT45V50BB71Q.png', 2),
('Psicologia', 'https://yesconsulta.com/storage/uploads/areas-of-activities/01K758BQE3P2XX1FG49N6Y4B2Y.png', 3),
('Nutrição', 'https://yesconsulta.com/storage/uploads/areas-of-activities/01K758CTF3E64B8QRF2WWQKPMZ.png', 4),
('Fisioterapia', 'https://yesconsulta.com/storage/uploads/areas-of-activities/01K758E16FSGX9WR66HV78G96G.png', 5),
('Enfermagem', 'https://yesconsulta.com/storage/uploads/areas-of-activities/01K758F4XRNPJT71QNQD0YF3ES.png', 6),
('Veterinária', 'https://yesconsulta.com/storage/uploads/areas-of-activities/01K758GAX7PGGQGDYYTWE4NAR0.png', 7),
('Farmácia', 'https://yesconsulta.com/storage/uploads/areas-of-activities/01K758HFXPWSJCH69Q0Z9DGCH2.png', 8);

-- Create trigger for updated_at
CREATE TRIGGER update_activity_categories_updated_at
BEFORE UPDATE ON public.activity_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();