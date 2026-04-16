# CAC Dashboard — GM Educação 2026

Controle de Custo de Aquisição de Clientes para CPPEM, Colégio CPPEM e Unicive.
Acesso restrito via login (Supabase Auth).

## Rodar localmente

```bash
npm install
cp .env.local.example .env.local  # e preencha as credenciais do Supabase
npm run dev
```

Acesse `http://localhost:3000` — se não estiver autenticado, será redirecionado para `/login`.

## Configurar Supabase (necessário)

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Em **Project Settings → API**, copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Em **Authentication → Providers**, deixe apenas **Email** habilitado
4. Em **Authentication → Providers → Email**, **desabilite** "Enable email signups"
   para manter o sistema invite-only
5. Em **Authentication → Users → Add user**, crie manualmente os usuários da equipe
   (marque *Auto Confirm User* para pular verificação por email)
6. Preencha `.env.local` com as credenciais

## Deploy na Vercel

1. Suba o repositório no GitHub
2. Acesse [vercel.com](https://vercel.com) e importe o repositório
3. Framework: **Next.js** (detectado automaticamente)
4. Em **Environment Variables**, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Clique em **Deploy**

## Estrutura

```
app/
  layout.tsx            → Layout raiz (fonte, tema, favicon)
  login/                → Página de login (pública)
    page.tsx
    actions.ts          → signIn / signOut server actions
  (app)/                → Rotas protegidas (requer login)
    layout.tsx          → Sidebar + container
    page.tsx            → Dashboard CAC

components/
  sidebar.tsx           → Menu lateral, tema, logout
  header.tsx            → Seletores de ano e produto
  kpi-card.tsx          → Cards de indicadores
  bar-chart.tsx         → Gráfico de barras CAC Máximo vs Real
  detail-table.tsx      → Tabela editável com todos os inputs
  edit-cell.tsx         → Célula editável (campos amarelos)
  efficiency-grid.tsx   → Grid visual de eficiência mensal
  investment-split.tsx  → Barra de distribuição MKT vs Comercial
  projection.tsx        → Painel de projeção 12 meses
  theme-toggle.tsx      → Alternador claro/escuro/sistema

lib/
  data.ts               → Tipos, dados iniciais, cálculos e formatters
  supabase/             → Clients Supabase (browser/server/middleware)

middleware.ts           → Protege todas as rotas exceto /login e /auth
```

## Como usar

- **Login**: acesse `/login` com as credenciais criadas no Supabase
- **Toggle CPPEM / Colégio / Unicive** no header para alternar entre produtos
- **Campos com borda amarela** são editáveis — clique para alterar
- Todos os cálculos (CAC Real, Comparativo, Projeção) recalculam em tempo real
- Alertas aparecem automaticamente quando o CAC real ultrapassa o teto
- **Sair**: botão no rodapé do menu lateral
