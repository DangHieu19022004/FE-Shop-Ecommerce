import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('DORM_MART_ACCESS_TOKEN_V2', 'form-sizing-test-token');
    window.localStorage.setItem('DORM_MART_SESSION_V2', JSON.stringify({
      UserId: 'admin-form-test',
      FullName: 'Admin Form Test',
      Email: 'admin-form@example.com',
      Roles: ['Admin'],
      AccessToken: 'form-sizing-test-token',
    }));
  });

  await page.route('**/api/**', async (Route) => {
    const Pathname = new URL(Route.request().url()).pathname;

    if (Pathname.endsWith('/admin/finance/summary')) {
      await Route.fulfill({ json: { Data: { ProductRevenue: 0, ExpenseAmount: 0, GrossProfit: 0 } } });
      return;
    }

    if (Pathname.endsWith('/admin/finance/profit')) {
      await Route.fulfill({ json: { Data: { GrossMarginPercent: 0 } } });
      return;
    }

    await Route.fulfill({ json: { Data: [] } });
  });
});

test('single-line form controls use one shared height while widths remain flexible', async ({ page }) => {
  await page.goto('/admin/finance');
  await expect(page.getByRole('heading', { name: 'Quản lý thu chi' })).toBeVisible();

  const ControlSizes = await page.locator('.admin-form').evaluate((Form) => {
    const measure = (Selector) => {
      const Element = Form.querySelector(Selector);
      const Rect = Element.getBoundingClientRect();
      return { Height: Rect.height, Width: Rect.width };
    };

    return {
      Input: measure('.ms-input-in'),
      Select: measure('.ms-multiselect .multiselect__tags'),
      Button: measure('.ms-button'),
      Token: getComputedStyle(document.documentElement).getPropertyValue('--dm-control-height').trim(),
    };
  });

  expect(ControlSizes.Token).toBe('46px');
  expect(ControlSizes.Input.Height).toBe(46);
  expect(ControlSizes.Select.Height).toBe(ControlSizes.Input.Height);
  expect(ControlSizes.Button.Height).toBe(ControlSizes.Input.Height);
  expect(ControlSizes.Input.Width).toBeGreaterThan(0);
  expect(ControlSizes.Select.Width).toBeGreaterThan(0);
});

test('native single-line fields follow the shared height and textarea stays multiline', async ({ page }) => {
  await page.goto('/products');

  const NativeFieldHeights = await page.locator('.dm-field:not(textarea)').evaluateAll(
    (Fields) => Fields.map((Field) => Field.getBoundingClientRect().height),
  );
  expect(NativeFieldHeights.length).toBeGreaterThan(0);
  expect(new Set(NativeFieldHeights)).toEqual(new Set([46]));

  await page.goto('/support');
  const TextareaHeight = await page.locator('textarea.dm-field').first().evaluate(
    (Textarea) => Textarea.getBoundingClientRect().height,
  );
  expect(TextareaHeight).toBeGreaterThan(46);
});
