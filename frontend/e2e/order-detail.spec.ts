import { expect, test } from '@playwright/test';

test.describe('Order detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/orders/7', async (route) => {
      const body = {
        id: 7,
        total: 33,
        items: [
          {
            productId: 1,
            name: 'Café',
            quantity: 2,
            unitPrice: 10,
            lineTotal: 20,
          },
        ],
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });
  });

  test('renderiza cabeçalho e itens', async ({ page }) => {
    await page.goto('http://localhost:4200/orders/7');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      /pedido #7/i
    );
    await expect(page.getByRole('button', { name: /imprimir/i })).toBeVisible();
    await expect(
      page.getByRole('table', { name: /itens do pedido/i })
    ).toBeVisible();
  });
});
