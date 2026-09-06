import { test, expect } from '@playwright/test';

test('support chat stays fixed and collapses into a right-edge restore arrow', async ({ page }) => {
  await page.route('**/api/**', async (Route) => {
    const Url = new URL(Route.request().url());
    const Data = Url.pathname.endsWith('/products')
      ? { Items: [], Total: 0, PageIndex: 1, PageSize: 48 }
      : [];
    await Route.fulfill({ json: { Data } });
  });

  await page.goto('/');

  const Launcher = page.locator('.support-chat__launcher');
  const CollapseButton = page.locator('.support-chat__collapse');
  const RestoreButton = page.locator('.support-chat__restore');
  const ChatPanel = page.locator('.support-chat__panel');

  await expect(Launcher).toBeVisible();
  await expect(CollapseButton).toBeVisible();
  await expect(CollapseButton.locator('.material-symbols-outlined')).toHaveText('close');

  const LauncherPosition = await Launcher.evaluate((Element) => getComputedStyle(Element).position);
  expect(LauncherPosition).toBe('fixed');

  await CollapseButton.click();
  await expect(Launcher).toBeHidden();
  await expect(RestoreButton).toBeVisible();
  await expect(RestoreButton.locator('.material-symbols-outlined')).toHaveText('chevron_left');

  const RestorePlacement = await RestoreButton.evaluate((Element) => {
    const Style = getComputedStyle(Element);
    return { position: Style.position, right: Style.right };
  });
  expect(RestorePlacement).toEqual({ position: 'fixed', right: '0px' });

  await RestoreButton.click();
  await expect(Launcher).toBeVisible();
  await page.locator('.support-chat__bubble').click();
  await expect(ChatPanel).toBeVisible();

  await page.locator('.support-chat__close').click();
  await expect(ChatPanel).toBeHidden();
  await expect(RestoreButton).toBeVisible();
});
