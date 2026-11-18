# Guia de Desenvolvimento e Operação — NV Hub

> **Última atualização:** 18/11/2026  
> **Documentos relacionados:** [Escopo do Projeto](./project-scope.md) · [Matriz de Desenvolvimento e QA](./status-and-qa-matrix.md) · [Arquitetura](./architecture.md) · [Banco de Dados](./database.md) · [Design System](./design-system.md)

---

## 1. Pré-requisitos

- **Node.js** v20 ou superior (`@types/node` ^20)
- **npm** (lockfile em `package-lock.json`)
- **PostgreSQL** local ou projeto **Supabase** de desenvolvimento *(opcional apenas se for rodar exclusivamente em modo `sandbox`)*

---

## 2. Setup Local Passo a Passo

### 2.1 Instalar dependências e configurar ambiente
```bash
npm install
```

Crie um arquivo `.env` (ou `.env.local`) a partir do [.env.example](../.env.example):

```env
# Banco PostgreSQL (local ou Supabase)
DATABASE_URL="postgresql://postgres:password@localhost:5432/nvhub"
DIRECT_URL="postgresql://postgres:password@localhost:5432/nvhub"

# Better Auth (gere com: openssl rand -base64 32)
BETTER_AUTH_SECRET="chave-aleatoria-com-32-ou-mais-caracteres"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Logs de performance (opcional)
PERF_LOGGING="0"
```

### 2.2 Preparar o banco de dados (modo `database` — padrão)
```bash
# 1. Gerar o Prisma Client
npx prisma generate

# 2. Aplicar migrations existentes
npx prisma migrate deploy

# 3. (Opcional, apenas em dev) Popular organização admin e operador inicial
npx tsx prisma/seed.ts
```

> **Atenção:** nunca defina `ALLOW_DESTRUCTIVE_SEED="true"` fora de um banco descartável de desenvolvimento.

### 2.3 Iniciar o servidor de desenvolvimento
```bash
npm run dev
```
*(Em Windows, também é possível usar o atalho `iniciar.bat` na raiz do projeto.)*

Acesse [http://localhost:3000](http://localhost:3000).

### 2.4 Rodando em modo `sandbox` (demo sem banco)
Para testar protótipos de UI sem PostgreSQL local, adicione explicitamente no `.env.local`:
```env
NEXT_PUBLIC_DATA_MODE="sandbox"
```
Esse modo só funciona fora de produção (`localhost` + `NODE_ENV !== 'production'`). Em produção/Vercel o sistema é **fail-closed** e força `database`.

---

## 3. Comandos Principais

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Inicia Next.js em desenvolvimento (`next dev --webpack`) |
| `npm run build` | Executa `prisma generate && next build` |
| `npm run start` | Sobe o build de produção localmente |
| `npm run lint` | Roda ESLint (`eslint-config-next` 16.2.9) |
| `npx tsc --noEmit` | Checagem estrita de tipos TypeScript |
| `node scripts/test-planner.mjs` | Executa testes unitários do Planner (`lib/planner.ts`) |
| `npm run perf:db` | Mede latência de 5 queries `SELECT 1` contra `DATABASE_URL` |
| `npm run db:compare-counts` | Compara contagens read-only entre bancos (utilitário da migração) |

---

## 4. Padrão Oficial para Desenvolver ou Migrar Módulos

Ao construir um novo módulo ou migrar uma tela do Zustand (`lib/store.ts`) para o PostgreSQL, **siga o padrão validado de `app/publicacoes/`**:

### Passo 1 — Schema e Migration (`prisma/schema.prisma`)
1. Modele as tabelas sempre com `organizationId` (`onDelete: Cascade`) e índices compostos `[organizationId, status]` / `[organizationId, createdAt]`.
2. Crie a migration com `npx prisma migrate dev --name <descricao_clara>`.
3. Consulte os detalhes em [docs/database.md](./database.md).

### Passo 2 — Server Actions (`app/<modulo>/actions.ts`)
1. Comece o arquivo com `'use server';`.
2. Em **leituras**, resolva o tenant via `getCurrentDatabaseTenantContext()` (que já é cacheado por request e traz as feature flags) e valide `tenantContext.features.<modulo> !== false`.
3. Em **escritas**, sempre:
   - Valide sessão (`getSession()`) e acesso ao tenant (`const membership = await validateTenantAccess(activeOrgId)`).
   - Bloqueie usuários somente leitura (`if (membership.role === 'viewer') throw new Error('Permissão insuficiente.')`).
   - Valide que todos os registros referenciados (`clientId`, `id` do item editado, etc.) pertencem ao mesmo `activeOrgId`.
   - Grave registro no `AuditLog`, aplicando o prefixo `[SIMULACAO_OPERADOR]` quando `membership.viaOperatorBypass === true`.
4. Se o módulo tiver **rota pública** (sem login):
   - Use token criptográfico único (`crypto.randomBytes`), nunca apenas ID previsível.
   - Aplique `checkRateLimit` + `getClientIp` de `lib/rate-limit.ts`.
   - Use `select` explícito e DTO dedicado (nunca exponha `organizationId` ou dados internos).
   - Marque o `AuditLog` com `[CLIENTE_EXTERNO/LINK_PUBLICO]`.

### Passo 3 — Server Component (`app/<modulo>/page.tsx`) + Layout
1. Em `app/<modulo>/layout.tsx`, reutilize `ServerDashboardLayout` com `export const dynamic = 'force-dynamic';`.
2. Em `page.tsx`, verifique `isDatabaseDataMode`:
   - Se `false` (sandbox), renderize `<Modulo>SandboxClient`.
   - Se `true` (produção), busque todos os dados iniciais em paralelo com `Promise.all(...)` envolvido em `measureServerTiming('<modulo>/data-total', ...)` e passe como props para `<Modulo>PageClient`.
3. **Nunca importe `lib/store.ts` em `<Modulo>PageClient.tsx` ou `<Modulo>View.tsx`** — isso garante que o bundle de produção fique livre do estado mockado.

### Passo 4 — Interface e Design System
1. Antes de criar qualquer componente visual novo, verifique os componentes existentes em `components/ui/` e as regras em [docs/design-system.md](./design-system.md).
2. Use exclusivamente tokens semânticos de `app/globals.css` (suporte nativo a tema claro/escuro).
3. Garanta compatibilidade mobile conforme [docs/mobile-ui-ux-audit.md](./mobile-ui-ux-audit.md): alvos de toque ≥ 44 px, sem rolagem horizontal e respeito a `prefers-reduced-motion`.

### Passo 5 — Atualizar Escopo e Matriz de QA
Ao concluir o desenvolvimento ou homologação de um módulo, atualize seu status e checklists em [docs/status-and-qa-matrix.md](./status-and-qa-matrix.md).

---

## 5. Checklist Antes de Abrir PR ou Fazer Deploy

- [ ] `npx tsc --noEmit` sem erros
- [ ] `npm run lint` sem erros
- [ ] `node scripts/test-planner.mjs` passando
- [ ] `npm run build` concluído com sucesso
- [ ] Nenhum arquivo `.env*`, credencial ou dump incluído no commit (`.gitignore` e `.vercelignore` preservados)
- [ ] Se houve mudança em `prisma/schema.prisma`, migration criada e aplicada com `npx prisma migrate deploy` no banco de destino antes ou durante o rollout

---

## 6. Deploy na Vercel e Diagnóstico de Performance

### Variáveis obrigatórias na Vercel (Production)
| Variável | Observação |
| --- | --- |
| `DATABASE_URL` | Supabase **Transaction Pooler** (porta `6543`) com `?pgbouncer=true&connection_limit=1` |
| `DIRECT_URL` | Supabase **Session Pooler** (porta `5432`) ou direta |
| `BETTER_AUTH_SECRET` | Chave secreta forte (mín. 32 caracteres) |
| `BETTER_AUTH_URL` | URL pública de produção (ex.: `https://nvhub.vercel.app`) |
| `NEXT_PUBLIC_APP_URL` | URL pública da aplicação (usada em links/redirects) |

> **Região das Functions:** mantida em São Paulo (`gru1`) via [vercel.json](../vercel.json). Ao inspecionar headers de resposta em produção, confirme `X-Vercel-Id: gru1::gru1::...`.

### Diagnóstico de latência em Preview/Produção
1. Defina temporariamente `PERF_LOGGING="1"` nas variáveis da Vercel (ou rode localmente em `dev`, onde já fica ativo).
2. Filtre os logs da Function por `nvhub.performance` para separar o tempo gasto em `auth/session`, `tenant/context-query` e queries individuais de cada página (`dashboard/data-total`, `clients/data-total`, `tasks/data-total`, `publications/data-total`).
3. Volte `PERF_LOGGING="0"` após concluir a investigação para manter os logs limpos.
