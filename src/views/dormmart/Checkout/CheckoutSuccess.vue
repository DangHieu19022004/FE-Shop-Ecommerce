<template>
  <section v-if="IsLoading" class="checkout-success__empty dm-card">
    <h1>Đang tải đơn hàng...</h1>
  </section>
  <section v-else-if="Order" class="checkout-success">
    <div class="checkout-success__topbar">
      <router-link :to="{ name: 'orderHistory' }" class="checkout-success__back">
        <span class="material-symbols-outlined" aria-hidden="true">arrow_back</span>
      </router-link>
      <div>
        <div class="checkout-success__meta">
          <span>Đơn Hàng Dorm Mart</span>
          <span>•</span>
          <span class="checkout-success__mono">{{ Order.OrderCode }}</span>
        </div>
        <h1>Thanh Toán Thành Công</h1>
      </div>
      <div class="checkout-success__badges">
        <DMBadge :type="statusBadgeType(Order.Status)" icon-name="inventory_2">{{ getStatusLabel(Order.Status) }}</DMBadge>
        <DMBadge :type="paymentBadgeType(PaymentStatusKey)" icon-name="check_circle">{{ getPaymentStatusLabel(Order.Payment?.Status || Order.PaymentStatus) }}</DMBadge>
      </div>
    </div>

    <article class="checkout-success__progress dm-card">
      <div>
        <h2>Tiến trình vận đơn & xử lý</h2>
        <p>Mã đơn: <strong class="checkout-success__mono">{{ Order.OrderCode }}</strong> | Đặt lúc: {{ Order.CreateDate ? formatDateTime(Order.CreateDate) : '-' }}</p>
      </div>
      <div class="checkout-success__steps">
        <div v-for="Step in Steps" :key="Step.Key" class="checkout-success__step" :class="`checkout-success__step--${Step.State}`">
          <span class="material-symbols-outlined" aria-hidden="true">{{ Step.Icon }}</span>
          <strong>{{ Step.Index }}. {{ Step.Label }}</strong>
          <small>{{ Step.Meta }}</small>
          <em>{{ Step.StateLabel }}</em>
        </div>
      </div>
    </article>

    <div class="checkout-success__grid">
      <div class="checkout-success__main">
        <article class="checkout-success__paid-card dm-card">
          <div class="checkout-success__paid-head">
            <span class="material-symbols-outlined" aria-hidden="true">verified</span>
            <div>
              <h2>{{ PaymentStatusKey === 'Paid' ? 'Thanh toán đã xác nhận' : 'Đơn đã tạo thành công' }}</h2>
              <p>Phương thức: <strong>{{ getPaymentLabel(Order.Payment?.PaymentMethod || Order.PaymentMethod) }}</strong></p>
            </div>
            <DMBadge :type="paymentBadgeType(PaymentStatusKey)" dot>{{ getPaymentStatusLabel(Order.Payment?.Status || Order.PaymentStatus) }}</DMBadge>
          </div>

          <div class="checkout-success__payment-grid">
            <div>
              <span>Mã giao dịch</span>
              <strong class="checkout-success__mono">{{ Order.Payment?.TransactionRef || Order.OrderCode }}</strong>
            </div>
            <div>
              <span>Số tiền thanh toán</span>
              <strong class="checkout-success__danger">{{ formatCurrency(Order.Payment?.Amount || Order.Total) }}</strong>
            </div>
            <div>
              <span>Thời gian xác nhận</span>
              <strong>{{ getPaymentTime() }}</strong>
            </div>
          </div>

          <div v-if="PaymentQrImageUrl" class="checkout-success__qr-block">
            <img :src="PaymentQrImageUrl" alt="QR thanh toán VietQR" />
            <div>
              <h3>Quét VietQR để hoàn tất thanh toán</h3>
              <p>Nội dung chuyển khoản: <strong class="checkout-success__mono">{{ Order.Payment?.TransferContent || Order.OrderCode }}</strong></p>
              <button type="button" class="checkout-success__copy" @click="copyTransferContent">
                <span class="material-symbols-outlined" aria-hidden="true">content_copy</span>
                Sao chép nội dung
              </button>
            </div>
          </div>

          <div class="checkout-success__actions">
            <router-link :to="{ name: 'orderHistory' }" class="checkout-success__primary-link">
              <span class="material-symbols-outlined" aria-hidden="true">receipt_long</span>
              Xem danh sách đơn hàng
            </router-link>
            <router-link :to="{ name: 'productList' }" class="checkout-success__secondary-link">
              Tiếp tục mua sắm
            </router-link>
          </div>
        </article>

        <article v-if="SortedStatusHistories.length" class="checkout-success__history dm-card">
          <h2><span class="material-symbols-outlined" aria-hidden="true">history</span>Nhật ký đơn hàng</h2>
          <div v-for="HistoryItem in SortedStatusHistories" :key="HistoryItem.OrderStatusHistoryId" class="checkout-success__history-row">
            <span class="material-symbols-outlined" aria-hidden="true">schedule</span>
            <div>
              <strong>{{ getStatusLabel(HistoryItem.Status) }}</strong>
              <p>{{ HistoryItem.Note || `Hệ thống cập nhật đơn sang trạng thái ${getStatusLabel(HistoryItem.Status)}.` }}</p>
            </div>
            <small>{{ HistoryItem.CreateDate ? formatDateTime(HistoryItem.CreateDate) : '-' }}</small>
          </div>
        </article>
      </div>

      <aside class="checkout-success__side">
        <article class="checkout-success__address dm-card">
          <h2><span class="material-symbols-outlined" aria-hidden="true">location_on</span>Địa chỉ nhận hàng</h2>
          <strong>{{ Order.Address?.RecipientName || '-' }} · {{ Order.Address?.PhoneNumber || '-' }}</strong>
          <p>{{ formatAddress(Order.Address) }}</p>
        </article>

        <article class="checkout-success__items dm-card">
          <h2><span class="material-symbols-outlined" aria-hidden="true">shopping_bag</span>Sản phẩm đã mua ({{ Order.Items.length + (Order.Combos?.length || 0) }})</h2>
          <div v-for="Item in Order.Items" :key="Item.OrderItemId" class="checkout-success__item">
            <img :src="Item.PrimaryImageUrl || 'https://placehold.co/160x160?text=No+Image'" :alt="Item.ProductName" />
            <div><strong>{{ Item.ProductName }}</strong><small>{{ Item.VariantName || Item.Sku || '-' }}</small></div>
            <span>{{ Item.Quantity }} × {{ formatCurrency(Item.UnitPrice) }}</span>
          </div>
          <div v-for="Combo in Order.Combos || []" :key="Combo.OrderComboId" class="checkout-success__item checkout-success__item--combo">
            <span class="material-symbols-outlined" aria-hidden="true">redeem</span>
            <div><strong>{{ Combo.ComboName }}</strong><small>{{ (Combo.Items || []).map((Item) => `${Item.ProductName} × ${Item.Quantity}`).join(', ') }}</small></div>
            <span>{{ Combo.Quantity }} × {{ formatCurrency(Combo.UnitPrice) }}</span>
          </div>
        </article>

        <article class="checkout-success__summary dm-card">
          <h2><span class="material-symbols-outlined" aria-hidden="true">receipt</span>Chi tiết thanh toán</h2>
          <div><span>Tổng tiền hàng</span><strong>{{ formatCurrency(Order.Subtotal) }}</strong></div>
          <div><span>Phí vận chuyển</span><strong>{{ formatCurrency(Order.ShippingFee) }}</strong></div>
          <div><span>Voucher giảm</span><strong>{{ Order.Discount ? `-${formatCurrency(Order.Discount)}` : formatCurrency(0) }}</strong></div>
          <div class="checkout-success__total"><span>Tổng cộng</span><strong>{{ formatCurrency(Order.Total) }}</strong></div>
        </article>
      </aside>
    </div>
  </section>
  <section v-else class="checkout-success__empty dm-card">
    <h1>{{ ErrorMessage || 'Không tìm thấy đơn hàng' }}</h1>
    <router-link :to="{ name: 'orderHistory' }" class="dm-btn">Quay lại lịch sử đơn hàng</router-link>
  </section>
</template>

<script setup>
import { computed, inject, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import DMBadge from "@/components/base/DMBadge.vue";
import { getOrderById, getOrders } from "@/services/orderService";
import { formatAddress, formatCurrency, formatDateTime } from "@/utils/shopFormatters";

const Props = defineProps({
  order: {
    type: Object,
    default: null,
  },
});

const Route = useRoute();
const I18n = inject("i18nCommon");
const HistoryText = I18n.OrderHistory;
const LocalOrder = ref(null);
const IsLocalLoading = ref(false);
const ErrorMessage = ref("");
const Order = computed(() => Props.order || LocalOrder.value);
const IsLoading = computed(() => !Props.order && IsLocalLoading.value);

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
const PAYMENT_METHOD_LABELS = { Cod: HistoryText.PaymentMethodCod, BankTransfer: HistoryText.PaymentMethodBankTransfer, Gateway: HistoryText.PaymentMethodGateway };
const PAYMENT_STATUS_LABELS = {
  Pending: HistoryText.PaymentStatusPending,
  AwaitingProof: HistoryText.PaymentStatusAwaitingProof,
  UnderReview: HistoryText.PaymentStatusUnderReview,
  Rejected: HistoryText.PaymentStatusRejected,
  Cancelled: HistoryText.PaymentStatusCancelled,
  Paid: HistoryText.PaymentStatusPaid,
  Refunded: HistoryText.PaymentStatusRefunded,
};
const STEP_DEFINITIONS = [
  { Key: "PendingApproval", Label: "Đặt hàng thành công", Icon: "check", ActiveMeta: "Đơn vừa được tạo" },
  { Key: "Confirmed", Label: "Chuyển khoản & Duyệt", Icon: "verified", ActiveMeta: "Đang chờ thanh toán hoặc duyệt" },
  { Key: "Preparing", Label: "Đóng gói chuẩn bị", Icon: "inventory_2", ActiveMeta: "Kho Dorm Mart" },
  { Key: "Shipping", Label: "Đang giao hàng", Icon: "local_shipping", ActiveMeta: "Shipper KTX" },
  { Key: "Completed", Label: "Nhận hàng thành công", Icon: "verified", ActiveMeta: "Hoàn tất đơn" },
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
const getStatusKey = (Status) => getEnumKey(Status, STATUS_LABELS);
const getPaymentStatusKey = (Status) => getEnumKey(Status, PAYMENT_STATUS_LABELS);
const getStatusLabel = (Status) => normalizeEnumValue(Status, STATUS_LABELS);
const getPaymentLabel = (Method) => normalizeEnumValue(Method, PAYMENT_METHOD_LABELS);
const getPaymentStatusLabel = (Status) => normalizeEnumValue(Status, PAYMENT_STATUS_LABELS);
const PaymentStatusKey = computed(() => getPaymentStatusKey(Order.value?.Payment?.Status || Order.value?.PaymentStatus));
const PaymentQrImageUrl = computed(() => {
  const Payment = Order.value?.Payment;
  if (Payment?.QrImageUrl) return Payment.QrImageUrl;
  if (!Payment?.BankAccountNumber || !Payment?.BankName || !(Payment.TransferContent || Order.value?.OrderCode)) return null;
  return `https://vietqr.app/img?acc=${encodeURIComponent(Payment.BankAccountNumber)}&bank=${encodeURIComponent(Payment.BankName)}&amount=${Number(Payment.Amount || Order.value?.Total || 0)}&des=${encodeURIComponent(Payment.TransferContent || Order.value.OrderCode)}`;
});
const SortedStatusHistories = computed(() => [...(Order.value?.StatusHistories || [])].sort((Left, Right) => new Date(Right.CreateDate || 0) - new Date(Left.CreateDate || 0)));
const Steps = computed(() => {
  const StatusKey = getStatusKey(Order.value?.Status);
  const CurrentIndex = Math.max(STEP_DEFINITIONS.findIndex((Step) => Step.Key === StatusKey), 0);
  const HistoryMap = new Map((Order.value?.StatusHistories || []).map((HistoryItem) => [getStatusKey(HistoryItem.Status) || HistoryItem.Status, HistoryItem]));

  return STEP_DEFINITIONS.map((Step, Index) => {
    const HistoryItem = HistoryMap.get(Step.Key);
    const State = Index < CurrentIndex ? "done" : Index === CurrentIndex ? "active" : "todo";
    return {
      ...Step,
      Index: Index + 1,
      State,
      Meta: HistoryItem?.CreateDate ? formatDateTime(HistoryItem.CreateDate) : State === "active" ? Step.ActiveMeta : "Chờ xử lý",
      StateLabel: State === "done" ? "Hoàn tất" : State === "active" ? "Hiện tại" : "Chờ",
    };
  });
});

const statusBadgeType = (Status) => {
  const StatusKey = getStatusKey(Status);
  if (["Rejected", "Cancelled"].includes(StatusKey)) return "error";
  if (StatusKey === "Completed") return "success";
  if (StatusKey === "Shipping") return "info";
  return "warning";
};
const paymentBadgeType = (Status) => {
  if (Status === "Paid") return "success";
  if (["Rejected", "Cancelled", "Refunded"].includes(Status)) return "error";
  return "warning";
};
const getPaymentTime = () => {
  const PaidHistory = (Order.value?.StatusHistories || []).find((HistoryItem) => ["Confirmed", "Preparing", "ReadyToShip", "Shipping", "Completed"].includes(getStatusKey(HistoryItem.Status)));
  return PaidHistory?.CreateDate ? formatDateTime(PaidHistory.CreateDate) : "Chờ xác nhận";
};
const copyTransferContent = async () => {
  const Content = Order.value?.Payment?.TransferContent || Order.value?.OrderCode;
  if (Content) await navigator.clipboard.writeText(Content);
};
const loadOrder = async () => {
  if (Props.order) return;
  IsLocalLoading.value = true;
  ErrorMessage.value = "";
  try {
    const Orders = await getOrders();
    const Summary = Orders.find((OrderItem) => OrderItem.OrderCode === Route.params.orderCode);
    if (!Summary) {
      ErrorMessage.value = "Không tìm thấy đơn hàng";
      LocalOrder.value = null;
      return;
    }
    LocalOrder.value = await getOrderById(Summary.OrderId);
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsLocalLoading.value = false;
  }
};

onMounted(loadOrder);
</script>

<style scoped lang="scss" src="@/assets/styles/screens/checkout-success.scss"></style>
