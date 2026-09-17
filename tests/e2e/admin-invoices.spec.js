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
  RecipientName: 'Nguyễn Văn An',
  PhoneNumber: '0901234567',
  AddressText: 'Phòng A101, Ký túc xá Đại học Quốc gia, Phường Linh Trung, Thành phố Thủ Đức, TP. Hồ Chí Minh',
  Subtotal: 170000,
  ShippingFee: 15000,
  Discount: 10000,
  Total: 175000,
  ItemCount: 2,
  CreateDate: '2026-09-16T08:30:00Z',
};

const ConfirmedPaidInvoiceDraft = {
  ...ConfirmedPaidOrder,
  Note: 'Gọi trước khi giao',
  AddressLine: 'Phòng A101, Ký túc xá Đại học Quốc gia',
  Ward: 'Phường Linh Trung',
  District: 'Thành phố Thủ Đức',
  Province: 'TP. Hồ Chí Minh',
  QrPayload: 'Mã đơn: ORD-INVOICE-001\nNgười nhận: Nguyễn Văn An\nSĐT: 0901234567\nĐịa chỉ: Phòng A101, Ký túc xá Đại học Quốc gia, Phường Linh Trung, Thành phố Thủ Đức, TP. Hồ Chí Minh',
  Order: {
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
  },
};

const PdfBytes = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF');

test('admin invoice screen loads invoice API draft and downloads backend PDF', async ({ page }) => {
  const PageErrors = [];
  const UnexpectedRequests = [];
  const ExportRequests = [];
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

    if (Url.pathname.endsWith('/admin/invoices/orders')) {
      await Route.fulfill({ json: { Data: [ConfirmedPaidOrder] } });
      return;
    }

    if (Url.pathname.endsWith(`/admin/invoices/orders/${ConfirmedPaidOrder.OrderId}/draft`)) {
      await Route.fulfill({ json: { Data: ConfirmedPaidInvoiceDraft } });
      return;
    }

    if (Url.pathname.endsWith('/admin/invoices/export')) {
      ExportRequests.push(JSON.parse(Route.request().postData() || '{}'));
      await Route.fulfill({
        body: PdfBytes,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="invoice-ORD-INVOICE-001.pdf"',
        },
      });
      return;
    }

    UnexpectedRequests.push(`${Route.request().method()} ${Url.pathname}`);
    await Route.fulfill({ status: 404, json: { Data: null } });
  });

  await page.goto('/admin/invoices');

  await expect(page.getByRole('heading', { name: 'Xuất hóa đơn' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Xuất hóa đơn' })).toBeVisible();
  await expect(page.getByText('ORD-INVOICE-001', { exact: true }).first()).toBeVisible();

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
  await page.screenshot({ path: 'test-results/admin-invoices-desktop.png', fullPage: true });

  const DownloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Xác nhận & xuất PDF' }).click();
  const Download = await DownloadPromise;
  expect(Download.suggestedFilename()).toBe('invoice-ORD-INVOICE-001.pdf');
  const DownloadPath = await Download.path();
  const DownloadedBytes = await readFile(DownloadPath);
  expect(DownloadedBytes.subarray(0, 5).toString()).toBe('%PDF-');
  await expect(page.getByText('Đã tải invoice-ORD-INVOICE-001.pdf.')).toBeVisible();
  expect(ExportRequests).toEqual([{
    OrderId: ConfirmedPaidOrder.OrderId,
    RecipientName: 'Nguyễn Văn An',
    PhoneNumber: '0901234567',
    AddressLine: 'Phòng A101, Ký túc xá Đại học Quốc gia',
    Ward: 'Phường Linh Trung',
    District: 'Thành phố Thủ Đức',
    Province: 'TP. Hồ Chí Minh',
    Note: 'Gọi trước khi giao',
  }]);

  await page.setViewportSize({ width: 390, height: 844 });
  const HasHorizontalOverflow = await page.locator('.admin-invoices').evaluate(
    (Element) => Element.scrollWidth > Element.clientWidth + 1,
  );
  expect(HasHorizontalOverflow).toBe(false);
  expect(PageErrors).toEqual([]);
  expect(UnexpectedRequests).toEqual([]);
  await page.screenshot({ path: 'test-results/admin-invoices-mobile.png', fullPage: true });
});
