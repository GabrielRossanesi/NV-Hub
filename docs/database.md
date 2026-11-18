# Modelo de Dados e Banco — NV Hub

> **Banco em produção:** PostgreSQL gerenciado no Supabase (região `sa-east-1` — São Paulo)  
> **ORM:** Prisma `6.19.3` (`prisma/schema.prisma`)  
> **Migrations aplicadas:** 8 migrations em `prisma/migrations/`  
> **Última atualização:** 18/11/2026  
> **Documentos relacionados:** [Arquitetura](./architecture.md) · [Guia de Desenvolvimento](./development-guide.md) · [Relatório da Migração Supabase](./supabase-migration-2026-09-29.md)

---

## 1. Diagrama Entidade-Relacionamento (13 Tabelas Atuais)

```mermaid
erDiagram
    User ||--o{ Session : "possui"
    User ||--o{ Account : "possui"
    User ||--o{ Member : "participa"
    User ||--o{ AuditLog : "registra"
    User ||--o{ Task : "responsavel (assignedUserId)"
    User ||--o{ TaskNote : "autor (authorUserId)"

    Organization ||--o{ Member : "possui"
    Organization ||--o{ Invitation : "envia"
    Organization ||--o| OrganizationFeature : "configura"
    Organization ||--o{ AuditLog : "audita"
    Organization ||--o{ Client : "gerencia"
    Organization ||--o{ Task : "gerencia"
    Organization ||--o{ TaskNote : "contem"
    Organization ||--o{ Publication : "gerencia"

    Client ||--o{ Task : "vinculado"
    Client ||--o{ Publication : "vinculado"

    Task ||--o{ TaskNote : "possui"

    User {
        string id PK
        string email UK
        string name
        string platformRole
        boolean mustChangePassword
        datetime passwordChangedAt
    }

    Session {
        string id PK
        string token UK
        string userId FK
        string activeOrganizationId
        datetime expiresAt
    }

    Account {
        string id PK
        string userId FK
        string providerId
        string accountId
        string password
    }

    Verification {
        string id PK
        string identifier
        string value
        datetime expiresAt
    }

    Organization {
        string id PK
        string name
        string slug UK
        string planId
        boolean isActive
        datetime archivedAt
    }

    Member {
        string id PK
        string organizationId FK
        string userId FK
        string role
    }

    Invitation {
        string id PK
        string organizationId FK
        string email
        string role
        string status
        datetime expiresAt
    }

    OrganizationFeature {
        string id PK
        string organizationId FK
        boolean leads
        boolean clients
        boolean proposals
        boolean contracts
        boolean charges
        boolean onboarding
        boolean publications
        boolean tasks
        boolean history
        boolean team
        boolean financial
    }

    AuditLog {
        string id PK
        string organizationId FK
        string userId FK
        string action
        string target
        datetime createdAt
    }

    Client {
        string id PK
        string organizationId FK
        string companyName
        string document
        string status
        string responsibleUser
        datetime archivedAt
    }

    Task {
        string id PK
        string organizationId FK
        string clientId FK
        string assignedUserId FK
        string title
        string status
        string priority
        datetime dueDate
        datetime archivedAt
    }

    TaskNote {
        string id PK
        string organizationId FK
        string taskId FK
        string authorUserId FK
        string authorName
        string content
    }

    Publication {
        string id PK
        string organizationId FK
        string clientId FK
        string approvalToken UK
        string postType
        string status
        string scheduledDate
        string platform
        json images
        json channels
        datetime archivedAt
    }
```

---

## 2. Catálogo das Tabelas por Domínio

### 2.1 Autenticação (Better Auth Core)
| Model / Tabela | Finalidade | Campos e índices relevantes |
| --- | --- | --- |
| `User` (`user`) | Contas de usuários da plataforma e dos tenants | `email` (`@unique`), `platformRole` (`"platform_admin"` \| `"operator"` \| `null`), `mustChangePassword`, `passwordChangedAt`. |
| `Session` (`session`) | Sessões ativas de autenticação | `token` (`@unique`), `activeOrganizationId`, `expiresAt`; índice `[userId]`. |
| `Account` (`account`) | Credenciais e provedores de login (`credential`) | `providerId`, `accountId`, `password` (hash Better Auth); índice `[userId]`. |
| `Verification` (`verification`) | Tokens temporários de verificação do Better Auth | `identifier`, `value`, `expiresAt`; índice `[identifier]`. |

### 2.2 Multi-Tenancy, Controle de Módulos e Auditoria
| Model / Tabela | Finalidade | Campos e índices relevantes |
| --- | --- | --- |
| `Organization` (`organization`) | Tenants (empresas/agências) | `slug` (`@unique`), `planId` (`"starter"` \| `"pro"` \| `"enterprise"`), `isActive`, `archivedAt`, `archivedBy`. |
| `Member` (`member`) | Vínculo usuário ↔ organização e permissão | `role` (`"owner"` \| `"admin"` \| `"member"` \| `"viewer"`); `@@unique([organizationId, userId])`, índice `[userId]`. |
| `Invitation` (`invitation`) | Convites pendentes para novos membros | `email`, `role`, `status` (`"pending"` \| `"accepted"` \| `"rejected"` \| `"canceled"`), `expiresAt`, `inviterId`. |
| `OrganizationFeature` (`organization_feature`) | Feature flags 1:1 por organização | `organizationId` (`@unique`); booleanos para `leads`, `clients`, `proposals`, `contracts`, `charges`, `onboarding`, `publications`, `tasks`, `history`, `team`, `financial` (padrão `false`). |
| `AuditLog` (`audit_log`) | Trilha de auditoria de ações do tenant | `action`, `target`, `ipAddress`, `userAgent`, `createdAt`; índices `[organizationId, createdAt]` e `[organizationId, target]`. |

### 2.3 Módulos de Negócio Persistidos
| Model / Tabela | Finalidade | Campos e índices relevantes |
| --- | --- | --- |
| `Client` (`client`) | Clientes de cada tenant | `companyName`, `document`, `documentType` (`"cpf"` \| `"cnpj"` \| `"other"`), `contactName`, `email`, `phone`, `status` (`"active"` \| `"onboarding"` \| `"inactive"` \| `"archived"`), `responsibleUser`, `archivedAt`; índices `[organizationId]`, `[organizationId, status]`. |
| `Task` (`task`) | Tarefas operacionais | `title`, `description`, `status` (`"pending"` \| `"in_progress"` \| `"in_review"` \| `"completed"` \| `"cancelled"` \| `"archived"`), `priority` (`"low"` \| `"medium"` \| `"high"` \| `"urgent"`), `dueDate`, `completedAt`, `archivedAt`, `clientId` (`SetNull`), `assignedUserId` (`SetNull`); índices `[organizationId]`, `[organizationId, status]`, `[organizationId, dueDate]`, `[organizationId, clientId]`, `[organizationId, assignedUserId]`. |
| `TaskNote` (`task_note`) | Comentários cronológicos em tarefas | `taskId` (`Cascade`), `authorUserId` (`SetNull`), `authorName`, `content`; índices `[organizationId]`, `[taskId]`, `[authorUserId]`. |
| `Publication` (`publication`) | Peças de mídia e fluxo de aprovação externa | `approvalToken` (`@unique`), `postType` (`"single_image"` \| `"carousel"`), `caption`, `scheduledDate`, `status` (`"pending_approval"` \| `"approved"` \| `"changes_requested"` \| `"archived"`), `clientComments`, `responsibleUser`, `platform`, `channels` (`Json`), `images` (`Json`), `imageUrl`, metadados de arquivo, `archivedAt`, `archivedBy`; índices `[organizationId]`, `[organizationId, status]`, `[approvalToken]`. |

---

## 3. Conexões e Connection Pooling (Vercel + Supabase)

Em ambiente serverless (Vercel), o `prisma/schema.prisma` usa duas URLs obrigatórias:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

| Variável | Uso | Configuração recomendada (Supabase) |
| --- | --- | --- |
| **`DATABASE_URL`** | Runtime da aplicação (Server Components, Server Actions, Better Auth) | **Transaction Pooler (porta `6543`)** com `?pgbouncer=true&connection_limit=1` (obrigatório para Prisma 6 em serverless). |
| **`DIRECT_URL`** | `prisma migrate deploy`, `prisma migrate dev`, introspecção | **Session Pooler (porta `5432`, IPv4)** ou conexão direta (IPv6). **Nunca** usar Transaction Pooler aqui. |

> Em desenvolvimento local com PostgreSQL instalado na máquina, `DATABASE_URL` e `DIRECT_URL` podem apontar para a mesma string local (`postgresql://postgres:password@localhost:5432/nvhub`).

O cliente Prisma em `lib/prisma.ts` utiliza o padrão singleton em `globalThis` para evitar múltiplas conexões durante hot-reload em desenvolvimento.

---

## 4. Histórico de Migrations e Regras de Evolução

As 8 migrations existentes em `prisma/migrations/` cobrem:
1. `init_saas` — tabelas Better Auth, `Organization`, `Member`, `Invitation`, `OrganizationFeature`, `AuditLog`
2. `add_client_model` — tabela `Client`
3. `add_responsible_user_to_client` — campo `responsibleUser` em `Client`
4. `add_task_models` — tabelas `Task` e `TaskNote`
5. `add_admin_user_security` — `platformRole`, `mustChangePassword`, `passwordChangedAt`, `archivedAt`/`archivedBy` em `Organization`
6. `add_publications` — tabela `Publication`
7. `add_publication_management_fields` — canais, arquivamento e metadados de imagem em `Publication`
8. `supabase_read_indexes` — 6 índices de leitura adicionados no corte para Supabase

### Checklist obrigatório ao criar novas tabelas (próximos módulos)
Ao modelar `Lead`, `Proposal`, `ProposalItem`, `Contract`, `Charge`, `Onboarding`, `FinancialEntry`, `FinancialRecurrence` ou `OrganizationIntegration`:
- [ ] Incluir `organizationId String` com relação `organization Organization @relation(..., onDelete: Cascade)`.
- [ ] Adicionar índices compostos iniciando por `organizationId` (ex.: `@@index([organizationId, status])`, `@@index([organizationId, createdAt])`).
- [ ] Usar `@db.Decimal(12, 2)` (ou centavos inteiros) para campos monetários — nunca `Float`.
- [ ] Preferir soft-delete (`archivedAt DateTime?`) em entidades de negócio relevantes para manter integridade histórica.
- [ ] Usar tokens únicos não previsíveis (`@unique`) para qualquer registro exposto em rota pública (ex.: `Proposal.publicToken`).
- [ ] Em produção, aplicar migrations apenas com `npx prisma migrate deploy` (nunca `prisma db push` nem `prisma migrate reset`).

---

## 5. Seed do Banco (`prisma/seed.ts`)

O seed foi desenhado como **não-destrutivo por padrão** (verifica se os registros existem antes de inserir):

- Cria a organização administrativa `NV Hub Admin` (slug `nv-hub-admin`, plano `enterprise`, todas as flags ativas) e o usuário operador `operator@nvhub.com.br` (`platformRole: "operator"`), além do tenant/usuário de demonstração.
- **Senhas:** definidas via `SEED_OPERATOR_PASSWORD` e `SEED_CLIENT_PASSWORD`; se ausentes, senhas aleatórias são geradas e impressas no terminal durante o seed.
- **Proteção contra apagamento acidental:** a limpeza prévia das tabelas só ocorre se `ALLOW_DESTRUCTIVE_SEED="true"`. **Nunca definir essa flag em produção.**

---

## 6. Scripts de Diagnóstico e Integridade

| Comando | Script | O que faz |
| --- | --- | --- |
| `npm run perf:db` | `scripts/measure-db-latency.mjs` | Executa 5 consultas `SELECT 1` contra `DATABASE_URL` e imprime amostras, mínimo, média e máximo em JSON (`nvhub.db-connectivity`). |
| `npm run db:compare-counts` | `scripts/compare-db-counts.mjs` | Comparação read-only de contagens (e conteúdo com `--content`) das 13 tabelas entre origem Railway e destino Supabase. |
