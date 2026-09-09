import { test, expect } from '@playwright/test';

const routeEmptyHomeData = async (Route) => {
  const Url = new URL(Route.request().url());
  if (Url.pathname.endsWith('/forced-api-error')) {
    await Route.fulfill({
      status: 422,
      json: { UserMessage: 'Dữ liệu gửi lên không hợp lệ.' },
    });
    return;
  }
  await Route.fulfill({ json: { Data: [] } });
};

test('every final API error is surfaced through the global danger alert', async ({ page }) => {
  await page.route('**/api/**', routeEmptyHomeData);
  await page.goto('/');

  await page.evaluate(async () => {
    const { default: Api } = await import('/src/services/axios.js');
    await Api.get('/forced-api-error', { HasRetriedWithFallback: true }).catch(() => null);
  });

  const ErrorAlert = page.locator('.dm-alert--danger').filter({ hasText: 'Dữ liệu gửi lên không hợp lệ.' });
  await expect(ErrorAlert).toBeVisible();
  await expect(ErrorAlert).toContainText('Lỗi API (422)');
});

test('confirmation popup resolves cancel and confirm actions without native browser dialogs', async ({ page }) => {
  await page.route('**/api/**', routeEmptyHomeData);
  await page.goto('/');

  await page.evaluate(async () => {
    const { confirmDelete } = await import('/src/stores/confirmStore.js');
    window.__confirmResult = 'pending';
    confirmDelete('Xóa bản ghi thử nghiệm?').then((Result) => {
      window.__confirmResult = Result;
    });
  });

  let Dialog = page.getByRole('alertdialog', { name: 'Xác nhận xóa' });
  await expect(Dialog).toBeVisible();
  await expect(Dialog).toContainText('Xóa bản ghi thử nghiệm?');
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'test-results/confirm-dialog-desktop.png', fullPage: true });
  await Dialog.getByRole('button', { name: 'Quay lại' }).click();
  await expect(Dialog).toBeHidden();
  await expect.poll(() => page.evaluate(() => window.__confirmResult)).toBe(false);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(async () => {
    const { confirmDelete } = await import('/src/stores/confirmStore.js');
    window.__confirmResult = 'pending';
    confirmDelete('Xóa bản ghi thử nghiệm?').then((Result) => {
      window.__confirmResult = Result;
    });
  });

  Dialog = page.getByRole('alertdialog', { name: 'Xác nhận xóa' });
  const MobileLayout = await Dialog.evaluate((Element) => {
    const Rect = Element.getBoundingClientRect();
    return Rect.left >= 0
      && Rect.right <= document.documentElement.clientWidth
      && Element.scrollWidth <= Element.clientWidth + 1;
  });
  expect(MobileLayout).toBe(true);
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'test-results/confirm-dialog-mobile.png', fullPage: true });
  await Dialog.getByRole('button', { name: 'Xóa', exact: true }).click();
  await expect(Dialog).toBeHidden();
  await expect.poll(() => page.evaluate(() => window.__confirmResult)).toBe(true);
});
