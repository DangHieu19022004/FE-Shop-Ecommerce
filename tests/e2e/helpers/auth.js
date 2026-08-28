import { expect } from '@playwright/test';
import { defaultPassword, defaultPhone, uniqueEmail } from './data';

export const registerViaUi = async (page, overrides = {}) => {
  const account = {
    fullName: overrides.fullName || 'Playwright User',
    email: overrides.email || uniqueEmail('playwright'),
    phone: overrides.phone || defaultPhone,
    password: overrides.password || defaultPassword,
  };

  await page.goto('/register');
  await page.getByLabel('Họ và tên').fill(account.fullName);
  await page.getByLabel('Số điện thoại').fill(account.phone);
  await page.getByLabel('Email').fill(account.email);
  await page.getByLabel('Mật khẩu', { exact: true }).fill(account.password);
  await page.getByLabel('Xác nhận mật khẩu').fill(account.password);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Đăng ký' }).click();
  await expect(page).toHaveURL(/\/login/);

  return account;
};

export const loginViaUi = async (page, email, password = defaultPassword) => {
  await page.goto('/login');
  await page.getByLabel(/tài khoản|email/i).fill(email);
  await page.getByLabel('Mật khẩu').fill(password);
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
};

export const loginAdminViaUi = async (page) => {
  await loginViaUi(page, 'fullsmoke2+20260826221141@example.com', defaultPassword);
};
