import { test } from '../suporte/fixtures'

import { generateOrderCode } from '../suporte/helpers'

import type { OrderDetails } from '../suporte/actions/orderLockupActions'

test.describe('Consulta de Pedido', () => {
  test.beforeEach(async ({ app }) => {
    await app.orderLockup.open()
  })

  test('deve consultar um pedido aprovado', async ({ app }) => {
    const order: OrderDetails = {
      number: 'VLO-EMP0B6',
      status: 'APROVADO',
      color: 'Lunar White',
      wheels: 'sport Wheels',
      customer: {
        name: 'Thiago Souza',
        email: '610thiago@gmail.com',
      },
      payment: 'À Vista',
    }

    await app.orderLockup.searchOrder(order.number)

    await app.orderLockup.validateOrderDetails(order)
    await app.orderLockup.validateStatusBadge(order.status)
  })

  test('deve consultar um pedido reprovado', async ({ app }) => {
    const order: OrderDetails = {
      number: 'VLO-5Z2TS9',
      status: 'REPROVADO',
      color: 'Midnight Black',
      wheels: 'sport Wheels',
      customer: {
        name: 'Steve Jobs',
        email: 'jobs@apple.com',
      },
      payment: 'À Vista',
    }

    await app.orderLockup.searchOrder(order.number)

    await app.orderLockup.validateOrderDetails(order)
    await app.orderLockup.validateStatusBadge(order.status)
  })

  test('deve consultar um pedido em analise', async ({ app }) => {
    const order: OrderDetails = {
      number: 'VLO-FS5J1I',
      status: 'EM_ANALISE',
      color: 'Lunar White',
      wheels: 'aero Wheels',
      customer: {
        name: 'Larissa Souza ',
        email: '610thiago@gmail.com',
      },
      payment: 'À Vista',
    }

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
})
