import { test, expect } from '@playwright/test'

test('a has title', async ({ page }) => {
  await page.goto('http://localhost:5173')

  await expect(page).toHaveTitle(/Velô by Papito/)
})
