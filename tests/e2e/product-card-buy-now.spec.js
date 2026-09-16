import { test, expect } from '@playwright/test';

const Product = {
  ProductId: 'product-buy-now',
  Name: 'Bộ đồ dùng nhập trọ',
  Slug: 'bo-do-dung-nhap-tro',
  ProductCode: 'BUY-001',
  CategoryId: 'category-dorm',
  CategoryName: 'Đồ dùng phòng trọ',
  BrandName: 'Dorm Mart',
  ShortDescription: 'Đủ món thiết yếu cho ngày đầu nhập trọ.',
  Status: 1,
  AvailableStock: 10,
  HasSellableVariant: true,
  MinSalePrice: 149000,
  MaxSalePrice: 149000,
  PrimaryImageUrl: null,
};

const ProductDetail = {
  ...Product,
  Variants: [{
    ProductVariantId: 'variant-buy-now',
    Name: 'Mặc định',
    Sku: 'BUY-001-DEFAULT',
    SalePrice: 149000,
    AvailableStock: 10,
    Status: 1,
    IsDefault: true,
  }],
};

const Cart = {
  CartId: 'cart-buy-now',
  Subtotal: 149000,
  Total: 149000,
  ItemCount: 1,
  Items: [{
    CartItemId: 'cart-item-buy-now',
    ProductVariantId: 'variant-buy-now',
    ProductSlug: Product.Slug,
    ProductName: Product.Name,
    VariantName: 'Mặc định',
    PrimaryImageUrl: null,
    UnitPrice: 149000,
    Quantity: 1,
    AvailableStock: 10,
    LineTotal: 149000,
  }],
  Combos: [],
};

test('buy now on a product card adds the product to cart and opens payment', async ({ page }) => {
  let AddCartPayload = null;

  await page.addInitScript(() => {
    window.localStorage.setItem('DORM_MART_ACCESS_TOKEN_V2', 'buy-now-test-token');
    window.localStorage.setItem('DORM_MART_SESSION_V2', JSON.stringify({
      UserId: 'buy-now-user',
      FullName: 'Buy Now User',
      Roles: ['Customer'],
      AccessToken: 'buy-now-test-token',
    }));
  });

  await page.route('**/api/**', async (Route) => {
    const Request = Route.request();
    const Url = new URL(Request.url());

    if (Url.pathname.endsWith(`/products/by-slug/${Product.Slug}`)) {
      await Route.fulfill({ json: { Data: ProductDetail } });
      return;
    }

    if (Url.pathname.endsWith('/products')) {
      await Route.fulfill({
        json: { Data: { Items: [Product], Total: 1, PageIndex: 1, PageSize: 24 } },
      });
      return;
    }

    if (Url.pathname.endsWith('/categories') || Url.pathname.endsWith('/brands') || Url.pathname.endsWith('/flash-sales') || Url.pathname.endsWith('/vouchers')) {
      await Route.fulfill({ json: { Data: [] } });
      return;
    }

    if (Url.pathname.endsWith('/cart/items') && Request.method() === 'POST') {
      AddCartPayload = Request.postDataJSON();
      await Route.fulfill({ json: { Data: Cart } });
      return;
    }

    if (Url.pathname.endsWith('/cart') && Request.method() === 'GET') {
      await Route.fulfill({ json: { Data: Cart } });
      return;
    }

    if (Url.pathname.endsWith('/me/addresses')) {
      await Route.fulfill({ json: { Data: [] } });
      return;
    }

    await Route.fulfill({ status: 404, json: { Data: null } });
  });

  await page.goto('/products');
  const ProductCard = page.locator('.product-card').filter({ hasText: Product.Name });
  await expect(ProductCard).toBeVisible();
  await ProductCard.getByRole('button', { name: 'Mua ngay' }).click();

  await expect(page).toHaveURL(/\/payment$/);
  await expect(page.getByRole('heading', { name: 'Thanh toán', exact: true }).first()).toBeVisible();
  await expect(page.getByText(Product.Name)).toBeVisible();
  expect(AddCartPayload).toEqual({ ProductVariantId: 'variant-buy-now', Quantity: 1 });
});
