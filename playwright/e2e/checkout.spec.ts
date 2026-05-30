import { test, expect } from '../suporte/fixtures'
import type { Page } from '@playwright/test'

import { deleteOrderByEmail } from '../suporte/database/orderRepository'
import testData from '../suporte/fixtures/orders.json' with { type: 'json' }
import { openConfigurator, mockCreditAnalysis, arrangeCheckout } from '../suporte/helpers'

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

      const customer = testData.checkout_pagamento_vista

      await deleteOrderByEmail(customer.email)

      // Arrange
      await arrangeCheckout(page, app, customer)

      // Act
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.expectSummaryTotal(customer.totalPrice)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByRole('heading', { name: /Pedido Aprovado/i })).toBeVisible()
    })

    test('deve aprovar automaticamente o crédito quando o score do CPF for maior que 700 no financiamento', async ({ page, app }) => {

      const customer = testData.checkout_financiamento_score_alto

      await deleteOrderByEmail(customer.email)
      await mockCreditAnalysis(page, customer.score)

      // Arrange
      await arrangeCheckout(page, app, customer)

      // Act
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByRole('heading', { name: /Pedido Aprovado/i })).toBeVisible()
    })

    test('deve encaminhar para análise de crédito quando o score do CPF for entre 501 e 700 no financiamento', async ({ page, app }) => {

      const customer = testData.checkout_financiamento_score_medio

      await deleteOrderByEmail(customer.email)
      await mockCreditAnalysis(page, customer.score)

      // Arrange
      await arrangeCheckout(page, app, customer)

      // Act
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByRole('heading', { name: /Pedido em Análise/i })).toBeVisible()
    })

    test('deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento sem entrada', async ({ page, app }) => {

      const customer = testData.checkout_financiamento_score_baixo_sem_entrada

      await deleteOrderByEmail(customer.email)
      await mockCreditAnalysis(page, customer.score)

      // Arrange
      await arrangeCheckout(page, app, customer)

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
      await mockCreditAnalysis(page, customer.score)

      // Arrange
      await arrangeCheckout(page, app, customer)

      // Act
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.fillDownPayment(customer.downPayment)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByRole('heading', { name: /Crédito Reprovado/i })).toBeVisible()
    })

    test('deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada igual a 50%', async ({ page, app }) => {

      const customer = testData.checkout_financiamento_score_baixo_entrada_igual_50

      await deleteOrderByEmail(customer.email)
      await mockCreditAnalysis(page, customer.score)

      // Arrange
      await arrangeCheckout(page, app, customer)

      // Act
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.fillDownPayment(customer.downPayment)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByRole('heading', { name: /Pedido Aprovado/i })).toBeVisible()
    })

    test('deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada mair que 50%', async ({ page, app }) => {

      const customer = testData.checkout_financiamento_score_baixo_entrada_maior_50

      await deleteOrderByEmail(customer.email)
      await mockCreditAnalysis(page, customer.score)

      // Arrange
      await arrangeCheckout(page, app, customer)

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