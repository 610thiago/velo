import { expect, test } from '../suporte/fixtures'

test.describe('Configuração do Veículo', () => {
  test.beforeEach(async ({ app }) => {
    await app.vehicleConfigurator.open()
  })

  test('deve atualizar a visualização ao alterar a cor, mantendo o preço base', async ({ app }) => {
    await app.vehicleConfigurator.validateBaseState()
    await app.vehicleConfigurator.selectColor('Lunar White')

    await expect(app.vehicleConfigurator.elements.colorButton('Lunar White')).toBeVisible()
    await app.vehicleConfigurator.validateSalePrice('R$ 40.000,00')
    await app.vehicleConfigurator.validatePreviewAlt(/lunar-white with aero wheels/i)
  })

  test('deve atualizar o preço e a visualização apenas ao alterar as rodas', async ({ app }) => {
    await app.vehicleConfigurator.validateBaseState()

    await app.vehicleConfigurator.selectWheels('Sport Wheels')
    await expect(app.vehicleConfigurator.elements.wheelsButton('Sport Wheels')).toBeVisible()
    await app.vehicleConfigurator.validateSalePrice('R$ 42.000,00')
    await app.vehicleConfigurator.validatePreviewAlt(/with sport wheels/i)

    await app.vehicleConfigurator.selectWheels('Aero Wheels')
    await expect(app.vehicleConfigurator.elements.wheelsButton('Aero Wheels')).toBeVisible()
    await app.vehicleConfigurator.validateSalePrice('R$ 40.000,00')
    await app.vehicleConfigurator.validatePreviewAlt(/with aero wheels/i)
  })

  test('deve atualizar o preço ao adicionar opcionais e persistir no checkout', async ({ app }) => {
    await app.vehicleConfigurator.validateBaseState()

    await app.vehicleConfigurator.setOptional('Precision Park', true)
    await app.vehicleConfigurator.validateSalePrice('R$ 45.500,00')

    await app.vehicleConfigurator.setOptional('Flux Capacitor', true)
    await app.vehicleConfigurator.validateSalePrice('R$ 50.500,00')

    await app.vehicleConfigurator.setOptional('Precision Park', false)
    await app.vehicleConfigurator.validateSalePrice('R$ 45.000,00')

    await app.vehicleConfigurator.setOptional('Flux Capacitor', false)
    await app.vehicleConfigurator.validateSalePrice('R$ 40.000,00')

    await app.vehicleConfigurator.goToCheckout()
    await app.vehicleConfigurator.validateCheckoutTotal('R$ 40.000,00')
  })
})
