import { test, expect } from '@playwright/test';

const Pixel = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';

const FlashSales = [
  {
    FlashSaleId: 'flash-2',
    Name: 'Flash Sale thứ hai',
    sortOrder: 2,
    EndsAt: '2099-12-31T23:59:59Z',
    Items: [{
      ProductVariantId: 'variant-2',
      ProductSlug: 'san-pham-flash-2',
      ProductName: 'Sản phẩm Flash 2',
      VariantName: 'Sản phẩm Flash 2',
      Sku: 'FLASH-2',
      PrimaryImageUrl: Pixel,
      FlashPrice: 49000,
      OriginalPrice: 79000,
      FlashStock: 10,
      SoldCount: 2,
    }],
  },
  {
    FlashSaleId: 'flash-1',
    Name: 'Flash Sale chung nhóm',
    SortOrder: 1,
    EndsAt: '2099-11-30T23:59:59Z',
    Items: [{
      ProductVariantId: 'variant-1',
      ProductSlug: 'san-pham-flash-1',
      ProductName: 'Sản phẩm Flash 1',
      VariantName: 'Sản phẩm Flash 1',
      Sku: 'FLASH-1',
      PrimaryImageUrl: Pixel,
      FlashPrice: 29000,
      OriginalPrice: 59000,
      FlashStock: 12,
      SoldCount: 1,
    }],
  },
];

const createCombo = (Id, Name, SortOrder) => ({
  ComboId: Id,
  ComboCode: Id.toUpperCase(),
  Name,
  Slug: Id,
  CategoryCode: 'ESSENTIAL',
  CategoryName: 'Thiết yếu',
  Description: 'Combo dành cho sinh viên',
  Badge: 'Tiết kiệm',
  Icon: 'redeem',
  Theme: 'BLUE',
  OriginalPrice: 200000,
  ComboPrice: 150000,
  Rating: 4.8,
  SoldCount: 20,
  SortOrder,
  Items: [{
    ComboItemId: `${Id}-item`,
    ProductName: 'Sản phẩm trong combo',
    Quantity: 2,
    ImageUrl: Pixel,
  }],
});

const Combos = [
  createCombo('combo-unsorted', 'Combo chưa xếp thứ tự', null),
  createCombo('combo-shared', 'Combo chung nhóm', 1),
];

test('promotion page groups flash sales and combos by SortOrder', async ({ page }) => {
  const PageErrors = [];
  page.on('pageerror', (Error) => PageErrors.push(Error.message));

  await page.route('**/api/**', async (Route) => {
    const Url = new URL(Route.request().url());

    if (Url.pathname.endsWith('/flash-sales')) {
      await Route.fulfill({ json: { Data: FlashSales } });
      return;
    }

    if (Url.pathname.endsWith('/combos')) {
      await Route.fulfill({ json: { Data: Combos } });
      return;
    }

    await Route.fulfill({ status: 404, json: { Data: null } });
  });

  await page.goto('/promotions');

  await expect(page.getByRole('heading', { name: 'Tất cả ưu đãi tại Dorm Mart' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Khuyến mãi', exact: true })).toBeVisible();
  await expect(page.locator('.promotion-group')).toHaveCount(3);
  await expect(page.locator('.promotion-group').first()).toHaveAttribute('data-sort-order', '1');

  const GroupOrders = await page.locator('.promotion-group').evaluateAll((Elements) => (
    Elements.map((Element) => Element.dataset.sortOrder)
  ));
  expect(GroupOrders).toEqual(['1', '2', 'unsorted']);

  const SharedGroup = page.locator('.promotion-group[data-sort-order="1"]');
  await expect(SharedGroup).toContainText('Flash Sale chung nhóm');
  await expect(SharedGroup).toContainText('Combo chung nhóm');
  await expect(SharedGroup.locator('.product-card')).toHaveCount(1);
  await expect(SharedGroup.locator('.combo-card')).toHaveCount(1);
  await expect(page.locator('.vite-error-overlay')).toHaveCount(0);
  await page.screenshot({ path: 'test-results/promotions-desktop.png', fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  const HasMobileOverflow = await page.locator('.promotion-page').evaluate(
    (Element) => Element.scrollWidth > Element.clientWidth + 1,
  );
  expect(HasMobileOverflow).toBe(false);
  await page.screenshot({ path: 'test-results/promotions-mobile.png', fullPage: true });

  await page.getByRole('button', { name: 'Flash Sale', exact: true }).click();
  await expect(page).toHaveURL(/\/promotions\?type=flash-sale$/);
  await expect(page.locator('.combo-card')).toHaveCount(0);
  await expect(page.locator('.product-card')).toHaveCount(2);

  await page.getByRole('button', { name: 'Combo', exact: true }).click();
  await expect(page).toHaveURL(/\/promotions\?type=combo$/);
  await expect(page.locator('.product-card')).toHaveCount(0);
  await expect(page.locator('.combo-card')).toHaveCount(2);

  const HasHorizontalOverflow = await page.locator('.promotion-page').evaluate(
    (Element) => Element.scrollWidth > Element.clientWidth + 1,
  );
  expect(HasHorizontalOverflow).toBe(false);
  expect(PageErrors).toEqual([]);
});
