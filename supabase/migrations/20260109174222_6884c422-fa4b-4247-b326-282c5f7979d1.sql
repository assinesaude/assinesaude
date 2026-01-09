-- Table for professions (e.g., Dentista, Nutricionista)
CREATE TABLE public.professions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for professional councils (e.g., CRO, CRN)
CREATE TABLE public.professional_councils (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    abbreviation TEXT NOT NULL UNIQUE,
    profession_id UUID NOT NULL REFERENCES public.professions(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for specialties (e.g., Ortodontia, Nutrição Esportiva)
CREATE TABLE public.specialties (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    profession_id UUID NOT NULL REFERENCES public.professions(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(name, profession_id)
);

-- Table for Brazilian states (fixed data)
CREATE TABLE public.brazilian_states (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    abbreviation TEXT NOT NULL UNIQUE
);

-- Table for cities
CREATE TABLE public.brazilian_cities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    state_id UUID NOT NULL REFERENCES public.brazilian_states(id) ON DELETE CASCADE,
    UNIQUE(name, state_id)
);

-- Table for platform messages
CREATE TABLE public.platform_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'manual', -- manual, holiday, promotion, birthday
    target_audience TEXT NOT NULL DEFAULT 'all', -- all, professionals, patients
    filter_profession_id UUID REFERENCES public.professions(id),
    filter_specialty_id UUID REFERENCES public.specialties(id),
    filter_state_id UUID REFERENCES public.brazilian_states(id),
    filter_city_id UUID REFERENCES public.brazilian_cities(id),
    is_automatic BOOLEAN NOT NULL DEFAULT false,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table to track message recipients
CREATE TABLE public.message_recipients (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES public.platform_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for discount coupons
CREATE TABLE public.discount_coupons (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_type TEXT NOT NULL DEFAULT 'percentage', -- percentage, fixed
    discount_value NUMERIC NOT NULL,
    max_uses INTEGER,
    current_uses INTEGER NOT NULL DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    valid_until TIMESTAMP WITH TIME ZONE,
    target_audience TEXT NOT NULL DEFAULT 'patients', -- patients, professionals, all
    created_by UUID NOT NULL,
    created_by_type TEXT NOT NULL DEFAULT 'admin', -- admin, professional
    professional_id UUID REFERENCES public.professional_profiles(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table to track coupon usage
CREATE TABLE public.coupon_usage (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    coupon_id UUID NOT NULL REFERENCES public.discount_coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add profession, specialty, and council references to professional_profiles
ALTER TABLE public.professional_profiles
ADD COLUMN profession_id UUID REFERENCES public.professions(id),
ADD COLUMN specialty_id UUID REFERENCES public.specialties(id),
ADD COLUMN council_id UUID REFERENCES public.professional_councils(id);

-- Enable RLS on all new tables
ALTER TABLE public.professions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_councils ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brazilian_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brazilian_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for professions
CREATE POLICY "Anyone can view active professions" ON public.professions FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage professions" ON public.professions FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for professional_councils
CREATE POLICY "Anyone can view active councils" ON public.professional_councils FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage councils" ON public.professional_councils FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for specialties
CREATE POLICY "Anyone can view active specialties" ON public.specialties FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage specialties" ON public.specialties FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for brazilian_states (public read)
CREATE POLICY "Anyone can view states" ON public.brazilian_states FOR SELECT USING (true);
CREATE POLICY "Admins can manage states" ON public.brazilian_states FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for brazilian_cities (public read)
CREATE POLICY "Anyone can view cities" ON public.brazilian_cities FOR SELECT USING (true);
CREATE POLICY "Admins can manage cities" ON public.brazilian_cities FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for platform_messages
CREATE POLICY "Admins can manage messages" ON public.platform_messages FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for message_recipients
CREATE POLICY "Users can view their messages" ON public.message_recipients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their messages" ON public.message_recipients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage recipients" ON public.message_recipients FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for discount_coupons
CREATE POLICY "Admins can manage all coupons" ON public.discount_coupons FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Professionals can manage own coupons" ON public.discount_coupons FOR ALL USING (
    has_role(auth.uid(), 'professional') AND 
    created_by = auth.uid() AND 
    created_by_type = 'professional'
);
CREATE POLICY "Anyone can view active coupons" ON public.discount_coupons FOR SELECT USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

-- RLS Policies for coupon_usage
CREATE POLICY "Users can view own usage" ON public.coupon_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage" ON public.coupon_usage FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all usage" ON public.coupon_usage FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Insert Brazilian states
INSERT INTO public.brazilian_states (name, abbreviation) VALUES
('Acre', 'AC'), ('Alagoas', 'AL'), ('Amapá', 'AP'), ('Amazonas', 'AM'),
('Bahia', 'BA'), ('Ceará', 'CE'), ('Distrito Federal', 'DF'), ('Espírito Santo', 'ES'),
('Goiás', 'GO'), ('Maranhão', 'MA'), ('Mato Grosso', 'MT'), ('Mato Grosso do Sul', 'MS'),
('Minas Gerais', 'MG'), ('Pará', 'PA'), ('Paraíba', 'PB'), ('Paraná', 'PR'),
('Pernambuco', 'PE'), ('Piauí', 'PI'), ('Rio de Janeiro', 'RJ'), ('Rio Grande do Norte', 'RN'),
('Rio Grande do Sul', 'RS'), ('Rondônia', 'RO'), ('Roraima', 'RR'), ('Santa Catarina', 'SC'),
('São Paulo', 'SP'), ('Sergipe', 'SE'), ('Tocantins', 'TO');

-- Insert some initial professions
INSERT INTO public.professions (name) VALUES
('Dentista'), ('Nutricionista'), ('Psicólogo'), ('Fisioterapeuta'), ('Médico'), ('Enfermeiro');

-- Insert councils for each profession
INSERT INTO public.professional_councils (name, abbreviation, profession_id) VALUES
('Conselho Regional de Odontologia', 'CRO', (SELECT id FROM professions WHERE name = 'Dentista')),
('Conselho Regional de Nutricionistas', 'CRN', (SELECT id FROM professions WHERE name = 'Nutricionista')),
('Conselho Regional de Psicologia', 'CRP', (SELECT id FROM professions WHERE name = 'Psicólogo')),
('Conselho Regional de Fisioterapia', 'CREFITO', (SELECT id FROM professions WHERE name = 'Fisioterapeuta')),
('Conselho Regional de Medicina', 'CRM', (SELECT id FROM professions WHERE name = 'Médico')),
('Conselho Regional de Enfermagem', 'COREN', (SELECT id FROM professions WHERE name = 'Enfermeiro'));

-- Insert some initial specialties
INSERT INTO public.specialties (name, profession_id) VALUES
('Ortodontia', (SELECT id FROM professions WHERE name = 'Dentista')),
('Implantodontia', (SELECT id FROM professions WHERE name = 'Dentista')),
('Endodontia', (SELECT id FROM professions WHERE name = 'Dentista')),
('Nutrição Esportiva', (SELECT id FROM professions WHERE name = 'Nutricionista')),
('Nutrição Clínica', (SELECT id FROM professions WHERE name = 'Nutricionista')),
('Psicologia Clínica', (SELECT id FROM professions WHERE name = 'Psicólogo')),
('Neuropsicologia', (SELECT id FROM professions WHERE name = 'Psicólogo')),
('Fisioterapia Ortopédica', (SELECT id FROM professions WHERE name = 'Fisioterapeuta')),
('Fisioterapia Respiratória', (SELECT id FROM professions WHERE name = 'Fisioterapeuta')),
('Cardiologia', (SELECT id FROM professions WHERE name = 'Médico')),
('Dermatologia', (SELECT id FROM professions WHERE name = 'Médico')),
('Pediatria', (SELECT id FROM professions WHERE name = 'Médico'));

-- Triggers for updated_at
CREATE TRIGGER update_professions_updated_at BEFORE UPDATE ON public.professions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_councils_updated_at BEFORE UPDATE ON public.professional_councils FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_specialties_updated_at BEFORE UPDATE ON public.specialties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.discount_coupons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();