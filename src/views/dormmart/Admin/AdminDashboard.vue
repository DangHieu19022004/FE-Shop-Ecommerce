<script setup>
import { computed, inject, onMounted, ref } from "vue";
import { getAdminAccounts, getAdminOrders, getFinanceSummary } from "@/services/adminService";
import { formatCurrency, formatDateTime } from "@/utils/shopFormatters";

const Text = inject("i18nCommon").AdminDashboard;
const Summary = ref(null);
const Orders = ref([]);
const Accounts = ref([]);
const IsLoading = ref(false);
const ErrorMessage = ref("");
const UpdatedAt = ref(null);
const StatusLabels = ["Chờ duyệt", "Đã xác nhận", "Đã từ chối", "Đang chuẩn bị", "Sẵn sàng giao", "Đang giao", "Đã hoàn thành", "Đã hủy"];
const RecentOrders = computed(() => [...Orders.value]
  .sort((Left, Right) => (Date.parse(Right.CreateDate) || 0) - (Date.parse(Left.CreateDate) || 0))
  .slice(0, 6));
const orderStatus = (Value) => Value !== null && Value !== undefined ? StatusLabels[Value] || "Chưa xác định" : "Chưa xác định";
const displayDate = (Value) => Value && Number.isFinite(Date.parse(Value)) ? formatDateTime(Value) : "—";
const FinanceDetails = computed(() => [
  { Label: "Giá vốn hàng bán", Value: Summary.value?.CostOfGoodsSold },
  { Label: "Phí vận chuyển cửa hàng", Value: Summary.value?.StoreShippingFee },
  { Label: "Phí thanh toán", Value: Summary.value?.PaymentFee },
  { Label: "Hoàn tiền", Value: Summary.value?.RefundAmount },
  { Label: "Chi phí vận hành", Value: Summary.value?.ExpenseAmount },
]);

const Metrics = computed(() => [
  { Label: Text.Revenue, Value: formatCurrency(Summary.value?.ProductRevenue || 0), Icon: "payments", Tone: "primary" },
  { Label: Text.Profit, Value: formatCurrency(Summary.value?.GrossProfit || 0), Icon: "trending_up", Tone: "success" },
  { Label: Text.ActiveAccounts, Value: Accounts.value.filter((Item) => Item.StatusCode === "ACTIVE").length, Icon: "group", Tone: "primary" },
  { Label: Text.PendingOrders, Value: Orders.value.filter((Item) => Item.Status === 0 || Item.Status === "0").length, Icon: "local_shipping", Tone: "warning" },
]);
const Sections = computed(() => [
  { Title: Text.FinanceTitle, Description: Text.FinanceDescription, Icon: "monitoring", RouteName: "adminFinance" },
  { Title: Text.AccountsTitle, Description: Text.AccountsDescription, Icon: "manage_accounts", RouteName: "adminAccounts" },
  { Title: Text.OrdersTitle, Description: Text.OrdersDescription, Icon: "inventory", RouteName: "adminOrders" },
  { Title: Text.SupportTitle, Description: Text.SupportDescription, Icon: "support_agent", RouteName: "adminSupport" },
]);

const loadDashboard = async () => {
  if (IsLoading.value) return;
  IsLoading.value = true;
  ErrorMessage.value = "";

  try {
    const [SummaryData, OrderData, AccountData] = await Promise.all([
      getFinanceSummary(),
      getAdminOrders(),
      getAdminAccounts(),
    ]);
    Summary.value = SummaryData;
    Orders.value = OrderData;
    Accounts.value = AccountData;
    UpdatedAt.value = new Date().toISOString();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsLoading.value = false;
  }
};

onMounted(loadDashboard);
</script>
<template>
  <section class="admin-page admin-overview" :aria-busy="IsLoading">
    <header class="admin-page__header admin-overview__header">
      <div><span class="admin-overview__eyebrow">DORM MART / QUẢN TRỊ</span><h1>{{ Text.Title }}</h1><p>{{ Text.Subtitle }}</p></div>
      <div class="admin-overview__refresh"><small v-if="UpdatedAt">Cập nhật {{ displayDate(UpdatedAt) }}</small><button type="button" :disabled="IsLoading" @click="loadDashboard"><span class="material-symbols-outlined" aria-hidden="true">refresh</span>{{ IsLoading ? 'Đang tải…' : 'Tải lại dữ liệu' }}</button></div>
    </header>
    <div v-if="ErrorMessage" role="alert" class="dm-card admin-overview__error"><strong>Không thể tải dữ liệu tổng quan</strong><p>{{ ErrorMessage }}</p><span>Chọn tải lại dữ liệu để thử lại.</span></div>
    <div v-if="IsLoading" class="dm-card admin-panel" role="status">Đang tải dữ liệu tổng quan…</div>
    <div v-else-if="!ErrorMessage" class="admin-metrics"><article v-for="Item in Metrics" :key="Item.Label" :class="['dm-card', 'admin-metric', `admin-metric--${Item.Tone}`]"><span class="material-symbols-outlined">{{ Item.Icon }}</span><div class="admin-metric__label">{{ Item.Label }}</div><div class="admin-metric__value">{{ Item.Value }}</div></article></div>
    <article v-if="!IsLoading && !ErrorMessage" class="dm-card admin-panel">
      <div class="admin-panel__header"><div><h2>Chi tiết kỳ tài chính</h2><p class="admin-overview__caption">Từ {{ displayDate(Summary?.From) }} đến trước {{ displayDate(Summary?.To) }} · {{ Summary?.CompletedOrderCount ?? '—' }} đơn hoàn tất</p></div></div>
      <dl class="admin-overview__finance"><div v-for="Item in FinanceDetails" :key="Item.Label"><dt>{{ Item.Label }}</dt><dd>{{ Item.Value == null ? '—' : formatCurrency(Item.Value) }}</dd></div></dl>
    </article>
    <article v-if="!IsLoading && !ErrorMessage" class="dm-card admin-panel">
      <div class="admin-panel__header"><div><h2>Đơn hàng gần nhất</h2><p class="admin-overview__caption">{{ Orders.length }} đơn trong dữ liệu hiện có · Hiển thị tối đa 6 đơn mới nhất</p></div><router-link :to="{ name: 'adminOrders' }">Xem tất cả →</router-link></div>
      <div v-if="!RecentOrders.length" class="admin-overview__empty"><span class="material-symbols-outlined" aria-hidden="true">receipt_long</span><h3>Chưa có đơn hàng</h3><p>Đơn mới sẽ xuất hiện tại đây để bạn theo dõi và xử lý.</p></div>
      <div v-else class="admin-table-wrap"><table class="admin-orders-table"><caption class="admin-overview__table-caption">Danh sách đơn hàng gần nhất</caption><thead><tr><th scope="col">Mã đơn</th><th scope="col">Ngày tạo</th><th scope="col">Thanh toán</th><th scope="col">Trạng thái</th><th scope="col" class="admin-orders-money">Tổng tiền</th></tr></thead><tbody><tr v-for="Order in RecentOrders" :key="Order.OrderId"><td><strong>{{ Order.OrderCode || '—' }}</strong><small>{{ Order.ItemCount ?? '—' }} mặt hàng</small></td><td>{{ displayDate(Order.CreateDate) }}</td><td>{{ ({ 0: 'Tiền mặt (COD)', 1: 'Chuyển khoản', 2: 'VietQR' })[Order.PaymentMethod] || 'Chưa xác định' }}<small>{{ ({ 0: 'Chờ xử lý', 1: 'Chờ biên lai', 2: 'Đang đối soát', 3: 'Từ chối', 4: 'Đã hủy', 5: 'Đã thanh toán', 6: 'Đã hoàn tiền' })[Order.PaymentStatus] || 'Chưa có trạng thái thanh toán' }}</small></td><td><span class="admin-orders-pill">{{ orderStatus(Order.Status) }}</span></td><td class="admin-orders-money">{{ Order.Total == null ? '—' : formatCurrency(Order.Total) }}</td></tr></tbody></table></div>
    </article>
    <article class="dm-card admin-panel"><div class="admin-panel__header"><h2>{{ Text.SectionsTitle }}</h2></div><div class="admin-section-grid"><router-link v-for="Item in Sections" :key="Item.RouteName" :to="{ name: Item.RouteName }" class="admin-section-card"><span class="material-symbols-outlined" aria-hidden="true">{{ Item.Icon }}</span><div><h3>{{ Item.Title }}</h3><p>{{ Item.Description }}</p><strong>{{ Text.OpenSection }} →</strong></div></router-link></div></article>
  </section>
</template>
<style scoped lang="scss" src="@/assets/styles/screens/admin-operations.scss"></style>
<style scoped lang="scss">
.admin-overview__header { padding: 8px 0 20px; border-bottom: 1px solid var(--dm-border); }
.admin-overview__eyebrow { display: block; margin-bottom: 12px; color: var(--dm-text-soft); font-size: 11px; font-weight: 700; letter-spacing: .12em; }
.admin-overview__refresh { display: grid; justify-items: end; gap: 10px; }
.admin-overview__refresh small, .admin-overview__caption { color: var(--dm-text-soft); font-size: 12px; }
.admin-overview__refresh button { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border: 1px solid var(--dm-border); border-radius: 10px; background: var(--dm-surface); color: var(--dm-primary); font: inherit; cursor: pointer; }
.admin-overview__refresh button:disabled { opacity: .6; cursor: wait; }
.admin-overview__refresh button:focus-visible, .admin-overview a:focus-visible { outline: 3px solid var(--dm-primary); outline-offset: 3px; }
.admin-overview__caption { margin: 8px 0 0; }
.admin-overview__finance { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin: 0; }
.admin-overview__finance > div { padding: 16px; border-radius: 12px; background: var(--dm-surface-soft); }
.admin-overview__finance dt { font-size: 12px; color: var(--dm-text-soft); }
.admin-overview__finance dd { margin: 10px 0 0; font-size: 18px; font-weight: 700; font-variant-numeric: tabular-nums; }
.admin-overview__error { padding: 20px; color: var(--dm-danger); }
.admin-overview__error p { margin: 8px 0; }
.admin-overview__empty { padding: 36px 16px; text-align: center; color: var(--dm-text-soft); }
.admin-overview__empty > span { font-size: 40px; color: var(--dm-primary); }
.admin-overview__empty h3 { color: var(--dm-text); }
.admin-overview__table-caption { text-align: left; padding-bottom: 12px; color: var(--dm-text-soft); font-size: 12px; }
.admin-overview .admin-orders-table { min-width: 650px; }
.admin-overview .admin-orders-table tr { cursor: default; }
.admin-overview .admin-metric { border-top: 0; border-radius: 16px; border: 1px solid var(--dm-border); }
.admin-overview .admin-metric > span { padding: 8px; border-radius: 12px; background: var(--dm-primary-soft); }
.admin-overview .admin-metric__value { overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
@media (max-width: 700px) { .admin-overview__refresh { justify-items: start; } .admin-overview .admin-panel__header { align-items: start; flex-wrap: wrap; } }
</style>
