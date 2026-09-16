<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import DMTextarea from "@/components/base/DMTextarea.vue";
import { getAdminOrderById, getAdminOrders } from "@/services/adminService";
import { buildInvoiceQrDataUrl, generateInvoicePdf } from "@/services/invoiceService";
import { formatCurrency } from "@/utils/shopFormatters";

const Orders = ref([]);
const SelectedOrder = ref(null);
const Search = ref("");
const IsLoading = ref(false);
const IsDetailLoading = ref(false);
const IsExporting = ref(false);
const ErrorMessage = ref("");
const SuccessMessage = ref("");
const QrDataUrl = ref("");
const FormErrors = reactive({});
const Form = reactive({
  RecipientName: "",
  PhoneNumber: "",
  AddressLine: "",
  Ward: "",
  District: "",
  Province: "",
  Note: "",
});

const paymentStatus = (Order) => Number(Order?.PaymentStatus ?? Order?.Payment?.Status ?? -1);
const isInvoiceEligible = (Order) => Number(Order?.Status) === 1 && paymentStatus(Order) === 5;
const EligibleOrders = computed(() => Orders.value.filter(isInvoiceEligible));
const FilteredOrders = computed(() => {
  const Keyword = Search.value.trim().toLocaleLowerCase("vi");
  if (!Keyword) return EligibleOrders.value;
  return EligibleOrders.value.filter((Order) => [Order.OrderCode, Order.OrderId]
    .some((Value) => String(Value || "").toLocaleLowerCase("vi").includes(Keyword)));
});
const FullAddress = computed(() => [Form.AddressLine, Form.Ward, Form.District, Form.Province]
  .map((Value) => Value.trim()).filter(Boolean).join(", "));
const TotalLineCount = computed(() => (SelectedOrder.value?.Items?.length || 0) + (SelectedOrder.value?.Combos?.length || 0));
const CanExport = computed(() => Boolean(
  SelectedOrder.value
  && Form.RecipientName.trim()
  && Form.PhoneNumber.trim()
  && FullAddress.value
  && !IsExporting.value,
));

const resetFormErrors = () => Object.keys(FormErrors).forEach((Key) => delete FormErrors[Key]);
const hydrateForm = (Order) => {
  const Address = Order?.Address || Order?.ShippingAddress || {};
  Object.assign(Form, {
    RecipientName: Address.RecipientName ?? Address.recipientName ?? Order?.RecipientName ?? "",
    PhoneNumber: Address.PhoneNumber ?? Address.phoneNumber ?? Order?.PhoneNumber ?? "",
    AddressLine: Address.AddressLine ?? Address.addressLine ?? "",
    Ward: Address.Ward ?? Address.ward ?? "",
    District: Address.District ?? Address.district ?? "",
    Province: Address.Province ?? Address.province ?? "",
    Note: Order?.Note ?? "",
  });
  resetFormErrors();
};

const selectOrder = async (Order) => {
  if (!Order?.OrderId || IsDetailLoading.value) return;
  IsDetailLoading.value = true;
  ErrorMessage.value = "";
  SuccessMessage.value = "";
  try {
    const Detail = await getAdminOrderById(Order.OrderId);
    if (!isInvoiceEligible(Detail)) throw new Error("Đơn hàng không còn ở trạng thái đã xác nhận và đã thanh toán.");
    SelectedOrder.value = Detail;
    hydrateForm(Detail);
  } catch (Error) {
    ErrorMessage.value = Error.message || "Không thể tải chi tiết đơn hàng.";
  } finally {
    IsDetailLoading.value = false;
  }
};

const loadOrders = async () => {
  IsLoading.value = true;
  ErrorMessage.value = "";
  try {
    Orders.value = await getAdminOrders();
    const FirstEligibleOrder = EligibleOrders.value[0];
    if (FirstEligibleOrder) await selectOrder(FirstEligibleOrder);
    else SelectedOrder.value = null;
  } catch (Error) {
    ErrorMessage.value = Error.message || "Không thể tải danh sách đơn hàng.";
  } finally {
    IsLoading.value = false;
  }
};

const validateForm = () => {
  resetFormErrors();
  if (!Form.RecipientName.trim()) FormErrors.RecipientName = "Nhập tên người nhận.";
  if (!Form.PhoneNumber.trim()) FormErrors.PhoneNumber = "Nhập số điện thoại.";
  else if (!/^[0-9+() .-]{8,20}$/.test(Form.PhoneNumber.trim())) FormErrors.PhoneNumber = "Số điện thoại chưa hợp lệ.";
  if (!Form.AddressLine.trim()) FormErrors.AddressLine = "Nhập địa chỉ chi tiết.";
  if (!Form.Province.trim()) FormErrors.Province = "Nhập tỉnh/thành phố.";
  return Object.keys(FormErrors).length === 0;
};

const exportInvoice = async () => {
  if (!SelectedOrder.value || !validateForm()) return;
  IsExporting.value = true;
  ErrorMessage.value = "";
  SuccessMessage.value = "";
  try {
    const Result = await generateInvoicePdf({ Order: SelectedOrder.value, Form: { ...Form } });
    SuccessMessage.value = `Đã tạo ${Result.FileName}. File sẵn sàng để in.`;
  } catch (Error) {
    ErrorMessage.value = Error.message || "Chưa thể tạo file hóa đơn.";
  } finally {
    IsExporting.value = false;
  }
};

let QrRenderId = 0;
watch(
  [() => SelectedOrder.value?.OrderCode, Form],
  async () => {
    const RenderId = ++QrRenderId;
    if (!SelectedOrder.value || !Form.RecipientName || !Form.PhoneNumber || !FullAddress.value) {
      QrDataUrl.value = "";
      return;
    }
    const DataUrl = await buildInvoiceQrDataUrl({ Order: SelectedOrder.value, Form: { ...Form } });
    if (RenderId === QrRenderId) QrDataUrl.value = DataUrl;
  },
  { deep: true },
);

onMounted(loadOrders);
</script>

<template>
  <section class="admin-invoices">
    <header class="admin-invoices__hero">
      <div>
        <span class="admin-invoices__eyebrow"><span class="material-symbols-outlined" aria-hidden="true">receipt_long</span>Đóng gói & giao hàng</span>
        <h1>Xuất hóa đơn</h1>
        <p>Chọn đơn đã xác nhận và thanh toán, kiểm tra thông tin giao hàng rồi xuất PDF A4 có mã QR.</p>
      </div>
      <DMButton type="border-secondary" :is-tooltip="false" icon-name="refresh" message="Tải lại đơn" :un-active="IsLoading" @click="loadOrders" />
    </header>

    <div v-if="ErrorMessage" class="admin-invoices__alert admin-invoices__alert--error" role="alert">
      <span class="material-symbols-outlined" aria-hidden="true">error</span>{{ ErrorMessage }}
    </div>
    <div v-if="SuccessMessage" class="admin-invoices__alert admin-invoices__alert--success" role="status">
      <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>{{ SuccessMessage }}
    </div>

    <div class="admin-invoices__metrics">
      <article><span class="material-symbols-outlined">verified</span><div><strong>{{ EligibleOrders.length }}</strong><small>Đơn đủ điều kiện</small></div></article>
      <article><span class="material-symbols-outlined">description</span><div><strong>{{ SelectedOrder ? 1 : 0 }}</strong><small>Hóa đơn đang soạn</small></div></article>
      <article><span class="material-symbols-outlined">qr_code_2</span><div><strong>QR</strong><small>Địa chỉ & số điện thoại</small></div></article>
    </div>

    <div class="admin-invoices__workspace">
      <aside class="admin-invoices__orders dm-card">
        <div class="admin-invoices__panel-head">
          <div><span>Bước 1</span><h2>Chọn đơn hàng</h2></div>
          <DMBadge type="success">{{ EligibleOrders.length }} đơn</DMBadge>
        </div>
        <DMInput v-model="Search" type="search" placeholder="Tìm theo mã đơn..." aria-label="Tìm đơn đủ điều kiện" />
        <p class="admin-invoices__condition"><span class="material-symbols-outlined">info</span>Chỉ hiện đơn “Đã xác nhận” và “Đã thanh toán”.</p>

        <div v-if="IsLoading" class="admin-invoices__empty">Đang tải đơn hàng...</div>
        <div v-else-if="!FilteredOrders.length" class="admin-invoices__empty">
          <span class="material-symbols-outlined">inventory_2</span>
          <strong>Chưa có đơn đủ điều kiện</strong>
          <small>Hãy xác nhận thanh toán trong phân hệ Đơn hàng trước.</small>
        </div>
        <div v-else class="admin-invoices__order-list">
          <button
            v-for="Order in FilteredOrders"
            :key="Order.OrderId"
            type="button"
            class="admin-invoices__order"
            :class="{ 'admin-invoices__order--active': SelectedOrder?.OrderId === Order.OrderId }"
            @click="selectOrder(Order)"
          >
            <span class="admin-invoices__order-icon material-symbols-outlined">receipt</span>
            <span><strong>{{ Order.OrderCode }}</strong><small>{{ Order.ItemCount }} món · {{ formatCurrency(Order.Total) }}</small></span>
            <span class="admin-invoices__order-status">Đã thanh toán</span>
          </button>
        </div>
      </aside>

      <main class="admin-invoices__form dm-card">
        <div class="admin-invoices__panel-head">
          <div><span>Bước 2</span><h2>Kiểm tra thông tin hóa đơn</h2></div>
          <span v-if="SelectedOrder" class="admin-invoices__order-code">{{ SelectedOrder.OrderCode }}</span>
        </div>

        <div v-if="IsDetailLoading" class="admin-invoices__empty">Đang trích xuất thông tin đơn...</div>
        <div v-else-if="!SelectedOrder" class="admin-invoices__empty admin-invoices__empty--large">
          <span class="material-symbols-outlined">draft</span>
          <strong>Chọn một đơn hàng để bắt đầu</strong>
          <small>Thông tin người nhận và sản phẩm sẽ được tự động điền.</small>
        </div>
        <template v-else>
          <div class="admin-invoices__form-grid">
            <DMInput v-model="Form.RecipientName" label="Tên người nhận" :error-messages="FormErrors.RecipientName" is-required />
            <DMInput v-model="Form.PhoneNumber" label="Số điện thoại" inputmode="tel" :error-messages="FormErrors.PhoneNumber" is-required />
            <DMInput v-model="Form.AddressLine" label="Địa chỉ chi tiết" :error-messages="FormErrors.AddressLine" is-required />
            <DMInput v-model="Form.Ward" label="Phường/Xã" />
            <DMInput v-model="Form.District" label="Quận/Huyện" />
            <DMInput v-model="Form.Province" label="Tỉnh/Thành phố" :error-messages="FormErrors.Province" is-required />
          </div>
          <DMTextarea v-model="Form.Note" label="Ghi chú giao hàng" :max-length="250" :rows="3" />

          <section class="admin-invoices__items">
            <header><div><span class="material-symbols-outlined">shopping_bag</span><strong>Sản phẩm trên hóa đơn</strong></div><small>{{ TotalLineCount }} dòng</small></header>
            <div v-for="Item in SelectedOrder.Items || []" :key="Item.OrderItemId" class="admin-invoices__item">
              <span><strong>{{ Item.ProductName }}</strong><small>{{ [Item.VariantName, Item.Sku].filter(Boolean).join(' · ') }}</small></span>
              <span>{{ Item.Quantity }} × {{ formatCurrency(Item.UnitPrice) }}</span>
              <strong>{{ formatCurrency(Item.LineTotal) }}</strong>
            </div>
            <div v-for="Combo in SelectedOrder.Combos || []" :key="Combo.OrderComboId" class="admin-invoices__item">
              <span><strong>Combo: {{ Combo.Name }}</strong><small>{{ Combo.ComboCode }}</small></span>
              <span>{{ Combo.Quantity }} combo</span>
              <strong>{{ formatCurrency(Combo.LineTotal) }}</strong>
            </div>
          </section>

          <section class="admin-invoices__preview">
            <div class="admin-invoices__preview-copy">
              <span class="admin-invoices__preview-label">BẢN XEM TRƯỚC</span>
              <h3>{{ Form.RecipientName || 'Người nhận' }}</h3>
              <p><span class="material-symbols-outlined">call</span>{{ Form.PhoneNumber || 'Số điện thoại' }}</p>
              <p><span class="material-symbols-outlined">location_on</span>{{ FullAddress || 'Địa chỉ giao hàng' }}</p>
              <dl>
                <div><dt>Tạm tính</dt><dd>{{ formatCurrency(SelectedOrder.Subtotal) }}</dd></div>
                <div><dt>Phí giao hàng</dt><dd>{{ formatCurrency(SelectedOrder.ShippingFee) }}</dd></div>
                <div><dt>Tổng thanh toán</dt><dd>{{ formatCurrency(SelectedOrder.Total) }}</dd></div>
              </dl>
            </div>
            <div class="admin-invoices__qr">
              <img v-if="QrDataUrl" :src="QrDataUrl" alt="Mã QR chứa địa chỉ và số điện thoại người nhận" />
              <span v-else class="material-symbols-outlined">qr_code_2</span>
              <small>Quét để xem địa chỉ & SĐT</small>
            </div>
          </section>

          <footer class="admin-invoices__actions">
            <div><span class="material-symbols-outlined">lock</span><p><strong>Xử lý tại frontend</strong><small>Chưa ghi dữ liệu hóa đơn lên backend.</small></p></div>
            <DMButton
              type="warning"
              :is-tooltip="false"
              icon-name="picture_as_pdf"
              :message="IsExporting ? 'Đang tạo PDF...' : 'Xác nhận & xuất PDF'"
              :un-active="!CanExport"
              @click="exportInvoice"
            />
          </footer>
        </template>
      </main>
    </div>
  </section>
</template>

<style scoped lang="scss">
.admin-invoices { display: grid; gap: 22px; }
.admin-invoices__hero { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; padding: 26px 28px; border-radius: 22px; background: linear-gradient(125deg, #0f2747, #174a7e); color: #fff; box-shadow: 0 18px 40px rgba(15, 39, 71, .18); }
.admin-invoices__hero h1, .admin-invoices__hero p { margin: 0; }
.admin-invoices__hero h1 { margin-top: 7px; font-size: 32px; }
.admin-invoices__hero p { max-width: 720px; margin-top: 7px; color: rgba(255, 255, 255, .76); }
.admin-invoices__eyebrow { display: inline-flex; align-items: center; gap: 6px; color: #fbbf24; font-size: 12px; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; }
.admin-invoices__eyebrow .material-symbols-outlined { font-size: 18px; }
.admin-invoices__hero :deep(.ms-button) { border-color: rgba(255, 255, 255, .5) !important; background: rgba(255, 255, 255, .1) !important; color: #fff !important; }
.admin-invoices__hero :deep(.ms-button:hover) { background: rgba(255, 255, 255, .18) !important; }
.admin-invoices__alert { display: flex; align-items: center; gap: 9px; padding: 13px 16px; border-radius: 12px; font-weight: 700; }
.admin-invoices__alert--error { background: #fff1f2; color: #be123c; }
.admin-invoices__alert--success { background: #ecfdf5; color: #047857; }
.admin-invoices__metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.admin-invoices__metrics article { display: flex; align-items: center; gap: 14px; padding: 18px; border: 1px solid var(--dm-border); border-radius: 16px; background: var(--dm-surface); }
.admin-invoices__metrics article > .material-symbols-outlined { display: grid; width: 46px; height: 46px; place-items: center; border-radius: 14px; background: var(--dm-primary-soft); color: var(--dm-primary); }
.admin-invoices__metrics strong, .admin-invoices__metrics small { display: block; }
.admin-invoices__metrics strong { color: var(--dm-text); font-size: 22px; }
.admin-invoices__metrics small { color: var(--dm-text-soft); }
.admin-invoices__workspace { display: grid; grid-template-columns: minmax(290px, .7fr) minmax(0, 1.6fr); align-items: start; gap: 18px; }
.admin-invoices__orders, .admin-invoices__form { display: grid; gap: 18px; padding: 22px; border: 1px solid var(--dm-border); }
.admin-invoices__orders { position: sticky; top: 20px; }
.admin-invoices__panel-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.admin-invoices__panel-head h2 { margin: 3px 0 0; color: var(--dm-text); font-size: 19px; }
.admin-invoices__panel-head > div > span { color: var(--dm-primary); font-size: 11px; font-weight: 850; letter-spacing: .09em; text-transform: uppercase; }
.admin-invoices__condition { display: flex; align-items: flex-start; gap: 7px; margin: -4px 0 0; color: var(--dm-text-soft); font-size: 12px; }
.admin-invoices__condition .material-symbols-outlined { color: var(--dm-primary); font-size: 17px; }
.admin-invoices__order-list { display: grid; max-height: 560px; overflow-y: auto; gap: 9px; padding-right: 2px; }
.admin-invoices__order { display: grid; width: 100%; grid-template-columns: 38px minmax(0, 1fr); gap: 10px; padding: 13px; border: 1px solid var(--dm-border); border-radius: 13px; background: var(--dm-surface); color: var(--dm-text); cursor: pointer; text-align: left; transition: 160ms ease; }
.admin-invoices__order:hover, .admin-invoices__order--active { border-color: var(--dm-primary); background: var(--dm-primary-soft); box-shadow: 0 6px 16px rgba(23, 74, 126, .1); }
.admin-invoices__order-icon { display: grid; width: 36px; height: 36px; grid-row: span 2; place-items: center; border-radius: 10px; background: #fff; color: var(--dm-primary); }
.admin-invoices__order strong, .admin-invoices__order small { display: block; min-width: 0; overflow-wrap: anywhere; }
.admin-invoices__order small { margin-top: 3px; color: var(--dm-text-soft); font-size: 11px; }
.admin-invoices__order-status { grid-column: 2; color: #15803d; font-size: 11px; font-weight: 800; }
.admin-invoices__order-code { padding: 6px 10px; border-radius: 999px; background: var(--dm-primary-soft); color: var(--dm-primary); font-size: 12px; font-weight: 800; }
.admin-invoices__form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.admin-invoices__items { overflow: hidden; border: 1px solid var(--dm-border); border-radius: 14px; }
.admin-invoices__items header, .admin-invoices__item { display: grid; grid-template-columns: minmax(0, 1fr) 150px 120px; align-items: center; gap: 12px; padding: 12px 14px; }
.admin-invoices__items header { display: flex; justify-content: space-between; background: var(--dm-surface-soft); }
.admin-invoices__items header > div { display: flex; align-items: center; gap: 7px; }
.admin-invoices__items header .material-symbols-outlined { color: var(--dm-primary); }
.admin-invoices__items header small, .admin-invoices__item small { color: var(--dm-text-soft); }
.admin-invoices__item + .admin-invoices__item { border-top: 1px solid var(--dm-border); }
.admin-invoices__item > span:first-child strong, .admin-invoices__item > span:first-child small { display: block; }
.admin-invoices__item > strong { color: var(--dm-danger); text-align: right; }
.admin-invoices__preview { display: grid; grid-template-columns: minmax(0, 1fr) 190px; gap: 22px; padding: 22px; border: 1px dashed #94a3b8; border-radius: 16px; background: linear-gradient(145deg, #f8fafc, #fff); }
.admin-invoices__preview-label { color: var(--dm-primary); font-size: 10px; font-weight: 900; letter-spacing: .1em; }
.admin-invoices__preview h3 { margin: 6px 0 10px; color: var(--dm-text); font-size: 21px; }
.admin-invoices__preview p { display: flex; align-items: flex-start; gap: 7px; margin: 7px 0; color: var(--dm-text-soft); }
.admin-invoices__preview p .material-symbols-outlined { color: var(--dm-primary); font-size: 18px; }
.admin-invoices__preview dl { display: grid; gap: 5px; margin: 16px 0 0; }
.admin-invoices__preview dl > div { display: flex; justify-content: space-between; gap: 10px; }
.admin-invoices__preview dt, .admin-invoices__preview dd { margin: 0; }
.admin-invoices__preview dl > div:last-child { padding-top: 8px; border-top: 2px solid var(--dm-primary); font-weight: 900; }
.admin-invoices__preview dl > div:last-child dd { color: var(--dm-danger); }
.admin-invoices__qr { display: grid; align-content: center; justify-items: center; gap: 6px; text-align: center; }
.admin-invoices__qr img { width: 164px; height: 164px; border: 1px solid var(--dm-border); border-radius: 10px; background: #fff; }
.admin-invoices__qr > .material-symbols-outlined { font-size: 120px; color: var(--dm-text-soft); }
.admin-invoices__qr small { color: var(--dm-text-soft); font-size: 11px; font-weight: 700; }
.admin-invoices__actions { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding-top: 18px; border-top: 1px solid var(--dm-border); }
.admin-invoices__actions > div { display: flex; align-items: center; gap: 9px; }
.admin-invoices__actions > div > .material-symbols-outlined { color: #16a34a; }
.admin-invoices__actions p, .admin-invoices__actions strong, .admin-invoices__actions small { display: block; margin: 0; }
.admin-invoices__actions small { color: var(--dm-text-soft); }
.admin-invoices__empty { display: grid; min-height: 120px; place-content: center; justify-items: center; gap: 7px; color: var(--dm-text-soft); text-align: center; }
.admin-invoices__empty--large { min-height: 420px; }
.admin-invoices__empty > .material-symbols-outlined { color: var(--dm-primary); font-size: 42px; }

@media (max-width: 1100px) {
  .admin-invoices__workspace { grid-template-columns: 1fr; }
  .admin-invoices__orders { position: static; }
  .admin-invoices__order-list { max-height: 320px; }
}

@media (max-width: 720px) {
  .admin-invoices__hero, .admin-invoices__actions { align-items: stretch; flex-direction: column; }
  .admin-invoices__metrics { grid-template-columns: 1fr; }
  .admin-invoices__form-grid, .admin-invoices__preview { grid-template-columns: 1fr; }
  .admin-invoices__items header, .admin-invoices__item { grid-template-columns: minmax(0, 1fr); }
  .admin-invoices__item > strong { text-align: left; }
}
</style>
