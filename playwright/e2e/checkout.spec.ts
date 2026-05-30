import { test, expect } from '../suporte/fixtures'

import { deleteOrderByEmail } from '../suporte/database/orderRepository'
import testData from '../suporte/fixtures/orders.json' with { type: 'json' }
test.describe('Checkout', () => {



  test.describe('Validações de campos obrigatórios', () => {

    let alerts: any

    test.beforeEach(async ({ page, app }) => {
      await page.goto('/order')
      await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()

      alerts = app.checkout.elements.alerts
    })


    test('deve validar obrigatoriedade de todos os campos em branco', async ({ app }) => {
      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
      await expect(alerts.email).toHaveText('Email inválido')
      await expect(alerts.phone).toHaveText('Telefone inválido')
      await expect(alerts.document).toHaveText('CPF inválido')
      await expect(alerts.store).toHaveText('Selecione uma loja')
      await expect(alerts.terms).toHaveText('Aceite os termos')
    })

    test('deve validar limite mínimo de caracteres para Nome e Sobrenome', async ({ app }) => {

      const customer = testData.checkout_limite_caracteres

      // Arrange
      await deleteOrderByEmail(customer.email)
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
    })

    test('deve exibir erro para e-mail com formato inválido', async ({ app }) => {
      const customer = testData.checkout_email_invalido

      // Arrange
      await deleteOrderByEmail(customer.email)
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.email).toHaveText('Email inválido')
    })

    test('deve exibir erro para CPF inválido', async ({ app }) => {

      const customer = testData.checkout_cpf_invalido

      // Arrange
      await deleteOrderByEmail(customer.email)
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.document).toHaveText('CPF inválido')
    })

    test('deve exigir o aceite dos termos ao finalizar com dados válidos', async ({ app }) => {

      const customer = testData.checkout_dados_validos

      // Arrange
      await deleteOrderByEmail(customer.email)
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore('Velô Paulista')

      await expect(app.checkout.elements.terms).not.toBeChecked()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.terms).toHaveText('Aceite os termos')
    })
  })

  test.describe('Pagamento e Confirmação', () => {

    test('deve criar um pedido com sucesso para pagamento à vista', async ({ page, app }) => {

      const customer = {
        ...testData.checkout_pagamento_vista,
        email: `papito+vista-${Date.now()}@teste.com`
      }

      // Arrange
      await page.goto('/')
      await page.getByRole('link', { name: /Configure Agora/i }).click()

      await app.configurator.expectPrice(customer.totalPrice)
      await app.configurator.finishConfigurator()
      await app.checkout.expectLoaded()

      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore(customer.store)

      // Act
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.expectSummaryTotal(customer.totalPrice)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByRole('heading', { name: 'Pedido Aprovado!' })).toBeVisible()
    })

    test('deve aprovar automaticamente o crédito quando o score do CPF for maior que 700 no financiamento', async ({ page, app }) => {

      const customer = testData.checkout_financiamento_score_alto

      await deleteOrderByEmail(customer.email)

      await page.route('**/functions/v1/credit-analysis', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'Done', score: customer.score }),
        })
      })

      // Arrange
      await page.goto('/')
      await page.getByRole('link', { name: /Configure Agora/i }).click()

      await app.configurator.expectPrice(customer.totalPrice)
      await app.configurator.finishConfigurator()
      await app.checkout.expectLoaded()

      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore(customer.store)

      // Act
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByRole('heading', { name: 'Pedido Aprovado!' })).toBeVisible()
    })

    test('deve encaminhar para análise de crédito quando o score do CPF for entre 501 e 700 no financiamento', async ({ page, app }) => {

      const customer = testData.checkout_financiamento_score_medio

      await deleteOrderByEmail(customer.email)

      await page.route('**/functions/v1/credit-analysis', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'Done', score: customer.score }),
        })
      })

      // Arrange
      await page.goto('/')
      await page.getByRole('link', { name: /Configure Agora/i }).click()

      await app.configurator.expectPrice(customer.totalPrice)
      await app.configurator.finishConfigurator()
      await app.checkout.expectLoaded()

      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore(customer.store)

      // Act
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByRole('heading', { name: 'Pedido em Análise!' })).toBeVisible()
    })

    test('deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento sem entrada', async ({ page, app }) => {

      const customer = testData.checkout_financiamento_score_baixo_sem_entrada

      await deleteOrderByEmail(customer.email)

      await page.route('**/functions/v1/credit-analysis', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'Done', score: customer.score }),
        })
      })

      // Arrange
      await page.goto('/')
      await page.getByRole('link', { name: /Configure Agora/i }).click()

      await app.configurator.expectPrice(customer.totalPrice)
      await app.configurator.finishConfigurator()
      await app.checkout.expectLoaded()

      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore(customer.store)

      // Act
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByRole('heading', { name: /Crédito Reprovado/i })).toBeVisible()
    })

    test('deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada menor que 50%', async ({ page, app }) => {

      const customer = testData.checkout_financiamento_score_baixo_entrada_menor_50

      await deleteOrderByEmail(customer.email)

      await page.route('**/functions/v1/credit-analysis', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'Done', score: customer.score }),
        })
      })

      // Arrange
      await page.goto('/')
      await page.getByRole('link', { name: /Configure Agora/i }).click()

      await app.configurator.expectPrice(customer.totalPrice)
      await app.configurator.finishConfigurator()
      await app.checkout.expectLoaded()

      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore(customer.store)

      // Act
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.fillDownPayment(customer.downPayment)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByRole('heading', { name: /Crédito Reprovado/i })).toBeVisible()
    })

    test('deve aprovar o pedido quando o score do CPF for menor ou igual a 500 no financiamento com entrada igual a 50%', async ({ page, app }) => {

      const customer = testData.checkout_financiamento_score_baixo_entrada_igual_50

      await deleteOrderByEmail(customer.email)

      await page.route('**/functions/v1/credit-analysis', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'Done', score: customer.score }),
        })
      })

      // Arrange
      await page.goto('/')
      await page.getByRole('link', { name: /Configure Agora/i }).click()

      await app.configurator.expectPrice(customer.totalPrice)
      await app.configurator.finishConfigurator()
      await app.checkout.expectLoaded()

      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore(customer.store)

      // Act
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.fillDownPayment(customer.downPayment)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByRole('heading', { name: /Pedido Aprovado/i })).toBeVisible()
    })

    test('deve aprovar o pedido quando o score do CPF for menor ou igual a 500 no financiamento com entrada maior que 50%', async ({ page, app }) => {

      const customer = testData.checkout_financiamento_score_baixo_entrada_maior_50

      await deleteOrderByEmail(customer.email)

      await page.route('**/functions/v1/credit-analysis', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'Done', score: customer.score }),
        })
      })

      // Arrange
      await page.goto('/')
      await page.getByRole('link', { name: /Configure Agora/i }).click()

      await app.configurator.expectPrice(customer.totalPrice)
      await app.configurator.finishConfigurator()
      await app.checkout.expectLoaded()

      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore(customer.store)

      // Act
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.fillDownPayment(customer.downPayment)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByRole('heading', { name: /Pedido Aprovado/i })).toBeVisible()
    })

  })
})