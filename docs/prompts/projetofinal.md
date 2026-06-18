# Objetivo

Você é um Engenheiro DevOps/QA especialista em Supabase, Vercel, GitHub Actions e Playwright.

Analise completamente este repositório e me conduza passo a passo na implementação de um ambiente de Preview isolado do ambiente de Produção.

Não assuma nada. Antes de executar mudanças, investigue o projeto, explique o que encontrou e apresente um plano de execução.

# Contexto do problema

Hoje o pipeline faz:

1. Executa testes unitários
2. Faz deploy Preview na Vercel
3. Executa testes E2E (Playwright) contra a URL Preview
4. Promove o mesmo build para Produção

Atualmente existe apenas um projeto Supabase.

Consequência:

* Ambiente Preview utiliza o mesmo banco de Produção
* Testes E2E criam e alteram dados reais
* Existe risco de apagar ou corromper dados de clientes

O objetivo é criar separação completa entre Preview e Produção.

# Resultado esperado

Ao final:

* Preview deve utilizar um projeto Supabase exclusivo
* Produção deve continuar utilizando o Supabase atual
* Testes E2E devem executar apenas contra o banco Preview
* Nenhum dado de teste deve chegar ao banco de Produção
* Edge Functions devem existir em ambos os projetos
* Migrações devem estar sincronizadas entre os ambientes
* Nenhuma secret deve ser commitada

# Tarefas que você deve executar

## Fase 1 — Descoberta

Investigue e me mostre:

* Estrutura do diretório supabase/
* Conteúdo de supabase/migrations
* Conteúdo de supabase/functions
* Arquivos de configuração do Supabase
* package.json
* Workflow .github/workflows/cd.yml
* Configuração Playwright
* Como o frontend obtém as variáveis VITE_SUPABASE_*
* Como ocorre o deploy na Vercel
* Como ocorre o promote

Explique todos os riscos encontrados.

## Fase 2 — Supabase Preview

Identifique:

* Como conectar o CLI ao projeto Preview
* Como aplicar migrations
* Como publicar Edge Functions
* Como validar que RLS e policies foram criadas corretamente

Forneça os comandos exatos.

## Fase 3 — Vercel

Investigue:

* Variáveis de ambiente utilizadas
* Ambientes disponíveis
* Como Preview e Production recebem variáveis

Explique quais variáveis devem ser configuradas:

* VITE_SUPABASE_URL
* VITE_SUPABASE_PROJECT_ID
* VITE_SUPABASE_PUBLISHABLE_KEY

e em qual ambiente cada uma deve existir.

## Fase 4 — Pipeline

Analise cuidadosamente o workflow.

Explique:

* O que acontece no vercel pull --environment=preview
* Quais variáveis entram no build
* Como VITE_* é incorporado ao bundle
* O que o vercel promote realmente faz
* Se o promote reutiliza o build existente ou gera um novo build

## Fase 5 — Solução

Determine qual solução é tecnicamente correta.

Avalie:

### Opção A

Build Preview
→ E2E
→ Novo Build Production
→ Deploy Production

### Opção B

Promover o mesmo build

Explique os impactos de cada opção e recomende a melhor.

## Fase 6 — Implementação

Após validar a solução:

* Gere as alterações necessárias
* Mostre os diffs
* Explique cada mudança
* Atualize o workflow
* Atualize a documentação

# Regras importantes

* Não modificar produção sem explicar o impacto
* Não assumir nomes de projetos Supabase
* Não assumir IDs ou secrets
* Não commitar secrets
* Não remover etapas de teste existentes
* Não simplificar a análise

# Entregáveis

Quero receber:

1. Diagnóstico do projeto atual
2. Plano de implementação
3. Arquivos modificados
4. Diffs completos
5. Comandos para executar
6. Procedimento de validação
7. Evidências de que Preview e Produção estão isolados

Antes de qualquer alteração, mostre primeiro a análise do repositório.





# Desafio Final — Ambiente de Preview com Banco Isolado
Olá QA 👋, Agora chegou a prova de fogo 🔥 pra voc6e obter a sua certifiação em Especialização em automaçao de testes com apoio da IA.

Como eu disse algumas aulas, o grande desafio da automação não está em como buscar um elemento com ou sem ID, com XPATH, CSS Selector e por ai vai. O segredo 🔑 está em como vc lida com ambientes e ecosistema do projeto.

📌 Contexto
Hoje o pipeline de CD (.github/workflows/cd.yml) faz o seguinte fluxo:

Roda os testes unitários
Faz deploy de preview na Vercel
Executa os testes E2E (Playwright) contra a URL de preview
Promove o mesmo build para produção
O problema: existe apenas um projeto Supabase. Isso significa que os testes E2E estão criando pedidos, alterando dados e batendo contra o mesmo banco de produção. Qualquer execução do pipeline polui o banco real, e um teste mal escrito pode até apagar dados de clientes.

A separação preview/produção na Vercel não resolve sozinha — o front-end da preview continua apontando para o Supabase de produção, porque as variáveis VITE_SUPABASE_* estão iguais nos dois ambientes.

🎯 Objetivo
Criar um segundo projeto Supabase que servirá como ambiente de preview. O ambiente atual permanece como produção. Ao final:

Deploys de preview devem usar o Supabase de preview
O promote para produção deve fazer com que a aplicação passe a usar o Supabase de produção
Os testes E2E devem rodar contra o banco de preview, sem encostar em produção
🧩 Tarefas
1. 🗄️ Provisionar o segundo projeto Supabase
Criar um novo projeto no supabase.com (ex: velo-sprint-preview)
Aplicar as migrações do diretório supabase/migrations no novo projeto
Fazer deploy das Edge Functions do diretório supabase/functions no novo projeto
Conferir que as policies de RLS estão idênticas ao projeto de produção
Dica: o CLI do Supabase (yarn supabase link + yarn supabase db push + yarn supabase functions deploy) já está documentado no README. O detalhe é cuidar para qual --project-ref você está apontando antes de cada comando.

2. ⚙️ Configurar variáveis de ambiente na Vercel
A Vercel permite definir variáveis de ambiente por ambiente (Production, Preview, Development). Você precisa garantir que:

No ambiente Production da Vercel, as VITE_SUPABASE_* apontem para o projeto Supabase de produção (o atual)
No ambiente Preview da Vercel, as VITE_SUPABASE_* apontem para o novo projeto Supabase de preview
Variáveis envolvidas: VITE_SUPABASE_URL, VITE_SUPABASE_PROJECT_ID, VITE_SUPABASE_PUBLISHABLE_KEY.

3. 🔄 Garantir que o pipeline use as variáveis certas
Olhe com atenção esta parte do workflow:

YAML
- name: Pull Vercel Config
  run: |
    yarn vercel pull --yes \
    --environment=preview \
    --token=$VERCEL_TOKEN \
    --scope=$VERCEL_SCOPE

- name: Build Vercel
  run: yarn vercel build --token=$VERCEL_TOKEN
Pergunta para refletir: o vercel pull --environment=preview baixa as variáveis de qual ambiente? E o build resultante carrega quais valores das VITE_SUPABASE_* no bundle?

Atenção: variáveis VITE_* são embutidas no bundle em tempo de build. Isso tem implicação direta no passo de promote. Investigue se o vercel promote apenas re-aponta o domínio para um build já existente, ou se gera um novo build.

4. 🚢 Validar o fluxo de promote
O job promote no workflow atual faz:

YAML
npx vercel@latest promote ${{ needs.build-and-deploy.outputs.deployment-url }} ...
Pense:

Se o build de preview foi gerado com as variáveis do Supabase de preview, ao promover esse mesmo build para produção, com qual banco a aplicação em produção vai conversar?
O comportamento desejado é que produção fale com o Supabase de produção. Como você resolve isso?
Existem mais de um caminho válido. Documente no PR a escolha que você fez e o porquê.

✅ Critérios de Aceitação
Existem dois projetos Supabase distintos, um para preview e outro para produção
Um pedido criado durante a execução dos testes E2E não aparece no banco de produção
Após o promote, a aplicação em produção lê e escreve no banco de produção (e não no de preview)
Os testes E2E continuam passando no pipeline
As migrações e Edge Functions estão sincronizadas entre os dois projetos
As secrets/variáveis sensíveis não foram commitadas no repositório
💡 Dicas e Armadilhas
Edge Functions: lembre-se que o segundo projeto começa vazio. Sem deploy das functions, chamadas do front vão dar 404.
supabase link: o CLI guarda o último projeto vinculado. Antes de rodar db push ou functions deploy, confirme com yarn supabase projects list qual está ativo.
RLS: se você criou o projeto novo "do zero", as policies precisam vir das migrações. Não recrie tabelas pela UI — confie nas migrações para manter os ambientes idênticos.
VITE_* no build: variáveis com prefixo VITE_ viram strings literais dentro do JavaScript final. Você não consegue trocá-las "em runtime" só renomeando domínios.
TestDino / Playwright report: como o job de E2E publica relatório, certifique-se de que ele aponta para a URL correta após sua mudança.





#senha do banco de dados - velo-sprint-preview
velo@Avell1
