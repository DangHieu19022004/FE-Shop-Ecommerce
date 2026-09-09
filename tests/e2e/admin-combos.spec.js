import { test, expect } from '@playwright/test';

test('admin Combo sidebar item opens a working combo CRUD screen', async ({ page }) => {
  const Requests = [];
  let Combos = [];

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
    const Request = Route.request();
    const Url = new URL(Request.url());
    const Method = Request.method();
    const ComboMatch = Url.pathname.match(/\/admin\/combos\/([^/]+)$/);

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

    if (Url.pathname.endsWith('/admin/combos') && Method === 'GET') {
      await Route.fulfill({ json: { Data: Combos } });
      return;
    }

    if (Url.pathname.endsWith('/admin/combos') && Method === 'POST') {
      const Payload = Request.postDataJSON();
      Requests.push({ Method, Payload });
      Combos = [{
        ...Payload,
        ComboId: 'combo-1',
        OriginalPrice: 180000,
        ComboPrice: 150000,
        Discounts: [],
      }];
      await Route.fulfill({ json: { Data: Combos[0] } });
      return;
    }

    if (ComboMatch && Method === 'GET') {
      await Route.fulfill({ json: { Data: Combos.find((Item) => Item.ComboId === ComboMatch[1]) } });
      return;
    }

    if (ComboMatch && Method === 'PUT') {
      const Payload = Request.postDataJSON();
      Requests.push({ Method, Payload });
      Combos = Combos.map((Item) => Item.ComboId === ComboMatch[1] ? { ...Item, ...Payload } : Item);
      await Route.fulfill({ json: { Data: Combos[0] } });
      return;
    }

    if (ComboMatch && Method === 'DELETE') {
      Requests.push({ Method });
      Combos = Combos.filter((Item) => Item.ComboId !== ComboMatch[1]);
      await Route.fulfill({ json: { Data: true } });
      return;
    }

    await Route.fulfill({ status: 404, json: { Data: null } });
  });

  await page.goto('/admin/products');
  const Sidebar = page.locator('.dm-admin__sidebar');
  await Sidebar.getByRole('button', { name: 'Combo' }).click();
  await expect(page).toHaveURL(/\/admin\/combos$/);
  await expect(Sidebar.getByRole('button', { name: 'Combo' })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('heading', { name: 'Combo', exact: true })).toBeVisible();

  const field = (Label) => page.locator('.ms-input').filter({ hasText: Label }).locator('input').first();
  await field('Mã combo').fill('CB-001');
  await field('Tên combo').fill('Combo phòng trọ');
  const ItemRows = page.locator('.admin-combos__item-row');
  await ItemRows.nth(0).locator('input').first().fill('variant-1');
  await ItemRows.nth(1).locator('input').first().fill('variant-2');
  await page.getByRole('button', { name: 'Tạo combo', exact: true }).click();

  await expect(page.getByText('Đã tạo combo.')).toBeVisible();
  const ComboCard = page.locator('.admin-combos__card').filter({ hasText: 'Combo phòng trọ' });
  await expect(ComboCard).toBeVisible();
  expect(Requests[0]).toMatchObject({
    Method: 'POST',
    Payload: {
      ComboCode: 'CB-001',
      Name: 'Combo phòng trọ',
      Items: [
        { ProductVariantId: 'variant-1', Quantity: 1 },
        { ProductVariantId: 'variant-2', Quantity: 1 },
      ],
    },
  });

  await ComboCard.getByRole('button', { name: 'Sửa', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Cập nhật combo' })).toBeVisible();
  await field('Tên combo').fill('Combo phòng trọ mới');
  await page.getByRole('button', { name: 'Cập nhật combo', exact: true }).click();

  await expect(page.getByText('Đã cập nhật combo.')).toBeVisible();
  await expect(page.locator('.admin-combos__card').filter({ hasText: 'Combo phòng trọ mới' })).toBeVisible();
  expect(Requests[1]).toMatchObject({ Method: 'PUT', Payload: { Name: 'Combo phòng trọ mới' } });

  await page.locator('.admin-combos__card').filter({ hasText: 'Combo phòng trọ mới' }).getByRole('button', { name: 'Xóa', exact: true }).click();
  const ConfirmDialog = page.getByRole('alertdialog', { name: 'Xác nhận xóa' });
  await expect(ConfirmDialog).toBeVisible();
  expect(Requests).toHaveLength(2);
  await ConfirmDialog.getByRole('button', { name: 'Xóa', exact: true }).click();

  await expect(page.getByText('Đã xóa combo.')).toBeVisible();
  await expect(page.locator('.admin-combos__card')).toHaveCount(0);
  expect(Requests[2]).toEqual({ Method: 'DELETE' });
});
