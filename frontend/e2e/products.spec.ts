import { expect, test } from '@playwright/test';

test.describe('Products', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/products?**', async (route) => {
      const url = new URL(route.request().url());
      const q = url.searchParams.get('q')?.toLowerCase() ?? '';
      const all = [
        { id: 1, name: 'Café Torrado 250g', price: 10, stock: 5, active: true },
        {
          id: 2,
          name: 'Filtro de Papel nº103',
          price: 5,
          stock: 0,
          active: true,
        },
      ];
      const content = all.filter((p) => p.name.toLowerCase().includes(q));
      const body = {
        content,
        totalElements: content.length,
        size: 10,
        number: 0,
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });
  });

  test('busca, paginação e estado de estoque', async ({ page }) => {
    await page.goto('http://localhost:4200/products');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      /catálogo/i
    );

    await page.getByPlaceholder(/buscar por nome/i).fill('filtro');
    await expect(page.locator('.card')).toHaveCount(1);
    await expect(
      page.getByRole('button', { name: /adicionar/i })
    ).toBeDisabled();
  });
});
