# 🚀 Deploy Rápido na Vercel - AssineSaúde

## ✅ Passos Rápidos

### 1. Subir Código para GitHub

Se ainda não fez:

```bash
git init
git add .
git commit -m "Ready for Vercel deployment"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/NOME_REPO.git
git push -u origin main
```

### 2. Deploy na Vercel (Via Web)

1. Acesse: **https://vercel.com/new**
2. Clique em **"Import Git Repository"**
3. Selecione seu repositório do GitHub
4. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 3. Variáveis de Ambiente

Adicione estas 2 variáveis:

```
VITE_SUPABASE_URL
https://ctdhpcfkkeiglzfeipfy.supabase.co

VITE_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0ZGhwY2Zra2VpZ2x6ZmVpcGZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MzA2MDcsImV4cCI6MjA3ODQwNjYwN30.8p9S9cmt_eJ2IhQBymaJJMmlz6ZKcrGnbvRVu3Aa-ls
```

Marque: **Production**, **Preview** e **Development**

### 4. Deploy

Clique em **"Deploy"** e aguarde 2-3 minutos.

## 🎉 Pronto!

Seu site estará em: `https://seu-projeto.vercel.app`

## 📝 Próximos Passos

Após deploy:

1. **Criar Admin** - Execute SQL no Supabase Dashboard:

```sql
-- Criar usuário admin
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@assinesaude.com',
  crypt('Admin@2024', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}'
);

-- Criar perfil admin
INSERT INTO user_profiles (id, role, full_name, email)
SELECT id, 'admin', 'Administrador', 'admin@assinesaude.com'
FROM auth.users
WHERE email = 'admin@assinesaude.com';
```

2. **Login:** admin@assinesaude.com / Admin@2024
3. **Popular Conteúdo** no Dashboard Admin

---

Veja **DEPLOY.md** para guia completo e troubleshooting.
