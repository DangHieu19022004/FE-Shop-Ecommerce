<script setup>
import { computed, inject, onMounted, ref } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import { getAdminOrders, getAdminPayments, getAdminShipments, runAdminOrderAction, runAdminPaymentAction, runAdminShipmentAction, getAdminOrderById } from "@/services/adminService";
import { confirmAction } from "@/stores/confirmStore";
import { formatCurrency } from "@/utils/shopFormatters";

const Text = inject("i18nCommon").AdminOrders;
const Orders = ref([]);
const SelectedOrder = ref(null);
const ErrorMessage = ref("");
const SuccessMessage = ref("");
const IsLoading = ref(false);
const IsDetailLoading = ref(false);
const ActiveStatus = ref("all");
const SearchText = ref("");
const PaymentMethod = ref("all");
const PaymentStatus = ref("all");
const OrderDate = ref("");

const OrderStatuses = {
  0: { Text: "Chờ duyệt", Tone: "warning", Icon: "pending" },
  1: { Text: "Đã xác nhận", Tone: "primary", Icon: "verified" },
  2: { Text: "Đã từ chối", Tone: "danger", Icon: "block" },
  3: { Text: "Đang chuẩn bị", Tone: "info", Icon: "inventory" },
  4: { Text: "Sẵn sàng giao", Tone: "success", Icon: "package_2" },
  5: { Text: "Đang giao", Tone: "primary", Icon: "local_shipping" },
  6: { Text: "Đã hoàn thành", Tone: "success", Icon: "task_alt" },
  7: { Text: "Đã hủy", Tone: "muted", Icon: "cancel" },
};

const PaymentMethods = {
  0: "Tiền mặt (COD)",
  1: "Chuyển khoản",
  2: "Chuyển khoản VietQR",
};

const PaymentStatuses = {
  0: "Chờ xử lý",
  1: "Chờ biên lai",
  2: "Đang đối soát",
  3: "Từ chối",
  4: "Hủy",
  5: "Đã thanh toán",
  6: "Đã hoàn tiền",
};

const StatusTabs = [
  { Value: "all", Label: "Tất cả", Icon: "list_alt" },
  { Value: 0, Label: "Chờ duyệt", Icon: "hourglass_top" },
  { Value: 1, Label: "Đã xác nhận" },
  { Value: 3, Label: "Đang chuẩn bị" },
  { Value: 4, Label: "Sẵn sàng giao" },
  { Value: 5, Label: "Đang giao" },
  { Value: 6, Label: "Đã hoàn thành" },
  { Value: 7, Label: "Đã hủy" },
  { Value: 2, Label: "Từ chối" },
];

const StatusCounts = computed(() => Orders.value.reduce((Counts, Order) => {
  Counts.all += 1;
  Counts[Order.Status] = (Counts[Order.Status] || 0) + 1;
  return Counts;
}, { all: 0 }));

const PendingOrders = computed(() => Orders.value.filter((Order) => Order.Status === 0));
const RejectedOrCancelledOrders = computed(() => Orders.value.filter((Order) => Order.Status === 2 || Order.Status === 7));
const PendingTotal = computed(() => PendingOrders.value.reduce((Total, Order) => Total + Number(Order.Total || 0), 0));
const TotalAmount = computed(() => Orders.value.reduce((Total, Order) => Total + Number(Order.Total || 0), 0));

const FilteredOrders = computed(() => Orders.value.filter((Order) => {
  const Search = SearchText.value.trim().toLowerCase();
  const OrderDateText = Order.CreateDate ? new Date(Order.CreateDate).toISOString().slice(0, 10) : "";

  return (ActiveStatus.value === "all" || Order.Status === ActiveStatus.value)
    && (!Search || Order.OrderCode.toLowerCase().includes(Search) || String(Order.OrderId).toLowerCase().includes(Search))
    && (PaymentMethod.value === "all" || String(Order.PaymentMethod) === PaymentMethod.value)
    && (PaymentStatus.value === "all" || String(Order.PaymentStatus) === PaymentStatus.value)
    && (!OrderDate.value || OrderDateText === OrderDate.value);
}));

const FastOrder = computed(() => PendingOrders.value[0] || Orders.value[0] || null);

const orderStatus = (Status) => OrderStatuses[Status] || { Text: `Trạng thái ${Status}`, Tone: "muted", Icon: "help" };
const paymentMethodText = (Method) => PaymentMethods[Method] || `PT thanh toán ${Method}`;
const paymentStatusText = (Status) => PaymentStatuses[Status] || `TT thanh toán ${Status}`;
const dateTimeText = (Value) => Value ? new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(Value)) : "-";
const shortId = (Value) => String(Value || "").slice(0, 8);

const selectOrder = async (Order) => {
  IsDetailLoading.value = true;
  ErrorMessage.value = "";

  try {
    SelectedOrder.value = await getAdminOrderById(Order.OrderId);
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsDetailLoading.value = false;
  }
};

const loadAdminData = async () => {
  IsLoading.value = true;
  ErrorMessage.value = "";

  try {
    Orders.value = await getAdminOrders();
    if (Orders.value.length) await selectOrder(Orders.value[0]);
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsLoading.value = false;
  }
};

const runOrderAction = async (OrderId, Action, Note = "") => {
  if (Action === "cancel" && !await confirmAction({
    Title: "Xác nhận hủy đơn",
    Message: "Bạn có chắc chắn muốn hủy đơn hàng này?",
    ConfirmText: "Hủy đơn",
  })) return;

  try {
    const Order = await runAdminOrderAction(OrderId, Action, Note);
    SuccessMessage.value = `Đã xử lý đơn hàng: ${Action}`;
    await loadAdminData();
    if (Order?.OrderId) SelectedOrder.value = Order;
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

const actionsFor = (Status) => {
  const Actions = {
    0: [{ Action: "confirm", Label: "Duyệt", Tone: "success", Icon: "check" }, { Action: "reject", Label: "Từ chối", Tone: "danger", Icon: "close" }],
    1: [{ Action: "prepare", Label: "Chuẩn bị", Tone: "primary", Icon: "inventory" }],
    3: [{ Action: "ready-to-ship", Label: "Sẵn sàng giao", Tone: "success", Icon: "package_2" }],
    4: [{ Action: "ship", Label: "Giao", Tone: "primary", Icon: "local_shipping" }],
    5: [{ Action: "complete", Label: "Hoàn thành", Tone: "success", Icon: "task_alt" }],
  }[Status] || [];

  if (![2, 6, 7].includes(Status)) {
    return [...Actions, { Action: "cancel", Label: "Hủy", Tone: "danger", Icon: "cancel" }];
  }

const runShipmentAction = async (ShipmentId, Action, OrderId) => {
  if (Action === "cancel" && !await confirmAction({
    Title: "Xác nhận hủy vận chuyển",
    Message: "Bạn có chắc chắn muốn hủy vận chuyển của đơn hàng này?",
    ConfirmText: "Hủy vận chuyển",
  })) return;

  const Form = ensureShipmentForm(OrderId);
  try {
    await runAdminShipmentAction(ShipmentId, Action, { Note: Form.Note });
    SuccessMessage.value = `Đã xử lý shipment ${Action}`;
    await loadAdminData();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
  return Actions;
};

onMounted(loadAdminData);
</script>

<template>
  <section class="admin-page admin-orders-page">
    <header class="admin-page__header admin-orders-hero">
      <div>
        <div class="admin-orders-hero__title">
          <span class="material-symbols-outlined">local_shipping</span>
          <h1>Quản Lý Đơn Hàng</h1>
          <span class="admin-orders-badge admin-orders-badge--soft">Dorm Mart Admin</span>
        </div>
        <p>{{ Text.Subtitle }}</p>
      </div>
      <div class="admin-orders-toolbar">
        <DMButton type="border-secondary" :is-tooltip="false" icon-name="refresh" message="Tải lại" @click="loadAdminData" />
        <DMButton type="primary" :is-tooltip="false" icon-name="file_download" message="Xuất Excel / CSV" un-active tooltip-message="Chưa có API xuất file" />
      </div>
    </header>

    <div v-if="ErrorMessage" class="dm-card admin-orders-alert admin-orders-alert--danger">{{ ErrorMessage }}</div>
    <div v-if="SuccessMessage" class="dm-card admin-orders-alert admin-orders-alert--success">{{ SuccessMessage }}</div>

    <div class="admin-metrics">
      <article class="dm-card admin-metric">
        <span class="material-symbols-outlined">receipt_long</span>
        <div class="admin-metric__label">Tổng số đơn hàng</div>
        <div class="admin-metric__value">{{ Orders.length }}</div>
        <small>Đồng bộ từ API</small>
      </article>
      <article class="dm-card admin-metric admin-metric--warning">
        <span class="material-symbols-outlined">notifications_active</span>
        <div class="admin-metric__label">Chờ duyệt</div>
        <div class="admin-metric__value">{{ PendingOrders.length }}</div>
        <small v-if="FastOrder">Mã: {{ FastOrder.OrderCode }}</small>
      </article>
      <article class="dm-card admin-metric admin-metric--expense">
        <span class="material-symbols-outlined">cancel</span>
        <div class="admin-metric__label">Đã từ chối / Hủy</div>
        <div class="admin-metric__value">{{ RejectedOrCancelledOrders.length }}</div>
        <small>Rejected / Cancelled</small>
      </article>
      <article class="dm-card admin-metric admin-metric--success">
        <span class="material-symbols-outlined">payments</span>
        <div class="admin-metric__label">Tổng tiền đơn phát sinh</div>
        <div class="admin-metric__value">{{ formatCurrency(TotalAmount) }}</div>
        <small>Chờ duyệt: {{ formatCurrency(PendingTotal) }}</small>
      </article>
    </div>

    <article class="dm-card admin-panel admin-orders-filter">
      <div class="admin-orders-tabs">
        <button
          v-for="Tab in StatusTabs"
          :key="Tab.Value"
          type="button"
          :class="['admin-orders-tab', { 'admin-orders-tab--active': ActiveStatus === Tab.Value }]"
          @click="ActiveStatus = Tab.Value"
        >
          <span v-if="Tab.Icon" class="material-symbols-outlined">{{ Tab.Icon }}</span>
          {{ Tab.Label }}
          <small>{{ StatusCounts[Tab.Value] || 0 }}</small>
        </button>
      </div>
      <div class="admin-orders-filters">
        <DMInput v-model="SearchText" class="admin-search" placeholder="Tìm mã đơn (ORD-...)..." />
        <select v-model="PaymentMethod" class="admin-orders-select">
          <option value="all">PT Thanh toán: Tất cả</option>
          <option value="0">COD (Tiền mặt)</option>
          <option value="1">Chuyển khoản</option>
          <option value="2">VietQR</option>
        </select>
        <select v-model="PaymentStatus" class="admin-orders-select">
          <option value="all">Trạng thái TT: Tất cả</option>
          <option value="0">Chờ xử lý</option>
          <option value="1">Chờ biên lai</option>
          <option value="2">Đang đối soát</option>
          <option value="5">Đã thanh toán</option>
          <option value="4">Hủy</option>
        </select>
        <DMInput v-model="OrderDate" type="date" />
      </div>
    </article>

    <div class="admin-orders-grid">
      <article class="dm-card admin-orders-table-card">
        <div v-if="IsLoading" class="admin-orders-empty">Đang tải orders...</div>
        <div v-else-if="!FilteredOrders.length" class="admin-orders-empty">Không có đơn phù hợp.</div>
        <div v-else class="admin-table-wrap">
          <table class="admin-orders-table">
            <thead>
              <tr>
                <th>Mã đơn & Ngày tạo</th>
                <th>Món</th>
                <th>Thanh toán</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="OrderItem in FilteredOrders"
                :key="OrderItem.OrderId"
                :class="{ 'admin-orders-row--selected': SelectedOrder?.OrderId === OrderItem.OrderId, 'admin-orders-row--pending': OrderItem.Status === 0 }"
                @click="selectOrder(OrderItem)"
              >
                <td>
                  <strong>{{ OrderItem.OrderCode }}</strong>
                  <small>{{ dateTimeText(OrderItem.CreateDate) }} • Id: {{ shortId(OrderItem.OrderId) }}...</small>
                </td>
                <td><span class="admin-orders-pill">{{ OrderItem.ItemCount }} món</span></td>
                <td>
                  <span>{{ paymentMethodText(OrderItem.PaymentMethod) }}</span>
                  <small>{{ paymentStatusText(OrderItem.PaymentStatus) }}</small>
                </td>
                <td class="admin-orders-money">
                  <strong>{{ formatCurrency(OrderItem.Total) }}</strong>
                  <small>Ship: {{ formatCurrency(OrderItem.ShippingFee) }}</small>
                </td>
                <td>
                  <span :class="['admin-orders-status', `admin-orders-status--${orderStatus(OrderItem.Status).Tone}`]">
                    <span class="material-symbols-outlined">{{ orderStatus(OrderItem.Status).Icon }}</span>
                    {{ orderStatus(OrderItem.Status).Text }}
                  </span>
                </td>
                <td>
                  <div class="admin-orders-actions">
                    <DMButton
                      v-for="ActionItem in actionsFor(OrderItem.Status)"
                      :key="ActionItem.Action"
                      type="none"
                      :is-tooltip="false"
                      :message="ActionItem.Label"
                      :icon-name="ActionItem.Icon"
                      :class="['admin-orders-action', `admin-orders-action--${ActionItem.Tone}`]"
                      @click.stop="runOrderAction(OrderItem.OrderId, ActionItem.Action)"
                    />
                    <DMButton v-if="!actionsFor(OrderItem.Status).length" type="none" :is-tooltip="false" message="Chi tiết" icon-name="visibility" class="admin-orders-action" @click.stop="selectOrder(OrderItem)" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <footer class="admin-orders-pagination">
          <span>Hiển thị {{ FilteredOrders.length ? 1 : 0 }} - {{ FilteredOrders.length }} trên {{ FilteredOrders.length }} đơn hàng</span>
          <div><button disabled>Trước</button><strong>1</strong><button disabled>Sau</button></div>
        </footer>
      </article>

      <aside class="dm-card admin-orders-detail">
        <div class="admin-orders-detail__head">
          <div>
            <span class="material-symbols-outlined">emergency_home</span>
            <strong>Đơn Cần Xử Lý Nhanh</strong>
          </div>
          <span class="admin-orders-badge admin-orders-badge--warning">Cấp bách</span>
        </div>

        <div v-if="IsDetailLoading" class="admin-orders-empty">Đang tải chi tiết...</div>
        <div v-else-if="!SelectedOrder" class="admin-orders-empty">Chọn một đơn để xem chi tiết.</div>
        <template v-else>
          <div class="admin-orders-summary">
            <div><span>Mã đơn hàng</span><strong>{{ SelectedOrder.OrderCode }}</strong></div>
            <div><span>Thời gian đặt</span><strong>{{ dateTimeText(SelectedOrder.CreateDate) }}</strong></div>
            <div><span>Số lượng sản phẩm</span><strong>{{ SelectedOrder.ItemCount }} mặt hàng</strong></div>
            <div><span>Phương thức thanh toán</span><strong>{{ paymentMethodText(SelectedOrder.PaymentMethod) }}</strong></div>
            <div><span>Người nhận</span><strong>{{ SelectedOrder.Address?.RecipientName || '-' }}</strong></div>
            <div><span>Điện thoại</span><strong>{{ SelectedOrder.Address?.PhoneNumber || '-' }}</strong></div>
            <div class="admin-orders-summary__total"><span>Tổng giá trị đơn</span><strong>{{ formatCurrency(SelectedOrder.Total) }}</strong></div>
          </div>

          <div class="admin-orders-note">
            <strong><span class="material-symbols-outlined">verified_user</span>Chính sách Ký túc xá:</strong>
            <p>Kiểm tra biên lai chuyển khoản trước khi duyệt để kho soạn đơn và giao tận phòng.</p>
          </div>

          <div class="admin-orders-items">
            <strong>Sản phẩm</strong>
            <div v-for="Item in SelectedOrder.Items" :key="Item.OrderItemId" class="admin-orders-item">
              <span>{{ Item.ProductName }} · {{ Item.VariantName }}</span>
              <strong>{{ Item.Quantity }} × {{ formatCurrency(Item.UnitPrice) }}</strong>
            </div>
          </div>

          <div class="admin-orders-detail__actions">
            <DMButton
              v-for="ActionItem in actionsFor(SelectedOrder.Status)"
              :key="ActionItem.Action"
              type="none"
              :is-tooltip="false"
              :message="ActionItem.Label"
              :icon-name="ActionItem.Icon"
              :class="['admin-orders-action', `admin-orders-action--${ActionItem.Tone}`]"
              @click="runOrderAction(SelectedOrder.OrderId, ActionItem.Action)"
            />
            <DMButton type="border-secondary" :is-tooltip="false" icon-name="chat" message="Liên hệ sinh viên qua Zalo" un-active tooltip-message="Chưa có Zalo API" />
          </div>
        </template>
      </aside>
    </div>
  </section>
</template>

<style scoped lang="scss" src="@/assets/styles/screens/admin-operations.scss"></style>
