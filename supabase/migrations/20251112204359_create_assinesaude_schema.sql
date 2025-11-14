/*
  # AssineSaúde - Schema Completo da Plataforma

  ## 1. Tabelas Principais
  
  ### Profissionais (`professionals`)
  - Armazena dados completos de profissionais de saúde
  - Campos: dados pessoais, profissionais, localização, verificação
  - Relacionamento com auth.users
  
  ### Pacientes (`patients`)
  - Dados dos pacientes/clientes da plataforma
  - Campos: dados pessoais, histórico, preferências
  - Relacionamento com auth.users
  
  ### Planos de Benefícios (`benefit_plans`)
  - Planos criados pelos profissionais (até 3 por profissional)
  - Campos: nome, descrição, preço, serviços inclusos/exclusos
  - Relacionamento com profissionais
  
  ### Contratos/Assinaturas (`subscriptions`)
  - Contratos ativos entre pacientes e profissionais
  - Campos: status, datas, valores, termos aceitos
  - Relacionamento com pacientes e planos
  
  ### Pagamentos (`payments`)
  - Histórico de todos os pagamentos da plataforma
  - Campos: valor, status, método, stripe_id
  - Relacionamento com assinaturas
  
  ### Agendamentos (`appointments`)
  - Agendas de consultas presenciais e online
  - Campos: data/hora, tipo, status, observações
  - Relacionamento com profissionais e pacientes
  
  ### Prontuários (`medical_records`)
  - Registros médicos dos pacientes
  - Campos: anamnese, histórico, exames, observações
  - Relacionamento com pacientes e profissionais
  
  ### Mensagens (`messages`)
  - Sistema de mensagens internas da plataforma
  - Campos: remetente, destinatário, conteúdo, status
  - Relacionamento com usuários
  
  ### Avaliações (`reviews`)
  - Avaliações de pacientes sobre profissionais
  - Campos: estrelas (1-5), comentário, data
  - Relacionamento com pacientes e profissionais
  
  ### Testemunhos (`testimonials`)
  - Depoimentos destacados na home
  - Campos: nome, foto, cidade, depoimento, tipo (profissional/paciente)
  
  ### Cupons (`coupons`)
  - Cupons de desconto criados por admin ou profissionais
  - Campos: código, desconto, validade, limite de uso
  
  ### Carrossel (`carousel_items`)
  - Itens do carrossel da home (imagens/vídeos)
  - Campos: tipo, url, ordem, ativo
  
  ### Vetores/Ícones (`feature_vectors`)
  - Ícones rotativos com legendas configuráveis
  - Campos: imagem, legenda, fonte, cor, tamanho

  ## 2. Segurança
  - RLS habilitado em todas as tabelas
  - Políticas restritivas por papel (admin/professional/patient)
  - Dados sensíveis protegidos
  
  ## 3. Relacionamentos
  - Foreign keys com CASCADE apropriado
  - Índices para otimizar buscas
  - Constraints para integridade
*/

-- ENUMS para tipos e status
CREATE TYPE user_role AS ENUM ('admin', 'professional', 'patient');
CREATE TYPE professional_type AS ENUM ('consultorio', 'clinica', 'hospital');
CREATE TYPE profession AS ENUM (
  'medico', 'medico_veterinario', 'biomedico', 'dentista',
  'fisioterapeuta', 'fonoaudiologo', 'quiropraxista', 'psicologo',
  'psicanalista', 'nutricionista', 'enfermeiro', 'farmaceutico'
);
CREATE TYPE subscription_status AS ENUM ('active', 'suspended', 'cancelled', 'pending');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('credit_card', 'pix', 'boleto');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE appointment_type AS ENUM ('online', 'presencial');
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');
CREATE TYPE carousel_type AS ENUM ('image', 'video');

-- Estender auth.users com metadados
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'patient',
  full_name text NOT NULL,
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- PROFISSIONAIS DE SAÚDE
CREATE TABLE IF NOT EXISTS public.professionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_type professional_type NOT NULL,
  profession profession NOT NULL,
  specialties text[] NOT NULL,
  council_number text NOT NULL,
  council_uf text NOT NULL,
  council_document_front text,
  council_document_back text,
  verified boolean DEFAULT false,
  verified_at timestamptz,
  
  -- Nomenclatura comercial preferida
  plan_nomenclature text DEFAULT 'Plano de Benefícios',
  
  -- Dados de localização
  cep text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  country text DEFAULT 'Brasil',
  neighborhood text,
  
  -- Dados comerciais
  business_name text NOT NULL,
  description text,
  business_photos text[],
  opening_hours jsonb,
  
  -- Redes sociais
  social_links jsonb,
  
  -- Configuração de pagamento
  payment_preference text NOT NULL CHECK (payment_preference IN ('platform', 'direct_pix')),
  pix_key text,
  bank_details jsonb,
  
  -- Plano da plataforma
  platform_plan text,
  platform_plan_active boolean DEFAULT false,
  
  -- Avaliações
  average_rating numeric(2,1) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  
  -- Online status
  is_online boolean DEFAULT false,
  last_online_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- PACIENTES
CREATE TABLE IF NOT EXISTS public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cpf text UNIQUE NOT NULL,
  birth_date date,
  address text,
  cep text,
  city text,
  state text,
  emergency_contact text,
  emergency_phone text,
  
  -- Dados de saúde gerais
  blood_type text,
  allergies text[],
  chronic_conditions text[],
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- PLANOS DE BENEFÍCIOS
CREATE TABLE IF NOT EXISTS public.benefit_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  
  -- Serviços
  included_services text[] NOT NULL,
  excluded_services text[],
  service_limits jsonb,
  
  -- Preços
  monthly_price numeric(10,2) NOT NULL,
  annual_price numeric(10,2),
  
  -- Carências
  waiting_periods jsonb,
  
  -- Status
  is_published boolean DEFAULT false,
  is_active boolean DEFAULT true,
  
  -- Ordem de exibição
  display_order integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- CONTRATOS/ASSINATURAS
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES benefit_plans(id) ON DELETE RESTRICT,
  professional_id uuid NOT NULL REFERENCES professionals(id) ON DELETE RESTRICT,
  
  status subscription_status DEFAULT 'pending',
  
  -- Datas
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  next_billing_date timestamptz,
  
  -- Valores
  monthly_amount numeric(10,2) NOT NULL,
  
  -- Contrato
  contract_accepted boolean DEFAULT false,
  contract_accepted_at timestamptz,
  contract_ip text,
  contract_pdf_url text,
  
  -- Dependentes
  dependents jsonb DEFAULT '[]'::jsonb,
  
  -- Cupom aplicado
  coupon_code text,
  discount_amount numeric(10,2) DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- PAGAMENTOS
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  
  amount numeric(10,2) NOT NULL,
  status payment_status DEFAULT 'pending',
  payment_method payment_method NOT NULL,
  
  -- Integração Stripe
  stripe_payment_intent_id text,
  stripe_charge_id text,
  
  -- PIX/Boleto
  pix_qr_code text,
  pix_copy_paste text,
  boleto_url text,
  boleto_barcode text,
  
  -- Datas
  due_date timestamptz NOT NULL,
  paid_at timestamptz,
  
  -- Taxas
  platform_fee numeric(10,2),
  net_amount numeric(10,2),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AGENDAMENTOS
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE SET NULL,
  
  appointment_type appointment_type NOT NULL,
  status appointment_status DEFAULT 'scheduled',
  
  -- Data e hora
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer DEFAULT 30,
  
  -- Online meeting
  meeting_url text,
  meeting_password text,
  
  -- Notas
  patient_notes text,
  professional_notes text,
  
  -- Notificações
  reminder_sent boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- PRONTUÁRIOS MÉDICOS
CREATE TABLE IF NOT EXISTS public.medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE SET NULL,
  
  -- Anamnese
  chief_complaint text,
  history_present_illness text,
  past_medical_history text,
  family_history text,
  social_history text,
  
  -- Exame físico
  vital_signs jsonb,
  physical_examination text,
  
  -- Diagnóstico e tratamento
  diagnosis text,
  treatment_plan text,
  prescriptions jsonb,
  
  -- Exames
  lab_results jsonb,
  imaging_results jsonb,
  
  -- Observações
  notes text,
  
  -- Arquivos
  attachments text[],
  
  -- Datas
  visit_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- MENSAGENS
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  subject text,
  content text NOT NULL,
  status message_status DEFAULT 'sent',
  
  -- Sistema
  is_system_message boolean DEFAULT false,
  is_birthday_message boolean DEFAULT false,
  
  read_at timestamptz,
  
  created_at timestamptz DEFAULT now()
);

-- AVALIAÇÕES
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE SET NULL,
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  
  -- Moderação
  is_approved boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(professional_id, patient_id, appointment_id)
);

-- TESTEMUNHOS
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('professional', 'patient')),
  name text NOT NULL,
  photo_url text NOT NULL,
  city text NOT NULL,
  testimonial text NOT NULL,
  
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- CUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  
  code text UNIQUE NOT NULL,
  description text,
  
  -- Desconto
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric(10,2) NOT NULL,
  
  -- Validade
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz NOT NULL,
  
  -- Limites
  max_uses integer,
  current_uses integer DEFAULT 0,
  max_uses_per_user integer DEFAULT 1,
  
  -- Aplicação
  applicable_to text[] DEFAULT ARRAY['all'],
  
  is_active boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- CARROSSEL HOME
CREATE TABLE IF NOT EXISTS public.carousel_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type carousel_type NOT NULL,
  url text NOT NULL,
  title text,
  description text,
  
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  
  -- Para vídeos
  duration_seconds integer,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- VETORES/ÍCONES
CREATE TABLE IF NOT EXISTS public.feature_vectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text NOT NULL,
  
  -- Configuração de fonte
  font_family text DEFAULT 'Inter',
  font_size text DEFAULT '16px',
  font_color text DEFAULT '#1e293b',
  
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_professionals_user_id ON professionals(user_id);
CREATE INDEX IF NOT EXISTS idx_professionals_verified ON professionals(verified);
CREATE INDEX IF NOT EXISTS idx_professionals_city_state ON professionals(city, state);
CREATE INDEX IF NOT EXISTS idx_professionals_profession ON professionals(profession);
CREATE INDEX IF NOT EXISTS idx_professionals_specialties ON professionals USING GIN(specialties);

CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_cpf ON patients(cpf);

CREATE INDEX IF NOT EXISTS idx_benefit_plans_professional ON benefit_plans(professional_id);
CREATE INDEX IF NOT EXISTS idx_benefit_plans_published ON benefit_plans(is_published);

CREATE INDEX IF NOT EXISTS idx_subscriptions_patient ON subscriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_professional ON subscriptions(professional_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_payments_subscription ON payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

CREATE INDEX IF NOT EXISTS idx_appointments_professional ON appointments(professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_professional ON medical_records(professional_id);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);

CREATE INDEX IF NOT EXISTS idx_reviews_professional ON reviews(professional_id);
CREATE INDEX IF NOT EXISTS idx_reviews_patient ON reviews(patient_id);

-- HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE carousel_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_vectors ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS - USER PROFILES
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- POLÍTICAS RLS - PROFESSIONALS
CREATE POLICY "Anyone can view verified professionals"
  ON professionals FOR SELECT
  TO authenticated
  USING (verified = true);

CREATE POLICY "Professionals can view own data"
  ON professionals FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Professionals can update own data"
  ON professionals FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all professionals"
  ON professionals FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- POLÍTICAS RLS - PATIENTS
CREATE POLICY "Patients can view own data"
  ON patients FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Patients can update own data"
  ON patients FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Professionals can view their patients"
  ON patients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions s
      JOIN professionals p ON s.professional_id = p.id
      WHERE s.patient_id = patients.id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all patients"
  ON patients FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- POLÍTICAS RLS - BENEFIT PLANS
CREATE POLICY "Anyone can view published plans"
  ON benefit_plans FOR SELECT
  TO authenticated
  USING (is_published = true AND is_active = true);

CREATE POLICY "Professionals can manage own plans"
  ON benefit_plans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE id = benefit_plans.professional_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all plans"
  ON benefit_plans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- POLÍTICAS RLS - SUBSCRIPTIONS
CREATE POLICY "Patients can view own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE id = subscriptions.patient_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can view their subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE id = subscriptions.professional_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can manage their subscriptions"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE id = subscriptions.professional_id
      AND user_id = auth.uid()
    )
  );

-- POLÍTICAS RLS - PAYMENTS
CREATE POLICY "Patients can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions s
      JOIN patients p ON s.patient_id = p.id
      WHERE s.id = payments.subscription_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can view their payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions s
      JOIN professionals pr ON s.professional_id = pr.id
      WHERE s.id = payments.subscription_id
      AND pr.user_id = auth.uid()
    )
  );

-- POLÍTICAS RLS - APPOINTMENTS
CREATE POLICY "Patients can manage own appointments"
  ON appointments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE id = appointments.patient_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can manage their appointments"
  ON appointments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE id = appointments.professional_id
      AND user_id = auth.uid()
    )
  );

-- POLÍTICAS RLS - MEDICAL RECORDS
CREATE POLICY "Patients can view own records"
  ON medical_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE id = medical_records.patient_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can manage their patients records"
  ON medical_records FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE id = medical_records.professional_id
      AND user_id = auth.uid()
    )
  );

-- POLÍTICAS RLS - MESSAGES
CREATE POLICY "Users can view sent messages"
  ON messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid());

CREATE POLICY "Users can view received messages"
  ON messages FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update received messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- POLÍTICAS RLS - REVIEWS
CREATE POLICY "Anyone can view approved reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (is_approved = true);

CREATE POLICY "Patients can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients
      WHERE id = reviews.patient_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- POLÍTICAS RLS - TESTIMONIALS (Público)
CREATE POLICY "Anyone can view active testimonials"
  ON testimonials FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage testimonials"
  ON testimonials FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- POLÍTICAS RLS - COUPONS
CREATE POLICY "Anyone can view active coupons"
  ON coupons FOR SELECT
  TO authenticated
  USING (is_active = true AND valid_until > now());

CREATE POLICY "Professionals can manage own coupons"
  ON coupons FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM professionals
      WHERE id = coupons.professional_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all coupons"
  ON coupons FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- POLÍTICAS RLS - CAROUSEL (Público)
CREATE POLICY "Anyone can view active carousel items"
  ON carousel_items FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage carousel"
  ON carousel_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- POLÍTICAS RLS - FEATURE VECTORS (Público)
CREATE POLICY "Anyone can view active vectors"
  ON feature_vectors FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage vectors"
  ON feature_vectors FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- FUNÇÕES AUXILIARES

-- Atualizar média de avaliações do profissional
CREATE OR REPLACE FUNCTION update_professional_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE professionals
  SET 
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM reviews
      WHERE professional_id = NEW.professional_id
      AND is_approved = true
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE professional_id = NEW.professional_id
      AND is_approved = true
    )
  WHERE id = NEW.professional_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_professional_rating
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_professional_rating();

-- Atualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_professionals_updated_at BEFORE UPDATE ON professionals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_benefit_plans_updated_at BEFORE UPDATE ON benefit_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_medical_records_updated_at BEFORE UPDATE ON medical_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_testimonials_updated_at BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_coupons_updated_at BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_carousel_items_updated_at BEFORE UPDATE ON carousel_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_feature_vectors_updated_at BEFORE UPDATE ON feature_vectors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
