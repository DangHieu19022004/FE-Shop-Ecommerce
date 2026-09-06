<template>
  <section v-if="IsLoading" class="order-empty dm-card">
    <h1>Đang tải đơn hàng...</h1>
  </section>
  <section v-else-if="Order" class="order-detail">
    <div class="order-detail__toast" :class="{ 'order-detail__toast--visible': ToastMessage }">
      <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
      <span>{{ ToastMessage }}</span>
    </div>

    <div class="order-detail__topbar">
      <div class="order-detail__topbar-left">
        <router-link :to="{ name: 'orderHistory' }" class="order-detail__back-shell">
          <span class="material-symbols-outlined" aria-hidden="true">arrow_back</span>
        </router-link>
        <div>
          <div class="order-detail__topmeta">
            <span>Đơn Hàng Dorm Mart</span>
            <span>•</span>
            <span class="order-detail__mono">{{ Order.OrderCode }}</span>
          </div>
          <h1 class="order-detail__title">Chi Tiết Đơn Hàng</h1>
        </div>
      </div>
      <div class="order-detail__badge-row">
        <DMBadge :type="statusBadgeType(Order.Status)" dot>
          {{ getStatusBadgeText(Order.Status) }}
        </DMBadge>
        <DMBadge :type="paymentStatusBadgeType(Order.Payment?.Status || Order.PaymentStatus)" icon-name="account_balance">
          {{ getPaymentStatusBadgeText(Order.Payment?.Status || Order.PaymentStatus) }}
        </DMBadge>
      </div>
    </div>

    <article class="order-detail__progress-card dm-card">
      <div class="order-detail__progress-head">
        <div>
          <h2>Tiến trình vận đơn & xử lý</h2>
          <p>Mã đơn: <span class="order-detail__mono order-detail__mono--strong">{{ Order.OrderCode }}</span> | Đặt lúc: {{ Order.CreateDate ? formatDateTime(Order.CreateDate) : '-' }}</p>
        </div>
        <div class="order-detail__progress-user">
          <span class="material-symbols-outlined" aria-hidden="true">person</span>
          <span class="order-detail__mono">{{ getActorDisplay() }}</span>
        </div>
      </div>
      <div class="order-detail__stepper-shell">
        <div class="order-detail__stepper-line">
          <div class="order-detail__stepper-line-fill" :style="{ width: `${StepProgress}%` }"></div>
        </div>
        <div class="order-detail__stepper-grid">
          <div v-for="Step in OrderSteps" :key="Step.Key" class="order-detail__step-card" :class="{
            'order-detail__step-card--done': Step.State === 'done',
            'order-detail__step-card--active': Step.State === 'active',
            'order-detail__step-card--todo': Step.State === 'todo',
            'order-detail__step-card--loading': Step.IsLoading,
          }">
            <div class="order-detail__step-icon-wrap">
              <span v-if="Step.IsLoading" class="material-symbols-outlined order-detail__step-spinner" aria-hidden="true">progress_activity</span>
              <span v-else class="material-symbols-outlined" aria-hidden="true">{{ Step.Icon }}</span>
            </div>
            <span class="order-detail__step-title">{{ Step.Index }}. {{ Step.Label }}</span>
            <span class="order-detail__step-meta">{{ Step.Meta }}</span>
            <span class="order-detail__step-state">{{ Step.StateLabel }}</span>
          </div>
        </div>
      </div>
    </article>

    <div class="order-detail__plan-grid">
      <div class="order-detail__plan-main">
        <article class="order-detail__bank-card dm-card">
          <div class="order-detail__bank-decor order-detail__bank-decor--top"></div>
          <div class="order-detail__bank-decor order-detail__bank-decor--bottom"></div>
          <div class="order-detail__bank-head">
            <div class="order-detail__bank-head-left">
              <div class="order-detail__bank-head-icon">
                <span class="material-symbols-outlined" aria-hidden="true">account_balance_wallet</span>
              </div>
              <div>
                <h3>Thông Tin & QR Chuyển Khoản</h3>
                <p>Phương thức: <strong>{{ getPaymentDisplayName() }}</strong></p>
              </div>
            </div>
            <DMBadge success icon-name="bolt">Tự động kích hoạt</DMBadge>
          </div>

          <div class="order-detail__bank-grid">
            <div class="order-detail__qr-panel">
              <div class="order-detail__qr-box">
                <img v-if="PaymentQrImageUrl" :src="PaymentQrImageUrl" alt="QR thanh toán Sepay" />
                <div v-else class="order-detail__qr-grid">
                  <span v-for="Cell in 121" :key="Cell" :class="['order-detail__qr-cell', { 'order-detail__qr-cell--filled': QrPattern.has(Cell) }]"></span>
                </div>
              </div>
              <div class="order-detail__qr-label">
                <span class="material-symbols-outlined" aria-hidden="true">qr_code_scanner</span>
                <span>Quét VietQR Tự Động</span>
              </div>
              <small>{{ PaymentQrImageUrl ? 'Mở app ngân hàng để quét mã.' : 'Chưa có QR từ API. Bấm làm mới hoặc tạo lại đơn Gateway.' }}</small>
            </div>

            <div class="order-detail__bank-info">
              <div class="order-detail__bank-info-card">
                <span>Ngân Hàng Thụ Hưởng</span>
                <div class="order-detail__bank-info-row">
                  <strong>{{ Order.Payment?.BankName || '-' }}</strong>
                  <span class="order-detail__bank-tag">24/7 Napas</span>
                </div>
                <p>Chủ TK: <strong>{{ Order.Payment?.BankAccountName || '-' }}</strong></p>
              </div>

              <div class="order-detail__copy-card">
                <div>
                  <span>Số Tài Khoản</span>
                  <strong class="order-detail__mono order-detail__copy-value">{{ Order.Payment?.BankAccountNumber || '-' }}</strong>
                </div>
                <button type="button" class="order-detail__copy-button" :disabled="!Order.Payment?.BankAccountNumber" @click="copyValue(Order.Payment?.BankAccountNumber, `Số tài khoản ${Order.Payment?.BankAccountNumber}`)">
                  <span class="material-symbols-outlined" aria-hidden="true">content_copy</span>
                  <span>Sao chép</span>
                </button>
              </div>

              <div class="order-detail__copy-card">
                <div>
                  <span>Số Tiền Chuyển Khoản</span>
                  <strong class="order-detail__copy-value order-detail__copy-value--danger">{{ formatCurrency(Order.Payment?.Amount || Order.Total) }}</strong>
                </div>
                <button type="button" class="order-detail__copy-button" @click="copyValue(String(Order.Payment?.Amount || Order.Total || ''), `Số tiền ${formatCurrency(Order.Payment?.Amount || Order.Total)}`)">
                  <span class="material-symbols-outlined" aria-hidden="true">content_copy</span>
                  <span>Sao chép tiền</span>
                </button>
              </div>

              <div class="order-detail__transfer-card">
                <div class="order-detail__transfer-head">
                  <span>Nội Dung Chuyển Khoản (Bắt buộc)</span>
                  <span>Quan trọng*</span>
                </div>
                <div class="order-detail__transfer-row">
                  <strong class="order-detail__mono order-detail__transfer-code">{{ Order.Payment?.TransferContent || Order.OrderCode }}</strong>
                  <button type="button" class="order-detail__transfer-button" @click="copyValue(Order.Payment?.TransferContent || Order.OrderCode, 'Mã nội dung đơn hàng')">
                    <span class="material-symbols-outlined" aria-hidden="true">copy_all</span>
                    <span>Sao chép nội dung</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="order-detail__note-box">
            <span class="material-symbols-outlined" aria-hidden="true">info</span>
            <p><strong>Lưu ý:</strong> Đơn hàng sẽ được Admin Dorm Mart tự động duyệt sau khi nhận được thông báo chuyển khoản hợp lệ từ ngân hàng. Vui lòng ghi đúng 100% nội dung chuyển khoản để hệ thống đối soát tự động.</p>
          </div>

          <div v-if="IsGatewayPending" class="order-detail__upload-actions" style="margin-bottom: 16px;">
            <button type="button" class="order-detail__submit-proof" :disabled="IsRefreshingPayment" @click="refreshOrderDetail">
              <span class="material-symbols-outlined" aria-hidden="true">sync</span>
              {{ IsRefreshingPayment ? Text.RefreshingPaymentStatus : Text.RefreshPaymentStatus }}
            </button>
            <p style="margin: 12px 0 0; color: #64748b;">{{ Text.GatewayPendingHint }}</p>
          </div>

          <div v-if="IsBankTransfer" class="order-detail__upload-box">
            <div class="order-detail__upload-head">
              <div>
                <h4>Tải Lên Bằng Chứng Chuyển Khoản</h4>
                <p>Ảnh chụp màn hình giao dịch chuyển khoản thành công từ Internet Banking</p>
              </div>
              <span>JPG, PNG, PDF tối đa 10MB</span>
            </div>

            <label class="order-detail__upload-dropzone">
              <input type="file" accept="image/png, image/jpeg, application/pdf,image/*,.pdf" :disabled="IsUploadingProof || !Order.Payment?.PaymentId" @change="handleFileSelect" />
              <div v-if="!SelectedProofFile" class="order-detail__upload-placeholder">
                <div class="order-detail__upload-icon"><span class="material-symbols-outlined" aria-hidden="true">cloud_upload</span></div>
                <p>Kéo thả biên lai vào đây hoặc <span>chọn tệp từ thiết bị</span></p>
                <small>Định dạng hỗ trợ: JPG, PNG, PDF</small>
              </div>
              <div v-else class="order-detail__upload-preview">
                <div class="order-detail__upload-preview-icon"><span class="material-symbols-outlined" aria-hidden="true">receipt_long</span></div>
                <div class="order-detail__upload-preview-content">
                  <strong>{{ SelectedProofFile.name }}</strong>
                  <p>{{ formatSelectedProofSize(SelectedProofFile) }} • Sẵn sàng tải lên</p>
                </div>
                <button type="button" class="order-detail__upload-remove" @click.stop.prevent="removeSelectedFile">
                  <span class="material-symbols-outlined" aria-hidden="true">close</span>
                </button>
              </div>
            </label>

            <div class="order-detail__upload-actions">
              <button type="button" class="order-detail__submit-proof" :disabled="IsUploadingProof || !Order.Payment?.PaymentId" @click="submitSelectedProof">
                <span class="material-symbols-outlined" aria-hidden="true">verified_user</span>
                {{ IsUploadingProof ? Text.Uploading : 'Xác Nhận & Gửi Biên Lai' }}
              </button>
            </div>

            <div v-if="Order.Payment?.Proofs?.length" class="order-detail__proof-list">
              <div v-for="Proof in Order.Payment.Proofs" :key="Proof.PaymentProofId" class="order-detail__proof-item">
                <div>
                  <strong>{{ Proof.FileName }}</strong>
                  <span>{{ formatFileMeta(Proof) }}</span>
                </div>
                <span>{{ Proof.RelativePath || '-' }}</span>
              </div>
            </div>
          </div>
        </article>

        <article v-if="Order.StatusHistories?.length" class="order-detail__history-card dm-card">
          <h3><span class="material-symbols-outlined" aria-hidden="true">history</span>Nhật Ký Đơn Hàng (StatusHistories)</h3>
          <div class="order-detail__history-list">
            <div v-for="HistoryItem in Order.StatusHistories" :key="HistoryItem.OrderStatusHistoryId" class="order-detail__history-item">
              <div class="order-detail__history-icon"><span class="material-symbols-outlined" aria-hidden="true">schedule</span></div>
              <div class="order-detail__history-body">
                <div class="order-detail__history-row">
                  <strong>{{ getStatusLabel(HistoryItem.Status) }}</strong>
                  <span class="order-detail__mono">{{ formatDateTime(HistoryItem.CreateDate) }}</span>
                </div>
                <p>{{ HistoryItem.Note || getHistoryDescription(HistoryItem) }}</p>
                <div class="order-detail__history-actor">
                  <span>Thực hiện bởi:</span>
                  <span class="order-detail__history-actor-tag">{{ HistoryItem.CreatedBy || getActorDisplay() }}</span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div class="order-detail__plan-side">
        <article class="order-detail__address-card dm-card">
          <div class="order-detail__card-head">
            <div>
              <span class="material-symbols-outlined" aria-hidden="true">location_on</span>
              <h3>Địa Chỉ Nhận Hàng</h3>
            </div>
            <DMBadge primary>KTX / Nhà Trọ Sinh Viên</DMBadge>
          </div>
          <div class="order-detail__address-box">
            <div class="order-detail__address-line">
              <strong>{{ Order.Address?.RecipientName || '-' }}</strong>
              <span>•</span>
              <span class="order-detail__mono order-detail__mono--strong">{{ Order.Address?.PhoneNumber || '-' }}</span>
            </div>
            <p>{{ formatAddress(Order.Address) }}</p>
            <div class="order-detail__address-foot">
              <span class="material-symbols-outlined" aria-hidden="true">local_shipping</span>
              <span>{{ Order.Shipment?.CarrierName || 'Giao giờ hành chính hoặc ngoài giờ hỗ trợ sinh viên' }}</span>
            </div>
          </div>
        </article>

        <article class="order-detail__products-card dm-card">
          <div class="order-detail__card-head">
            <div>
              <span class="material-symbols-outlined" aria-hidden="true">shopping_bag</span>
              <h3>Sản Phẩm Đã Mua ({{ Order.Items.length }})</h3>
            </div>
            <span class="order-detail__muted">{{ Order.Items.length }} {{ HistoryText.ProductCount.toLowerCase() }}</span>
          </div>
          <div class="order-detail__product-list">
            <div v-for="Item in Order.Items" :key="Item.OrderItemId" class="order-detail__product-card">
              <div class="order-detail__product-image-wrap">
                <img :src="Item.PrimaryImageUrl || 'https://placehold.co/240x240?text=No+Image'" :alt="Item.ProductName" />
                <span class="order-detail__product-chip">Dorm Choice</span>
              </div>
              <div class="order-detail__product-content">
                <div>
                  <h4 :title="Item.ProductName">{{ Item.ProductName }}</h4>
                  <div class="order-detail__variant-row">
                    <span v-if="Item.Color">Màu: {{ Item.Color }}</span>
                    <span v-if="Item.Size">Kích thước: {{ Item.Size }}</span>
                    <span v-if="!Item.Color && !Item.Size">{{ Item.VariantName || '-' }}</span>
                  </div>
                  <p>SKU: {{ Item.Sku || '-' }}</p>
                </div>
                <div class="order-detail__product-foot">
                  <div class="order-detail__review-inline">
                    <span class="material-symbols-outlined" aria-hidden="true">star</span>
                    <span>{{ ReviewSummaries[Item.ProductId]?.AverageRating || '5.0' }}</span>
                    <small>({{ Text.ReviewCountPrefix }} {{ ReviewSummaries[Item.ProductId]?.ReviewCount || 0 }})</small>
                  </div>
                  <div class="order-detail__price-inline">
                    <strong>{{ formatCurrency(Item.LineTotal) }}</strong>
                    <span>x {{ Item.Quantity }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        <article class="order-detail__summary-card dm-card">
          <h3><span class="material-symbols-outlined" aria-hidden="true">receipt</span>Chi Tiết Thanh Toán</h3>
          <div class="order-detail__summary-list">
            <div><span>Tổng tiền hàng:</span><span>{{ formatCurrency(Order.Subtotal) }}</span></div>
            <div><span>{{ Text.ShippingFee }}:</span><span>{{ formatCurrency(Order.ShippingFee) }}</span></div>
            <div><span>Voucher giảm giá:</span><span>{{ Order.Discount ? `-${formatCurrency(Order.Discount)}` : formatCurrency(0) }}</span></div>
            <div><span>Thuế VAT (8%):</span><span>Đã bao gồm</span></div>
          </div>
          <div class="order-detail__summary-total-box">
            <div>
              <span>Tổng cộng thanh toán:</span>
              <strong>{{ formatCurrency(Order.Total) }}</strong>
            </div>
            <p>Phương thức: {{ getPaymentDisplayName() }}</p>
          </div>
          <div class="order-detail__summary-actions">
            <button v-if="IsCancelable" type="button" class="order-detail__danger-button" @click="handleCancelOrder">
              <span class="material-symbols-outlined" aria-hidden="true">cancel</span>
              Hủy Đơn Hàng Này (Đang Chờ Duyệt)
            </button>
            <router-link :to="{ name: 'orderHistory' }" class="order-detail__primary-link">
              <span class="material-symbols-outlined" aria-hidden="true">shopping_cart_checkout</span>
              Quay Lại Danh Sách Đơn Mua
            </router-link>
          </div>
        </article>

        <article v-if="Order.Shipment || Order.Note || canReviewOrder" class="order-detail__extra-card dm-card">
          <div v-if="Order.Shipment" class="order-detail__extra-block">
            <h3>{{ Text.ShipmentTitle }}</h3>
            <dl>
              <div><dt>{{ Text.ShipmentStatus }}</dt><dd>{{ getShipmentStatusLabel(Order.Shipment.Status) }}</dd></div>
              <div><dt>{{ Text.ShipmentCarrier }}</dt><dd>{{ Order.Shipment.CarrierName || Order.Shipment.Provider || '-' }}</dd></div>
              <div><dt>{{ Text.ShipmentCode }}</dt><dd>{{ Order.Shipment.TrackingCode || '-' }}</dd></div>
              <div><dt>{{ Text.ShipmentNote }}</dt><dd>{{ Order.Shipment.Note || '-' }}</dd></div>
            </dl>
          </div>

          <div v-if="Order.Note" class="order-detail__extra-block">
            <h3>Ghi chú đơn hàng</h3>
            <p class="order-detail__note-text">{{ Order.Note }}</p>
          </div>

          <div v-if="canReviewOrder" class="order-detail__extra-block">
            <h3>{{ Text.SubmitReview }}</h3>
            <div v-for="Item in Order.Items" :key="`review-${Item.OrderItemId}`" class="order-detail__review dm-card">
              <div class="order-detail__review-head">
                <strong>{{ Item.ProductName }}</strong>
                <small>{{ Text.SubmitReviewDescription }}</small>
              </div>
              <div class="order-detail__review-grid">
                <DMInput v-model="ReviewForms[Item.OrderItemId].Rating" type="number" :label="Text.RatingLabel" />
                <DMInput v-model="ReviewForms[Item.OrderItemId].Title" :label="Text.ReviewTitleLabel" />
              </div>
              <DMTextarea v-model="ReviewForms[Item.OrderItemId].Content" :label="Text.ReviewContentLabel" :placeholder="Text.ReviewContentPlaceholder" :max-length="250" :rows="3" />
              <DMButton type="none" :is-tooltip="false" :message="Text.SubmitReview" class="admin-button" @click="submitReview(Item)" />
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
  <section v-else class="order-empty dm-card">
    <h1>{{ ErrorMessage || Text.OrderNotFound }}</h1><router-link :to="{ name: 'orderHistory' }" class="dm-btn">{{ Text.BackToOrders }}</router-link>
  </section>
</template>

<script setup>
import { computed, inject, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import DMTextarea from "@/components/base/DMTextarea.vue";
import { cancelOrder, getOrders, getOrderById } from "@/services/orderService";
import { uploadPaymentProof } from "@/services/adminService";
import { createReview, getProductReviews } from "@/services/expansionService";
import { formatI18nText } from "@/utils/i18n";
import { formatAddress, formatCurrency, formatDateTime } from "@/utils/shopFormatters";

const Route = useRoute();
const I18n = inject("i18nCommon");
const Text = I18n.OrderDetail;
const HistoryText = I18n.OrderHistory;
const Order = ref(null);
const ReviewSummaries = ref({});
const ReviewForms = ref({});
const IsLoading = ref(false);
const ErrorMessage = ref("");
const ActionMessage = ref("");
const IsUploadingProof = ref(false);
const IsRefreshingPayment = ref(false);
const SelectedProofFile = ref(null);
const ToastMessage = ref("");
let ToastTimer = null;
const QrPattern = new Set([1,2,3,4,5,12,16,23,24,25,34,36,45,46,47,56,57,58,63,67,69,71,72,73,78,81,84,89,90,91,94,95,100,103,104,105,108,111,114,116,117,118,119,120,121]);

const loadOrderDetail = async () => {
  IsLoading.value = true;
  ErrorMessage.value = "";

  try {
    const Orders = await getOrders();
    const Summary = Orders.find((OrderItem) => OrderItem.OrderCode === Route.params.orderCode);
    if (!Summary) {
      Order.value = null;
      return;
    }

    Order.value = await getOrderById(Summary.OrderId);
    await Promise.all((Order.value?.Items || []).map(async (Item) => {
      ReviewForms.value[Item.OrderItemId] = ReviewForms.value[Item.OrderItemId] || { Rating: 5, Title: "", Content: "" };
      try {
        ReviewSummaries.value[Item.ProductId] = await getProductReviews(Item.ProductId);
      } catch {
        // ponytail: skip per-product review summary failure on order detail; add inline retry when review UX matters.
      }
    }));
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsLoading.value = false;
  }
};

const handleCancelOrder = async () => {
  if (!Order.value) return;

  try {
    Order.value = await cancelOrder(Order.value.OrderId);
    ActionMessage.value = "Đã gửi yêu cầu hủy đơn.";
  } catch (Error) {
    ActionMessage.value = Error.message;
  }
};

const refreshOrderDetail = async () => {
  if (!Order.value?.OrderId) return;

  IsRefreshingPayment.value = true;
  try {
    Order.value = await getOrderById(Order.value.OrderId);
    ActionMessage.value = "Đã làm mới trạng thái thanh toán.";
  } catch (Error) {
    ActionMessage.value = Error.message;
  } finally {
    IsRefreshingPayment.value = false;
  }
};

const STATUS_LABELS = {
  PendingApproval: HistoryText.StatusPendingApproval,
  Confirmed: HistoryText.StatusConfirmed,
  Rejected: HistoryText.StatusRejected,
  Preparing: HistoryText.StatusPreparing,
  ReadyToShip: HistoryText.StatusReadyToShip,
  Shipping: HistoryText.StatusShipping,
  Completed: HistoryText.StatusCompleted,
  Cancelled: HistoryText.StatusCancelled,
};

const PAYMENT_METHOD_LABELS = {
  Cod: HistoryText.PaymentMethodCod,
  BankTransfer: HistoryText.PaymentMethodBankTransfer,
  Gateway: HistoryText.PaymentMethodGateway,
};

const PAYMENT_STATUS_LABELS = {
  Pending: HistoryText.PaymentStatusPending,
  AwaitingProof: HistoryText.PaymentStatusAwaitingProof,
  UnderReview: HistoryText.PaymentStatusUnderReview,
  Rejected: HistoryText.PaymentStatusRejected,
  Cancelled: HistoryText.PaymentStatusCancelled,
  Paid: HistoryText.PaymentStatusPaid,
  Refunded: HistoryText.PaymentStatusRefunded,
};

const SHIPMENT_STATUS_LABELS = {
  Pending: "Chờ xử lý",
  ReadyToShip: "Sẵn sàng giao",
  Shipping: "Đang giao",
  Delivered: "Đã giao",
  Failed: "Giao thất bại",
  Cancelled: "Đã hủy",
};

const ORDER_STEP_DEFINITIONS = [
  { Key: "PendingApproval", Label: "Đặt hàng thành công", Icon: "check", ActiveMeta: "Đơn vừa được tạo", DoneLabel: "Hoàn tất", ActiveLabel: "Hiện tại", TodoLabel: "Chờ xử lý" },
  { Key: "Confirmed", Label: "Chuyển khoản & Duyệt", Icon: "sync", ActiveMeta: "Đang chờ thanh toán", DoneLabel: "Hoàn tất", ActiveLabel: "Hiện tại", TodoLabel: "Chờ duyệt" },
  { Key: "Preparing", Label: "Đóng gói chuẩn bị", Icon: "inventory_2", ActiveMeta: "Kho Dorm Mart", DoneLabel: "Hoàn tất", ActiveLabel: "Hiện tại", TodoLabel: "Chờ duyệt" },
  { Key: "Shipping", Label: "Đang giao hàng", Icon: "local_shipping", ActiveMeta: "Shipper KTX", DoneLabel: "Hoàn tất", ActiveLabel: "Hiện tại", TodoLabel: "Dự kiến 24-48h" },
  { Key: "Completed", Label: "Nhận hàng thành công", Icon: "verified", ActiveMeta: "Hoàn tất đơn", DoneLabel: "Hoàn tất", ActiveLabel: "Hiện tại", TodoLabel: "Chờ giao" },
];

const getEnumKey = (Value, Labels) => {
  if (Value == null || Value === "") return null;
  if (typeof Value === "string") return Labels[Value] ? Value : Value;
  const NumericIndex = Number(Value);
  return Number.isInteger(NumericIndex) ? Object.keys(Labels)[NumericIndex] || null : null;
};

const normalizeEnumValue = (Value, Labels) => {
  const EnumKey = getEnumKey(Value, Labels);
  if (!EnumKey) return Value == null || Value === "" ? "-" : String(Value);
  return Labels[EnumKey] || EnumKey;
};

const getStatusLabel = (StatusCode) => normalizeEnumValue(StatusCode, STATUS_LABELS);
const getPaymentLabel = (PaymentMethod) => normalizeEnumValue(PaymentMethod, PAYMENT_METHOD_LABELS);
const getPaymentStatusLabel = (PaymentStatus) => normalizeEnumValue(PaymentStatus, PAYMENT_STATUS_LABELS);
const getShipmentStatusLabel = (ShipmentStatus) => normalizeEnumValue(ShipmentStatus, SHIPMENT_STATUS_LABELS);
const getStatusKey = (StatusCode) => getEnumKey(StatusCode, STATUS_LABELS);
const getPaymentStatusKey = (PaymentStatus) => getEnumKey(PaymentStatus, PAYMENT_STATUS_LABELS);
const getShipmentStatusKey = (ShipmentStatus) => getEnumKey(ShipmentStatus, SHIPMENT_STATUS_LABELS);
const getStatusBadgeText = (StatusCode) => {
  const Label = getStatusLabel(StatusCode);
  return typeof StatusCode === "string" ? `${Label} (${StatusCode})` : Label;
};
const getPaymentStatusBadgeText = (PaymentStatus) => getPaymentStatusLabel(PaymentStatus);
const statusBadgeType = (StatusCode) => {
  const StatusKey = getStatusKey(StatusCode);
  if (["Rejected", "Cancelled"].includes(StatusKey)) return "error";
  if (StatusKey === "Completed") return "success";
  if (StatusKey === "Shipping") return "info";
  if (["PendingApproval", "Confirmed", "Preparing", "ReadyToShip"].includes(StatusKey)) return "warning";
  return "neutral";
};
const paymentStatusBadgeType = (PaymentStatus) => {
  const PaymentStatusKey = getPaymentStatusKey(PaymentStatus);
  if (PaymentStatusKey === "Paid") return "success";
  if (["Rejected", "Cancelled", "Refunded"].includes(PaymentStatusKey)) return "error";
  if (["Pending", "AwaitingProof", "UnderReview"].includes(PaymentStatusKey)) return "warning";
  return "neutral";
};

const CurrentStatusKey = computed(() => getStatusKey(Order.value?.Status));
const CurrentPaymentStatusKey = computed(() => getPaymentStatusKey(Order.value?.Payment?.Status || Order.value?.PaymentStatus));
const CurrentPaymentMethodKey = computed(() => getEnumKey(Order.value?.Payment?.PaymentMethod || Order.value?.PaymentMethod, PAYMENT_METHOD_LABELS));
const IsBankTransfer = computed(() => CurrentPaymentMethodKey.value === "BankTransfer");
const IsGateway = computed(() => CurrentPaymentMethodKey.value === "Gateway");
const PaymentQrImageUrl = computed(() => {
  const Payment = Order.value?.Payment;
  if (Payment?.QrImageUrl) return Payment.QrImageUrl;
  if (!Payment?.BankAccountNumber || !Payment?.BankName || !(Payment.TransferContent || Order.value?.OrderCode)) return null;
  return `https://vietqr.app/img?acc=${encodeURIComponent(Payment.BankAccountNumber)}&bank=${encodeURIComponent(Payment.BankName)}&amount=${Number(Payment.Amount || Order.value?.Total || 0)}&des=${encodeURIComponent(Payment.TransferContent || Order.value.OrderCode)}`;
});
const IsGatewayPending = computed(() => IsGateway.value && ["Pending", "AwaitingProof", "UnderReview"].includes(CurrentPaymentStatusKey.value));
const IsCancelable = computed(() => CurrentStatusKey.value === "PendingApproval");
const canReviewOrder = computed(() => CurrentStatusKey.value === "Completed");
const ProofCount = computed(() => Order.value?.Payment?.ProofCount || Order.value?.Payment?.Proofs?.length || 0);
const OrderSteps = computed(() => {
  const StatusKey = CurrentStatusKey.value;
  const PaymentStatusKey = CurrentPaymentStatusKey.value;
  const HistoryMap = new Map((Order.value?.StatusHistories || []).map((HistoryItem) => [getStatusKey(HistoryItem.Status) || HistoryItem.Status, HistoryItem]));
  const IsCancelled = ["Rejected", "Cancelled"].includes(StatusKey);
  const IsPastApproval = ["Confirmed", "Preparing", "ReadyToShip", "Shipping", "Completed"].includes(StatusKey);
  const IsPaymentReviewStep = IsBankTransfer.value
    && ["PendingApproval", "Confirmed"].includes(StatusKey)
    && ["Pending", "AwaitingProof", "UnderReview"].includes(PaymentStatusKey);
  const IsPaymentStepDone = IsBankTransfer.value
    && (["Paid"].includes(PaymentStatusKey) || IsPastApproval);
  const ActiveStepKey = IsCancelled
    ? null
    : IsPaymentReviewStep
      ? "Confirmed"
      : StatusKey;
  const CurrentIndex = ORDER_STEP_DEFINITIONS.findIndex((Step) => Step.Key === ActiveStepKey);

  return ORDER_STEP_DEFINITIONS.map((Step, Index) => {
    const HistoryItem = HistoryMap.get(Step.Key);
    let State = "todo";

    if (IsCancelled) {
      State = HistoryItem ? "done" : "todo";
    } else if (Step.Key === "PendingApproval") {
      State = Order.value?.OrderId ? (ActiveStepKey === "PendingApproval" ? "active" : "done") : "todo";
    } else if (Step.Key === "Confirmed" && IsBankTransfer.value) {
      State = IsPaymentReviewStep ? "active" : IsPaymentStepDone ? "done" : "todo";
    } else {
      State = Index < CurrentIndex ? "done" : Index === CurrentIndex ? "active" : "todo";
    }

    return {
      ...Step,
      Index: Index + 1,
      State,
      IsLoading: State === "active" && ((Step.Key === "Confirmed" && IsPaymentReviewStep) || ["PendingApproval", "Preparing", "Shipping"].includes(Step.Key)),
      Meta: HistoryItem?.CreateDate
        ? formatDateTime(HistoryItem.CreateDate)
        : State === "active"
          ? (Step.Key === "Confirmed" && IsPaymentReviewStep ? "Đang chờ chuyển khoản hoặc duyệt biên lai" : Step.ActiveMeta)
          : Step.TodoLabel,
      StateLabel: State === "done" ? Step.DoneLabel : State === "active" ? Step.ActiveLabel : Step.TodoLabel,
    };
  });
});

const StepProgress = computed(() => {
  const ActiveIndex = OrderSteps.value.findIndex((Step) => Step.State === "active");
  if (ActiveIndex >= 0) return ActiveIndex * 25;
  const DoneCount = OrderSteps.value.filter((Step) => Step.State === "done").length;
  return DoneCount <= 1 ? 0 : (DoneCount - 1) * 25;
});

const formatFileMeta = (Proof) => {
  const Parts = [];
  if (Proof?.ContentType) Parts.push(Proof.ContentType);
  if (Number.isFinite(Number(Proof?.FileSize))) Parts.push(`${(Number(Proof.FileSize) / 1024 / 1024).toFixed(2)} MB`);
  if (Proof?.CreateDate) Parts.push(formatDateTime(Proof.CreateDate));
  return Parts.join(" · ") || "-";
};

const getDeliveryDisplay = () => {
  if (Order.value?.Shipment?.DeliveredAt) return formatDateTime(Order.value.Shipment.DeliveredAt);
  if (Order.value?.Shipment?.ShippedAt) return formatDateTime(Order.value.Shipment.ShippedAt);
  return "-";
};

const getPaymentDisplayName = () => {
  const Method = getPaymentLabel(Order.value?.Payment?.PaymentMethod || Order.value?.PaymentMethod);
  const Bank = Order.value?.Payment?.BankName;
  return Bank ? `${Method} ${Bank}` : Method;
};

const getActorDisplay = () => {
  const LatestActor = Order.value?.StatusHistories?.findLast?.((HistoryItem) => HistoryItem.CreatedBy)?.CreatedBy;
  return LatestActor || Order.value?.Address?.RecipientName || "Khách hàng";
};

const getHistoryDescription = (HistoryItem) => {
  if (HistoryItem?.Status === "PendingApproval") {
    return `Khách hàng đã khởi tạo đơn hàng với phương thức ${getPaymentLabel(Order.value?.Payment?.PaymentMethod || Order.value?.PaymentMethod)}.`;
  }
  return `Hệ thống cập nhật đơn sang trạng thái ${getStatusLabel(HistoryItem?.Status)}.`;
};

const showToast = (Message) => {
  ToastMessage.value = Message;
  if (ToastTimer) clearTimeout(ToastTimer);
  ToastTimer = setTimeout(() => {
    ToastMessage.value = "";
  }, 2800);
};

const copyValue = async (Value, Label) => {
  if (!Value) return;

  try {
    await navigator.clipboard.writeText(String(Value));
    showToast(`Đã sao chép: ${Label}`);
  } catch {
    ActionMessage.value = `Không thể sao chép: ${Label}`;
  }
};

const handleFileSelect = (Event) => {
  const File = Event.target.files?.[0] || null;
  SelectedProofFile.value = File;
  if (File) {
    showToast(`Đã đính kèm: ${File.name}`);
  }
};

const removeSelectedFile = () => {
  SelectedProofFile.value = null;
  showToast("Đã hủy chọn tệp");
};

const formatSelectedProofSize = (File) => `${(Number(File?.size || 0) / 1024 / 1024).toFixed(2)} MB`;

const submitSelectedProof = async () => {
  if (!SelectedProofFile.value || !Order.value?.Payment?.PaymentId) {
    showToast("Vui lòng chọn ảnh chụp biên lai trước khi gửi!");
    return;
  }

  IsUploadingProof.value = true;
  try {
    const PaymentData = await uploadPaymentProof(Order.value.Payment.PaymentId, SelectedProofFile.value);
    Order.value = {
      ...Order.value,
      Payment: PaymentData,
    };
    SelectedProofFile.value = null;
    showToast("Tải lên biên lai thành công!");
    ActionMessage.value = "Đã upload payment proof.";
  } catch (Error) {
    ActionMessage.value = Error.message;
  } finally {
    IsUploadingProof.value = false;
  }
};

const submitReview = async (Item) => {
  const Form = ReviewForms.value[Item.OrderItemId];
  if (!Form || !Form.Title.trim()) {
    ActionMessage.value = "Nhập tiêu đề review trước khi gửi.";
    return;
  }

  try {
    await createReview({
      ProductId: Item.ProductId,
      OrderItemId: Item.OrderItemId,
      Rating: Number(Form.Rating) || 5,
      Title: Form.Title.trim(),
      Content: Form.Content.trim() || null,
    });
    ActionMessage.value = formatI18nText(Text.ReviewSubmitted, { name: Item.ProductName });
    ReviewSummaries.value[Item.ProductId] = await getProductReviews(Item.ProductId);
  } catch (Error) {
    ActionMessage.value = Error.message;
  }
};

const handleProofChange = async (Event) => {
  handleFileSelect(Event);
};

onMounted(loadOrderDetail);
</script>

<style scoped lang="scss" src="@/assets/styles/screens/order-history.scss"></style>
