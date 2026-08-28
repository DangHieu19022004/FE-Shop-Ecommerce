import { test, expect } from '@playwright/test';
import { loginAdminViaUi, loginViaUi, registerViaUi } from './helpers/auth';

test('support, loyalty, notifications, reviews pages load', async ({ page }) => {
  const account = await registerViaUi(page);
  await loginViaUi(page, account.email, account.password);

  await page.goto('/support');
  await expect(page.getByRole('heading', { name: /hỗ trợ/i })).toBeVisible();
  await page.getByLabel('Tiêu đề').fill('Playwright support');
  await page.getByPlaceholder('Mô tả vấn đề').fill('Need support from Playwright');
  await page.getByRole('button', { name: 'Tạo ticket' }).click();
  await expect(page.getByText('Đã tạo ticket hỗ trợ.')).toBeVisible();

  await page.goto('/profile/loyalty');
  await expect(page.getByRole('heading', { name: 'Điểm thưởng' })).toBeVisible();

  await page.goto('/profile/notifications');
  await expect(page.getByRole('heading', { name: 'Thông báo' })).toBeVisible();

  await page.goto('/profile/reviews');
  await expect(page.getByRole('heading', { name: /đánh giá/i })).toBeVisible();

  await loginAdminViaUi(page);
  await page.goto('/admin/reviews');
  await expect(page.getByRole('heading', { name: /đánh giá/i })).toBeVisible();
});
