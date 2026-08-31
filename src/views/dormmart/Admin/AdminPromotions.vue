<template>
  <section class="admin-page admin-promotions">
    <header class="admin-page__header">
      <div>
        <h1>Khuyến mãi</h1>
        <p>Quản lý voucher và flash sale đang chạy trên API thật, đủ để rà dữ liệu và thao tác nhanh sau merge.</p>
      </div>
      <DMButton type="none" :is-tooltip="false" message="Tải lại" class="admin-button" @click="loadPromotions" />
    </header>

    <div class="admin-metrics admin-promotions__metrics">
      <article class="dm-card admin-metric">
        <span class="material-symbols-outlined">confirmation_number</span>
        <div class="admin-metric__label">Tổng voucher</div>
        <div class="admin-metric__value">{{ Vouchers.length }}</div>
      </article>
      <article class="dm-card admin-metric admin-metric--success">
        <span class="material-symbols-outlined">sell</span>
        <div class="admin-metric__label">Voucher đang bật</div>
        <div class="admin-metric__value">{{ ActiveVoucherCount }}</div>
      </article>
      <article class="dm-card admin-metric admin-metric--warning">
        <span class="material-symbols-outlined">bolt</span>
        <div class="admin-metric__label">Flash sale đang bật</div>
        <div class="admin-metric__value">{{ ActiveFlashSaleCount }}</div>
      </article>
      <article class="dm-card admin-metric admin-metric--expense">
        <span class="material-symbols-outlined">inventory_2</span>
        <div class="admin-metric__label">Tổng item flash sale</div>
        <div class="admin-metric__value">{{ FlashSaleItemCount }}</div>
      </article>
    </div>

    <div v-if="ErrorMessage" class="admin-promotions__alert admin-promotions__alert--danger dm-card">{{ ErrorMessage }}</div>
    <div v-if="SuccessMessage" class="admin-promotions__alert dm-card">{{ SuccessMessage }}</div>
    <div v-if="IsLoading" class="admin-promotions__alert dm-card">Đang tải khuyến mãi...</div>

    <section class="admin-promotions__forms">
      <article class="dm-card admin-panel admin-form">
        <div class="admin-panel__header">
          <div>
            <h2>Voucher</h2>
            <p>{{ VoucherModeLabel }}</p>
          </div>
          <span class="admin-status" :class="{ 'admin-status--warning': !VoucherForm.IsActive }">{{ VoucherForm.IsActive ? 'Active' : 'Draft' }}</span>
        </div>
        <div class="admin-promotions__grid">
          <DMInput v-model="VoucherForm.Code" label="Mã" />
          <DMInput v-model="VoucherForm.DiscountType" label="Loại giảm (0=%,1=VND)" type="number" />
          <DMInput v-model="VoucherForm.DiscountValue" label="Giá trị" type="number" />
          <DMInput v-model="VoucherForm.MinOrderAmount" label="Đơn tối thiểu" type="number" />
          <DMInput v-model="VoucherForm.MaxDiscountAmount" label="Giảm tối đa" type="number" />
          <DMInput v-model="VoucherForm.MaxUsageCount" label="Tổng lượt dùng" type="number" />
          <DMInput v-model="VoucherForm.PerUserLimit" label="Giới hạn mỗi user" type="number" />
          <DMInput v-model="VoucherForm.StartsAt" label="Bắt đầu" type="datetime-local" />
          <DMInput v-model="VoucherForm.ExpiresAt" label="Hết hạn" type="datetime-local" />
          <label class="admin-promotions__toggle">
            <span>Kích hoạt</span>
            <input v-model="VoucherForm.IsActive" type="checkbox" />
          </label>
        </div>
        <div class="admin-toolbar">
          <DMButton type="none" :is-tooltip="false" :message="VoucherForm.VoucherId ? 'Cập nhật voucher' : 'Tạo voucher'" class="admin-button" @click="submitVoucher" />
          <DMButton type="none" :is-tooltip="false" message="Reset voucher" class="admin-button" @click="resetVoucherForm" />
        </div>
      </article>

      <article class="dm-card admin-panel admin-form">
        <div class="admin-panel__header">
          <div>
            <h2>Flash sale</h2>
            <p>{{ FlashSaleModeLabel }}</p>
          </div>
          <span class="admin-status" :class="{ 'admin-status--warning': !FlashSaleForm.IsActive }">{{ FlashSaleForm.IsActive ? 'Active' : 'Draft' }}</span>
        </div>
        <div class="admin-promotions__grid">
          <DMInput v-model="FlashSaleForm.Name" label="Tên" />
          <DMInput v-model="FlashSaleForm.StartsAt" label="Bắt đầu" type="datetime-local" />
          <DMInput v-model="FlashSaleForm.EndsAt" label="Kết thúc" type="datetime-local" />
          <label class="admin-promotions__toggle">
            <span>Kích hoạt</span>
            <input v-model="FlashSaleForm.IsActive" type="checkbox" />
          </label>
        </div>
        <div class="admin-toolbar">
          <DMButton type="none" :is-tooltip="false" :message="FlashSaleForm.FlashSaleId ? 'Cập nhật flash sale' : 'Tạo flash sale'" class="admin-button" @click="submitFlashSale" />
          <DMButton type="none" :is-tooltip="false" message="Reset flash sale" class="admin-button" @click="resetFlashSaleForm" />
        </div>
      </article>
    </section>

    <article class="dm-card admin-panel admin-table-wrap">
      <div class="admin-panel__header">
        <div>
          <h2>Vouchers</h2>
          <p>Danh sách đang dùng dữ liệu thật từ `/api/admin/vouchers`.</p>
        </div>
      </div>
      <table class="dm-table" style="min-width: 1100px;">
        <thead>
          <tr>
            <th>Mã</th>
            <th>Loại</th>
            <th>Giá trị</th>
            <th>Đơn tối thiểu</th>
            <th>Đã dùng</th>
            <th>Hết hạn</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="Voucher in Vouchers" :key="Voucher.VoucherId">
            <td>
              <strong>{{ Voucher.Code }}</strong>
            </td>
            <td>{{ formatDiscountType(Voucher.DiscountType) }}</td>
            <td>{{ formatCurrency(Voucher.DiscountValue) }}</td>
            <td>{{ formatCurrency(Voucher.MinOrderAmount) }}</td>
            <td>{{ Voucher.UsedCount }}</td>
            <td>{{ formatDateTime(Voucher.ExpiresAt) }}</td>
            <td><span class="admin-status" :class="{ 'admin-status--warning': !Voucher.IsActive }">{{ Voucher.IsActive ? 'Active' : 'Inactive' }}</span></td>
            <td>
              <div class="admin-table-actions">
                <DMButton type="none" :is-tooltip="false" message="Sửa" class="admin-button" @click="editVoucher(Voucher)" />
                <DMButton type="none" :is-tooltip="false" message="Xóa" class="admin-button admin-button--danger" @click="removeVoucher(Voucher)" />
              </div>
            </td>
          </tr>
          <tr v-if="!Vouchers.length && !IsLoading">
            <td colspan="8" style="text-align: center; padding: 20px; color: var(--dm-text-soft);">Chưa có voucher từ API.</td>
          </tr>
        </tbody>
      </table>
    </article>

    <article class="dm-card admin-panel admin-table-wrap">
      <div class="admin-panel__header">
        <div>
          <h2>Flash sales</h2>
          <p>Header CRUD đã sẵn sàng. Item-level mutations vẫn để follow-up riêng.</p>
        </div>
      </div>
      <table class="dm-table" style="min-width: 1120px;">
        <thead>
          <tr>
            <th>Tên</th>
            <th>Bắt đầu</th>
            <th>Kết thúc</th>
            <th>Trạng thái</th>
            <th>Số item</th>
            <th>Item đầu</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="FlashSale in FlashSales" :key="FlashSale.FlashSaleId">
            <td><strong>{{ FlashSale.Name }}</strong></td>
            <td>{{ formatDateTime(FlashSale.StartsAt) }}</td>
            <td>{{ formatDateTime(FlashSale.EndsAt) }}</td>
            <td><span class="admin-status" :class="{ 'admin-status--warning': !FlashSale.IsActive }">{{ FlashSale.IsActive ? 'Active' : 'Inactive' }}</span></td>
            <td>{{ FlashSale.Items?.length || 0 }}</td>
            <td>{{ FlashSale.Items?.[0]?.Sku || '-' }}</td>
            <td>
              <div class="admin-table-actions">
                <DMButton type="none" :is-tooltip="false" message="Sửa" class="admin-button" @click="editFlashSale(FlashSale)" />
                <DMButton type="none" :is-tooltip="false" message="Xóa" class="admin-button admin-button--danger" @click="removeFlashSale(FlashSale)" />
              </div>
            </td>
          </tr>
          <tr v-if="!FlashSales.length && !IsLoading">
            <td colspan="7" style="text-align: center; padding: 20px; color: var(--dm-text-soft);">Chưa có flash sale từ API.</td>
          </tr>
        </tbody>
      </table>
    </article>
  </section>
</template>

<script setup>
import { computed, inject, onMounted, reactive, ref } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import {
  createAdminFlashSale,
  createAdminVoucher,
  deleteAdminFlashSale,
  deleteAdminVoucher,
  getAdminFlashSales,
  getAdminVouchers,
  updateAdminFlashSale,
  updateAdminVoucher,
} from "@/services/adminService";
import { formatCurrency, formatDateTime } from "@/utils/shopFormatters";
import { formatI18nText } from "@/utils/i18n";

const Text = inject("i18nCommon").AdminPromotions;
const Vouchers = ref([]);
const FlashSales = ref([]);
const ErrorMessage = ref("");
const SuccessMessage = ref("");
const IsLoading = ref(false);
const VoucherForm = reactive({
  VoucherId: "",
  Code: "",
  DiscountType: 1,
  DiscountValue: 0,
  MinOrderAmount: 0,
  MaxDiscountAmount: "",
  MaxUsageCount: "",
  PerUserLimit: "",
  StartsAt: "",
  ExpiresAt: "",
  IsActive: true,
});
const FlashSaleForm = reactive({
  FlashSaleId: "",
  Name: "",
  StartsAt: "",
  EndsAt: "",
  IsActive: true,
});

const VoucherModeLabel = computed(() => VoucherForm.VoucherId ? "Đang sửa voucher" : "Tạo voucher mới");
const FlashSaleModeLabel = computed(() => FlashSaleForm.FlashSaleId ? "Đang sửa flash sale" : "Tạo flash sale mới");
const ActiveVoucherCount = computed(() => Vouchers.value.filter((Voucher) => Voucher.IsActive).length);
const ActiveFlashSaleCount = computed(() => FlashSales.value.filter((FlashSale) => FlashSale.IsActive).length);
const FlashSaleItemCount = computed(() => FlashSales.value.reduce((Total, FlashSale) => Total + (FlashSale.Items?.length || 0), 0));
const formatDiscountType = (DiscountType) => Number(DiscountType) === 0 ? "%" : "VND";

const resetVoucherForm = () => {
  VoucherForm.VoucherId = "";
  VoucherForm.Code = "";
  VoucherForm.DiscountType = 1;
  VoucherForm.DiscountValue = 0;
  VoucherForm.MinOrderAmount = 0;
  VoucherForm.MaxDiscountAmount = "";
  VoucherForm.MaxUsageCount = "";
  VoucherForm.PerUserLimit = "";
  VoucherForm.StartsAt = "";
  VoucherForm.ExpiresAt = "";
  VoucherForm.IsActive = true;
};

const resetFlashSaleForm = () => {
  FlashSaleForm.FlashSaleId = "";
  FlashSaleForm.Name = "";
  FlashSaleForm.StartsAt = "";
  FlashSaleForm.EndsAt = "";
  FlashSaleForm.IsActive = true;
};

const toIsoOrNull = (Value) => Value ? new Date(Value).toISOString() : null;

const loadPromotions = async () => {
  IsLoading.value = true;
  ErrorMessage.value = "";

  try {
    const [VoucherData, FlashSaleData] = await Promise.all([
      getAdminVouchers(),
      getAdminFlashSales(),
    ]);
    Vouchers.value = VoucherData;
    FlashSales.value = FlashSaleData;
    SuccessMessage.value = "Đã đồng bộ voucher và flash sale từ API thật.";
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsLoading.value = false;
  }
};

const submitVoucher = async () => {
  ErrorMessage.value = "";

  if (!VoucherForm.Code.trim()) {
    ErrorMessage.value = "Nhập mã voucher trước khi lưu.";
    return;
  }

  if ((Number(VoucherForm.DiscountValue) || 0) <= 0) {
    ErrorMessage.value = "Giá trị voucher phải lớn hơn 0.";
    return;
  }

  if (VoucherForm.StartsAt && VoucherForm.ExpiresAt && new Date(VoucherForm.StartsAt) > new Date(VoucherForm.ExpiresAt)) {
    ErrorMessage.value = "Thời gian hết hạn phải sau thời gian bắt đầu.";
    return;
  }

  const Payload = {
    Code: VoucherForm.Code.trim(),
    DiscountType: Number(VoucherForm.DiscountType),
    DiscountValue: Number(VoucherForm.DiscountValue) || 0,
    MinOrderAmount: Number(VoucherForm.MinOrderAmount) || 0,
    MaxDiscountAmount: VoucherForm.MaxDiscountAmount === "" ? null : Number(VoucherForm.MaxDiscountAmount),
    MaxUsageCount: VoucherForm.MaxUsageCount === "" ? null : Number(VoucherForm.MaxUsageCount),
    PerUserLimit: VoucherForm.PerUserLimit === "" ? null : Number(VoucherForm.PerUserLimit),
    StartsAt: toIsoOrNull(VoucherForm.StartsAt),
    ExpiresAt: toIsoOrNull(VoucherForm.ExpiresAt),
    IsActive: VoucherForm.IsActive,
  };

  try {
    if (VoucherForm.VoucherId) {
      await updateAdminVoucher(VoucherForm.VoucherId, Payload);
      SuccessMessage.value = "Đã cập nhật voucher.";
    } else {
      await createAdminVoucher(Payload);
      SuccessMessage.value = "Đã tạo voucher.";
    }
    resetVoucherForm();
    await loadPromotions();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

const submitFlashSale = async () => {
  ErrorMessage.value = "";

  if (!FlashSaleForm.Name.trim()) {
    ErrorMessage.value = "Nhập tên flash sale trước khi lưu.";
    return;
  }

  if (!FlashSaleForm.StartsAt || !FlashSaleForm.EndsAt) {
    ErrorMessage.value = "Chọn đủ thời gian bắt đầu và kết thúc cho flash sale.";
    return;
  }

  if (new Date(FlashSaleForm.StartsAt) >= new Date(FlashSaleForm.EndsAt)) {
    ErrorMessage.value = "Thời gian kết thúc phải sau thời gian bắt đầu.";
    return;
  }

  const Payload = {
    Name: FlashSaleForm.Name.trim(),
    StartsAt: new Date(FlashSaleForm.StartsAt).toISOString(),
    EndsAt: new Date(FlashSaleForm.EndsAt).toISOString(),
    IsActive: FlashSaleForm.IsActive,
  };

  try {
    if (FlashSaleForm.FlashSaleId) {
      await updateAdminFlashSale(FlashSaleForm.FlashSaleId, Payload);
      SuccessMessage.value = "Đã cập nhật flash sale.";
    } else {
      await createAdminFlashSale(Payload);
      SuccessMessage.value = "Đã tạo flash sale.";
    }
    resetFlashSaleForm();
    await loadPromotions();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

const editVoucher = (Voucher) => {
  VoucherForm.VoucherId = Voucher.VoucherId;
  VoucherForm.Code = Voucher.Code || "";
  VoucherForm.DiscountType = Number(Voucher.DiscountType ?? 1);
  VoucherForm.DiscountValue = Number(Voucher.DiscountValue || 0);
  VoucherForm.MinOrderAmount = Number(Voucher.MinOrderAmount || 0);
  VoucherForm.MaxDiscountAmount = Voucher.MaxDiscountAmount ?? "";
  VoucherForm.MaxUsageCount = Voucher.MaxUsageCount ?? "";
  VoucherForm.PerUserLimit = Voucher.PerUserLimit ?? "";
  VoucherForm.StartsAt = Voucher.StartsAt ? String(Voucher.StartsAt).slice(0, 16) : "";
  VoucherForm.ExpiresAt = Voucher.ExpiresAt ? String(Voucher.ExpiresAt).slice(0, 16) : "";
  VoucherForm.IsActive = Boolean(Voucher.IsActive);
  SuccessMessage.value = formatI18nText(Text.EditingVoucher, { name: Voucher.Code || Voucher.VoucherId });
};

const editFlashSale = (FlashSale) => {
  FlashSaleForm.FlashSaleId = FlashSale.FlashSaleId;
  FlashSaleForm.Name = FlashSale.Name || "";
  FlashSaleForm.StartsAt = FlashSale.StartsAt ? String(FlashSale.StartsAt).slice(0, 16) : "";
  FlashSaleForm.EndsAt = FlashSale.EndsAt ? String(FlashSale.EndsAt).slice(0, 16) : "";
  FlashSaleForm.IsActive = Boolean(FlashSale.IsActive);
  SuccessMessage.value = formatI18nText(Text.EditingFlashSale, { name: FlashSale.Name || FlashSale.FlashSaleId });
};

const removeVoucher = async (Voucher) => {
  const VoucherName = Voucher.Code || Voucher.VoucherId;
  if (!window.confirm(formatI18nText(Text.ConfirmDeleteVoucher, { name: VoucherName }))) return;

  try {
    await deleteAdminVoucher(Voucher.VoucherId);
    SuccessMessage.value = formatI18nText(Text.DeleteVoucherSuccess, { name: VoucherName });
    await loadPromotions();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

const removeFlashSale = async (FlashSale) => {
  const FlashSaleName = FlashSale.Name || FlashSale.FlashSaleId;
  if (!window.confirm(formatI18nText(Text.ConfirmDeleteFlashSale, { name: FlashSaleName }))) return;

  try {
    await deleteAdminFlashSale(FlashSale.FlashSaleId);
    SuccessMessage.value = formatI18nText(Text.DeleteFlashSaleSuccess, { name: FlashSaleName });
    await loadPromotions();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

onMounted(loadPromotions);
</script>

<style scoped lang="scss" src="@/assets/styles/screens/admin-operations.scss"></style>

<style scoped lang="scss">
.admin-promotions__metrics {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.admin-promotions__alert {
  padding: 16px 18px;
  color: var(--dm-primary);
}

.admin-promotions__alert--danger {
  color: var(--dm-danger);
}

.admin-promotions__forms {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.admin-promotions__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.admin-promotions__toggle {
  display: grid;
  gap: 8px;
  align-content: start;
  color: var(--dm-text);
  font-size: 14px;
  font-weight: 700;
}

.admin-promotions__toggle input {
  width: 18px;
  height: 18px;
}

.admin-panel__header p {
  margin: 6px 0 0;
}

@media (max-width: 960px) {
  .admin-promotions__forms {
    grid-template-columns: 1fr;
  }
}
</style>

<!-- ponytail: CRUD hiện cover voucher và flash sale header; add flash sale item mutations khi cần test item-level admin flow. -->
