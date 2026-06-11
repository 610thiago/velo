import { Page, expect } from '@playwright/test'

export function createVehicleConfiguratorActions(page: Page) {
  const salePrice = page.getByText('Preço de Venda').locator('..').getByText(/^R\$/)
  const carPreview = page.getByRole('img', { name: /Velô Sprint - .* with .* wheels/i })
  const modelHeading = page.getByRole('heading', { name: 'Velô Sprint' })
  const checkoutButton = page.getByRole('button', { name: 'Monte o Seu' })

  return {
    elements: {
      salePrice,
      carPreview,
      modelHeading,
      checkoutButton,
      colorButton: (name: string) => page.getByRole('button', { name }),
      wheelsButton: (name: string) => page.getByRole('button', { name: new RegExp(name, 'i') }),
      optionalCheckbox: (name: string) => page.getByRole('checkbox', { name: new RegExp(name, 'i') }),
    },

    async open() {
      await page.goto('/configure')
      await expect(page).toHaveURL(/\/configure$/)
      await expect(modelHeading).toBeVisible()
    },

    async selectColor(colorName: string) {
      await this.elements.colorButton(colorName).click()
    },

    async selectWheels(wheelsName: string) {
      await this.elements.wheelsButton(wheelsName).click()
    },

    async setOptional(optionalName: string, checked: boolean) {
      const optional = this.elements.optionalCheckbox(optionalName)
      if (checked) {
        await optional.check()
        return
      }
      await optional.uncheck()
    },

    async validateBaseState() {
      await expect(salePrice).toHaveText('R$ 40.000,00')
      await expect(carPreview).toHaveAttribute('alt', /with aero wheels/i)
    },

    async validateSalePrice(expectedPrice: string) {
      await expect(salePrice).toHaveText(expectedPrice)
    },

    async validatePreviewAlt(expected: RegExp) {
      await expect(carPreview).toHaveAttribute('alt', expected)
    },

    async goToCheckout() {
      await checkoutButton.click()
      await expect(page).toHaveURL(/\/order$/)
    },

    async validateCheckoutTotal(expectedPrice: string) {
      await expect(page.getByRole('heading', { name: 'Resumo' })).toBeVisible()
      await expect(page.getByText('Total').locator('..').getByText(expectedPrice)).toBeVisible()
    },

    async expectPrice(expectedPrice: string) {
      await this.validateSalePrice(expectedPrice);
    },

    async expectCarImageSrc(expectedSrc: string) {
      const normalizedExpectedSrc = expectedSrc.replace(/^\/+|\/+$/g, '')
      await expect(this.elements.carPreview).toHaveAttribute('src', new RegExp(normalizedExpectedSrc))
    },

    async checkOptional(optionalName: string) {
      await this.setOptional(optionalName, true);
    },

    async uncheckOptional(optionalName: string) {
      await this.setOptional(optionalName, false);
    },

    async finishConfigurator() {
      await this.goToCheckout();
    },
  }
}
