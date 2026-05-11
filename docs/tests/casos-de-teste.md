# Documento de Casos de Testes - Velô Sprint

Este documento detalha os casos de teste funcionais para o sistema Velô Sprint (Configurador de Veículo Elétrico), cobrindo os módulos: Landing Page, Configurador de Veículo, Checkout/Pedido, Análise de Crédito Automática, Confirmação e Consulta de Pedidos.

---

### CT01 - Navegação da Landing Page para o Configurador

#### Objetivo
Validar que o usuário consegue acessar a página inicial (Landing Page) do Velô Sprint e navegar com sucesso para a tela de configuração de veículo.

#### Pré-Condições
- O sistema deve estar rodando e acessível no navegador.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Acessar a URL base do sistema (Landing Page). | A página carrega com sucesso, exibindo informações do carro e botão de call-to-action (CTA) para configurar. |
| 2  | Clicar no botão "Configurar" ou "Monte o seu". | O sistema redireciona o usuário para a página do Configurador (`/configure`). |

#### Resultados Esperados
- O usuário é levado ao Configurador de Veículo sem erros.

#### Critérios de Aceitação
- A URL muda para a rota do configurador.
- O configurador é renderizado exibindo o carro base (R$ 40.000).

---

### CT02 - Configuração do Veículo - Atualização de Preço (Fluxo Feliz)

#### Objetivo
Garantir que as seleções de opcionais atualizam o preço total do veículo corretamente, de acordo com as regras de negócio.

#### Pré-Condições
- Estar na página do Configurador.
- Preço base inicial ser R$ 40.000.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Selecionar rodas "Sport". | O preço total é atualizado somando R$ 2.000 (Total: R$ 42.000). |
| 2  | Adicionar opcional "Precision Park". | O preço total é atualizado somando R$ 5.500 (Total: R$ 47.500). |
| 3  | Adicionar opcional "Flux Capacitor". | O preço total é atualizado somando R$ 5.000 (Total: R$ 52.500). |
| 4  | Clicar no botão para Prosseguir ao Checkout. | O sistema redireciona para a página de Checkout mantendo as configurações e o preço total atualizado. |

#### Resultados Esperados
- O preço total do veículo na tela de resumo deve ser de R$ 52.500 após a seleção de todos os opcionais.
- O resumo da compra deve exibir as opções selecionadas corretamente.

#### Critérios de Aceitação
- O cálculo matemático dos adicionais (2000 + 5500 + 5000) deve estar exato.
- A configuração deve ser preservada ao trocar de tela.

---

### CT03 - Checkout - Pagamento à Vista com Sucesso

#### Objetivo
Validar a criação de um pedido com sucesso utilizando a forma de pagamento "À Vista".

#### Pré-Condições
- Ter configurado um veículo e acessado a tela de Checkout (`/order`).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Preencher o campo "Nome" e "Sobrenome" com dados válidos. | Campos aceitam a entrada corretamente. |
| 2  | Preencher "Email", "Telefone", "CPF" com dados válidos. | O sistema formata e aceita os dados (máscaras aplicadas). |
| 3  | Selecionar uma "Loja para Retirada". | A loja é selecionada. |
| 4  | Selecionar a forma de pagamento "À Vista". | O valor a ser pago não inclui juros e o bloco de entrada de financiamento fica oculto. |
| 5  | Marcar a checkbox de aceite dos Termos de Uso. | Checkbox marcada. |
| 6  | Clicar em "Confirmar Pedido". | O sistema processa o pedido e redireciona para a página de Sucesso (`/success`). |

#### Resultados Esperados
- O pedido deve ser gerado no banco de dados com status "APROVADO".
- O usuário deve ver a tela de confirmação com o número do pedido.

#### Critérios de Aceitação
- Nenhuma análise de crédito deve ser chamada.
- A página final deve confirmar a aprovação imediata para pagamento à vista.

---

### CT04 - Checkout - Validação de Campos Obrigatórios e Inválidos

#### Objetivo
Garantir que o sistema impeça o envio do formulário de checkout caso existam dados faltantes, formato incorreto ou termos não aceitos.

#### Pré-Condições
- Estar na página de Checkout (`/order`).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Deixar todos os campos em branco e clicar em "Confirmar Pedido". | O sistema bloqueia o envio e exibe mensagens de erro em todos os campos obrigatórios. |
| 2  | Preencher "Email" com formato inválido (ex: `teste@.com`) e "CPF" incompleto. | O sistema exibe erros específicos de formato: "Email inválido" e "CPF inválido". |
| 3  | Preencher todos os campos corretamente, mas deixar os "Termos de Uso" desmarcados, e tentar submeter. | O sistema impede o envio exibindo a mensagem "Aceite os termos". |

#### Resultados Esperados
- O formulário não é enviado (não há criação de pedido).
- Mensagens de validação ficam visíveis para o usuário próximo a cada campo.

#### Critérios de Aceitação
- Zod schema intercepta e bloqueia a submissão.
- As mensagens de erro estão claras e de acordo com as regras de UI.

---

### CT05 - Análise de Crédito - Aprovação por Score Alto (> 700)

#### Objetivo
Validar o fluxo de financiamento onde o usuário possui um Score de crédito aprovado automaticamente.

#### Pré-Condições
- Estar na tela de Checkout.
- Todos os campos pessoais preenchidos corretamente com um CPF atrelado a um Score > 700 na API (Mokado/Configurado).
- Forma de pagamento selecionada: "Financiamento".

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Inserir um valor de "Entrada" de 10% do total. | Sistema calcula o restante em 12x com juros compostos de 2% ao mês. |
| 2  | Clicar em "Confirmar Pedido". | O sistema envia os dados para análise de crédito, exibindo loading. |
| 3  | Aguardar a resposta da API. | O sistema redireciona para a tela de Sucesso. |

#### Resultados Esperados
- O pedido é criado com status "APROVADO".
- O resumo na tela de confirmação exibe o financiamento, as parcelas e os juros aplicados.

#### Critérios de Aceitação
- Cálculo de parcelas e juros totais estão corretos (12 parcelas fixas com 2% a.m.).
- O usuário visualiza o status APROVADO.

---

### CT06 - Análise de Crédito - Score Médio (Em Análise: 501 - 700)

#### Objetivo
Validar o fluxo de financiamento onde o score de crédito cai na faixa de avaliação manual/análise.

#### Pré-Condições
- Todos os campos preenchidos corretamente com CPF atrelado a um Score entre 501 e 700.
- Valor de entrada menor que 50% do valor total do veículo.
- Financiamento selecionado.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Clicar em "Confirmar Pedido". | O sistema consulta o score. |
| 2  | Aguardar a resposta e redirecionamento. | O sistema leva o usuário para a página de Sucesso (`/success`). |

#### Resultados Esperados
- O pedido é salvo com status "EM_ANALISE".
- A mensagem de sucesso deve refletir que o pedido foi recebido, porém o crédito está sob avaliação.

#### Critérios de Aceitação
- A tela de confirmação exibe a situação "Em análise" e orienta o cliente a aguardar o contato.

---

### CT07 - Análise de Crédito - Score Baixo (Reprovado: <= 500)

#### Objetivo
Validar que financiamentos para usuários com score muito baixo sejam negados pelo sistema, a menos que uma exceção seja atendida.

#### Pré-Condições
- Dados preenchidos com CPF atrelado a um Score <= 500.
- Valor de entrada menor que 50% do valor total do veículo.
- Financiamento selecionado.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Clicar em "Confirmar Pedido". | O sistema avalia o score da API. |
| 2  | Aguardar o processamento. | O sistema redireciona para a tela de Sucesso (`/success`). |

#### Resultados Esperados
- O pedido é gravado no banco de dados com status "REPROVADO".
- O usuário é informado de que o crédito não foi aprovado para o financiamento solicitado.

#### Critérios de Aceitação
- Exibição clara do status "Reprovado".

---

### CT08 - Análise de Crédito - Exceção de Entrada >= 50%

#### Objetivo
Garantir que a regra de exceção funcione: se a entrada for de 50% ou mais, o pedido é aprovado mesmo que o Score de Crédito seja baixo.

#### Pré-Condições
- Veículo configurado no total de R$ 40.000.
- Forma de pagamento: "Financiamento".
- CPF atrelado a um Score <= 500 (Que normalmente reprovaria).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Digitar R$ 20.000 no campo "Valor da Entrada" (50% de 40k). | O sistema recalcula o valor financiado (R$ 20.000) mais juros. |
| 2  | Clicar em "Confirmar Pedido". | O sistema submete o pedido para a análise. |
| 3  | Aguardar a finalização. | O sistema redireciona para a página de sucesso. |

#### Resultados Esperados
- O status do pedido gerado deve ser "APROVADO", ignorando o score baixo.
- A regra de "Entrada Alta" sobrepõe a restrição de crédito.

#### Critérios de Aceitação
- Status gravado no sistema é "APROVADO".

---

### CT09 - Consulta de Pedidos - Busca com Número Válido

#### Objetivo
Validar se o usuário consegue consultar o status e detalhes do seu pedido utilizando o número do pedido (`order_number`).

#### Pré-Condições
- Um pedido válido deve ter sido criado previamente e seu `order_number` deve ser conhecido.
- Estar na página de Consulta de Pedidos (`/lookup` ou `/order-lookup`).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Inserir o `order_number` no campo de busca. | O campo recebe o número corretamente. |
| 2  | Clicar no botão "Buscar Pedido". | O sistema processa a solicitação (loading). |
| 3  | Aguardar o retorno. | Os detalhes do pedido, veículo configurado, preço e status atual aparecem na tela. |

#### Resultados Esperados
- Os dados do pedido consultado são exibidos apenas para aquele número específico.

#### Critérios de Aceitação
- Dados sensíveis (como CPF completo) devem preferencialmente não ser expostos na consulta.
- Status do pedido ("APROVADO", "EM_ANALISE", "REPROVADO") deve ser exibido com destaque.

---

### CT10 - Consulta de Pedidos - Número Inválido ou Inexistente

#### Objetivo
Validar o comportamento do sistema ao tentar buscar um pedido que não existe ou utilizando um código incorreto.

#### Pré-Condições
- Estar na tela de Consulta de Pedidos.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Inserir um `order_number` aleatório e inexistente (ex: `123-INEXISTENTE`). | O campo é preenchido. |
| 2  | Clicar em "Buscar Pedido". | O sistema faz a busca e não encontra o pedido. |

#### Resultados Esperados
- O sistema exibe uma mensagem amigável indicando que o pedido não foi encontrado (Ex: "Pedido não encontrado. Verifique o número digitado e tente novamente.").
- Nenhum dado de outros pedidos é vazado.

#### Critérios de Aceitação
- Mensagem de erro clara.
- Nenhuma falha/crash do sistema na ausência de dados.
