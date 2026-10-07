# Planner de tarefas e publicações

O módulo `/tarefas` abre com o planner da equipe. A lista anterior, o calendário de tarefas e seus fluxos permanecem disponíveis em “Lista de tarefas”. A preferência entre essas visualizações é salva localmente com uma chave própria para a nova experiência.

## Composição

- Uma superfície contínua reúne calendário, agenda do dia e pendências.
- A semana começa na segunda-feira. As visões Dia, Semana e Mês compartilham a data selecionada.
- Em desktop amplo, a semana mostra até duas atividades por dia; o restante aparece na agenda ao selecionar a data.
- Em telas estreitas, os dias mostram contagens e a agenda mantém todas as informações e ações em uma coluna, sem exigir rolagem horizontal.
- Cores, tipografia, bordas e estados usam os tokens do design system. A seleção usa o dourado NV; tipo de atividade é comunicado por texto e ícone, sem criar uma paleta por categoria.
- Transições de seleção, affordance de abertura e entrada da agenda são curtas; a preferência por movimento reduzido é respeitada.

## Regras dos dados

- Tarefas entram pelo prazo de entrega; publicações entram pela data prevista.
- As datas são tratadas como datas civis, sem conversão UTC que deslocaria o dia no Brasil.
- Concluídas e publicadas ficam ocultas por padrão e podem ser incluídas pelos filtros.
- Tarefas canceladas/arquivadas e publicações arquivadas não entram no planner. Continuam acessíveis nos módulos originais.
- Uma atividade ainda aberta só está atrasada quando sua data é anterior a hoje, ou quando a tarefa está explicitamente marcada como atrasada.
- Atividades sem data válida entram em “Sem data”.
- Busca, tipo, cliente e responsável filtram calendário, agenda e pendências conjuntamente. O resumo de finalização do dia informa o total do dia, incluindo os itens finalizados ocultos.
- O planner não cria cópias dos registros nem gera tarefas automaticamente a partir das publicações.

## Integração

- Detalhes, observações, edição, conclusão e reabertura de tarefas reutilizam o componente e as ações existentes. Os formulários aguardam o salvamento e mantêm os valores em caso de falha.
- A criação de tarefa recebe a data selecionada.
- A prévia de publicação mostra mídia, legenda, responsável e status; “Gerenciar publicação” leva ao registro selecionado no módulo original.
- “Agendar publicação” abre o formulário existente com a data escolhida.
- Publicações oferece um acesso de retorno ao planner quando a funcionalidade de tarefas está habilitada.
- Em database mode, o servidor busca os registros em paralelo, usando as ações autenticadas e o tenant atual. Se publicações estiver desabilitado, a consulta e os controles desse módulo são omitidos.
- Uma falha ao carregar publicações aparece com opção de tentar novamente, mantendo as tarefas disponíveis e preservando publicações anteriormente carregadas.

## Verificação

`node scripts/test-planner.mjs` valida datas civis, semanas iniciadas na segunda-feira, mudança de ano, fevereiro bissexto, meses com seis semanas, combinação das fontes, IDs independentes e regras de atraso/arquivamento/conclusão.

Verificação manual no navegador em sandbox: detalhes de tarefa, conclusão e reabertura, salvamento da edição, prévia de publicação, navegação ao registro correto, data herdada em ambos os formulários, filtros, visões mensal/semanal/diária e layout em 320/390 px. As operações reais no banco dependem da sessão autenticada do workspace.

TypeScript, ESLint nos arquivos alterados, testes de datas em `America/Sao_Paulo` e build de produção concluíram sem erros. Temas claro e escuro foram verificados no navegador.

## Próxima evolução sugerida

Reagendamento por arraste, com confirmação do novo prazo e uso das mesmas ações de atualização. Horários e capacidade diária exigem definir campos e regras adicionais; o modelo atual utiliza somente datas.
