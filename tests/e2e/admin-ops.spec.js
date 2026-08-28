import { test, expect } from '@playwright/test';
import { loginAdminViaUi, registerViaUi } from './helpers/auth';

test('admin pages load and key actions render', async ({ page }) => {
  await loginAdminViaUi(page);
  await expect(page).toHaveURL(/\/$/);

  await page.goto('/admin/orders');
  await expect(page.getByRole('heading', { name: /đơn hàng/i })).toBeVisible();
  await expect(page.getByText(/Payment:/)).toBeVisible();

  await page.goto('/admin/finance');
  await expect(page.getByRole('heading', { name: /tài chính/i })).toBeVisible();
  await expect(page.getByText(/Đã lưu khoản chi\.|Doanh thu|Lợi nhuận/i)).toBeVisible();

  const throwaway = await registerViaUi(page, { email: undefined, fullName: 'Admin Target' });
  await loginAdminViaUi(page);
  await page.goto('/admin/accounts');
  await expect(page.getByRole('heading', { name: /tài khoản/i })).toBeVisible();
  await page.getByPlaceholder(/tìm/i).fill(throwaway.email);
  await expect(page.getByText(throwaway.email)).toBeVisible();

  await page.goto('/admin/support');
  await expect(page.getByRole('heading', { name: /hỗ trợ/i })).toBeVisible();
});
