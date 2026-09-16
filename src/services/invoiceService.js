import { formatCurrency } from "@/utils/shopFormatters";

const escapeHtml = (Value) => String(Value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const fullAddress = (Form) => [
  Form.AddressLine,
  Form.Ward,
  Form.District,
  Form.Province,
].map((Value) => String(Value || "").trim()).filter(Boolean).join(", ");

export const buildInvoiceQrPayload = ({ Order, Form }) => JSON.stringify({
  OrderCode: Order?.OrderCode || "",
  RecipientName: Form?.RecipientName || "",
  PhoneNumber: Form?.PhoneNumber || "",
  Address: fullAddress(Form || {}),
}, null, 2);

export const buildInvoiceQrDataUrl = async ({ Order, Form }) => {
  const { default: QRCode } = await import("qrcode");
  return QRCode.toDataURL(buildInvoiceQrPayload({ Order, Form }), {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 280,
    color: { dark: "#0f2747", light: "#ffffff" },
  });
};

const itemRows = (Order) => {
  const ProductRows = (Order?.Items || []).map((Item) => ({
    Name: [Item.ProductName, Item.VariantName].filter(Boolean).join(" - "),
    Sku: Item.Sku || "-",
    Quantity: Number(Item.Quantity || 0),
    UnitPrice: Number(Item.UnitPrice || 0),
    LineTotal: Number(Item.LineTotal ?? Number(Item.UnitPrice || 0) * Number(Item.Quantity || 0)),
  }));
  const ComboRows = (Order?.Combos || []).map((Item) => ({
    Name: `Combo: ${Item.Name || Item.ComboCode || "Combo"}`,
    Sku: Item.ComboCode || "-",
    Quantity: Number(Item.Quantity || 0),
    UnitPrice: Number(Item.UnitPrice ?? Item.LineTotal ?? 0),
    LineTotal: Number(Item.LineTotal || 0),
  }));
  return [...ProductRows, ...ComboRows];
};

const buildInvoiceMarkup = ({ Order, Form, QrDataUrl, IssuedAt }) => {
  const Rows = itemRows(Order);
  const RowsMarkup = Rows.map((Item, Index) => `
    <tr>
      <td style="padding:11px 8px;border-bottom:1px solid #e5e7eb;color:#64748b;text-align:center">${Index + 1}</td>
      <td style="padding:11px 8px;border-bottom:1px solid #e5e7eb"><strong style="display:block;color:#0f2747">${escapeHtml(Item.Name)}</strong><small style="color:#64748b">SKU: ${escapeHtml(Item.Sku)}</small></td>
      <td style="padding:11px 8px;border-bottom:1px solid #e5e7eb;text-align:center">${Item.Quantity}</td>
      <td style="padding:11px 8px;border-bottom:1px solid #e5e7eb;text-align:right">${escapeHtml(formatCurrency(Item.UnitPrice))}</td>
      <td style="padding:11px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700">${escapeHtml(formatCurrency(Item.LineTotal))}</td>
    </tr>
  `).join("");

  return `
    <div style="box-sizing:border-box;width:794px;min-height:1123px;padding:52px 58px;background:#fff;color:#1f2937;font-family:Arial,'Segoe UI',sans-serif;font-size:14px;line-height:1.45">
      <header style="display:flex;justify-content:space-between;gap:32px;padding-bottom:24px;border-bottom:4px solid #fbbf24">
        <div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="display:grid;width:52px;height:52px;place-items:center;border-radius:16px;background:#fbbf24;color:#0f2747;font-size:28px;font-weight:900">DM</div>
            <div><strong style="display:block;color:#0f2747;font-size:24px;line-height:1">DORM MART</strong><span style="color:#64748b;font-size:12px">Tiện dụng - Nhanh chóng - Tiết kiệm</span></div>
          </div>
          <p style="margin:16px 0 0;color:#64748b">Tạp Hóa Sinh Viên</p>
        </div>
        <div style="text-align:right">
          <h1 style="margin:0;color:#0f2747;font-size:30px;letter-spacing:.02em">HÓA ĐƠN BÁN HÀNG</h1>
          <strong style="display:block;margin-top:8px;color:#dc2626;font-size:17px">#${escapeHtml(Order.OrderCode)}</strong>
          <span style="color:#64748b;font-size:12px">Ngày xuất: ${escapeHtml(IssuedAt)}</span>
        </div>
      </header>

      <section style="display:grid;grid-template-columns:1fr 190px;gap:28px;padding:28px 0">
        <div>
          <p style="margin:0 0 12px;color:#64748b;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase">Thông tin giao hàng</p>
          <h2 style="margin:0 0 8px;color:#0f2747;font-size:21px">${escapeHtml(Form.RecipientName)}</h2>
          <p style="margin:5px 0"><strong>Số điện thoại:</strong> ${escapeHtml(Form.PhoneNumber)}</p>
          <p style="margin:5px 0"><strong>Địa chỉ:</strong> ${escapeHtml(fullAddress(Form))}</p>
          ${Form.Note ? `<p style="margin:12px 0 0;padding:10px 12px;border-radius:8px;background:#f8fafc;color:#475569"><strong>Ghi chú:</strong> ${escapeHtml(Form.Note)}</p>` : ""}
        </div>
        <div style="text-align:center">
          <img src="${QrDataUrl}" alt="QR thông tin giao hàng" style="display:block;width:156px;height:156px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px" />
          <strong style="display:block;margin-top:7px;color:#0f2747;font-size:11px">QUÉT ĐỂ XEM ĐỊA CHỈ & SĐT</strong>
        </div>
      </section>

      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr style="background:#0f2747;color:#fff">
          <th style="width:34px;padding:10px 8px;text-align:center">STT</th>
          <th style="padding:10px 8px;text-align:left">Sản phẩm</th>
          <th style="width:48px;padding:10px 8px;text-align:center">SL</th>
          <th style="width:105px;padding:10px 8px;text-align:right">Đơn giá</th>
          <th style="width:110px;padding:10px 8px;text-align:right">Thành tiền</th>
        </tr></thead>
        <tbody>${RowsMarkup || `<tr><td colspan="5" style="padding:18px;text-align:center;color:#64748b">Không có sản phẩm</td></tr>`}</tbody>
      </table>

      <section style="display:grid;grid-template-columns:1fr 280px;gap:30px;padding-top:24px">
        <div style="padding:16px;border-radius:10px;background:#f8fafc;color:#64748b;font-size:12px">
          <strong style="display:block;margin-bottom:7px;color:#0f2747">LƯU Ý KHI NHẬN HÀNG</strong>
          Vui lòng kiểm tra đúng mã đơn và tình trạng sản phẩm trước khi nhận. Giữ hóa đơn để được hỗ trợ đổi trả theo chính sách Dorm Mart.
        </div>
        <dl style="margin:0">
          <div style="display:flex;justify-content:space-between;padding:5px 0"><dt>Tạm tính</dt><dd style="margin:0;font-weight:700">${escapeHtml(formatCurrency(Order.Subtotal))}</dd></div>
          <div style="display:flex;justify-content:space-between;padding:5px 0"><dt>Phí vận chuyển</dt><dd style="margin:0;font-weight:700">${escapeHtml(formatCurrency(Order.ShippingFee))}</dd></div>
          <div style="display:flex;justify-content:space-between;padding:5px 0"><dt>Giảm giá</dt><dd style="margin:0;font-weight:700;color:#16a34a">-${escapeHtml(formatCurrency(Order.Discount))}</dd></div>
          <div style="display:flex;justify-content:space-between;margin-top:7px;padding:12px 0;border-top:2px solid #0f2747;color:#0f2747"><dt style="font-weight:900">TỔNG THANH TOÁN</dt><dd style="margin:0;color:#dc2626;font-size:19px;font-weight:900">${escapeHtml(formatCurrency(Order.Total))}</dd></div>
        </dl>
      </section>

      <footer style="margin-top:42px;padding-top:18px;border-top:1px solid #e5e7eb;text-align:center;color:#64748b;font-size:11px">
        Cảm ơn bạn đã mua sắm tại Dorm Mart · Hóa đơn được tạo tự động từ hệ thống quản trị
      </footer>
    </div>
  `;
};

export const generateInvoicePdf = async ({ Order, Form }) => {
  const [{ default: html2canvas }, { jsPDF }, QrDataUrl] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
    buildInvoiceQrDataUrl({ Order, Form }),
  ]);
  const IssuedAt = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());
  const InvoiceElement = document.createElement("div");
  InvoiceElement.setAttribute("aria-hidden", "true");
  InvoiceElement.style.cssText = "position:fixed;left:-10000px;top:0;width:794px;background:#fff;z-index:-1";
  InvoiceElement.innerHTML = buildInvoiceMarkup({ Order, Form, QrDataUrl, IssuedAt });
  document.body.appendChild(InvoiceElement);

  try {
    const Canvas = await html2canvas(InvoiceElement.firstElementChild, {
      scale: 2,
      backgroundColor: "#ffffff",
      logging: false,
      useCORS: true,
    });
    const Document = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const Margin = 8;
    const PageWidth = Document.internal.pageSize.getWidth();
    const PageHeight = Document.internal.pageSize.getHeight();
    const ImageWidth = PageWidth - Margin * 2;
    const ImageHeight = (Canvas.height * ImageWidth) / Canvas.width;
    const ImageData = Canvas.toDataURL("image/jpeg", 0.96);
    let RemainingHeight = ImageHeight;
    let Position = Margin;

    Document.addImage(ImageData, "JPEG", Margin, Position, ImageWidth, ImageHeight, undefined, "FAST");
    RemainingHeight -= PageHeight - Margin * 2;

    while (RemainingHeight > 0) {
      Position -= PageHeight - Margin * 2;
      Document.addPage();
      Document.addImage(ImageData, "JPEG", Margin, Position, ImageWidth, ImageHeight, undefined, "FAST");
      RemainingHeight -= PageHeight - Margin * 2;
    }

    const SafeOrderCode = String(Order.OrderCode || Order.OrderId || "hoa-don").replace(/[^a-zA-Z0-9_-]/g, "-");
    const FileName = `hoa-don-${SafeOrderCode}.pdf`;
    Document.save(FileName);
    return { FileName, QrPayload: buildInvoiceQrPayload({ Order, Form }) };
  } finally {
    InvoiceElement.remove();
  }
};
