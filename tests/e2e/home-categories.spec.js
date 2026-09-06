import { test, expect } from '@playwright/test';

const Categories = [
  { Id: 'personal-care', Name: 'Chăm sóc cá nhân', Slug: 'cham-soc-ca-nhan' },
  { Id: 'home-appliances', Name: 'Đồ điện gia dụng', Slug: 'do-dien-gia-dung' },
  { Id: 'home-cleaning', Name: 'Vệ sinh nhà cửa', Slug: 've-sinh-nha-cua' },
];

const createProduct = (Index, Category) => ({
  ProductId: `product-${Index}`,
  Name: `Sản phẩm ${Index}`,
  Slug: `san-pham-${Index}`,
  ProductCode: `SP-${String(Index).padStart(3, '0')}`,
  CategoryId: Category.Id,
  CategoryName: Category.Name,
  BrandName: 'Dorm Mart',
  ShortDescription: `Mô tả sản phẩm ${Index}`,
  Status: Index === 1 ? 0 : 1,
  AvailableStock: 20,
  HasSellableVariant: true,
  MinSalePrice: 49000 + Index * 1000,
  MaxSalePrice: 49000 + Index * 1000,
  PrimaryImageUrl: null,
});

const Products = Categories.flatMap((Category, CategoryIndex) => [
  createProduct(CategoryIndex * 2 + 1, Category),
  createProduct(CategoryIndex * 2 + 2, Category),
]);

test('home groups products by category in wrapping grids without a horizontal rail', async ({ page }) => {
  let RequestedPageSize = null;

  await page.route('**/api/**', async (Route) => {
    const Url = new URL(Route.request().url());

    if (Url.pathname.endsWith('/categories')) {
      await Route.fulfill({ json: { Data: Categories } });
      return;
    }

    if (Url.pathname.endsWith('/products')) {
      RequestedPageSize = Url.searchParams.get('PageSize');
      await Route.fulfill({
        json: {
          Data: {
            Items: Products,
            Total: Products.length,
            PageIndex: 1,
            PageSize: Products.length,
          },
        },
      });
      return;
    }

    if (Url.pathname.endsWith('/flash-sales')) {
      await Route.fulfill({ json: { Data: [] } });
      return;
    }

    await Route.fulfill({ status: 404, json: { Data: null } });
  });

  await page.goto('/');

  await expect(page.locator('.dm-home-category-section')).toHaveCount(Categories.length);
  await expect(page.locator('.dm-home-category-section .product-card')).toHaveCount(Products.length);
  await expect(page.locator('.dm-home-category-section .dm-badge--primary')).toHaveCount(Products.length);
  await expect(page.locator('.dm-home-category-section .dm-badge--error')).toHaveCount(1);
  await expect(page.locator('.dm-home-hero .dm-badge--warning')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Chăm sóc cá nhân' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Đồ điện gia dụng' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Vệ sinh nhà cửa' })).toBeVisible();
  expect(RequestedPageSize).toBe('48');

  const HasHorizontalOverflow = await page.locator('.dm-home-discover').evaluate(
    (Element) => Element.scrollWidth > Element.clientWidth + 1,
  );
  expect(HasHorizontalOverflow).toBe(false);
  await expect(page.locator('.dm-home-product-rail')).toHaveCount(0);
});
