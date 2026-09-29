# Migração PostgreSQL → Supabase: carga de homologação concluída

Projeto de destino: `jtbithltxaqfnhjadsjt`.

## Estado verificado

- A aplicação usa Prisma 6 e Better Auth sobre PostgreSQL. O Supabase já recebeu uma cópia verificada dos dados. A aplicação local e a Vercel ainda apontam para Railway; não houve troca de produção.
- Contagem read-only da origem em 29/09: `user=7`, `session=24`, `account=7`, `organization=3`, `member=7`, `organization_feature=3`, `audit_log=189`, `client=2`, `publication=47`; `verification`, `invitation`, `task` e `task_note` estão vazias. Há dados reais a preservar.
- As 7 migrations históricas foram preservadas. A migration `20260929120000_supabase_read_indexes` só adiciona índices, sem apagar ou modificar registros.
- `prisma migrate status` na Railway mostra exatamente essa nova migration como pendente. O diff entre banco de origem e schema atual contém apenas os 6 índices novos; não foi encontrada outra divergência estrutural.
- `DATABASE_URL` é a conexão da aplicação. `DIRECT_URL` é a conexão usada pelo Prisma Migrate. Em produção serverless, use Transaction Pooler para a primeira e Direct ou Session Pooler para a segunda.
- O `.env` local ignorado pelo Git recebeu `DIRECT_URL` igual à conexão Railway atual para que a nova configuração Prisma continue validando e compilando. As variáveis `SUPABASE_*` devem ser adicionadas separadamente; não substitua a origem antes da cópia.
- As URLs do projeto foram conferidas: pooler compartilhado `aws-0-sa-east-1.pooler.supabase.com` nas portas 6543 (Transaction) e 5432 (Session). O project ref está no usuário de conexão. A região do host é São Paulo.
- As variáveis `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` e `SUPABASE_SECRET_KEY` presentes no `.env.local` são da API HTTP; elas não substituem as URLs PostgreSQL. O host da API corresponde ao project ref informado.
- `pg_dump` e `pg_restore` 18.6 estão instalados em `C:\Program Files\PostgreSQL\18\bin`.
- Backup completo read-only da origem criado em `backups/railway-pre-supabase-20260929.dump` (66.124 bytes; SHA-256 `838855EF4E1B65F0B61C61A66270C523823E781E226FE96648A77E17FFF6A105`). O arquivo é ignorado pelo Git e foi validado com `pg_restore --list`.
- A lista `backups/railway-app-data-restore.list` seleciona somente as 13 tabelas da aplicação e as ordena por dependências de chave estrangeira; foi validada com `pg_restore --data-only --use-list` sem conectar ao destino.
- Novo backup de transferência: `backups/railway-supabase-transfer-20260929.dump` (66.124 bytes; SHA-256 `0D9795902DED43B4F7F174C317E29B7DC6D9F67FDF4E817BEF7D8D28683F76C2`). A lista correspondente é `backups/railway-supabase-transfer-restore.list`.
- Antes da carga, o Supabase tinha 0 tabelas em `public`. As 8 migrations Prisma foram aplicadas com sucesso; `prisma migrate status` confirmou o schema atualizado. Os dados foram restaurados em transação única.
- Após a carga, as contagens e o conteúdo lido pelo Prisma nas 13 tabelas coincidiram integralmente (`mismatches=[]`, `contentMismatches=[]`). A comparação do conteúdo pode ser repetida com `node --env-file=.env --env-file=.env.local scripts/compare-db-counts.mjs --content`.
- Supabase será usado como PostgreSQL; o login continua no Better Auth. `auth`, `storage` e chaves da Data API do Supabase não são necessários para esta migração.

## Preparação realizada e requisitos para o corte final

1. Foi confirmada a cópia integral, incluindo `user`, `account`, `session`, clientes, tarefas e publicações.
2. As URLs estão em variáveis locais seguras `SUPABASE_DATABASE_URL` (Transaction Pooler `:6543`) e `SUPABASE_DIRECT_URL` (Session Pooler `:5432`). Não publicar senhas no Git, logs ou chat.
   - No painel do projeto, clique em **Connect** > **Database connection**. Copie o host exato de cada modo; o índice do host do pooler varia e não pode ser inferido do project ref.
   - Insira a senha do banco onde o painel mostra `[YOUR-PASSWORD]`. Se necessário, redefina a senha em **Database Settings** antes de prosseguir.
   - Adicione as duas linhas em `.env.local` (arquivo ignorado pelo Git), sem editar `DATABASE_URL` da Railway. Na URL de Transaction Pooler, acrescente `pgbouncer=true&connection_limit=1` usando `?` ou `&` conforme já existam parâmetros.
3. O Supabase já contém a cópia de homologação. Antes do corte final, verificar que nenhum serviço escreveu no destino e não restaurar um segundo dump por cima dos registros existentes.
4. Para o dump final, gerar novamente o backup na janela sem escrita e recriar a lista de restauração a partir do arquivo final. Limpar somente as tabelas da aplicação no destino sob transação/controle explícito antes da nova carga; preservar `_prisma_migrations`.
5. Planejar uma janela sem escrita para o dump final e a troca de conexão. Não executar `prisma/seed.ts` em produção: ele contém exclusões destrutivas condicionais.

## Corte final pendente

1. Obter acesso à configuração do projeto Vercel e confirmar a região da Function (`gru1` anteriormente observada). Preparar `DATABASE_URL` com o Transaction Pooler e `DIRECT_URL` com o Session Pooler no ambiente Production; não publicar as URLs no repositório.
2. Em uma janela sem escritas na Railway, gerar o dump final e recriar a lista de 13 tabelas. Conferir se a cópia de homologação no Supabase permaneceu sem novas escritas; restaurar o dump final sobre tabelas da aplicação limpas, preservando `_prisma_migrations`.
3. Repetir a comparação de contagens e conteúdo, depois validar login, organização ativa, clientes, tarefas, publicações e links de aprovação em Preview/produção. Manter `BETTER_AUTH_SECRET` e domínio de autenticação existentes. Testar também uma sessão nova; sessões antigas podem precisar de novo login se o cookie/ambiente mudar.
4. Trocar `DATABASE_URL` e `DIRECT_URL` da Vercel, fazer redeploy e observar `nvhub.performance` com `PERF_LOGGING=1` temporariamente. Manter Railway para rollback até estabilizar. As alterações de código deste trabalho precisam ser publicadas antes ou junto do corte, pois o schema Prisma agora exige `DIRECT_URL`.

## Atraso de carregamento

- Auditoria anterior mediu 5 consultas mínimas da máquina local à Railway: 214 ms nas conexões aquecidas e 2,86 s na primeira. Esse número é antigo e não representa TTFB em produção.
- Em 29/09/2026 a medição no sandbox falhou na abertura TLS (`Credenciais não disponíveis no pacote de segurança`). Fora do sandbox, 5 consultas `SELECT 1` somente de leitura funcionaram: `2264,7`, `239,9`, `238,8`, `239,9` e `238,3` ms. A primeira inclui abertura da conexão; as demais dão um baseline local aquecido de cerca de 239 ms. Ainda não é a latência Vercel → Railway.
- Comparação nova, a partir da mesma máquina: Railway `2234,1` ms na primeira conexão e `242,8–245,9` ms nas quatro aquecidas; Supabase Transaction Pooler `161,5` ms na primeira e `46,7–49,1` ms nas aquecidas. São consultas mínimas de conectividade local, não tempos de página nem medições da Vercel.
- O dashboard e publicações já buscam os dados iniciais no servidor. Clientes e tarefas ainda iniciavam 2–3 Server Actions em `useEffect` após a hidratação. Agora recebem os dados iniciais no render do servidor, em paralelo, e fazem buscas client-side somente após ações de edição.
- O layout autenticado ainda valida sessão, organização ativa, membership e usuário antes de renderizar. Isso impõe leituras sequenciais por request, mesmo após a mudança de região. Logs existentes (`auth/session`, `organization/active-validation`, `tenant/context-query`, `clients/data-total`, `tasks/data-total`) permitem identificar o custo real em Preview.
- Mover o banco para São Paulo pode reduzir latência de rede se a Function e o banco anterior estiverem distantes; região por si só não corrige cold starts, consultas seriadas, TLS nem hidratação.

## Referências

- Supabase: https://supabase.com/docs/guides/database/connecting-to-postgres
- Supabase + Prisma: https://supabase.com/docs/guides/database/prisma
- Prisma 6: https://www.prisma.io/docs/orm/v6/prisma-client/setup-and-configuration/databases-connections
- Next.js local: `node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md` e `node_modules/next/dist/docs/01-app/02-guides/prefetching.md`.
