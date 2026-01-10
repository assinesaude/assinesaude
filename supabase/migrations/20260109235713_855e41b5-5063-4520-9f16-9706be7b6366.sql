-- Create contract_templates table for platform contracts
CREATE TABLE public.contract_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'platform', -- 'platform' for B2B professional contracts, 'service' for B2C patient contracts
  content TEXT NOT NULL, -- The contract template with variable placeholders like {{professional_name}}, {{date}}, etc.
  variables JSONB DEFAULT '[]'::jsonb, -- List of available variables for this template
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;

-- Only admins can manage contract templates
CREATE POLICY "Admins can manage contract templates"
  ON public.contract_templates
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Professionals can view active platform contracts
CREATE POLICY "Professionals can view active platform contracts"
  ON public.contract_templates
  FOR SELECT
  USING (is_active = true AND type = 'platform' AND has_role(auth.uid(), 'professional'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_contract_templates_updated_at
  BEFORE UPDATE ON public.contract_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default contract templates
INSERT INTO public.contract_templates (name, description, type, content, variables) VALUES
(
  'Contrato de Prestação de Serviços - Plataforma',
  'Contrato entre a plataforma AssineSaúde e o profissional de saúde',
  'platform',
  E'# CONTRATO DE PRESTAÇÃO DE SERVIÇOS\n\n## PLATAFORMA ASSINESAÚDE\n\n**Contrato nº:** {{contract_number}}\n**Data:** {{date}}\n\n---\n\n### PARTES\n\n**CONTRATANTE (Plataforma):**\nAssineSaúde Tecnologia LTDA\nCNPJ: XX.XXX.XXX/0001-XX\nEndereço: [Endereço da empresa]\n\n**CONTRATADO (Profissional):**\nNome: {{professional_name}}\nCPF: {{professional_cpf}}\nRegistro Profissional: {{professional_registration}}\nEspecialidade: {{professional_specialty}}\nEndereço: {{professional_address}}\nCidade/UF: {{professional_city}}/{{professional_state}}\n\n---\n\n### CLÁUSULA 1ª - DO OBJETO\n\nO presente contrato tem por objeto a prestação de serviços de intermediação digital pela CONTRATANTE, permitindo ao CONTRATADO utilizar a plataforma AssineSaúde para:\n\na) Criar e gerenciar planos de benefícios personalizados;\nb) Divulgar seus serviços profissionais;\nc) Captar e gerenciar pacientes/clientes;\nd) Utilizar ferramentas de gestão disponibilizadas.\n\n---\n\n### CLÁUSULA 2ª - DAS OBRIGAÇÕES DO CONTRATADO\n\n2.1 Manter seus dados cadastrais atualizados;\n2.2 Possuir registro profissional válido e ativo;\n2.3 Prestar serviços com ética e qualidade;\n2.4 Cumprir as normas do respectivo conselho profissional;\n2.5 Responder civil e criminalmente por seus atos profissionais.\n\n---\n\n### CLÁUSULA 3ª - DO PLANO CONTRATADO\n\nPlano: {{plan_name}}\nValor: R$ {{plan_price}}/mês\nRecursos inclusos: {{plan_features}}\n\n---\n\n### CLÁUSULA 4ª - DA VIGÊNCIA\n\nEste contrato terá vigência a partir de {{start_date}}, renovando-se automaticamente a cada período de faturamento, podendo ser cancelado a qualquer momento por qualquer das partes.\n\n---\n\n### CLÁUSULA 5ª - ASSINATURAS\n\n\n_________________________________\nAssineSaúde Tecnologia LTDA\n\n\n_________________________________\n{{professional_name}}\nCPF: {{professional_cpf}}',
  '["contract_number", "date", "professional_name", "professional_cpf", "professional_registration", "professional_specialty", "professional_address", "professional_city", "professional_state", "plan_name", "plan_price", "plan_features", "start_date"]'::jsonb
),
(
  'Contrato de Serviços B2C - Profissional/Paciente',
  'Contrato modelo entre profissional de saúde e paciente/cliente',
  'service',
  E'# CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE SAÚDE\n\n**Contrato nº:** {{contract_number}}\n**Data:** {{date}}\n\n---\n\n### PARTES\n\n**PRESTADOR DE SERVIÇOS (Profissional):**\nNome: {{professional_name}}\nCPF: {{professional_cpf}}\nRegistro Profissional: {{professional_registration}}\nEspecialidade: {{professional_specialty}}\nClínica: {{clinic_name}}\nEndereço: {{clinic_address}}\nCidade/UF: {{professional_city}}/{{professional_state}}\nTelefone: {{professional_phone}}\n\n**CONTRATANTE (Paciente/Cliente):**\nNome: {{patient_name}}\nCPF: {{patient_cpf}}\nData de Nascimento: {{patient_birth_date}}\nEndereço: {{patient_address}}\nCidade/UF: {{patient_city}}/{{patient_state}}\nTelefone: {{patient_phone}}\n\n---\n\n### CLÁUSULA 1ª - DO OBJETO\n\nO presente contrato tem por objeto a prestação dos seguintes serviços de saúde pelo PRESTADOR ao CONTRATANTE:\n\n**Serviço/Plano:** {{service_title}}\n**Descrição:** {{service_description}}\n**Duração:** {{service_duration}} minutos\n\n---\n\n### CLÁUSULA 2ª - DO VALOR E PAGAMENTO\n\nValor: R$ {{service_price}}\nForma de pagamento: {{payment_method}}\nData do pagamento: {{payment_date}}\n\n---\n\n### CLÁUSULA 3ª - DAS OBRIGAÇÕES DO PRESTADOR\n\n3.1 Prestar os serviços contratados com zelo e competência profissional;\n3.2 Manter sigilo sobre todas as informações do paciente;\n3.3 Emitir documentação fiscal quando solicitado;\n3.4 Informar ao paciente sobre procedimentos, riscos e alternativas.\n\n---\n\n### CLÁUSULA 4ª - DAS OBRIGAÇÕES DO CONTRATANTE\n\n4.1 Fornecer informações verdadeiras sobre seu estado de saúde;\n4.2 Seguir as orientações do profissional;\n4.3 Efetuar os pagamentos nas datas acordadas;\n4.4 Comparecer às consultas agendadas ou avisar com antecedência.\n\n---\n\n### CLÁUSULA 5ª - DA VIGÊNCIA\n\nInício: {{start_date}}\nTérmino: {{end_date}}\n\n---\n\n### CLÁUSULA 6ª - DO CANCELAMENTO\n\nO cancelamento poderá ser solicitado por qualquer das partes, mediante aviso prévio de 7 dias, sendo devidos os valores proporcionais aos serviços já prestados.\n\n---\n\n### CLÁUSULA 7ª - DO FORO\n\nFica eleito o foro da comarca de {{professional_city}}/{{professional_state}} para dirimir quaisquer dúvidas.\n\n---\n\n### ASSINATURAS\n\n\n_________________________________\n{{professional_name}}\nPrestador de Serviços\n\n\n_________________________________\n{{patient_name}}\nContratante\n\n\nLocal e Data: {{professional_city}}, {{date}}',
  '["contract_number", "date", "professional_name", "professional_cpf", "professional_registration", "professional_specialty", "clinic_name", "clinic_address", "professional_city", "professional_state", "professional_phone", "patient_name", "patient_cpf", "patient_birth_date", "patient_address", "patient_city", "patient_state", "patient_phone", "service_title", "service_description", "service_duration", "service_price", "payment_method", "payment_date", "start_date", "end_date"]'::jsonb
);