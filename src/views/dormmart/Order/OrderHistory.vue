<template>
  <section class="order-history">
    <div class="order-history__topline">
      <div class="order-history__breadcrumb">
        <router-link to="/">{{ Text.BreadcrumbHome }}</router-link>
        <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
        <span>{{ Text.BreadcrumbOrders }}</span>
      </div>

      <div class="order-history__quick-metrics">
        <span class="material-symbols-outlined" aria-hidden="true">local_shipping</span>
        <strong>{{ ShippingCount }}</strong>
        <span>{{ Text.ShippingCountLabel }}</span>
        <span class="order-history__metric-divider" aria-hidden="true"></span>
        <span class="material-symbols-outlined" aria-hidden="true">pending_actions</span>
        <strong>{{ PendingApprovalCount }}</strong>
        <span>{{ Text.PendingApprovalCountLabel }}</span>
      </div>
    </div>

    <section class="order-history__panel dm-card">
      <div class="order-history__panel-head">
        <div>
          <h1>{{ Text.PageTitle }}</h1>
          <p>{{ Text.PageSubtitle }}</p>
        </div>
        <div class="order-history__search">
          <span class="material-symbols-outlined" aria-hidden="true">search</span>
          <DMInput v-model="SearchValue" :placeholder="Text.SearchPlaceholder" />
        </div>
      </div>

      <nav class="order-status-tabs" :aria-label="Text.PageTitle">
        <button
          v-for="StatusItem in StatusFilters"
          :key="StatusItem.StatusCode"
          type="button"
          class="order-status-tabs__button"
          :class="{ 'order-status-tabs__button--active': SelectedStatusCode === StatusItem.StatusCode }"
          @click="SelectedStatusCode = StatusItem.StatusCode"
        >
          <span>{{ StatusItem.StatusName }}</span>
          <span class="order-status-tabs__count">{{ StatusItem.Count }}</span>
        </button>
      </nav>

      <div v-if="IsLoading" class="order-empty"><h2>Đang tải đơn hàng...</h2></div>
      <div v-else-if="ErrorMessage" class="order-empty"><h2>{{ ErrorMessage }}</h2></div>
      <div v-else-if="FilteredOrders.length" class="order-list">
        <article v-for="OrderItem in FilteredOrders" :key="OrderItem.OrderId" class="order-card">
          <header class="order-card__header">
            <div class="order-card__store-line">
              <span class="material-symbols-outlined" aria-hidden="true">storefront</span>
              <strong>{{ Text.StoreName || "Dorm Mart" }}</strong>
              <span class="order-card__pipe" aria-hidden="true">|</span>
              <span class="order-card__code">{{ Text.OrderCode }}: <b>{{ OrderItem.OrderCode }}</b></span>
            </div>
            <div class="order-card__header-side">
              <DMBadge :type="statusBadgeType(OrderItem.Status)" :icon-name="statusIcon(OrderItem.Status)">
                {{ getStatusLabel(OrderItem.Status) }}
              </DMBadge>
              <DMBadge :type="paymentBadgeType(OrderItem.PaymentStatus)" icon-name="payments">
                {{ getPaymentLabel(OrderItem.PaymentMethod) }} · {{ getPaymentStatusLabel(OrderItem.PaymentStatus) }}
              </DMBadge>
            </div>
          </header>

          <div class="order-card__body">
            <div v-if="getPrimaryItem(OrderItem.OrderId)" class="order-card__preview">
              <img
                :src="getPrimaryItem(OrderItem.OrderId).PrimaryImageUrl || 'https://placehold.co/240x240?text=No+Image'"
                :alt="getPrimaryItem(OrderItem.OrderId).ProductName"
              />
              <div class="order-card__preview-content">
                <strong>{{ getPrimaryItem(OrderItem.OrderId).ProductName }}</strong>
                <span v-if="getPrimaryItem(OrderItem.OrderId).VariantName">{{ getPrimaryItem(OrderItem.OrderId).VariantName }}</span>
                <div class="order-card__item-line">
                  <span>{{ Text.QuantityPrefix }}{{ getPrimaryItem(OrderItem.OrderId).Quantity }}</span>
                  <small v-if="getRemainingItemCount(OrderItem.OrderId)">+{{ getRemainingItemCount(OrderItem.OrderId) }} {{ Text.MoreItems }}</small>
                </div>
              </div>
              <div class="order-card__item-price">
                <strong>{{ formatCurrency(getPrimaryItem(OrderItem.OrderId).LineTotal) }}</strong>
              </div>
            </div>

            <div v-else class="order-card__preview order-card__preview--summary">
              <span class="material-symbols-outlined" aria-hidden="true">inventory_2</span>
              <div class="order-card__preview-content">
                <strong>{{ formatI18nText(Text.ProductCountValue, { count: OrderItem.ItemCount || 0 }) }}</strong>
                <span>{{ Text.PanelSubtitle }}</span>
              </div>
            </div>

            <div class="order-card__meta-grid">
              <div class="order-card__meta-item">
                <span>{{ Text.OrderedAt }}</span>
                <strong>{{ formatDate(OrderItem.CreateDate) }}</strong>
              </div>
              <div class="order-card__meta-item">
                <span>{{ Text.PaymentMethod }}</span>
                <strong>{{ getPaymentLabel(OrderItem.PaymentMethod) }}</strong>
              </div>
              <div class="order-card__meta-item">
                <span>{{ Text.PaymentStatus }}</span>
                <strong>{{ getPaymentStatusLabel(OrderItem.PaymentStatus) }}</strong>
              </div>
              <div class="order-card__meta-item">
                <span>{{ Text.ShippingFee }}</span>
                <strong>{{ formatCurrency(OrderItem.ShippingFee) }}</strong>
              </div>
            </div>
          </div>

          <footer class="order-card__footer">
            <div class="order-card__total">
              <span>{{ Text.TotalAmount }}</span>
              <strong>{{ formatCurrency(OrderItem.Total) }}</strong>
              <small v-if="Number(OrderItem.Discount)">-{{ formatCurrency(OrderItem.Discount) }} {{ Text.Discount }}</small>
            </div>
            <router-link :to="{ name: 'orderDetail', params: { orderCode: OrderItem.OrderCode } }" class="dm-btn order-card__detail-link">
              <span class="material-symbols-outlined" aria-hidden="true">visibility</span>
              {{ Text.ViewDetail }}
            </router-link>
          </footer>
        </article>
      </div>
      <div v-else class="order-empty">
        <span class="material-symbols-outlined" aria-hidden="true">receipt_long</span>
        <h2>{{ Text.EmptyTitle }}</h2>
        <p>{{ Text.EmptyDescription }}</p>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, inject, onMounted, ref } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import { getOrderById, getOrders } from "@/services/orderService";
import { formatI18nText } from "@/utils/i18n";
import { formatCurrency, formatDate } from "@/utils/shopFormatters";

const Text = inject("i18nCommon").OrderHistory;
const Orders = ref([]);
const OrderDetails = ref({});
const SelectedStatusCode = ref("ALL");
const SearchValue = ref("");
const IsLoading = ref(false);
const ErrorMessage = ref("");

const STATUS_ORDER = ["PendingApproval", "Confirmed", "Preparing", "ReadyToShip", "Shipping", "Completed", "Cancelled", "Rejected"];
const STATUS_LABELS = {
  PendingApproval: Text.StatusPendingApproval,
  Confirmed: Text.StatusConfirmed,
  Rejected: Text.StatusRejected,
  Preparing: Text.StatusPreparing,
  ReadyToShip: Text.StatusReadyToShip,
  Shipping: Text.StatusShipping,
  Completed: Text.StatusCompleted,
  Cancelled: Text.StatusCancelled,
};

const PAYMENT_METHOD_LABELS = {
  Cod: Text.PaymentMethodCod,
  BankTransfer: Text.PaymentMethodBankTransfer,
  Gateway: Text.PaymentMethodGateway,
};

const PAYMENT_STATUS_LABELS = {
  Pending: Text.PaymentStatusPending,
  AwaitingProof: Text.PaymentStatusAwaitingProof,
  UnderReview: Text.PaymentStatusUnderReview,
  Rejected: Text.PaymentStatusRejected,
  Cancelled: Text.PaymentStatusCancelled,
  Paid: Text.PaymentStatusPaid,
  Refunded: Text.PaymentStatusRefunded,
};

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

const getStatusKey = (StatusCode) => getEnumKey(StatusCode, STATUS_LABELS);
const getPaymentStatusKey = (PaymentStatus) => getEnumKey(PaymentStatus, PAYMENT_STATUS_LABELS);
const getStatusLabel = (StatusCode) => normalizeEnumValue(StatusCode, STATUS_LABELS);
const getPaymentLabel = (PaymentMethod) => normalizeEnumValue(PaymentMethod, PAYMENT_METHOD_LABELS);
const getPaymentStatusLabel = (PaymentStatus) => normalizeEnumValue(PaymentStatus, PAYMENT_STATUS_LABELS);
const getOrderPreview = (OrderId) => OrderDetails.value[OrderId] || null;
const getPrimaryItem = (OrderId) => getOrderPreview(OrderId)?.Items?.[0] || null;
const getRemainingItemCount = (OrderId) => Math.max((getOrderPreview(OrderId)?.ItemCount || 0) - 1, 0);

const statusBadgeType = (StatusCode) => {
  const StatusKey = getStatusKey(StatusCode);
  if (["Rejected", "Cancelled"].includes(StatusKey)) return "error";
  if (StatusKey === "Completed") return "success";
  if (StatusKey === "Shipping") return "info";
  if (["PendingApproval", "Confirmed", "Preparing", "ReadyToShip"].includes(StatusKey)) return "warning";
  return "neutral";
};

const statusIcon = (StatusCode) => ({
  PendingApproval: "hourglass_top",
  Confirmed: "verified",
  Preparing: "inventory",
  ReadyToShip: "local_shipping",
  Shipping: "local_shipping",
  Completed: "task_alt",
  Cancelled: "cancel",
  Rejected: "block",
}[getStatusKey(StatusCode)] || "receipt_long");

const paymentBadgeType = (PaymentStatus) => {
  const PaymentStatusKey = getPaymentStatusKey(PaymentStatus);
  if (PaymentStatusKey === "Paid") return "success";
  if (["Rejected", "Cancelled", "Refunded"].includes(PaymentStatusKey)) return "error";
  if (["Pending", "AwaitingProof", "UnderReview"].includes(PaymentStatusKey)) return "warning";
  return "neutral";
};

const StatusFilters = computed(() => [
  { StatusCode: "ALL", StatusName: Text.AllOrders, Count: Orders.value.length },
  ...STATUS_ORDER.map((StatusCode) => ({
    StatusCode,
    StatusName: getStatusLabel(StatusCode),
    Count: Orders.value.filter((OrderItem) => getStatusKey(OrderItem.Status) === StatusCode).length,
  })),
]);

const FilteredOrders = computed(() => Orders.value.filter((OrderItem) => {
  const PrimaryItem = getPrimaryItem(OrderItem.OrderId);
  const SearchText = [
    OrderItem.OrderCode,
    getStatusLabel(OrderItem.Status),
    getPaymentLabel(OrderItem.PaymentMethod),
    getPaymentStatusLabel(OrderItem.PaymentStatus),
    PrimaryItem?.ProductName,
    PrimaryItem?.VariantName,
  ].filter(Boolean).join(" ").toLowerCase();
  const IsStatusMatched = SelectedStatusCode.value === "ALL" || getStatusKey(OrderItem.Status) === SelectedStatusCode.value;
  return IsStatusMatched && SearchText.includes(SearchValue.value.trim().toLowerCase());
}));

const PendingApprovalCount = computed(() => Orders.value.filter((OrderItem) => getStatusKey(OrderItem.Status) === "PendingApproval").length);
const ShippingCount = computed(() => Orders.value.filter((OrderItem) => getStatusKey(OrderItem.Status) === "Shipping").length);

const loadOrderPreviews = async (OrderItems) => {
  const DetailEntries = await Promise.all(OrderItems.map(async (OrderItem) => {
    try {
      const Detail = await getOrderById(OrderItem.OrderId);
      return [OrderItem.OrderId, Detail];
    } catch {
      // ponytail: skip per-card preview failure; add retry when item-preview UX matters.
      return [OrderItem.OrderId, null];
    }
  }));

  OrderDetails.value = Object.fromEntries(DetailEntries);
};

const loadOrderHistory = async () => {
  IsLoading.value = true;
  ErrorMessage.value = "";

  try {
    Orders.value = await getOrders();
    await loadOrderPreviews(Orders.value);
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsLoading.value = false;
  }
};

onMounted(loadOrderHistory);
</script>

<style scoped lang="scss" src="@/assets/styles/screens/order-history.scss"></style>
