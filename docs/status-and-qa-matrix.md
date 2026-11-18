# Matriz de Desenvolvimento, Pendências e QA — NV Hub

> **Finalidade:** Documento vivo de controle interno para guiar o desenvolvimento, registrar lacunas técnicas e acompanhar exatamente **o que está 100% testado e pronto para produção** vs. **o que falta testar ou desenvolver**.  
> **Última atualização:** 18/11/2026  
> **Escopo funcional de referência:** [docs/project-scope.md](./project-scope.md)

---

## 1. Resumo Executivo de Prontidão

> **Estado atual confirmado:** apenas o módulo de **Publicações & Aprovação Pública** (agendamento de posts e envio para aprovação do cliente) está **100% funcional e validado para produção**.

Todos os demais módulos — mesmo aqueles que já possuem tabelas no Supabase e Server Actions implementadas — ainda exigem **fechamento de pendências técnicas e/ou bateria formal de testes em produção** antes de receberem o selo de 100% pronto.

### Legenda de Status

| Dimensão | Código | Significado |
| --- | --- | --- |
| **Desenvolvimento** | `🟢 DB Real` | Persistido no PostgreSQL/Supabase com Server Actions e isolamento por `organizationId`. |
| **Desenvolvimento** | `🟡 Híbrido` | Parte da tela lê do PostgreSQL e outra parte ainda lê do store Zustand (mock/sandbox). |
| **Desenvolvimento** | `🟠 Protótipo UI` | Interface construída sobre `lib/store.ts` (Zustand/localStorage), sem tabelas Prisma nem backend real. |
| **Desenvolvimento** | `⚪ Não iniciado` | Integração ou funcionalidade ainda não implementada. |
| **Testes / Produção** | `✅ 100% Funcional` | Fluxo ponta a ponta homologado em produção e liberado para uso real. |
| **Testes / Produção** | `🧪 Parcialmente testado` | Passou em smoke test / build / uso inicial, mas falta homologação completa dos cenários de borda. |
| **Testes / Produção** | `⏳ Falta testar` | Código existe, porém sem validação formal em produção. |
| **Testes / Produção** | `➖ N/A` | Não aplicável ainda (aguardando desenvolvimento de backend/DB). |

### Critérios para promover qualquer módulo para `✅ 100% Funcional`
1. **Zero dependência de Zustand/mock** quando em modo `database` (produção).
2. **Isolamento multi-tenant validado** (tentativa de leitura/escrita com ID de outro tenant bloqueada no servidor).
3. **Permissões por papel (`owner`, `admin`, `member`, `viewer`) e feature flag** validadas no servidor e na UI.
4. **Fluxo completo testado em produção (`nvhub.vercel.app`)**: criar, editar, listar, filtrar, arquivar/restaurar, estados vazios e tratamento de erro.
5. **AuditLog consistente** (incluindo marcador `[SIMULACAO_OPERADOR]` quando operado via bypass).
6. **Responsividade mobile e performance** conferidas sem regressão.

---

## 2. Painel Consolidado por Módulo

| # | Grupo | Módulo | Rotas | Desenvolvimento | Testes / Prod | Resumo real |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | **Operações** | **Publicações & Aprovação Pública** | `/publicacoes`, `/a/[token]`, `/publicacao/[id]/aprovacao` | `🟢 DB Real` | `✅ 100% Funcional` | **Único módulo 100% funcional em produção.** RSC sem Zustand, DTO público enxuto, rate-limit e audit log. |
| 2 | **Base** | Autenticação & Primeiro Acesso | `/login`, `/primeiro-acesso`, `/api/auth/*`, `proxy.ts` | `🟢 DB Real` | `🧪 Parcialmente testado` | Login/sessão funcionam em prod; falta homologar todos os fluxos de erro, troca obrigatória e conta suspensa/arquivada. |
| 3 | **Admin** | Empresas / Painel Operador | `/empresas` | `🟢 DB Real` | `⏳ Falta testar` | CRUD de orgs/usuários no DB implementado, mas página ainda importa `useStore` (misto com sandbox) e falta bateria de QA completa. |
| 4 | **Operações** | Tarefas & Planner | `/tarefas` | `🟢 DB Real` | `🧪 Parcialmente testado` | Único módulo com teste automatizado (`test-planner.mjs`) + smoke test em prod; falta validar CRUD completo, notas, permissões e mobile. |
| 5 | **Comercial** | Clientes & Perfil 360° | `/clientes`, `/clientes/[id]` | `🟡 Híbrido` | `🧪 Parcialmente testado` | Listagem/CRUD em `/clientes` está no DB; `/clientes/[id]` ainda mistura dados do DB com abas do store Zustand. |
| 6 | **Comercial** | Dashboard | `/dashboard` | `🟡 Híbrido` | `🧪 Parcialmente testado` | Clientes e Tarefas vêm do DB; contadores de Publicações e módulos comerciais ainda leem `useTenantStore()`. |
| 7 | **Comercial** | Leads | `/leads` | `🟠 Protótipo UI` | `➖ N/A` | Apenas Zustand (`lib/store.ts`). Sem model Prisma e sem Server Actions. |
| 8 | **Comercial** | Propostas & Aceite Público | `/propostas`, `/proposta/[id]` | `🟠 Protótipo UI` | `➖ N/A` | Apenas Zustand (dívida explícita no topo de `/proposta/[id]`). |
| 9 | **Comercial** | Contratos (ZapSign) | `/contratos` | `🟠 Protótipo UI` + `⚪ API` | `➖ N/A` | Apenas Zustand. Sem tabela Prisma nem integração ZapSign. |
| 10 | **Comercial** | Cobranças (Asaas) | `/cobrancas` | `🟠 Protótipo UI` + `⚪ API` | `➖ N/A` | Apenas Zustand. Sem tabela Prisma nem integração Asaas. |
| 11 | **Operações** | Onboarding (Drive / ClickUp) | `/onboarding` | `🟠 Protótipo UI` + `⚪ API` | `➖ N/A` | Apenas Zustand. Sem tabela Prisma nem automação Google Drive/ClickUp. |
| 12 | **Operações** | Histórico / Auditoria | `/historico` | `🟠 Protótipo UI` | `➖ N/A` | Tela lê `historyEvents` do Zustand; tabela `AuditLog` já existe no DB mas não alimenta esta página. |
| 13 | **Gestão** | Financeiro (6 abas) | `/financeiro` | `🟠 Protótipo UI` | `➖ N/A` | 6 abas em `components/financial/` prontas em UI, sem persistência no banco. |
| 14 | **Gestão** | Configurações & Integrações | `/configuracoes` | `🟠 Protótipo UI` | `➖ N/A` | Tokens e planos salvos apenas no store local; sem persistência criptografada no DB. |
| 15 | **Público** | Landing Page | `/` | `🟠 Protótipo UI` | `⏳ Falta testar` | Página institucional funcional, mas modal de demonstração fica só em `useState` local (não salva nem envia lead). |

---

## 3. Detalhamento Módulo a Módulo (Guia de Desenvolvimento e QA)

### 3.1 ✅ Publicações & Aprovação Pública — `🟢 DB Real` · `✅ 100% Funcional`
- **Arquivos principais:** `app/publicacoes/page.tsx`, `PublicacoesPageClient.tsx`, `PublicacoesView.tsx`, `PublicacoesSandboxClient.tsx`, `app/publicacoes/actions.ts`, `app/a/[token]/page.tsx`, `app/publicacao/[id]/aprovacao/page.tsx`.
- **O que já funciona em produção:**
  - Server Component busca `clients`, `members` e `publications` em paralelo no servidor sem importar Zustand no bundle de produção.
  - Criação, edição (com reset de status quando reenviado), arquivamento, restauração e regeneração de link de aprovação (`/a/[token]`).
  - Rota pública sem login com `PUBLIC_APPROVAL_SELECT` (DTO `PublicApprovalPublication`), sem vazamento de `organizationId`, `clientId`, `clientName`, `responsibleUser` ou metadados de arquivo.
  - Rate limit por IP (`60/min` leitura, `10/min` aprovação/solicitação de ajustes).
  - `AuditLog` com marcadores `[SIMULACAO_OPERADOR]` e `[CLIENTE_EXTERNO/LINK_PUBLICO]`.
- **Melhorias evolutivas futuras (não bloqueantes, pós-produção):**
  - [ ] Validar expiração de 24h do token também no **server-side** dentro de `approvePublicationByTokenAction` e `requestPublicationChangesByTokenAction` (hoje o countdown/bloqueio de expiração está na UI).
  - [ ] Migrar upload de imagens de data URL/JSON no Postgres para storage dedicado (ex.: Supabase Storage) para reduzir tamanho das linhas em `publication`.
  - [ ] Migrar rate-limit em memória (`lib/rate-limit.ts`) para store distribuído (Upstash/Redis) se houver escala multi-instância.
  - [ ] Restringir ações de escrita (`create`, `update`, `archive`, `regenerate`) para bloquear papel `viewer` no servidor.

---

### 3.2 Autenticação & Primeiro Acesso — `🟢 DB Real` · `🧪 Parcialmente testado`
- **Arquivos principais:** `lib/auth.ts`, `lib/auth-client.ts`, `lib/tenant.ts`, `proxy.ts`, `app/login/page.tsx`, `app/primeiro-acesso/page.tsx`, `app/primeiro-acesso/actions.ts`, `app/dashboard/layout.tsx`, `app/forbidden.tsx`.
- **O que já existe:**
  - Better Auth + Prisma Adapter + plugin `organization`.
  - Backstop de cookie em `proxy.ts` + validação real em `ServerDashboardLayout`.
  - Redirecionamento automático para `/primeiro-acesso` quando `mustChangePassword = true`.
- **Pendências técnicas encontradas no código:**
  - [ ] Em `app/primeiro-acesso/actions.ts` (linha 73), o fallback `organizationId: firstMembership?.organizationId || 'admin_org_system_fallback'` falhará por violação de FK se um usuário sem membership trocar a senha inicial; tratar o caso sem gravar FK inválida.
  - [ ] Avaliar fluxo de "Esqueci minha senha" (atualmente não existe reset self-service por e-mail; apenas reset manual pelo operador em `/empresas`).
  - [ ] Revisar `trustedOrigins` em `lib/auth.ts` para garantir domínio final (`nvhub.com.br`) quando publicado em domínio customizado.
- **Checklist de QA para promover a 100%:**
  - [ ] Login válido, login inválido (credenciais erradas) e logout limpando sessão no banco.
  - [ ] Acesso direto a `/dashboard`, `/clientes`, `/tarefas` sem sessão redireciona para `/login?redirect=...` e retorna corretamente após login.
  - [ ] Usuário com `mustChangePassword = true` fica preso em `/primeiro-acesso` até definir senha ≥ 6 caracteres; após alterar, acessa `/dashboard` e grava `USER_FIRST_PASSWORD_CHANGED` no `AuditLog`.
  - [ ] Usuário vinculado a organização **suspensa** (`isActive = false`) ou **arquivada** recebe bloqueio limpo (sem erro 500 não tratado).
  - [ ] Usuário comum acessando `/empresas` recebe página `403` (`app/forbidden.tsx`).

---

### 3.3 Empresas / Painel do Operador — `🟢 DB Real` · `⏳ Falta testar`
- **Arquivos principais:** `app/empresas/layout.tsx`, `app/empresas/page.tsx`, `app/empresas/actions.ts`.
- **O que já existe:**
  - Gate server-side com `isOperator()` + `forbidden()` no layout e `requireOperator()` nas Server Actions.
  - CRUD completo em banco: `getRealOrganizations`, `createRealOrganization`, `updateRealOrganization`, `archiveRealOrganization`, `restoreRealOrganization`, gestão de membros (`getOrganizationUsers`, `createOrganizationUser`, `updateOrganizationUserRole`, `resetOrganizationUserPassword`, `removeOrganizationMember`) e troca de tenant ativo (`setOperatorActiveOrganization`).
- **Pendências técnicas encontradas no código:**
  - [ ] `app/empresas/page.tsx` é Client Component grande (~2.320 linhas) e ainda importa `useStore` de `lib/store.ts`; separar fluxo DB vs. sandbox e adotar padrão Server Component no carregamento inicial.
  - [ ] Padronizar `requireOperator()` em `app/empresas/actions.ts` para reutilizar `validatePlatformOperatorAccess()` de `lib/tenant.ts` (evita duplicação de query e aproveita `React.cache`).
  - [ ] Verificar se as feature flags `integrations` e `publicProposal` precisam virar colunas reais em `OrganizationFeature` no schema Prisma (hoje só existem no fallback em memória de `lib/tenant-context-actions.ts`).
- **Checklist de QA para promover a 100%:**
  - [ ] Criar nova organização + usuário owner inicial e confirmar login do owner no fluxo de primeiro acesso.
  - [ ] Alterar plano e alternar feature flags individuais, confirmando que a sidebar e as Server Actions do tenant respeitam o bloqueio.
  - [ ] Suspender, arquivar e restaurar organização, validando impacto no login dos membros.
  - [ ] Criar membro, trocar papel (`owner`/`admin`/`member`/`viewer`), resetar senha e remover membro.
  - [ ] Simular acesso a um tenant via `setOperatorActiveOrganization`, executar ações e conferir se o retorno ao workspace do operador funciona sem travar sessão.

---

### 3.4 Tarefas & Planner Operacional — `🟢 DB Real` · `🧪 Parcialmente testado`
- **Arquivos principais:** `app/tarefas/page.tsx`, `TarefasPageClient.tsx`, `app/tarefas/actions.ts`, `lib/planner.ts`, `components/ui/operational-planner.tsx`, `components/ui/task-calendar.tsx`, `scripts/test-planner.mjs`.
- **O que já existe:**
  - Server Component carregando tarefas, clientes, membros e publicações (para o planner) em paralelo.
  - CRUD completo (`Task` + `TaskNote`): criar, editar, concluir, reabrir, arquivar, restaurar e adicionar notas.
  - Único módulo com teste unitário automatizado (`node scripts/test-planner.mjs`) cobrindo datas, fuso, atrasos e unificação de tarefas + publicações.
- **Pendências técnicas encontradas no código:**
  - [ ] Aplicar marcador `[SIMULACAO_OPERADOR]` nos registros de `AuditLog` em `app/tarefas/actions.ts` (follow-up aberto em [task.md](../task.md)).
  - [ ] Em `getTaskById`, usar `getActiveOrganizationId(session)` + `validateTenantAccess` de forma consistente (evitar depender apenas de `session.session.activeOrganizationId` cru).
  - [ ] Aplicar restrição de papel `viewer` (impedir mutações por usuários somente leitura).
- **Checklist de QA para promover a 100%:**
  - [ ] Criar tarefa com e sem cliente, com e sem prazo, com responsável atribuído; confirmar persistência após reload.
  - [ ] Testar transições de status (`pending` → `in_progress` → `in_review` → `completed` → reabrir → `archived` → restaurar).
  - [ ] Adicionar notas (`TaskNote`) e validar ordenação e autor.
  - [ ] Testar Planner nas visões Dia, Semana, Mês e fila "Sem data", validando exibição conjunta de tarefas + publicações e navegação para `/publicacoes?publicacao=...`.
  - [ ] Validar fallback quando `features.publications === false` (planner deve abrir apenas com tarefas, sem erro).
  - [ ] Testar isolamento multi-tenant e experiência mobile (sem rolagem horizontal).

---

### 3.5 Clientes & Perfil 360° — `🟡 Híbrido` · `🧪 Parcialmente testado`
- **Arquivos principais:** `app/clientes/page.tsx`, `ClientesPageClient.tsx`, `app/clientes/actions.ts`, `app/clientes/[id]/page.tsx`.
- **O que já existe:**
  - `/clientes`: Server Component + Server Actions (`getClients`, `createClient`, `updateClient`, `archiveClient`, `restoreClient`, `getTenantMembers`) persistidos no Supabase.
  - `/clientes/[id]`: carrega dados básicos do cliente, tarefas e histórico via `getClientProfileDbData(clientId)`.
- **Pendências técnicas encontradas no código:**
  - [ ] **Remover fallback mockado em `app/clientes/actions.ts` (linha 44):** `responsibleUser: dbClient.responsibleUser || 'Ana Silva'` injeta nome fictício quando o campo está vazio no banco; deve retornar string vazia `''` ou "Sem responsável".
  - [ ] **Eliminar comportamento híbrido em `app/clientes/[id]/page.tsx`:** hoje a tela importa `useTenantStore()` e abas como **Publicações**, Propostas, Contratos, Cobranças e Onboarding ainda leem do store local. No mínimo, a aba **Publicações** deve ler do PostgreSQL imediatamente (pois `Publication` já está no DB), e abas ainda não migradas devem exibir estado vazio/em breve limpo em modo `database` em vez de dados fictícios do store.
  - [ ] Converter `app/clientes/[id]/page.tsx` para Server Component + Client Child (removendo waterfall `useEffect`).
  - [ ] Aplicar marcador `[SIMULACAO_OPERADOR]` nos `AuditLog` de `app/clientes/actions.ts` (follow-up de [task.md](../task.md)) e validar papel `viewer`.
- **Checklist de QA para promover a 100%:**
  - [ ] Criar, editar, filtrar (ativos/onboarding/inativos/arquivados), arquivar e restaurar clientes em produção.
  - [ ] Confirmar que cliente sem responsável não exibe "Ana Silva".
  - [ ] Abrir `/clientes/[id]` em produção e confirmar que 100% dos dados exibidos são reais do banco (incluindo tarefas e publicações vinculadas), sem vazamento de dados do sandbox.
  - [ ] Tentar acessar `/clientes/<id-de-outro-tenant>` e confirmar bloqueio.
  - [ ] Validar fluxo de criação de tarefa diretamente de dentro do perfil do cliente.

---

### 3.6 Dashboard — `🟡 Híbrido` · `🧪 Parcialmente testado`
- **Arquivos principais:** `app/dashboard/page.tsx`, `app/dashboard/DashboardPageClient.tsx`.
- **O que já existe:**
  - Server Component busca `getClients()` e `getTasks(false, false)` em paralelo.
  - Em modo `database`, zera `financeEntries` (`[]`) para não exibir valores financeiros fictícios.
- **Pendências técnicas encontradas no código:**
  - [ ] **Corrigir leitura híbrida em `DashboardPageClient.tsx` (linhas 210–217):** hoje `publications`, `proposals`, `contracts`, `charges`, `onboardings` e `historyEvents` ainda vêm de `useTenantStore()`.
    - **Ação imediata 1:** buscar `getRealPublications()` no Server Component `app/dashboard/page.tsx` (em paralelo com `getClients` e `getTasks`) para que os cards de Publicações reflitam o banco real.
    - **Ação imediata 2:** para módulos ainda não migrados (propostas, contratos, cobranças, onboardings, histórico), retornar listas vazias (ou ocultar/indicar "Em estruturação") quando `isDatabaseDataMode === true`, nunca exibindo números do store demo em produção.
  - [ ] Remover dependência de `useTenantStore` do bundle de produção do Dashboard (seguindo o padrão de `app/publicacoes/`).
- **Checklist de QA para promover a 100%:**
  - [ ] Validar que todos os KPIs exibidos em produção batem 100% com as contagens reais no Supabase (Clientes, Tarefas e Publicações).
  - [ ] Confirmar que um tenant recém-criado e vazio mostra zeros/estados vazios reais (zero dados de demo).
  - [ ] Desativar módulos em `OrganizationFeature` e confirmar que os blocos correspondentes somem do Dashboard.
  - [ ] Validar tempo de carregamento em produção (`PERF_LOGGING=1`) e layout mobile.

---

### 3.7 Módulos em Protótipo UI (Zustand — Pendentes de Banco e Backend)

Todos os módulos abaixo possuem interface pronta em modo `sandbox` (`lib/store.ts`), mas **ainda não possuem tabelas no `prisma/schema.prisma`, nem Server Actions, nem persistência real em produção**:

| Módulo | Pendências obrigatórias de desenvolvimento | QA mínimo após migração |
| --- | --- | --- |
| **Leads** (`/leads`) | Criar model `Lead` (e notas) com `organizationId`; Server Actions com RBAC e `AuditLog`; migrar Kanban/Lista para RSC + Client sem Zustand; implementar conversão real Lead → Client em transação Prisma. | CRUD + mover colunas Kanban + conversão em cliente + isolamento multi-tenant. |
| **Propostas** (`/propostas`, `/proposta/[id]`) | Criar models `Proposal` e `ProposalItem` + `publicToken` único (não expor UUID sequencial sem token); Server Actions autenticadas + rota pública com DTO restrito e rate-limit (mesmo padrão de `/a/[token]`); remover dívida técnica registrada em `app/proposta/[id]/page.tsx`. | Criar proposta com itens recorrentes/pontuais + abrir link público sem login + aceitar/recusar + auditoria externa. |
| **Contratos** (`/contratos`) | Criar model `Contract` vinculado a `Client`/`Proposal`; Server Actions; integrar API + webhook da **ZapSign** para assinatura eletrônica. | Geração via proposta aceita + envio + atualização de status por webhook + segurança de webhook. |
| **Cobranças** (`/cobrancas`) | Criar model `Charge` vinculado a `Client`/`Contract`; Server Actions; integrar API + webhook do **Asaas** (PIX/Boleto/Cartão). | Emissão de cobrança + pagamento/compensação via webhook + bloqueio de duplicidade (idempotência). |
| **Onboarding** (`/onboarding`) | Criar model `Onboarding` (checklist + links); Server Actions; disparo automático pós-pagamento; integrações opcionais com **Google Drive** e **ClickUp**. | Criação automática pós-pagamento + avanço das 6 etapas + persistência de links. |
| **Histórico** (`/historico`) | Substituir leitura de `historyEvents` (Zustand) por consulta paginada em `AuditLog` filtrada por `organizationId` e `target`/cliente, formatando ações legíveis na UI. | Conferir exibição de ações de Clientes, Tarefas, Publicações, Operador e Cliente Externo sem vazar outros tenants. |
| **Financeiro** (`/financeiro`) | Criar models `FinancialEntry` e `FinancialRecurrence` (com `Decimal` para valores monetários, nunca float); Server Actions para as 6 abas; rotina de geração/vencimento de recorrências e vínculo com `Charge`. | CRUD A Receber/A Pagar + baixa parcial/total + Fluxo de Caixa + Recorrências + precisão centavos. |
| **Configurações** (`/configuracoes`) | Criar model `OrganizationIntegration` com criptografia at-rest para tokens de API; persistir configurações no servidor; restringir escrita a `owner`/`admin`; conectar gestão de convites (`Invitation`). | Salvar/atualizar credenciais sem retornar segredo em texto plano ao browser + teste de conexão real. |
| **Landing Page** (`/`) | Criar Server Action ou endpoint rate-limited para persistir/encaminhar leads do modal de demonstração (banco ou notificação). | Envio do formulário em produção + validação anti-spam/rate-limit + confirmação de recebimento. |

---

## 4. Dívidas Técnicas Transversais (Prioridade para Próximos Sprints)

1. **Enforcement de papéis (`UserRole`) no servidor:** hoje `validateTenantAccess` valida se o usuário pertence ao tenant, mas a maioria das Server Actions de escrita (`clientes`, `tarefas`, `publicacoes`) ainda não bloqueia explicitamente `membership.role === 'viewer'`.
2. **Padronização de `[SIMULACAO_OPERADOR]`:** já implementado em `app/publicacoes/actions.ts`, pendente de replicar em `app/clientes/actions.ts` e `app/tarefas/actions.ts` (registrado em [task.md](../task.md)).
3. **AuditLog para atores externos:** hoje `AuditLog.userId` é obrigatório (FK para `User`), obrigando a ancorar ações públicas no responsável da publicação. Solução definitiva: tornar `userId` nullable + adicionar coluna `actorType` (`user` | `operator_simulation` | `external_public` | `system`) via migration.
4. **Cobertura de testes automatizados:** hoje existe apenas [scripts/test-planner.mjs](../scripts/test-planner.mjs). Recomenda-se introduzir testes automatizados para regras críticas (isolamento multi-tenant em Server Actions, fluxo de token público de aprovação, permissões por papel e smoke tests E2E de login/módulos principais).
5. **Isolamento do `lib/store.ts`:** garantir que nenhum módulo migrado para banco importe Zustand no bundle de produção (usando o padrão `PublicacoesPageClient` + `PublicacoesSandboxClient` já validado em `/publicacoes`).
6. **Limites de plano no servidor:** `checkLimit` hoje existe apenas em `lib/store.ts` (sandbox); precisa ser implementado no backend antes da abertura comercial self-service.
