import { test, expect } from '@playwright/test';

test('admin modules show API fields, usable empty states, and progressive forms', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('DORM_MART_ACCESS_TOKEN_V2', 'admin-test-token');
    localStorage.setItem('DORM_MART_SESSION_V2', JSON.stringify({ UserId: 'admin-1', FullName: 'Admin Test', Roles: ['Admin'], AccessToken: 'admin-test-token' }));
  });
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    let Data = [];
    if (path.endsWith('/admin/products')) Data = { Items: [{ ProductId: 'p1', Name: 'Bàn học', ProductCode: 'BAN-1', CategoryName: 'Nội thất', BrandName: 'Dorm', MinSalePrice: 100000, MaxSalePrice: 100000, AvailableStock: 17, HasSellableVariant: true, Status: 1 }], Total: 1, PageIndex: 1, PageSize: 12 };
    if (path.endsWith('/admin/finance/summary') || path.endsWith('/admin/finance/profit')) Data = { ProductRevenue: 100000, CostOfGoodsSold: 60000, StoreShippingFee: 5000, PaymentFee: 1000, RefundAmount: 0, ExpenseAmount: 0, GrossProfit: 34000, GrossMarginPercent: 34, CompletedOrderCount: 2 };
    if (path.endsWith('/admin/finance/revenue')) Data = [{ Period: '2026-09', ProductRevenue: 100000, CompletedOrderCount: 2 }];
    if (path.endsWith('/categories')) Data = [{ Id: 'c1', Name: 'Nội thất', Slug: 'noi-that', Description: 'Mô tả' }];
    if (path.endsWith('/brands')) Data = [{ Id: 'b1', Name: 'Dorm', Slug: 'dorm', Description: 'Mô tả' }];
    if (path.endsWith('/unread-count')) Data = 0;
    await route.fulfill({ json: { Data } });
  });

  await page.goto('/admin/products');
  await expect(page.getByRole('heading', { name: 'Tạo sản phẩm' })).toHaveCount(0);
  await expect(page.getByRole('cell', { name: '17' })).toBeVisible();
  await page.getByRole('button', { name: 'Tạo mới' }).click();
  await expect(page.getByRole('heading', { name: 'Tạo sản phẩm' })).toBeVisible();
  await page.getByRole('button', { name: 'Đóng' }).click();
  await expect(page.getByRole('heading', { name: 'Tạo sản phẩm' })).toHaveCount(0);

  await page.goto('/admin/categories');
  await expect(page.getByRole('heading', { name: 'Tạo danh mục' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Tạo mới' }).click();
  await expect(page.getByRole('heading', { name: 'Tạo danh mục' })).toBeVisible();

  await page.goto('/admin/finance');
  await expect(page.getByRole('heading', { name: 'Cấu phần tài chính' })).toBeVisible();
  await expect(page.getByText('2 đơn', { exact: true })).toBeVisible();
  await expect(page.getByText('Chưa có khoản chi nào trong kỳ.')).toBeVisible();

  await page.goto('/admin/support');
  await expect(page.getByText('Không có yêu cầu hỗ trợ')).toBeVisible();
  await page.goto('/admin/reviews');
  await expect(page.getByRole('heading', { name: 'Không có đánh giá phù hợp' })).toBeVisible();

  await page.goto('/admin');
  await page.getByRole('search').getByRole('searchbox').fill('ORD-123');
  await page.getByRole('button', { name: 'Tìm kiếm' }).click();
  await expect(page).toHaveURL(/\/admin\/orders\?Search=ORD-123/);
});
