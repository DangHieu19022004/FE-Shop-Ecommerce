import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const AdminSession = {
  UserId: 'admin-invoice-test',
  FullName: 'Admin Hóa đơn',
  Email: 'admin@example.com',
  Roles: ['Admin'],
  AccessToken: 'admin-invoice-token',
};

const ConfirmedPaidOrder = {
  OrderId: 'invoice-order-1',
  OrderCode: 'ORD-INVOICE-001',
  Status: 1,
  PaymentMethod: 1,
  PaymentStatus: 5,
  Subtotal: 170000,
  ShippingFee: 15000,
  Discount: 10000,
  Total: 175000,
  ItemCount: 2,
  CreateDate: '2026-09-16T08:30:00Z',
};

const PendingOrder = {
  OrderId: 'invoice-order-pending',
  OrderCode: 'ORD-PENDING-002',
  Status: 0,
  PaymentMethod: 1,
  PaymentStatus: 2,
  Total: 80000,
  ItemCount: 1,
};

const ConfirmedPaidOrderDetail = {
  ...ConfirmedPaidOrder,
  Note: 'Gọi trước khi giao',
  Address: {
    RecipientName: 'Nguyễn Văn An',
    PhoneNumber: '0901234567',
    AddressLine: 'Phòng A101, Ký túc xá Đại học Quốc gia',
    Ward: 'Phường Linh Trung',
    District: 'Thành phố Thủ Đức',
    Province: 'TP. Hồ Chí Minh',
  },
  Items: [{
    OrderItemId: 'invoice-item-1',
    ProductName: 'Ấm siêu tốc Dorm Mart',
    VariantName: 'Màu trắng',
    Sku: 'AM-ST-001',
    UnitPrice: 120000,
    Quantity: 1,
    LineTotal: 120000,
  }],
  Combos: [{
    OrderComboId: 'invoice-combo-1',
    ComboCode: 'COMBO-KTX',
    Name: 'Combo nhập trọ',
    Quantity: 1,
    LineTotal: 50000,
  }],
};

test('admin invoice screen extracts a paid order and downloads a printable PDF with QR', async ({ page }) => {
  const PageErrors = [];
  const UnexpectedRequests = [];
  page.on('pageerror', (Error) => PageErrors.push(Error.message));

  await page.addInitScript((Session) => {
    window.localStorage.setItem('DORM_MART_ACCESS_TOKEN_V2', Session.AccessToken);
    window.localStorage.setItem('DORM_MART_SESSION_V2', JSON.stringify(Session));
  }, AdminSession);

  await page.route('**/api/**', async (Route) => {
    const Url = new URL(Route.request().url());

    if (Url.pathname.endsWith('/notifications/unread-count')) {
      await Route.fulfill({ json: { Data: 0 } });
      return;
    }

    if (Url.pathname.endsWith('/notifications')) {
      await Route.fulfill({ json: { Data: [] } });
      return;
    }

    if (Url.pathname.endsWith('/admin/orders')) {
      await Route.fulfill({ json: { Data: [PendingOrder, ConfirmedPaidOrder] } });
      return;
    }

    if (Url.pathname.endsWith(`/admin/orders/${ConfirmedPaidOrder.OrderId}`)) {
      await Route.fulfill({ json: { Data: ConfirmedPaidOrderDetail } });
      return;
    }

    UnexpectedRequests.push(`${Route.request().method()} ${Url.pathname}`);
    await Route.fulfill({ status: 404, json: { Data: null } });
  });

  await page.goto('/admin/invoices');

  await expect(page.getByRole('heading', { name: 'Xuất hóa đơn' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Xuất hóa đơn' })).toBeVisible();
  await expect(page.getByText('ORD-INVOICE-001', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('ORD-PENDING-002')).toHaveCount(0);

  const field = (Label) => page.locator('.ms-input').filter({ hasText: Label }).locator('input');
  await expect(field('Tên người nhận')).toHaveValue('Nguyễn Văn An');
  await expect(field('Số điện thoại')).toHaveValue('0901234567');
  await expect(field('Địa chỉ chi tiết')).toHaveValue('Phòng A101, Ký túc xá Đại học Quốc gia');
  await expect(field('Tỉnh/Thành phố')).toHaveValue('TP. Hồ Chí Minh');
  await expect(page.getByText('Ấm siêu tốc Dorm Mart')).toBeVisible();
  await expect(page.getByText('Combo: Combo nhập trọ')).toBeVisible();

  const QrImage = page.getByAltText('Mã QR chứa địa chỉ và số điện thoại người nhận');
  await expect(QrImage).toBeVisible();
  await expect(QrImage).toHaveAttribute('src', /^data:image\/png;base64,/);
  const QrPayload = await QrImage.evaluate(async (Image) => {
    if (!('BarcodeDetector' in window)) return null;
    const Detector = new window.BarcodeDetector({ formats: ['qr_code'] });
    const Results = await Detector.detect(Image);
    return Results[0]?.rawValue || null;
  });
  if (QrPayload) {
    expect(QrPayload).toContain('0901234567');
    expect(QrPayload).toContain('TP. Hồ Chí Minh');
  }
  await page.screenshot({ path: 'test-results/admin-invoices-desktop.png', fullPage: true });

  const DownloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Xác nhận & xuất PDF' }).click();
  const Download = await DownloadPromise;
  expect(Download.suggestedFilename()).toBe('hoa-don-ORD-INVOICE-001.pdf');
  const DownloadPath = await Download.path();
  const PdfBytes = await readFile(DownloadPath);
  expect(PdfBytes.subarray(0, 5).toString()).toBe('%PDF-');
  expect(PdfBytes.length).toBeGreaterThan(20_000);
  await Download.saveAs('test-results/admin-invoice-sample.pdf');
  await expect(page.getByText('File sẵn sàng để in.')).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  const HasHorizontalOverflow = await page.locator('.admin-invoices').evaluate(
    (Element) => Element.scrollWidth > Element.clientWidth + 1,
  );
  expect(HasHorizontalOverflow).toBe(false);
  expect(PageErrors).toEqual([]);
  expect(UnexpectedRequests).toEqual([]);
  await page.screenshot({ path: 'test-results/admin-invoices-mobile.png', fullPage: true });
});
