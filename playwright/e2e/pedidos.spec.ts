import { test } from '../suporte/fixtures'
import { generateOrderCode } from '../suporte/helpers'
import type { OrderDetails } from '../suporte/actions/orderLockupActions'
import { expect } from '@playwright/test'
import { insertTestOrder, deleteOrderByNumber } from '../suporte/db'

test.describe('Consulta de Pedido', () => {
  test.beforeEach(async ({ app }) => {
    await app.orderLockup.open()
  })

  test('deve consultar um pedido aprovado', async ({ app }) => {
    const order: OrderDetails = {
      number: 'VLO-SE4R01',
      status: 'APROVADO',
      color: 'Lunar White',
      wheels: 'sport Wheels',
      customer: {
        name: 'Thiago Souza',
        email: '610thiago@gmail.com',
      },
      payment: 'À Vista',
      total_price: '47500'
    }

    await deleteOrderByNumber(order.number)

    await insertTestOrder({
      order_number: order.number,
      color: 'lunar-white',
      wheel_type: 'sport',
      customer_name: 'Thiago Souza',
      customer_email: '610thiago@gmail.com',
      customer_phone: '(41) 99916-2323',
      customer_cpf: '986.319.540-55',
      payment_method: 'avista',
      total_price: '47500',
      status: 'APROVADO',
      optionals: ['precision-park']
    })

    await app.orderLockup.searchOrder(order.number)

    await app.orderLockup.validateOrderDetails(order)
    await app.orderLockup.validateStatusBadge(order.status)
  })

  test('deve consultar um pedido reprovado', async ({ app }) => {
    const order: OrderDetails = {
      number: 'VLO-SE4R02',
      status: 'REPROVADO',
      color: 'Midnight Black',
      wheels: 'sport Wheels',
      customer: {
        name: 'Steve Jobs',
        email: 'jobs@apple.com',
      },
      payment: 'À Vista',
    }

    await deleteOrderByNumber(order.number)

    await insertTestOrder({
      order_number: order.number,
      color: 'midnight-black',
      wheel_type: 'sport',
      customer_name: 'Steve Jobs',
      customer_email: 'jobs@apple.com',
      customer_phone: '(11) 99999-9999',
      customer_cpf: '123.456.789-00',
      payment_method: 'avista',
      total_price: '47500',
      status: 'REPROVADO',
      optionals: []
    })

    await app.orderLockup.searchOrder(order.number)

    await app.orderLockup.validateOrderDetails(order)
    await app.orderLockup.validateStatusBadge(order.status)
  })

  test('deve consultar um pedido em analise', async ({ app }) => {
    const order: OrderDetails = {
      number: 'VLO-SE4R03',
      status: 'EM_ANALISE',
      color: 'Lunar White',
      wheels: 'aero Wheels',
      customer: {
        name: 'Larissa Souza ',
        email: '610thiago@gmail.com',
      },
      payment: 'À Vista',
    }

    await deleteOrderByNumber(order.number)

    await insertTestOrder({
      order_number: order.number,
      color: 'lunar-white',
      wheel_type: 'aero',
      customer_name: 'Larissa Souza ',
      customer_email: '610thiago@gmail.com',
      customer_phone: '(41) 99916-3434',
      customer_cpf: '075.590.339-03',
      payment_method: 'avista',
      total_price: '47500',
      status: 'EM_ANALISE',
      optionals: []
    })

    await app.orderLockup.searchOrder(order.number)

    await app.orderLockup.validateOrderDetails(order)
    await app.orderLockup.validateStatusBadge(order.status)
  })

  test('deve exibir mensagem quando o pedido não é encontrado', async ({ app }) => {
    const order = generateOrderCode()

    await app.orderLockup.searchOrder(order)
    await app.orderLockup.validateOrderNotFound()
  })

  test('deve exibir mensagem quando o código do pedido está fora do padrão', async ({ app }) => {
    const orderCode = 'XYZ-999-INVALIDO'

    await app.orderLockup.searchOrder(orderCode)
    await app.orderLockup.validateOrderNotFound()
  })
  test('deve manter o botão de busca desabilitado com campo vazio ou apenas espaços', async ({ app }) => {
    const button = app.orderLockup.elements.searchButton
    await expect(button).toBeDisabled()

    await app.orderLockup.elements.orderInput.fill('     ')
    await expect(button).toBeDisabled()
  })
})