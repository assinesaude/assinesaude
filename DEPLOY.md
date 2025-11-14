# 🚀 Deploy AssineSaúde na Vercel

Guia completo para fazer deploy da plataforma AssineSaúde na Vercel via GitHub.

## 📋 Pré-requisitos

- ✅ Conta na Vercel (https://vercel.com)
- ✅ Conta no GitHub com o repositório do projeto
- ✅ Banco de dados Supabase configurado e funcionando
- ✅ Variáveis de ambiente do Supabase (.env local)

## 🔧 Passo 1: Preparar o Repositório

### 1.1 Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Crie um novo repositório (público ou privado)
3. **NÃO** inicialize com README, .gitignore ou licença

### 1.2 Conectar Projeto Local ao GitHub

```bash
# Inicializar git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Fazer primeiro commit
git commit -m "Initial commit - AssineSaúde platform"

# Conectar ao repositório remoto
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git

# Enviar código para GitHub
git branch -M main
git push -u origin main
```

## 🌐 Passo 2: Deploy na Vercel

### 2.1 Importar Projeto

1. Acesse https://vercel.com/dashboard
2. Clique em **"Add New..."** → **"Project"**
3. Selecione **"Import Git Repository"**
4. Autorize a Vercel a acessar sua conta GitHub (se necessário)
5. Encontre e selecione o repositório do AssineSaúde
6. Clique em **"Import"**

### 2.2 Configurar Projeto

Na tela de configuração:

**Framework Preset:** Vite

**Root Directory:** ./

**Build Command:**
```
npm run build
```

**Output Directory:**
```
dist
```

**Install Command:**
```
npm install
```

### 2.3 Adicionar Variáveis de Ambiente

**IMPORTANTE:** Você DEVE adicionar as variáveis de ambiente antes do deploy!

1. Na seção **"Environment Variables"**, adicione:

```
VITE_SUPABASE_URL
```
**Value:** `https://ctdhpcfkkeiglzfeipfy.supabase.co`

```
VITE_SUPABASE_ANON_KEY
```
**Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0ZGhwY2Zra2VpZ2x6ZmVpcGZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MzA2MDcsImV4cCI6MjA3ODQwNjYwN30.8p9S9cmt_eJ2IhQBymaJJMmlz6ZKcrGnbvRVu3Aa-ls`

2. Selecione **"Production"**, **"Preview"** e **"Development"** para ambas variáveis
3. Clique em **"Add"** para cada variável

### 2.4 Iniciar Deploy

1. Revise todas as configurações
2. Clique em **"Deploy"**
3. Aguarde o build e deploy (geralmente 2-3 minutos)

## ✅ Passo 3: Verificar Deploy

### 3.1 Após Deploy Bem-Sucedido

1. Vercel mostrará uma tela de sucesso com confetes 🎉
2. Você verá a URL do seu projeto: `https://NOME-DO-PROJETO.vercel.app`
3. Clique em **"Visit"** para abrir o site

### 3.2 Testes Essenciais

Teste as seguintes funcionalidades:

- [ ] Home page carrega corretamente
- [ ] Logo e carrossel aparecem
- [ ] Botões de Login e Cadastro funcionam
- [ ] Página de login abre
- [ ] Página de cadastro abre
- [ ] Console do navegador não mostra erros críticos

### 3.3 Teste de Conexão com Supabase

1. Abra o **Console do Navegador** (F12)
2. Vá para a aba **Network**
3. Tente fazer login com credenciais de teste
4. Verifique se há chamadas para `ctdhpcfkkeiglzfeipfy.supabase.co`
5. Se as chamadas falharem com erro 401/403, revise as variáveis de ambiente

## 🔄 Passo 4: Configuração Pós-Deploy

### 4.1 Configurar Domínio Customizado (Opcional)

1. No Dashboard da Vercel, vá para **"Settings"** → **"Domains"**
2. Adicione seu domínio personalizado
3. Configure os registros DNS conforme instruído
4. Aguarde propagação (até 48h)

### 4.2 Configurar Redirects HTTPS

Por padrão, a Vercel já redireciona HTTP para HTTPS automaticamente.

### 4.3 Habilitar Analytics (Opcional)

1. No Dashboard da Vercel, vá para **"Analytics"**
2. Clique em **"Enable"**
3. Analytics começarão a coletar dados de visitantes

## 🗄️ Passo 5: Configurar Dados Iniciais

### 5.1 Criar Usuário Admin

1. Acesse Supabase Dashboard: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá para **SQL Editor**
4. Execute o seguinte SQL:

```sql
-- Criar usuário admin
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@assinesaude.com',
  crypt('Admin@2024', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  FALSE,
  '',
  '',
  '',
  ''
);

-- Criar perfil admin
INSERT INTO user_profiles (id, role, full_name, email)
SELECT
  id,
  'admin',
  'Administrador AssineSaúde',
  'admin@assinesaude.com'
FROM auth.users
WHERE email = 'admin@assinesaude.com';
```

### 5.2 Fazer Login como Admin

1. Acesse seu site: `https://NOME-DO-PROJETO.vercel.app`
2. Clique em **"Login"**
3. Use as credenciais:
   - Email: `admin@assinesaude.com`
   - Senha: `Admin@2024`
4. Você será redirecionado para o Dashboard Admin

### 5.3 Popular Conteúdo Inicial

**Carrossel da Home:**
1. No Dashboard Admin, clique em **"Carrossel"**
2. Adicione 5-6 imagens de URLs públicas
3. Sugestões de fontes de imagens:
   - https://images.pexels.com/photos/...
   - https://images.unsplash.com/photo/...

**Vetores Rotativos:**
1. Clique em **"Vetores"**
2. Adicione ícones/vetores com títulos e descrições
3. Configure a ordem de exibição

**Testemunhos:**
1. Clique em **"Testemunhos"**
2. Adicione 6 testemunhos de profissionais
3. Adicione 6 testemunhos de pacientes
4. Use fotos genéricas de perfil

## 🎯 Configurações Avançadas

### Ativar Edge Network (Automático)

A Vercel distribui automaticamente seu site pela rede global de CDN.

### Configurar Build Hooks

Para rebuilds automáticos ao atualizar o Supabase:

1. **Settings** → **Git** → **Deploy Hooks**
2. Crie um novo hook: "Supabase Update"
3. Copie a URL gerada
4. Use essa URL para triggerar rebuilds via webhook

### Configurar Environment Variables para Desenvolvimento

1. **Settings** → **Environment Variables**
2. Adicione variáveis específicas para Development
3. Útil para testar com Supabase local

## 🐛 Troubleshooting

### Build Falha

**Erro:** `Module not found: Error: Can't resolve...`

**Solução:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Variáveis de Ambiente Não Funcionam

**Problema:** Erro de conexão com Supabase

**Solução:**
1. Verifique se as variáveis começam com `VITE_`
2. Vá em **Settings** → **Environment Variables**
3. Confirme que estão adicionadas para Production
4. Faça um **Redeploy** (Deployments → ... → Redeploy)

### Rotas 404 em Produção

**Problema:** Páginas funcionam localmente mas dão 404 em produção

**Solução:** O `vercel.json` já está configurado para resolver isso com rewrites

### Imagens Não Carregam

**Problema:** Imagens da pasta `public/` não aparecem

**Solução:** Verifique se as imagens estão sendo referenciadas corretamente:
```jsx
// Correto
<img src="/assinesaude.png" alt="Logo" />

// Errado
<img src="./assinesaude.png" alt="Logo" />
```

## 📊 Monitoramento

### Logs de Build

1. **Deployments** → Selecione um deployment
2. Veja logs detalhados do build
3. Identifique warnings e erros

### Runtime Logs

1. **Deployments** → **Functions**
2. Veja logs de execução em tempo real
3. Útil para debug de Edge Functions

### Analytics

1. **Analytics** → **Overview**
2. Monitore visitantes, performance, Web Vitals
3. Identifique páginas lentas

## 🔐 Segurança

### Secrets

- ✅ Variáveis de ambiente estão seguras na Vercel
- ✅ Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` no frontend
- ✅ Use apenas `SUPABASE_ANON_KEY` no cliente

### RLS (Row Level Security)

- ✅ Todas as tabelas têm RLS habilitado
- ✅ Políticas restritivas por papel de usuário
- ✅ Dados protegidos contra acesso não autorizado

## 📝 Próximos Passos

Após deploy bem-sucedido:

1. **Configurar domínio personalizado** (ex: assinesaude.com.br)
2. **Popular conteúdo inicial** (carrossel, testemunhos)
3. **Criar primeiros profissionais de teste**
4. **Testar fluxo completo** de cadastro e login
5. **Configurar Edge Functions** se necessário (chat AI, busca)
6. **Adicionar Google Analytics** ou outro sistema de métricas
7. **Configurar email transacional** (SendGrid, Resend)

## 🆘 Suporte

- **Documentação Vercel:** https://vercel.com/docs
- **Documentação Supabase:** https://supabase.com/docs
- **Comunidade Vercel:** https://github.com/vercel/vercel/discussions

---

**AssineSaúde** - Plataforma de Gestão de Benefícios em Saúde

Deploy configurado e pronto para produção! 🚀
