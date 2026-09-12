import { test, expect } from '@playwright/test';

test('account filters reset pagination and tolerate missing fields', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('DORM_MART_ACCESS_TOKEN_V2', 'admin-test-token');
    localStorage.setItem('DORM_MART_SESSION_V2', JSON.stringify({ UserId: 'admin-1', FullName: 'Admin Test', Roles: ['Admin'], AccessToken: 'admin-test-token' }));
  });
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    const Data = path.endsWith('/admin/accounts') ? Array.from({ length: 14 }, (_, i) => ({
      UserId: `user-${i}`, FullName: i ? `Customer ${i}` : null, Email: i ? `customer${i}@example.test` : null,
      Phone: null, CreatedAt: i ? '2026-09-01T10:00:00Z' : 'invalid-date', OrderCount: i,
      StatusCode: i === 13 ? 'LOCKED' : 'ACTIVE',
    })) : path.endsWith('/unread-count') ? 0 : [];
    await route.fulfill({ json: { Data } });
  });
  await page.goto('/admin/accounts');
  await expect(page.locator('tbody tr')).toHaveCount(12);
  await expect(page.locator('tbody tr').first()).toContainText('Chưa có tên');
  await page.getByRole('button', { name: 'Trang sau' }).click();
  await expect(page.locator('tbody tr')).toHaveCount(2);
  await page.getByRole('combobox').selectOption('LOCKED');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.getByText('Trang 1 / 1', { exact: true })).toBeVisible();
  await page.getByRole('combobox').selectOption('all');
  await page.locator('.admin-accounts-search input').fill('no-such-customer');
  await expect(page.getByRole('heading', { name: 'Không tìm thấy tài khoản' })).toBeVisible();
  await page.locator('.admin-accounts-search input').fill('user-0');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.locator('tbody tr')).toContainText('Chưa có email');
});
