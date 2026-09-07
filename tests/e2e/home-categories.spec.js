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

const FlashSales = [{
  Name: 'Flash đồ dùng thiết yếu',
  EndsAt: '2099-12-31T23:59:59Z',
  Items: [{
    ProductVariantId: 'flash-variant-1',
    ProductSlug: 'tui-khan-giay-uot-mini-tien-loi',
    ProductName: 'Túi khăn giấy ướt mini tiện lợi',
    VariantName: 'Túi khăn giấy ướt mini tiện lợi',
    Sku: 'GD-005',
    BrandName: 'Kho Sỉ Hàng Nguyên',
    ShortDescription: 'Khăn giấy ướt mini, set 8 sản phẩm',
    FlashPrice: 21000,
    OriginalPrice: 35000,
    FlashStock: 20,
    SoldCount: 7,
  }],
}];

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
      await Route.fulfill({ json: { Data: FlashSales } });
      return;
    }

    await Route.fulfill({ status: 404, json: { Data: null } });
  });

  await page.goto('/');

  await expect(page.locator('.dm-home-category-section')).toHaveCount(Categories.length);
  await expect(page.locator('.dm-home-category-section .product-card')).toHaveCount(Products.length);
  await expect(page.locator('.dm-home-flash .product-card')).toHaveCount(1);
  await expect(page.locator('.dm-home-flash .dm-product-card')).toHaveCount(0);
  await expect(page.locator('.dm-home-flash .product-card__campaign')).toHaveText('Flash đồ dùng thiết yếu');
  await expect(page.locator('.dm-home-flash .product-card__stock')).toHaveText('Còn 13 sp');
  await expect(page.locator('.dm-home-flash .product-card__price strong')).toHaveText('21.000 ₫');
  await expect(page.locator('.dm-home-flash .product-card__price del')).toHaveText('35.000 ₫');
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
  const FlashCardContentFits = await page.locator('.dm-home-flash .product-card').evaluate((Element) => (
    Element.scrollWidth <= Element.clientWidth + 1 && Element.scrollHeight <= Element.clientHeight + 1
  ));
  expect(FlashCardContentFits).toBe(true);
  const PriceAndButtonDoNotOverlap = await page.locator('.dm-home-flash .product-card').evaluate((Element) => {
    const PriceRect = Element.querySelector('.product-card__price').getBoundingClientRect();
    const ButtonRect = Element.querySelector('.quick-add-cart').getBoundingClientRect();
    return PriceRect.right <= ButtonRect.left;
  });
  expect(PriceAndButtonDoNotOverlap).toBe(true);

  await page.setViewportSize({ width: 360, height: 800 });
  await expect(page.locator('.dm-home-flash .product-card__price strong')).toBeVisible();
  const MobileCardFits = await page.locator('.dm-home-flash .product-card').evaluate((Element) => (
    Element.scrollWidth <= Element.clientWidth + 1
  ));
  expect(MobileCardFits).toBe(true);
  await expect(page.locator('.dm-home-product-rail')).toHaveCount(0);
});
