import { test, expect } from '@playwright/test';

test('admin menu toggles the sidebar between full and icon-only modes', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 600 });

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
      await Route.fulfill({ json: { Data: { Items: [], Total: 0, PageIndex: 1, PageSize: 12 } } });
      return;
    }

    if (Url.pathname.endsWith('/categories') || Url.pathname.endsWith('/brands')) {
      await Route.fulfill({ json: { Data: [] } });
      return;
    }

    if (Url.pathname.includes('/notifications')) {
      await Route.fulfill({ json: { Data: Url.pathname.endsWith('/unread-count') ? 0 : [] } });
      return;
    }

    await Route.fulfill({ status: 404, json: { Data: null } });
  });

  await page.goto('/admin/products');

  const Sidebar = page.locator('.dm-admin__sidebar');
  const NavigationButtons = Sidebar.locator('.dm-admin__nav > button.ms-button');
  await expect(NavigationButtons).toHaveCount(12);
  await expect(Sidebar.locator('.dm-brand')).toHaveCount(0);
  await expect(Sidebar.getByRole('button', { name: 'Combo' })).toBeVisible();
  await expect(Sidebar.getByRole('button', { name: 'Đăng xuất' })).toBeVisible();
  expect(await Sidebar.evaluate((Element) => {
    const SidebarBox = Element.getBoundingClientRect();
    const LogoutBox = Element.querySelector('.dm-admin__logout').getBoundingClientRect();
    return LogoutBox.bottom <= SidebarBox.bottom;
  })).toBe(true);
  expect((await Sidebar.boundingBox()).width).toBeGreaterThan(200);

  await page.getByRole('button', { name: 'Thu gọn menu quản trị' }).click();

  await expect(Sidebar).toHaveClass(/dm-admin__sidebar--collapsed/);
  await expect(Sidebar.locator('.ms-button__content')).toHaveCount(0);
  expect((await Sidebar.boundingBox()).width).toBeLessThan(100);

  const BrandsButton = Sidebar.getByRole('button', { name: 'Thương hiệu' });
  await BrandsButton.hover();
  await expect(page.locator('.ms-button__tooltip')).toHaveText('Thương hiệu');
  await BrandsButton.click();
  await expect(page).toHaveURL(/\/admin\/brands$/);
  await expect(Sidebar).toHaveClass(/dm-admin__sidebar--collapsed/);

  await page.getByRole('button', { name: 'Mở rộng menu quản trị' }).click();
  await expect(Sidebar).not.toHaveClass(/dm-admin__sidebar--collapsed/);
  await expect(Sidebar.locator('.dm-brand')).toHaveCount(0);
  expect((await Sidebar.boundingBox()).width).toBeGreaterThan(200);
});
