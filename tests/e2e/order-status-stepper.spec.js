import { test, expect } from '@playwright/test';

const OrderSummary = {
  OrderId: 'order-status-test',
  OrderCode: 'ORD-STATUS-TEST',
};

const OrderDetail = {
  ...OrderSummary,
  Status: 'PendingApproval',
  CreateDate: '2026-09-06T16:56:00Z',
  PaymentMethod: 'BankTransfer',
  PaymentStatus: 'UnderReview',
  Subtotal: 21000,
  Total: 21000,
  Items: [
    {
      OrderItemId: 'item-status-test',
      ProductId: 'product-status-test',
      ProductName: 'Mì ly Hảo Hảo',
      VariantName: 'Tôm chua cay',
      UnitPrice: 11000,
      Quantity: 1,
      LineTotal: 11000,
    },
  ],
  Combos: [
    {
      OrderComboId: 'combo-status-test',
      ComboCode: 'COMBO-KTX',
      Name: 'Combo ăn đêm KTX',
      Quantity: 1,
      LineTotal: 10000,
      Items: [
        { ProductName: 'Bánh mì', Quantity: 1 },
        { ProductName: 'Sữa hộp', Quantity: 1 },
      ],
    },
  ],
  StatusHistories: [{
    Status: 'PendingApproval',
    CreateDate: '2026-09-06T16:56:00Z',
    CreatedBy: 'customer@example.com',
  }],
  Address: {
    RecipientName: 'Khách hàng thử nghiệm',
    PhoneNumber: '0900000000',
    AddressLine: 'Ký túc xá A',
  },
  Payment: {
    Status: 'UnderReview',
    PaymentMethod: 'BankTransfer',
    Amount: 21000,
  },
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('DORM_MART_ACCESS_TOKEN_V2', 'order-status-test-token');
    window.localStorage.setItem('DORM_MART_SESSION_V2', JSON.stringify({
      UserId: 'order-status-user',
      FullName: 'Khách hàng thử nghiệm',
      Email: 'customer@example.com',
      Roles: ['Customer'],
      AccessToken: 'order-status-test-token',
    }));
  });

  await page.route('**/api/**', async (Route) => {
    const Pathname = new URL(Route.request().url()).pathname;

    if (Pathname.endsWith('/orders/order-status-test')) {
      await Route.fulfill({ json: { Data: OrderDetail } });
      return;
    }

    if (Pathname.endsWith('/orders')) {
      await Route.fulfill({ json: { Data: [OrderSummary] } });
      return;
    }

    await Route.fulfill({ json: { Data: [] } });
  });
});

test('order progress is a simple static stepper without an infinite spinner', async ({ page }) => {
  await page.goto('/orders/ORD-STATUS-TEST');

  const Stepper = page.locator('.order-detail__stepper-shell');
  await expect(Stepper).toBeVisible();
  await expect(Stepper.locator('.order-detail__step-card')).toHaveCount(5);
  await expect(Stepper.locator('.order-detail__step-card--active')).toHaveCount(1);
  await expect(Stepper.locator('.order-detail__step-card--active')).toContainText('Thanh toán');
  await expect(Stepper.locator('.order-detail__step-spinner')).toHaveCount(0);
  await expect(page.locator('.order-detail__combo-card')).toContainText('Combo ăn đêm KTX');
  await expect(page.locator('.order-detail__combo-card')).toContainText('COMBO-KTX');
  await expect(page.locator('.order-detail__combo-card')).toContainText('Bánh mì × 1');
  await expect(page.getByRole('heading', { name: 'Sản Phẩm Đã Mua (2)' })).toBeVisible();

  const IconAnimations = await Stepper.locator('.order-detail__step-icon-wrap .material-symbols-outlined').evaluateAll(
    (Icons) => Icons.map((Icon) => getComputedStyle(Icon).animationName),
  );
  expect(new Set(IconAnimations)).toEqual(new Set(['none']));

  await page.screenshot({ path: 'test-results/order-stepper-simple.png', fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  const MobileLayout = await Stepper.evaluate((Element) => {
    const StepCard = Element.querySelector('.order-detail__step-card');
    return {
      Columns: getComputedStyle(StepCard).gridTemplateColumns.split(' ').length,
      FitsViewport: document.body.scrollWidth <= document.body.clientWidth + 1,
    };
  });
  expect(MobileLayout.Columns).toBe(3);
  expect(MobileLayout.FitsViewport).toBe(true);
});

const FulfillmentScenarios = [
  {
    Status: 'Preparing',
    ClassName: 'preparing',
    Step: 'Bước 3 trong 5',
    Title: 'Dorm Mart đang chuẩn bị đơn hàng',
    ActiveStep: 'Đang chuẩn bị hàng',
    Shipment: null,
  },
  {
    Status: 'Shipping',
    ClassName: 'shipping',
    Step: 'Bước 4 trong 5',
    Title: 'Đơn hàng đang trên đường giao đến bạn',
    ActiveStep: 'Đang giao hàng',
    Shipment: {
      Status: 'Shipping',
      CarrierName: 'Dorm Express',
      TrackingCode: 'DMX-123456',
      ShippedAt: '2026-09-07T08:30:00Z',
      Note: 'Tài xế đang giao đến ký túc xá',
    },
  },
  {
    Status: 'Completed',
    ClassName: 'completed',
    Step: 'Bước 5 trong 5',
    Title: 'Đơn hàng đã được giao thành công',
    ActiveStep: 'Nhận hàng thành công',
    Shipment: {
      Status: 'Delivered',
      CarrierName: 'Dorm Express',
      TrackingCode: 'DMX-123456',
      DeliveredAt: '2026-09-08T10:15:00Z',
    },
  },
];

for (const Scenario of FulfillmentScenarios) {
  test(`order status ${Scenario.Status} renders the dedicated fulfillment screen`, async ({ page }) => {
    await page.route('**/api/orders/order-status-test', async (Route) => {
      await Route.fulfill({
        json: {
          Data: {
            ...OrderDetail,
            Status: Scenario.Status,
            PaymentStatus: 'Paid',
            Payment: { ...OrderDetail.Payment, Status: 'Paid' },
            Shipment: Scenario.Shipment,
          },
        },
      });
    });

    await page.goto('/orders/ORD-STATUS-TEST');

    const FulfillmentCard = page.locator(`.order-detail__fulfillment-card--${Scenario.ClassName}`);
    await expect(FulfillmentCard).toBeVisible();
    await expect(FulfillmentCard).toContainText(Scenario.Step);
    await expect(FulfillmentCard).toContainText(Scenario.Title);
    await expect(page.locator('.order-detail__bank-card')).toHaveCount(0);
    await expect(page.locator('.order-detail__step-card--active')).toContainText(Scenario.ActiveStep);

    await page.screenshot({
      path: `test-results/order-stage-${Scenario.ClassName}.png`,
      fullPage: true,
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: `test-results/order-stage-${Scenario.ClassName}-mobile.png`,
      fullPage: true,
    });
    const MobileLayout = await FulfillmentCard.evaluate((Element) => ({
      MetricColumns: getComputedStyle(Element.querySelector('.order-detail__fulfillment-metrics')).gridTemplateColumns.split(' ').length,
      FitsViewport: document.body.scrollWidth <= document.body.clientWidth + 1,
    }));
    expect(MobileLayout.MetricColumns).toBe(1);
    expect(MobileLayout.FitsViewport).toBe(true);
  });
}
