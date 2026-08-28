import { test, expect } from '@playwright/test';
import { loginViaUi, registerViaUi } from './helpers/auth';

test('register, login, add address, open loyalty and notifications', async ({ page }) => {
  const account = await registerViaUi(page);

  await loginViaUi(page, account.email, account.password);
  await expect(page).toHaveURL(/\/$/);

  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: 'Hồ sơ của tôi' })).toBeVisible();

  await page.getByLabel('Người nhận').fill('Playwright Receiver');
  await page.getByLabel('Số điện thoại').fill('0900000001');
  await page.getByLabel('Địa chỉ').fill('123 Playwright Street');
  await page.getByLabel('Phường/Xã').fill('Ward 1');
  await page.getByLabel('Quận/Huyện').fill('District 1');
  await page.getByLabel('Tỉnh/Thành').fill('HCM');
  await page.getByRole('checkbox', { name: 'Đặt làm mặc định' }).check();
  await page.getByRole('button', { name: 'Tạo địa chỉ' }).click();
  await expect(page.getByText('Đã tạo địa chỉ.')).toBeVisible();
  await expect(page.getByText('Playwright Receiver · 0900000001')).toBeVisible();

  await page.getByRole('link', { name: 'Điểm thưởng' }).click();
  await expect(page).toHaveURL(/\/profile\/loyalty$/);
  await expect(page.getByRole('heading', { name: 'Điểm thưởng' })).toBeVisible();

  await page.getByRole('link', { name: 'Quay lại hồ sơ' }).click();
  await page.getByRole('link', { name: 'Thông báo' }).click();
  await expect(page).toHaveURL(/\/profile\/notifications$/);
  await expect(page.getByRole('heading', { name: 'Thông báo' })).toBeVisible();
});
