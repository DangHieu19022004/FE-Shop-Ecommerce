import { test, expect } from '@playwright/test';

const adminSession = {
  UserId: 'admin-1',
  FullName: 'Admin Test',
  Email: 'admin@example.com',
  Roles: ['Admin'],
  AccessToken: 'admin-test-token',
};

const pendingOrder = {
  OrderId: '11111111-1111-1111-1111-111111111111',
  OrderCode: 'ORD-20260906165645-81C389',
  Status: 0,
  PaymentMethod: 2,
  PaymentStatus: 5,
  Subtotal: 21000,
  ShippingFee: 0,
  Discount: 0,
  Total: 21000,
  ItemCount: 1,
  CreateDate: '2026-09-06T16:56:45Z',
};

const rejectedOrder = {
  OrderId: '22222222-2222-2222-2222-222222222222',
  OrderCode: 'ORD-20260906165515-AB052A',
  Status: 2,
  PaymentMethod: 0,
  PaymentStatus: 4,
  Subtotal: 4000,
  ShippingFee: 0,
  Discount: 0,
  Total: 4000,
  ItemCount: 1,
  CreateDate: '2026-09-06T16:55:15Z',
};

const pendingOrderDetail = {
  ...pendingOrder,
  CartId: '33333333-3333-3333-3333-333333333333',
  Note: 'Giao trước 20h',
  Address: {
    RecipientName: 'Sinh viên A',
    PhoneNumber: '0900000000',
    AddressLine: 'Phòng A101',
    Ward: 'KTX Khu A',
    District: 'Dĩ An',
    Province: 'Bình Dương',
  },
  Payment: {
    PaymentId: '44444444-4444-4444-4444-444444444444',
    PaymentMethod: 2,
    Status: 5,
    Amount: 21000,
    TransferContent: 'DM ORD-20260906165645-81C389',
    Proofs: [],
  },
  Shipment: {
    ShipmentId: '55555555-5555-5555-5555-555555555555',
    Status: 0,
    Provider: 'ManualShippingProvider',
    CarrierName: '',
    TrackingCode: '',
  },
  Items: [
    {
      OrderItemId: '66666666-6666-6666-6666-666666666666',
      ProductId: '77777777-7777-7777-7777-777777777777',
      ProductVariantId: '88888888-8888-8888-8888-888888888888',
      ProductName: 'Mì ly Hảo Hảo',
      VariantName: 'Tôm chua cay',
      Sku: 'MI-HH-001',
      UnitPrice: 21000,
      UnitCost: 15000,
      Quantity: 1,
      LineTotal: 21000,
    },
  ],
  Combos: [],
  StatusHistories: [],
};

test('admin orders screen renders dashboard table, filters pending orders, and confirms selected order', async ({ page }) => {
  const orderActionRequests = [];

  await page.addInitScript((Session) => {
    window.localStorage.setItem('DORM_MART_ACCESS_TOKEN_V2', Session.AccessToken);
    window.localStorage.setItem('DORM_MART_SESSION_V2', JSON.stringify(Session));
  }, adminSession);

  await page.route('**/api/**', async (Route) => {
    const Request = Route.request();
    const Url = new URL(Request.url());

    if (Url.pathname.endsWith('/notifications/unread-count')) {
      await Route.fulfill({ json: { Data: 0 } });
      return;
    }

    if (Url.pathname.endsWith('/admin/orders') && Request.method() === 'GET') {
      await Route.fulfill({ json: { Data: [pendingOrder, rejectedOrder] } });
      return;
    }

    if (Url.pathname.endsWith(`/admin/orders/${pendingOrder.OrderId}`) && Request.method() === 'GET') {
      await Route.fulfill({ json: { Data: pendingOrderDetail } });
      return;
    }

    if (Url.pathname.endsWith(`/admin/orders/${pendingOrder.OrderId}/confirm`) && Request.method() === 'POST') {
      orderActionRequests.push(Request.postDataJSON());
      await Route.fulfill({ json: { Data: { ...pendingOrderDetail, Status: 1 } } });
      return;
    }

    await Route.fulfill({ status: 404, json: { Data: null } });
  });

  await page.goto('/admin/orders');

  await expect(page.getByRole('heading', { name: 'Quản Lý Đơn Hàng' })).toBeVisible();
  await expect(page.getByText('Tổng số đơn hàng')).toBeVisible();
  await expect(page.getByText('2', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('cell', { name: /ORD-20260906165645-81C389/ })).toBeVisible();
  await expect(page.getByRole('cell', { name: /ORD-20260906165515-AB052A/ })).toBeVisible();
  await expect(page.getByText('Sinh viên A')).toBeVisible();
  await expect(page.getByText('Mì ly Hảo Hảo')).toBeVisible();

  await page.getByRole('button', { name: /Chờ duyệt/ }).click();
  await expect(page.getByRole('cell', { name: /ORD-20260906165645-81C389/ })).toBeVisible();
  await expect(page.getByRole('cell', { name: /ORD-20260906165515-AB052A/ })).toHaveCount(0);

  await page.locator('.admin-orders-table .admin-orders-action--success').first().click();
  await expect.poll(() => orderActionRequests).toEqual([{ Note: '' }]);
});
