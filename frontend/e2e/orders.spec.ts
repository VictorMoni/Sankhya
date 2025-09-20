import { expect, test } from '@playwright/test';

test.describe('Orders list', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/orders?**', async (route) => {
      const url = new URL(route.request().url());
      const pageNum = Number(url.searchParams.get('page') ?? 0);
      const size = Number(url.searchParams.get('size') ?? 10);
      const content = Array.from({ length: Math.min(3, size) }).map((_, i) => ({
        id: i + 1 + pageNum * size,
        createdAt: new Date().toISOString(),
        total: 10 * (i + 1),
        itemsCount: i + 1,
      }));
      const body = { content, totalElements: 25, size, number: pageNum };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });
  });

  test('lista pedidos e paginação', async ({ page }) => {
    await page.goto('http://localhost:4200/orders');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      /pedidos/i
    );
    await expect(page.locator('.list .item')).toHaveCount(3);
    const next = page.getByRole('button', { name: /próxima/i });
    await next.click();
    await expect(page.locator('.list .item')).toHaveCount(3);
  });
});
