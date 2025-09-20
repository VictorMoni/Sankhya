import { expect, test } from '@playwright/test';

test.describe('Home', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/orders?**', async (route) => {
      const body = {
        content: [
          {
            id: 9,
            createdAt: new Date().toISOString(),
            total: 50,
            itemsCount: 3,
          },
        ],
        totalElements: 1,
        size: 5,
        number: 0,
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });
    await page.route('**/products?**', async (route) => {
      const body = {
        content: [
          {
            id: 1,
            name: 'Café Torrado 250g',
            price: 10,
            stock: 10,
            active: true,
          },
        ],
        totalElements: 1,
        size: 6,
        number: 0,
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });
  });

  test('carrega e mostra pedidos recentes e CTA para catálogo/carrinho', async ({
    page,
  }) => {
    await page.goto('http://localhost:4200/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      /bem-vindo/i
    );
    await expect(
      page.getByRole('link', { name: /ir ao catálogo|finalizar pedido/i })
    ).toBeVisible();
    await expect(page.locator('.orders .order-link')).toHaveCount(1);
  });
});
