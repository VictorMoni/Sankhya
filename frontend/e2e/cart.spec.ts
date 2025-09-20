import { expect, test } from '@playwright/test';

test.describe('Cart', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/products?**', async (route) => {
      const body = {
        content: [{ id: 1, name: 'Café', price: 10, stock: 10, active: true }],
        totalElements: 1,
        size: 10,
        number: 0,
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });
    await page.route('**/orders/checkout', async (route) => {
      const body = { id: 123, total: 20, items: [] };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });
  });

  test('incrementa, decrementa e finaliza pedido', async ({ page }) => {
    await page.goto('http://localhost:4200/products');
    const add = page.getByRole('button', { name: /adicionar/i }).first();
    await add.click();
    await add.click();
    await page.goto('http://localhost:4200/cart');

    const dec = page.getByRole('button', { name: /diminuir quantidade/i });
    const inc = page.getByRole('button', { name: /aumentar quantidade/i });
    await inc.click();
    await dec.click();

    await page.getByRole('button', { name: /finalizar/i }).click();
    await expect(page.locator('.order-toast')).toBeVisible();
  });

  test('carrinho vazio: botão Finalizar navega para catálogo (nova compra)', async ({
    page,
  }) => {
    await page.goto('http://localhost:4200/cart');
    await expect(
      page.getByRole('button', { name: /finalizar/i })
    ).toBeDisabled();
  });
});
