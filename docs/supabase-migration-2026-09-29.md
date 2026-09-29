# Migração PostgreSQL → Supabase — 29/09/2026

Projeto Supabase: `jtbithltxaqfnhjadsjt`. Aplicação: `https://nvhub.vercel.app`.

## Estado da produção

- Os dados das 13 tabelas da aplicação foram copiados da Railway para o Supabase. As 8 migrations Prisma estão aplicadas no destino; a última adiciona 6 índices de leitura.
- O usuário configurou `DATABASE_URL` (Transaction Pooler, porta 6543) e `DIRECT_URL` (Session Pooler, porta 5432) no ambiente **Production** da Vercel e fez um redeploy. A CLI confirmou que as duas variáveis existem, com valores ocultos.
- O código atualizado foi publicado no deployment `dpl_3YVV5rbBAmDzyVsQ8QwzGxD3NYiH` e promovido para `nvhub.vercel.app`. Build e TypeScript passaram. `/login` respondeu 200; `/dashboard`, sem sessão, redirecionou para login; `/api/auth/get-session`, sem cookie, respondeu 200 com `null`.
- O usuário confirmou login e carregamento de Dashboard, Clientes e Tarefas em produção após esse deployment. O teste funcional foi bem-sucedido, embora não tenha medido latência das páginas.
- Depois do login no deployment final, o Supabase tinha uma sessão exclusiva atualizada em `2026-09-29T22:24:22Z`; a última atualização de sessão na Railway seguia em `2026-09-29T03:56:37Z`. Isso confirma uma gravação de sessão no destino em produção. A contagem permaneceu em 24 nos dois bancos, com uma sessão exclusiva em cada um.
- A Railway permanece intacta para consulta e eventual rollback. Não gravar novamente nela após o corte sem um plano de sincronização reversa.
- O deployment final foi enviado pela CLI a partir do código local. `origin/main` precisa conter as mesmas mudanças de Prisma, carregamento inicial, `.vercelignore` e `vercel.json` para que deployments automáticos posteriores preservem o corte.

## Integridade e backup

- Antes do primeiro login após o corte, a comparação Prisma read-only entre Railway e Supabase retornou `mismatches=[]` e `contentMismatches=[]` nas 13 tabelas. Contagens não vazias: `user=7`, `session=24`, `account=7`, `organization=3`, `member=7`, `organization_feature=3`, `audit_log=189`, `client=2`, `publication=47`. `verification`, `invitation`, `task` e `task_note` tinham 0 registros. Depois do login, `contentMismatches=["session"]` é esperado: o Supabase já recebe novas sessões, e a Railway é uma cópia histórica.
- O dump final da Railway está em `backups/railway-cutover-final-20260929.dump` (65.664 bytes; SHA-256 `E900D87E956ABAD3230CADDE370FAE657C93F52EC576D258337164671D63BBD9`). `pg_restore --list` validou o arquivo. A pasta `backups/` é ignorada pelo Git.
- Para repetir a comparação enquanto a Railway ainda estiver disponível: `node --env-file=.env --env-file=.env.local scripts/compare-db-counts.mjs --content`. Esse comando apenas lê os dois bancos. Não restaurar o dump por cima do Supabase após novas escritas em produção.
- O `.env` e o `.env.local` locais ainda contêm a origem Railway em `DATABASE_URL`; as conexões Supabase locais estão em `SUPABASE_DATABASE_URL` e `SUPABASE_DIRECT_URL`. Os arquivos são ignorados pelo Git. Não publicar credenciais em documentos ou logs.
- Um deploy intermediário por CLI carregou o `.env` local durante o build. `.vercelignore` passou a excluir arquivos `.env*` e `backups/`; o build final não carregou `.env` nem mostrou o aviso correspondente. O deployment intermediário `dpl_AM4gwkHVLc1mQGB7GcbhJJsg9cva` foi removido da Vercel após a promoção do substituto.

## Atraso de carregamento

- Da máquina local, cinco consultas `SELECT 1` mostraram Railway em 2234 ms na primeira conexão e 243–246 ms nas aquecidas; Supabase Transaction Pooler em 162 ms na primeira e 47–49 ms nas aquecidas. Isso mede a rede local até cada banco, não o tempo de uma página na Vercel.
- Clientes e tarefas antes carregavam os dados iniciais após a hidratação por 2–3 Server Actions disparadas em `useEffect`. Agora as consultas iniciais ocorrem no render do servidor, em paralelo. Buscas do cliente continuam para ações de edição.
- A rota dinâmica `/api/auth/get-session` do primeiro deployment respondeu com `X-Vercel-Id: gru1::iad1::...`: a requisição entrou pela borda de São Paulo, mas a Function executou em `iad1` (EUA). Isso mantinha distância de rede até o Supabase. O `vercel.json` agora fixa `gru1`; o deployment final mostra Functions em `gru1` e a mesma rota respondeu com `X-Vercel-Id: gru1::gru1::...`.
- Mesmo com a Function próxima ao banco, o layout autenticado faz leituras sequenciais de sessão, organização ativa, participação e usuário. Os logs `nvhub.performance` podem separar o custo de autenticação e das páginas se `PERF_LOGGING=1` for ativado temporariamente.

## Operação e rollback

1. Conferir login novo e carregar Dashboard, Clientes, Tarefas e Publicações em `nvhub.vercel.app`; verificar logs de erro e desempenho na Vercel.
2. Confirmar que `origin/main` contém os commits locais para que futuros deploys automáticos preservem o código e a configuração de região.
3. Manter o backup final e a Railway disponíveis até estabilização. Para voltar à Railway, seria necessário interromper gravações, reconciliar os dados criados no Supabase após o corte, trocar as duas URLs de produção e redeployar. Não apontar a aplicação diretamente para o dump antigo, pois isso perderia novas gravações.

## Referências

- [Conexão PostgreSQL no Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Supabase com Prisma](https://supabase.com/docs/guides/database/prisma)
- [Região das Functions na Vercel](https://vercel.com/docs/functions/configuring-functions/region)
- Guia local do Next.js 16: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/preferredRegion.md`.
