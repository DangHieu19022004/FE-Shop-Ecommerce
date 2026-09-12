import { test, expect } from '@playwright/test';

test('dashboard uses account and order statuses and recovers after an API failure', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('DORM_MART_ACCESS_TOKEN_V2', 'admin-test-token');
    localStorage.setItem('DORM_MART_SESSION_V2', JSON.stringify({ UserId: 'admin-1', FullName: 'Admin Test', Roles: ['Admin'], AccessToken: 'admin-test-token' }));
  });
  let failed = false;
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (failed && path.endsWith('/admin/finance/summary')) {
      await route.fulfill({ status: 400, json: { Message: 'Không thể đọc báo cáo' } });
      return;
    }
    let Data = [];
    if (path.endsWith('/admin/finance/summary')) Data = { ProductRevenue: 1250000, GrossProfit: 250000 };
    if (path.endsWith('/admin/accounts')) Data = [{ StatusCode: 'ACTIVE' }, { StatusCode: 'LOCKED' }];
    if (path.endsWith('/admin/orders')) Data = [
      { OrderId: 'old', OrderCode: 'ORDER-OLD', Status: 6, Total: 150000, CreateDate: '2026-09-01T10:00:00Z', PaymentMethod: 0 },
      { OrderId: 'new', OrderCode: 'ORDER-NEW', Status: 0, Total: 250000, CreateDate: '2026-09-02T10:00:00Z', PaymentMethod: 1 },
      { OrderId: 'unknown', OrderCode: 'ORDER-UNKNOWN', Status: null, Total: null, CreateDate: null },
    ];
    if (path.endsWith('/unread-count')) Data = 0;
    await route.fulfill({ json: { Data } });
  });
  await page.goto('/admin');
  const metrics = page.locator('.admin-metric__value');
  await expect(metrics).toHaveCount(4);
  await expect(metrics.nth(2)).toHaveText('1');
  await expect(metrics.nth(3)).toHaveText('1');
  await expect(page.locator('tbody tr').first()).toContainText('ORDER-NEW');
  failed = true;
  await page.getByRole('button', { name: 'Tải lại dữ liệu' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Không thể tải dữ liệu tổng quan' })).toBeVisible();
  await expect(metrics).toHaveCount(0);
  failed = false;
  await page.getByRole('button', { name: 'Tải lại dữ liệu' }).click();
  await expect(metrics).toHaveCount(4);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('button', { name: 'Tải lại dữ liệu' })).toBeVisible();
  await expect(page.locator('.dm-admin__sidebar')).toBeHidden();
  await page.getByRole('button', { name: 'Mở rộng menu quản trị' }).click();
  await expect(page.locator('.dm-admin__sidebar')).toBeVisible();
  await page.getByRole('button', { name: 'Đóng menu quản trị' }).click();
  await expect(page.locator('.dm-admin__sidebar')).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
