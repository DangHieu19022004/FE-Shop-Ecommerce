import { test, expect } from '@playwright/test';
import { loginViaUi, registerViaUi } from './helpers/auth';

test('browse product, add to cart, checkout COD, cancel order', async ({ page }) => {
  const account = await registerViaUi(page);
  await loginViaUi(page, account.email, account.password);

  await page.goto('/profile');
  await page.getByLabel('Người nhận').fill('Checkout User');
  await page.getByLabel('Số điện thoại').fill('0900000002');
  await page.getByLabel('Địa chỉ').fill('456 Checkout Street');
  await page.getByRole('button', { name: 'Tạo địa chỉ' }).click();
  await expect(page.getByText('Đã tạo địa chỉ.')).toBeVisible();

  await page.goto('/products');
  const firstProduct = page.locator('a[href^="/products/"]').first();
  await expect(firstProduct).toBeVisible();
  await firstProduct.click();

  await expect(page.locator('.product-detail')).toBeVisible();
  await page.getByRole('button', { name: 'Thêm vào giỏ hàng' }).click();
  await expect(page.getByText('Đã thêm sản phẩm vào giỏ hàng.')).toBeVisible();

  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: 'Giỏ hàng' })).toBeVisible();
  await page.getByRole('button', { name: /Thanh toán/i }).click();

  await expect(page).toHaveURL(/\/payment$/);
  await expect(page.getByRole('heading', { name: 'Thanh toán' })).toBeVisible();
  await page.getByRole('button', { name: 'Đặt hàng' }).click();
  await expect(page.getByText(/Đặt hàng thành công:/)).toBeVisible();

  await page.goto('/orders');
  await expect(page.getByRole('heading', { name: 'Đơn hàng của tôi' })).toBeVisible();
  const firstDetailLink = page.getByRole('link', { name: /Xem chi tiết|Chi tiết/i }).first();
  await expect(firstDetailLink).toBeVisible();
  await firstDetailLink.click();

  await expect(page.locator('.order-detail')).toBeVisible();
  const cancelButton = page.getByRole('button', { name: /Hủy đơn|Cancel/i });
  if (await cancelButton.count()) {
    await cancelButton.first().click();
  }
});
