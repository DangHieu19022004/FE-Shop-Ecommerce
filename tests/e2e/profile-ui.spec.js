import { test, expect } from '@playwright/test';

const Profile = {
  UserId: 'user-1',
  FullName: 'Nguyễn Minh An',
  Email: 'minhan@example.com',
  Phone: '0901234567',
};

const Addresses = [
  {
    UserAddressId: 'address-1',
    RecipientName: 'Nguyễn Minh An',
    PhoneNumber: '0901234567',
    AddressLine: '12 Nguyễn Trãi',
    Ward: 'Phường Bến Thành',
    District: 'Quận 1',
    Province: 'TP. Hồ Chí Minh',
    IsDefault: true,
  },
  {
    UserAddressId: 'address-2',
    RecipientName: 'Nguyễn Minh An',
    PhoneNumber: '0901234567',
    AddressLine: 'Ký túc xá Khu B',
    Ward: 'Phường Đông Hòa',
    District: 'Dĩ An',
    Province: 'Bình Dương',
    IsDefault: false,
  },
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript((SessionProfile) => {
    window.localStorage.setItem('DORM_MART_ACCESS_TOKEN_V2', 'profile-test-token');
    window.localStorage.setItem('DORM_MART_SESSION_V2', JSON.stringify({
      ...SessionProfile,
      Roles: ['Customer'],
      AccessToken: 'profile-test-token',
    }));
  }, Profile);

  await page.route('**/api/**', async (Route) => {
    const Url = new URL(Route.request().url());

    if (Url.pathname.endsWith('/me/addresses')) {
      await Route.fulfill({ json: { Data: Addresses } });
      return;
    }

    if (Url.pathname.endsWith('/me')) {
      await Route.fulfill({ json: { Data: Profile } });
      return;
    }

    if (Url.pathname.includes('/notifications')) {
      await Route.fulfill({ json: { Data: Url.pathname.endsWith('/unread-count') ? 0 : [] } });
      return;
    }

    await Route.fulfill({ status: 404, json: { Data: null } });
  });
});

test('profile presents account, shortcuts, and addresses without redundant sections', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/profile');

  await expect(page.getByRole('heading', { name: 'Thông tin cá nhân' })).toBeVisible();
  await expect(page.locator('.profile-account')).toContainText('Nguyễn Minh An');
  await expect(page.locator('.profile-shortcut')).toHaveCount(4);
  await expect(page.locator('.profile-address-card')).toHaveCount(2);
  await expect(page.locator('.profile-address-card .dm-badge--primary')).toHaveCount(1);
  await expect(page.locator('.profile-address-form')).toHaveCount(0);
  await expect(page.getByText('Tiện ích Phase 13')).toHaveCount(0);
  await expect(page.getByText('Các tính năng khác đang được hoàn thiện')).toHaveCount(0);

  const DesktopColumns = await page.locator('.profile-layout').evaluate(
    (Element) => getComputedStyle(Element).gridTemplateColumns.split(' ').length,
  );
  expect(DesktopColumns).toBe(2);
  await page.screenshot({ path: 'test-results/profile-ui-desktop.png', fullPage: true });

  await page.getByRole('button', { name: 'Thêm địa chỉ', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Thêm địa chỉ mới' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Lưu địa chỉ', exact: true })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  const MobileColumns = await page.locator('.profile-layout').evaluate(
    (Element) => getComputedStyle(Element).gridTemplateColumns.split(' ').length,
  );
  expect(MobileColumns).toBe(1);
  expect(await page.locator('body').evaluate((Element) => Element.scrollWidth <= Element.clientWidth + 1)).toBe(true);
  await page.screenshot({ path: 'test-results/profile-ui-mobile.png', fullPage: true });
});
