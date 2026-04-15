# CAC Dashboard — GM Educação 2026

Controle de Custo de Aquisição de Clientes para CPPEM e UNICV.

## Rodar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`

## Deploy na Vercel

1. Suba o repositório no GitHub
2. Acesse [vercel.com](https://vercel.com) e importe o repositório
3. Framework: **Next.js** (detectado automaticamente)
4. Clique em **Deploy**

Nenhuma variável de ambiente é necessária.

## Estrutura

```
app/
  layout.tsx        → Layout raiz com fonte Outfit
  globals.css       → Tailwind + estilos globais
  page.tsx          → Página principal do dashboard

components/
  header.tsx        → Header com toggle CPPEM/UNICV
  kpi-card.tsx      → Cards de indicadores
  bar-chart.tsx     → Gráfico de barras CAC Máximo vs Real
  detail-table.tsx  → Tabela editável com todos os inputs
  edit-cell.tsx     → Célula editável (campos amarelos)
  tag.tsx           → Badge/tag de status
  efficiency-grid.tsx → Grid visual de eficiência mensal
  investment-split.tsx → Barra de distribuição MKT vs Comercial
  projection.tsx    → Painel de projeção 12 meses

lib/
  data.ts           → Tipos, dados iniciais, cálculos e formatters
```

## Como usar

- **Toggle CPPEM / UNICV** no header para alternar entre produtos
- **Campos com borda amarela** são editáveis — clique para alterar
- Todos os cálculos (CAC Real, Comparativo, Projeção) recalculam em tempo real
- Alertas aparecem automaticamente quando o CAC real ultrapassa o teto
