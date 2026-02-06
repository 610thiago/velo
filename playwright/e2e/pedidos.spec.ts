import { test, expect } from '@playwright/test'


/// AAA - Arrange, Act, Assert - Preparar, Agir, verificar

test('deve consultar um pedido aprovado', async ({ page }) => {
  //Arrange
  await page.goto('http://localhost:5173/')
  await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')

  await page.getByRole('link', { name: 'Consultar Pedido' }).click()
  await expect(page.getByRole('heading')).toContainText('Consultar Pedido')

  //Act
  await page.getByRole('textbox', { name: 'Número do Pedido' }).fill('VLO-EMP0B6')
  await page.getByRole('button', { name: 'Buscar Pedido' }).click()

  //Assert
  await expect(page.getByText('VLO-EMP0B6')).toBeVisible({timeout: 10000});
  await expect(page.getByTestId('order-result-VLO-EMP0B6')).toContainText('VLO-EMP0B6');

  await expect(page.getByText('APROVADO')).toBeVisible()
  await expect(page.getByTestId('order-result-VLO-EMP0B6')).toContainText('APROVADO');

  
})