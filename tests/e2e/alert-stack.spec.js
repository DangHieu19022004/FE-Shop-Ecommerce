import { test, expect } from '@playwright/test';

test('global alerts support three tones, stack together, and close after three seconds', async ({ page }) => {
  await page.route('**/api/**', async (Route) => {
    await Route.fulfill({ json: { Data: [] } });
  });

  await page.goto('/');
  await page.evaluate(async () => {
    const AlertStore = await import('/src/stores/alertStore.js');
    AlertStore.showSuccess('Sản phẩm đã được lưu.');
    AlertStore.showDanger('Không thể kết nối máy chủ.');
    AlertStore.showWarning('Sản phẩm chỉ còn số lượng giới hạn.');
  });

  const Stack = page.locator('.dm-alert-stack');
  const Alerts = Stack.locator('.dm-alert');
  await expect(Stack).toBeVisible();
  await expect(Alerts).toHaveCount(3);
  await expect(Alerts.nth(0)).toHaveClass(/dm-alert--warning/);
  await expect(Alerts.nth(1)).toHaveClass(/dm-alert--danger/);
  await expect(Alerts.nth(2)).toHaveClass(/dm-alert--success/);

  const Layout = await Stack.evaluate((Element) => {
    const AlertElements = [...Element.querySelectorAll('.dm-alert')];
    const Rects = AlertElements.map((AlertElement) => AlertElement.getBoundingClientRect());
    return {
      IsTopRight: Element.getBoundingClientRect().top <= 24
        && document.documentElement.clientWidth - Element.getBoundingClientRect().right <= 24,
      IsVerticalStack: Rects.every((Rect, Index) => Index === 0 || Rect.top >= Rects[Index - 1].bottom),
      FitsViewport: Element.scrollWidth <= Element.clientWidth + 1,
    };
  });
  expect(Layout).toEqual({ IsTopRight: true, IsVerticalStack: true, FitsViewport: true });

  await page.screenshot({ path: 'test-results/alert-stack-desktop.png', fullPage: true });
  await page.waitForTimeout(3200);
  await expect(Alerts).toHaveCount(0);
});

test('alerts can be dismissed independently and fit a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/api/**', async (Route) => {
    await Route.fulfill({ json: { Data: [] } });
  });

  await page.goto('/');
  await page.evaluate(async () => {
    const AlertStore = await import('/src/stores/alertStore.js');
    AlertStore.showSuccess('Thông báo thứ nhất', { Duration: 0 });
    AlertStore.showWarning('Thông báo thứ hai', { Duration: 0 });
  });

  const Stack = page.locator('.dm-alert-stack');
  await expect(Stack.locator('.dm-alert')).toHaveCount(2);
  await Stack.locator('.dm-alert').first().getByRole('button', { name: 'Đóng thông báo' }).click();
  await expect(Stack.locator('.dm-alert')).toHaveCount(1);

  const MobileLayout = await Stack.evaluate((Element) => ({
    FitsViewport: Element.getBoundingClientRect().left >= 0
      && Element.getBoundingClientRect().right <= document.documentElement.clientWidth,
    HasNoHorizontalOverflow: Element.scrollWidth <= Element.clientWidth + 1,
  }));
  expect(MobileLayout).toEqual({ FitsViewport: true, HasNoHorizontalOverflow: true });
  await page.screenshot({ path: 'test-results/alert-stack-mobile.png', fullPage: true });
});
