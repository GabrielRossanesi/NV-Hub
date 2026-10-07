# Avaliação de UI/UX mobile — NV Hub

Data: 30/09/2026. Skill aplicada: `.agents/skills/frontend-skill/SKILL.md`.

## Direção de interface

- **Tese visual:** manter o dourado e as superfícies claras/escuras do NV Hub, com hierarquia calma, menos decoração e maior legibilidade no celular.
- **Conteúdo:** orientação e ação da página, indicadores compactos, filtros, trabalho principal e contexto secundário expansível.
- **Interação:** abertura do menu lateral, entrada breve dos painéis de formulário/ações e rotação do indicador de expansão; respeitar a preferência por movimento reduzido.

## Diagnóstico e implementação

| Problema identificado | Impacto no celular | Melhoria implementada |
| --- | --- | --- |
| Botões e ícones entre 28 e 40 px | Toques imprecisos, especialmente em ações de linha | Altura mínima de 44 px; ícones com largura mínima de 44 px; opções do menu com 48 px |
| Campos com tipografia pequena | Digitação difícil e possibilidade de zoom automático no iOS | Campos de texto, seleção e data com 16 px e altura mínima de 48 px |
| Quatro indicadores empilhados em tarefas | Consomem a primeira tela antes do trabalho principal | Um painel de indicadores em duas colunas, com divisórias discretas |
| Equipe e produtividade antes da lista | Exigem rolagem longa para encontrar tarefas | Equipe expansível com resumo da seleção; produtividade após o trabalho principal no mobile |
| Formulário central com limite independente de 70vh | Cabeçalho e ações podem ultrapassar a tela | Painel inferior em telas estreitas, altura limitada por `dvh`, rolagem interna e ações finais aderentes |
| Tabelas de pelo menos 600/680 px | Leitura exige deslocamento horizontal | Em menos de 768 px, linhas em blocos com todos os campos rotulados e ações preservadas |
| Menu de ações dentro da listagem | Pode ficar cortado pelo contêiner | Portal com fundo de fechamento e painel inferior exclusivamente no mobile; Escape e navegação por teclado |
| Kanban de leads com largura fixa de 1400 px | Etapas estreitas e navegação lateral difícil | Colunas com largura adequada ao celular e alinhamento por scroll snap |
| Fundo decorativo visível atrás do trabalho | Compete com os dados em telas pequenas | Menor opacidade da atmosfera no mobile |
| Menu lateral com linguagem visual do desktop | Espaço insuficiente e seleção pouco destacada | Maior largura útil, itens de 48 px, seleção dourada e respeito às áreas seguras |

## Preservação do desktop

As novas regras de `app/mobile.css` ficam integralmente dentro de media queries abaixo de 1024 px. As transformações de tabelas, indicadores e painéis inferiores usam o limite adicional de 768 px.

As classes existentes do desktop foram mantidas. Os painéis de equipe e produtividade continuam abertos a partir de 1024 px; o menu de ações continua ancorado ao botão. Os rótulos das tabelas são atributos adicionais, utilizados apenas pelas regras mobile. Autenticação, dados, ações de negócio e configuração de produção permanecem nos fluxos existentes.

## Validação realizada

- Navegador local em ambiente sandbox, com dimensões CSS reais medidas, incluindo 320 × 666 e 390 × 844 px; também foi inspecionado o formulário em 433 × 937 px.
- Tarefas: abertura do filtro, seleção de Ana Silva e fechamento mantendo a seleção.
- Em 390 × 844 px, o início da lista passou a aparecer na primeira tela (aproximadamente 683 px na medição anterior ao refinamento final dos indicadores). Na inspeção inicial, a primeira tela terminava no filtro de equipe.
- Tarefas, clientes e recorrências financeiras sem overflow horizontal do conteúdo principal nas larguras mobile verificadas.
- Clientes: filtro de leads retorna um registro e apresenta o botão acessível “Limpar filtros”.
- Formulário de tarefa em 320 × 666 px: altura limitada à tela, conteúdo com rolagem própria e ações finais visíveis; campos de 16 px.
- Recorrências: os oito rótulos do cabeçalho foram associados corretamente aos campos; valores e ações continuam disponíveis.
- TypeScript, ESLint dos arquivos alterados e build otimizado do Next.js verificados.

O comando `npm run build` encontrou a DLL do Prisma em uso pelo servidor local. A compilação foi realizada com `npx next build`, utilizando o cliente Prisma existente, e terminou com sucesso. Nenhum schema foi alterado.

## Limites da validação

A inspeção visual foi feita em Chromium com dados de demonstração. Não houve teste em aparelho físico/Safari, teclado virtual real ou leitor de tela. A conexão de inspeção do navegador deixou de responder na etapa final, impedindo a comparação visual adicional de desktop e o teste interativo do menu de clientes disponível apenas no modo banco. A proteção do desktop foi conferida pelo escopo das regras e pelo código responsivo.
