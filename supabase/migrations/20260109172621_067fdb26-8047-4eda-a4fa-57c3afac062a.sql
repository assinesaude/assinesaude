-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'professional', 'patient');

-- Create enum for professional approval status
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Create user_roles table (security best practice - roles separate from profiles)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create patient_profiles table
CREATE TABLE public.patient_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    cpf TEXT NOT NULL UNIQUE,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    birth_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on patient_profiles
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;

-- Create professional_profiles table
CREATE TABLE public.professional_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    cpf TEXT NOT NULL UNIQUE,
    professional_registration TEXT NOT NULL,
    specialty TEXT NOT NULL,
    phone TEXT,
    clinic_name TEXT,
    clinic_address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    document_front_url TEXT,
    document_back_url TEXT,
    approval_status approval_status NOT NULL DEFAULT 'pending',
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES auth.users(id),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on professional_profiles
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;

-- Create platform_plans table (B2B plans - only visible to admins and professionals after login)
CREATE TABLE public.platform_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    features JSONB DEFAULT '[]'::jsonb,
    is_free BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on platform_plans
ALTER TABLE public.platform_plans ENABLE ROW LEVEL SECURITY;

-- Create professional_subscriptions table (links professionals to their B2B plans)
CREATE TABLE public.professional_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID REFERENCES public.professional_profiles(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.platform_plans(id) ON DELETE RESTRICT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on professional_subscriptions
ALTER TABLE public.professional_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create service_offerings table (public offerings from approved professionals)
CREATE TABLE public.service_offerings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID REFERENCES public.professional_profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_minutes INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on service_offerings
ALTER TABLE public.service_offerings ENABLE ROW LEVEL SECURITY;

-- Function to check if professional is approved
CREATE OR REPLACE FUNCTION public.is_approved_professional(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.professional_profiles
    WHERE user_id = _user_id
      AND approval_status = 'approved'
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for patient_profiles
CREATE POLICY "Patients can view own profile" ON public.patient_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Patients can update own profile" ON public.patient_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Patients can insert own profile" ON public.patient_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all patient profiles" ON public.patient_profiles
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for professional_profiles
CREATE POLICY "Professionals can view own profile" ON public.professional_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Professionals can update own profile" ON public.professional_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Professionals can insert own profile" ON public.professional_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all professional profiles" ON public.professional_profiles
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update professional profiles" ON public.professional_profiles
    FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view approved professionals" ON public.professional_profiles
    FOR SELECT USING (approval_status = 'approved');

-- RLS Policies for platform_plans (B2B - only admins and authenticated professionals can see)
CREATE POLICY "Admins can manage plans" ON public.platform_plans
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Professionals can view active plans" ON public.platform_plans
    FOR SELECT USING (
        is_active = true 
        AND public.has_role(auth.uid(), 'professional')
    );

-- RLS Policies for professional_subscriptions
CREATE POLICY "Professionals can view own subscriptions" ON public.professional_subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.professional_profiles pp
            WHERE pp.id = professional_id AND pp.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage subscriptions" ON public.professional_subscriptions
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for service_offerings
CREATE POLICY "Public can view active offerings from approved professionals" ON public.service_offerings
    FOR SELECT USING (
        is_active = true 
        AND EXISTS (
            SELECT 1 FROM public.professional_profiles pp
            WHERE pp.id = professional_id AND pp.approval_status = 'approved'
        )
    );

CREATE POLICY "Professionals can manage own offerings" ON public.service_offerings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.professional_profiles pp
            WHERE pp.id = professional_id AND pp.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all offerings" ON public.service_offerings
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_patient_profiles_updated_at
    BEFORE UPDATE ON public.patient_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_professional_profiles_updated_at
    BEFORE UPDATE ON public.professional_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platform_plans_updated_at
    BEFORE UPDATE ON public.platform_plans
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_offerings_updated_at
    BEFORE UPDATE ON public.service_offerings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for professional documents
INSERT INTO storage.buckets (id, name, public) VALUES ('professional-documents', 'professional-documents', false);

-- Storage policies for professional-documents bucket
CREATE POLICY "Professionals can upload their own documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'professional-documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Professionals can view their own documents"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'professional-documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Admins can view all documents"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'professional-documents' 
        AND public.has_role(auth.uid(), 'admin')
    );

-- Insert initial free plan
INSERT INTO public.platform_plans (name, description, price, is_free, features)
VALUES (
    'Plano Gratuito',
    'Plano inicial para profissionais começarem na plataforma',
    0,
    true,
    '["Perfil básico", "Até 5 ofertas de serviços", "Suporte por email"]'::jsonb
);