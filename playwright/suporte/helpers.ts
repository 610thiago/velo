export function generateOrderCode() {
  const prefix = 'VLO'
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

  let randomPart = ''

  for (let i = 0; i < 6; i++) {
    const index = Math.floor(Math.random() * chars.length)
    randomPart += chars[index]
  }

  return `${prefix}-${randomPart}`
}

import type { Page } from '@playwright/test'

export async function openConfigurator(page: Page) {
  await page.goto('/')
  await page.getByRole('link', { name: /Configure Agora/i }).click()
}

export async function mockCreditAnalysis(page: Page, score: number) {
  await page.route('**/functions/v1/credit-analysis', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'Done', score }),
    })
  })
}

export async function arrangeCheckout(page: Page, app: any, customer: {
  name: string
  lastname: string
  email: string
  document: string
  phone: string
  store: string
  totalPrice: string
}) {
  await openConfigurator(page)
  await app.configurator.expectPrice(customer.totalPrice)
  await app.configurator.finishConfigurator()
  await app.checkout.expectLoaded()
  await app.checkout.fillCustomerlData(customer)
  await app.checkout.selectStore(customer.store)
}
