import { test, expect } from '@playwright/test';

const TotalProducts = 18;
const PageSize = 12;
const PixelImage = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

const createProduct = (Index) => ({
  ProductId: `product-${Index}`,
  Name: `Sản phẩm ${Index}`,
  Slug: `san-pham-${Index}`,
  ProductCode: `SP-${String(Index).padStart(3, '0')}`,
  CategoryId: 'category-1',
  CategoryName: 'Đồ dùng sinh viên',
  BrandName: 'Dorm Mart',
  ShortDescription: `Mô tả sản phẩm ${Index}`,
  Status: 1,
  AvailableStock: 10,
  HasSellableVariant: true,
  MinSalePrice: 50000 + Index * 1000,
  MaxSalePrice: 50000 + Index * 1000,
  PrimaryImageUrl: PixelImage,
});

test('product list uses the shared paging footer to navigate API pages', async ({ page }) => {
  const RequestedPages = [];

  await page.route('**/api/**', async (Route) => {
    const Url = new URL(Route.request().url());

    if (Url.pathname.endsWith('/products')) {
      const PageIndex = Number(Url.searchParams.get('PageIndex')) || 1;
      RequestedPages.push(PageIndex);
      const StartIndex = (PageIndex - 1) * PageSize;
      const ItemCount = Math.max(0, Math.min(PageSize, TotalProducts - StartIndex));
      const Items = Array.from({ length: ItemCount }, (_, Index) => createProduct(StartIndex + Index + 1));
      await Route.fulfill({
        json: { Data: { Items, Total: TotalProducts, PageIndex, PageSize } },
      });
      return;
    }

    if (Url.pathname.endsWith('/categories')) {
      await Route.fulfill({ json: { Data: [{ Id: 'category-1', Name: 'Đồ dùng sinh viên', Slug: 'do-dung-sinh-vien' }] } });
      return;
    }

    if (Url.pathname.endsWith('/brands')) {
      await Route.fulfill({ json: { Data: [] } });
      return;
    }

    await Route.fulfill({ status: 404, json: { Data: null } });
  });

  await page.goto('/products');

  const Footer = page.locator('.dm-paging-footer');
  const PreviousButton = page.getByRole('button', { name: 'Trang trước' });
  const NextButton = page.getByRole('button', { name: 'Trang sau' });

  await expect(Footer).toContainText('Tổng số 18 sản phẩm');
  await expect(Footer.locator('.dm-paging-footer__page')).toHaveText(/1\s*\/\s*2/);
  await expect(page.locator('.product-card')).toHaveCount(12);
  await expect(page.locator('.product-card .dm-badge--primary')).toHaveCount(12);
  await expect(PreviousButton).toBeDisabled();
  await expect(NextButton).toBeEnabled();

  await NextButton.click();
  await expect(page).toHaveURL(/PageIndex=2/);
  await expect(Footer.locator('.dm-paging-footer__page')).toHaveText(/2\s*\/\s*2/);
  await expect(page.locator('.product-card')).toHaveCount(6);
  await expect(PreviousButton).toBeEnabled();
  await expect(NextButton).toBeDisabled();
  expect(RequestedPages).toContain(2);
});

test('admin product list reuses the shared paging footer', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('DORM_MART_ACCESS_TOKEN_V2', 'admin-test-token');
    window.localStorage.setItem('DORM_MART_SESSION_V2', JSON.stringify({
      UserId: 'admin-1',
      FullName: 'Admin Test',
      Email: 'admin@example.com',
      Roles: ['Admin'],
      AccessToken: 'admin-test-token',
    }));
  });

  await page.route('**/api/**', async (Route) => {
    const Url = new URL(Route.request().url());

    if (Url.pathname.endsWith('/admin/products')) {
      const PageIndex = Number(Url.searchParams.get('PageIndex')) || 1;
      const StartIndex = (PageIndex - 1) * PageSize;
      const ItemCount = Math.max(0, Math.min(PageSize, TotalProducts - StartIndex));
      const Items = Array.from({ length: ItemCount }, (_, Index) => createProduct(StartIndex + Index + 1));
      await Route.fulfill({ json: { Data: { Items, Total: TotalProducts, PageIndex, PageSize } } });
      return;
    }

    if (Url.pathname.endsWith('/categories')) {
      await Route.fulfill({ json: { Data: [{ Id: 'category-1', Name: 'Đồ dùng sinh viên', Slug: 'do-dung-sinh-vien' }] } });
      return;
    }

    if (Url.pathname.endsWith('/brands')) {
      await Route.fulfill({ json: { Data: [] } });
      return;
    }

    await Route.fulfill({ status: 404, json: { Data: null } });
  });

  await page.goto('/admin/products');

  const Footer = page.locator('.dm-paging-footer');
  await expect(page).toHaveURL(/\/admin\/products$/);
  await expect(Footer).toContainText('Tổng số 18 sản phẩm');
  await expect(Footer.locator('.dm-paging-footer__page')).toHaveText(/1\s*\/\s*2/);
  await expect(page.locator('tbody tr')).toHaveCount(12);
  await expect(page.locator('tbody .dm-badge--success')).toHaveCount(12);

  await page.getByRole('button', { name: 'Trang sau' }).click();
  await expect(Footer.locator('.dm-paging-footer__page')).toHaveText(/2\s*\/\s*2/);
  await expect(page.locator('tbody tr')).toHaveCount(6);
});
