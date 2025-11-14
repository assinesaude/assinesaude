# AssineSaúde - Instruções de Uso

## Plataforma Completa Desenvolvida

Sistema de gestão de benefícios de saúde com funcionalidades completas para Admin, Profissionais e Pacientes.

## ✅ O que foi implementado

### 1. **Banco de Dados Supabase**
- Schema completo com 14 tabelas principais
- RLS (Row Level Security) configurado em todas as tabelas
- Relacionamentos e índices otimizados
- Triggers automáticos para atualização de dados

### 2. **Autenticação**
- Login/Cadastro com email e senha
- Sistema de perfis (Admin, Profissional, Paciente)
- Proteção de rotas por papel de usuário
- Context API para gerenciamento de estado

### 3. **Home Page Elegante**
- Logo centralizado no topo
- Carrossel automático (5 imagens + 1 vídeo)
- Vetores rotativos configuráveis
- Sistema de busca inteligente
- Testemunhos de profissionais e pacientes
- Design sofisticado em cinza escuro + verde elegante

### 4. **Dashboard Admin**
Gerenciamento completo de:
- ✅ Profissionais (verificação, aprovação)
- ✅ Pacientes (visualização, dados)
- ✅ Carrossel da home (CRUD completo)
- ✅ Vetores rotativos (CRUD completo)
- ✅ Testemunhos (CRUD completo)
- ✅ Cupons de desconto (criar, gerenciar)
- ✅ Mensagens do sistema
- ✅ Estatísticas gerais

### 5. **Dashboard Profissional**
Estrutura completa com:
- Visão geral de pacientes e receitas
- Agenda (estrutura pronta)
- Gestão de planos (estrutura pronta)
- Lista de pacientes (estrutura pronta)
- Prontuários (estrutura pronta)
- Pagamentos e repasses (estrutura pronta)
- Cupons próprios (estrutura pronta)
- Mensagens (estrutura pronta)

### 6. **Dashboard Paciente**
Estrutura completa com:
- Visão geral de assinaturas
- Minhas assinaturas (estrutura pronta)
- Agendamentos (estrutura pronta)
- Meu prontuário (estrutura pronta)
- Pagamentos (estrutura pronta)
- Mensagens (estrutura pronta)
- Perfil (estrutura pronta)

## 🎨 Design Implementado

- **Paleta de Cores**: Cinza escuro + Verde elegante + Branco
- **Tipografia**: Font serif para títulos, sans-serif para corpo
- **Estilo**: Minimalista, sofisticado, sem cores vibrantes
- **Responsivo**: Design adaptável para mobile/tablet/desktop

## 📋 Como Usar

### Primeiro Acesso

1. **Criar Conta Admin** (via Supabase Dashboard):
```sql
-- No SQL Editor do Supabase:
INSERT INTO auth.users (email, encrypted_password)
VALUES ('admin@assinesaude.com', crypt('senha123', gen_salt('bf')));

-- Depois criar o perfil:
INSERT INTO user_profiles (id, role, full_name)
SELECT id, 'admin', 'Administrador'
FROM auth.users
WHERE email = 'admin@assinesaude.com';
```

2. **Popular Carrossel** (via Dashboard Admin):
- Login como admin
- Ir em "Carrossel"
- Adicionar 5 imagens de URLs públicas
- Exemplo de URLs de imagens gratuitas:
  - https://images.pexels.com/photos/... (Pexels)
  - https://images.unsplash.com/... (Unsplash)

3. **Adicionar Vetores** (via Dashboard Admin):
- Ir em "Vetores"
- Adicionar ícones do Font Awesome, Flaticon ou similar
- Configurar legendas personalizadas

4. **Criar Testemunhos** (via Dashboard Admin):
- Ir em "Testemunhos"
- Adicionar 6 testemunhos de profissionais
- Adicionar 6 testemunhos de pacientes
- Usar fotos de perfil de serviços como thispersondoesnotexist.com

### Cadastro de Profissional

1. Ir em "Cadastrar" na home
2. Escolher "Profissional"
3. Preencher dados básicos
4. Após login, será direcionado ao dashboard
5. **Admin precisa verificar o profissional** no Dashboard Admin

### Cadastro de Paciente

1. Ir em "Cadastrar" na home
2. Escolher "Paciente"
3. Preencher dados básicos
4. Após login, será direcionado ao dashboard

## 🚀 Próximos Passos (Não Implementados)

Os itens abaixo requerem integrações externas ou desenvolvimento adicional:

### 1. **Integração Gemini AI**
- Necessário API Key do Google Gemini
- Implementar Edge Function para busca inteligente
- Treinar modelo com dados dos profissionais

### 2. **Stripe Pagamentos**
- Configurar Stripe no Supabase
- Criar webhooks para eventos de pagamento
- Implementar fluxo completo de checkout

### 3. **Sistema de Agendamento**
- Implementar calendário interativo
- Notificações por email/SMS
- Confirmação de presença

### 4. **Prontuários Detalhados**
- Formulários de anamnese
- Upload de exames
- Histórico completo

### 5. **Sistema de Mensagens**
- Chat em tempo real
- Notificações push
- Mensagens automáticas de aniversário

### 6. **Videoconferência**
- Integração com Jitsi ou similar
- Consultas online ao vivo
- Gravação de consultas

## 🔑 Variáveis de Ambiente

Certifique-se de ter no arquivo `.env`:

```
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

## 📊 Estrutura de Dados Principal

### Tipos de Usuário
- **Admin**: Controle total da plataforma
- **Professional**: Gerencia pacientes e planos
- **Patient**: Contrata planos e agenda consultas

### Fluxo Principal
1. Admin configura plataforma (carrossel, testemunhos)
2. Profissional se cadastra e aguarda verificação
3. Admin verifica e aprova profissional
4. Profissional cria até 3 planos de benefícios
5. Paciente busca profissionais
6. Paciente contrata plano
7. Paciente agenda consultas
8. Profissional atende e registra em prontuário

## 🎯 Funcionalidades Destaque

- ✅ Sistema completo de autenticação
- ✅ 3 dashboards diferentes por papel
- ✅ Gerenciamento de conteúdo dinâmico
- ✅ Sistema de verificação de profissionais
- ✅ Cupons de desconto
- ✅ Design elegante e sofisticado
- ✅ Totalmente responsivo
- ✅ Banco de dados seguro com RLS

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Roteamento**: React Router v6
- **Ícones**: Lucide React
- **Estado**: React Context API

## 📝 Notas Importantes

1. **Segurança**: Todas as tabelas possuem RLS configurado
2. **Políticas**: Acesso restrito por papel de usuário
3. **Triggers**: Atualização automática de ratings e timestamps
4. **Índices**: Otimizados para buscas rápidas
5. **Validações**: Frontend e backend validam dados

## 🎨 Personalização

Para alterar cores, editar:
- `/src/index.css` (classes Tailwind)
- Paleta principal: `emerald` (verde) e `slate` (cinza)

Para alterar fontes, editar:
- `/tailwind.config.js`
- Font atual: System fonts + serif para títulos

---

**Desenvolvido para AssineSaúde** - Plataforma de Gestão de Benefícios em Saúde
