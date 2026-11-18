# NV Hub

Plataforma SaaS B2B multi-tenant de gestão comercial e operacional para agências, consultorias e empresas de serviços recorrentes.

> **Estado atual de produção:** o módulo de **Publicações & Aprovação Pública** (agendamento de posts e envio para aprovação do cliente via link `/a/[token]`) está **100% funcional em produção**. Os demais módulos do core operacional (Auth, Empresas, Clientes, Tarefas/Planner e Dashboard) estão em validação/fechamento, e os módulos comerciais/financeiros avançados seguem em protótipo UI aguardando migração para o banco. Veja o detalhamento completo na [Matriz de Desenvolvimento e QA](docs/status-and-qa-matrix.md).

---

## Stack Principal

- **Framework:** Next.js `16.2.9` (App Router + `proxy.ts`) · React `19.2.4` · TypeScript `5`
- **Estilização:** Tailwind CSS `4` · `lucide-react`
- **Banco de Dados & ORM:** PostgreSQL (Supabase `sa-east-1`) · Prisma `6.19.3`
- **Autenticação & Multi-Tenancy:** Better Auth `1.6.23` (plugin `organization`)
- **Estado Demo (Sandbox):** Zustand `5.0.14` (desabilitado em produção — fail-closed)
- **Deploy:** Vercel (`gru1` — São Paulo)

---

## Como Executar Localmente

### Pré-requisitos
- Node.js v20+
- PostgreSQL local ou projeto Supabase *(opcional apenas em modo `sandbox`)*

### Passos (modo `database` — padrão)
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie [`.env.example`](.env.example) para `.env` (ou `.env.local`) e preencha `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` e `NEXT_PUBLIC_APP_URL`.
3. Gere o Prisma Client e aplique as migrations:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```
4. *(Opcional, apenas em desenvolvimento)* Execute o seed inicial não-destrutivo:
   ```bash
   npx tsx prisma/seed.ts
   ```
5. Inicie o servidor:
   ```bash
   npm run dev
   ```
6. Acesse [http://localhost:3000](http://localhost:3000).

> Para rodar o modo demo sem banco de dados localmente, defina `NEXT_PUBLIC_DATA_MODE="sandbox"` no `.env.local` (bloqueado automaticamente em produção).

### Scripts Úteis
```bash
npm run dev                  # Servidor de desenvolvimento (next dev --webpack)
npm run build                # prisma generate && next build
npm run lint                 # ESLint
npx tsc --noEmit             # Checagem de tipos TypeScript
node scripts/test-planner.mjs # Testes unitários do Planner Operacional
npm run perf:db              # Medição de latência do PostgreSQL
```

---

## Documentação do Projeto

### Documentação Viva (referência principal)
| Documento | Conteúdo |
| --- | --- |
| [Escopo do Projeto](docs/project-scope.md) | Visão do produto, perfis/planos, fluxo ponta a ponta, comportamento esperado de cada módulo, requisitos não-funcionais e roadmap (uso interno e externo). |
| [Matriz de Desenvolvimento e QA](docs/status-and-qa-matrix.md) | Status real módulo a módulo (DB real vs. híbrido vs. protótipo), lacunas conhecidas, pendências de código e checklists para marcar 100% pronto para produção. |
| [Arquitetura e Segurança](docs/architecture.md) | Stack, Next.js 16 (`proxy.ts`), modo `data-mode` fail-closed, multi-tenancy, rotas públicas vs. privadas, rate-limit, auditoria e infraestrutura Vercel/Supabase. |
| [Modelo de Dados e Banco](docs/database.md) | Diagrama ER das 13 tabelas atuais, poolers (`DATABASE_URL` vs. `DIRECT_URL`), regras de migrations, seed e scripts de diagnóstico. |
| [Guia de Desenvolvimento](docs/development-guide.md) | Setup completo, padrão oficial para criar/migrar módulos sem Zustand em produção, checklist pré-deploy e observabilidade (`PERF_LOGGING`). |
| [Design System](docs/design-system.md) | Tokens visuais, princípios de interface e componentes reutilizáveis do NV Hub. |
| [Planner Operacional](docs/operational-planner.md) | Especificação funcional e visual do planner unificado de tarefas e publicações em `/tarefas`. |

### Auditorias e Registros Históricos
| Documento | Contexto |
| --- | --- |
| [Migração Supabase (29/09/2026)](docs/supabase-migration-2026-09-29.md) | Registro do corte Railway → Supabase, integridade das 13 tabelas, região `gru1` e procedimento de rollback. |
| [Auditoria de Banco Clean Start](docs/database-clean-start-audit.md) | Diagnóstico pré-migração da camada de banco de dados. |
| [Auditoria de Performance](docs/performance-audit.md) | Análise dos gargalos de carregamento pós-login e latência. |
| [Auditoria Visual do Frontend](docs/frontend-visual-audit.md) | Diagnóstico visual da fase piloto do Dashboard e Design System. |
| [Avaliação de UI/UX Mobile](docs/mobile-ui-ux-audit.md) | Diagnóstico e melhorias de ergonomia e responsividade mobile. |
| [Checklist da Sprint de Correções](task.md) | Registro concluído das 12 entregas de segurança, performance e infra + follow-ups pendentes. |
