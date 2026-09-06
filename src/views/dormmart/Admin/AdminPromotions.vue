<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import DMBadge from "@/components/base/DMBadge.vue";
import DMSelect from "@/components/base/DMSelect.vue";
import {
  addAdminFlashSaleItem,
  createAdminFlashSale,
  createAdminVoucher,
  deleteAdminFlashSale,
  deleteAdminFlashSaleItem,
  deleteAdminVoucher,
  getAdminFlashSales,
  getAdminProductById,
  getAdminProducts,
  getAdminVouchers,
  updateAdminFlashSale,
  updateAdminVoucher,
} from "@/services/adminService";
import { formatCurrency, formatDateTime } from "@/utils/shopFormatters";

const Vouchers = ref([]);
const FlashSales = ref([]);
const Products = ref([]);
const FlashSaleVariantProducts = ref([]);
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

const FlashSaleItemForm = reactive({
  FlashSaleId: "",
  ProductId: "",
  ProductVariantId: "",
  FlashPrice: "",
  FlashStock: 1,
});

const VoucherModeLabel = computed(() => VoucherForm.VoucherId ? "Đang sửa voucher" : "Tạo voucher mới");
const FlashSaleModeLabel = computed(() => FlashSaleForm.FlashSaleId ? "Đang sửa flash sale" : "Tạo flash sale mới");
const ActiveVoucherCount = computed(() => Vouchers.value.filter((Voucher) => Voucher.IsActive).length);
const ActiveFlashSaleCount = computed(() => FlashSales.value.filter((FlashSale) => FlashSale.IsActive).length);
const FlashSaleItemCount = computed(() => FlashSales.value.reduce((Total, FlashSale) => Total + (FlashSale.Items?.length || 0), 0));
const FlashSaleOptions = computed(() => FlashSales.value.map((FlashSale) => ({ Value: FlashSale.FlashSaleId, Label: FlashSale.Name })));
const FlashSaleProductOptions = computed(() => Products.value.map((Product) => ({
  Value: Product.ProductId,
  Label: `${Product.Name}${Product.ProductCode ? ` (${Product.ProductCode})` : ""}`,
})));
const FlashSaleVariantOptions = computed(() => {
  const Product = FlashSaleVariantProducts.value.find((Item) => Item.ProductId === FlashSaleItemForm.ProductId) || null;
  return Array.isArray(Product?.Variants)
    ? Product.Variants.map((Variant) => ({
      Value: Variant.ProductVariantId,
      Label: `${Variant.Name || Variant.Sku || Variant.ProductVariantId}${Variant.Sku ? ` — ${Variant.Sku}` : ""}`,
      SalePrice: Number(Variant.SalePrice) || 0,
    }))
    : [];
});
const FlashSaleSelectedVariant = computed(() => FlashSaleVariantOptions.value.find((Item) => Item.Value === FlashSaleItemForm.ProductVariantId) || null);
const flashSaleStatusLabel = (IsActive) => (IsActive ? "Đang bật" : "Bản nháp");
const flashSaleItemCountLabel = (Count) => `${Count} item`;
const SelectedFlashSale = computed(() => FlashSales.value.find((FlashSale) => FlashSale.FlashSaleId === FlashSaleItemForm.FlashSaleId) || null);
const SelectedFlashSaleItems = computed(() => SelectedFlashSale.value?.Items || []);
const formatDiscountType = (DiscountType) => Number(DiscountType) === 0 ? "%" : "VND";

const VoucherDiscountTypeOptions = [
  { value: 0, label: "Percent - giảm theo %" },
  { value: 1, label: "Fixed - giảm số tiền" },
];

const VoucherFieldHelp = {
  Code: "Mã duy nhất, ví dụ SALE10.",
  DiscountType: "Percent = giảm theo %. Fixed = giảm số tiền cố định.",
  DiscountValue: "Percent: nhập số %, Fixed: nhập số tiền giảm.",
  MinOrderAmount: "Đơn tối thiểu để voucher có hiệu lực.",
  MaxDiscountAmount: "Chỉ áp dụng cho voucher Percent, để trần mức giảm tối đa.",
  MaxUsageCount: "Tổng số lượt dùng, để trống nếu không giới hạn.",
  PerUserLimit: "Mỗi user dùng tối đa, để trống nếu không giới hạn.",
  StartsAt: "Từ thời điểm này voucher mới dùng được.",
  ExpiresAt: "Sau thời điểm này voucher hết hạn.",
  IsActive: "Bật/tắt voucher ngay trong admin.",
};

const isPercentVoucher = computed(() => Number(VoucherForm.DiscountType) === 0);

const voucherHelpText = (field) => VoucherFieldHelp[field] || "";

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

const resetFlashSaleItemForm = () => {
  FlashSaleItemForm.FlashSaleId = FlashSaleOptions.value[0]?.Value || "";
  FlashSaleItemForm.ProductId = "";
  FlashSaleItemForm.ProductVariantId = "";
  FlashSaleItemForm.FlashPrice = "";
  FlashSaleItemForm.FlashStock = 1;
};
const loadFlashSaleVariants = async (ProductId) => {
  FlashSaleVariantProducts.value = [];
  FlashSaleItemForm.ProductVariantId = "";
  if (!ProductId) return;
  const Product = await getAdminProductById(ProductId);
  if (Product) FlashSaleVariantProducts.value = [Product];
};
const flashSaleVariantHelpText = computed(() => {
  if (!FlashSaleItemForm.ProductId) return "Chọn sản phẩm trước, rồi chọn biến thể từ dữ liệu detail.";
  if (!FlashSaleVariantOptions.value.length) return "Sản phẩm này chưa có biến thể khả dụng.";
  return `Có ${FlashSaleVariantOptions.value.length} biến thể từ detail sản phẩm.`;
});
const flashSaleSelectedVariantSalePrice = computed(() => Number(FlashSaleSelectedVariant.value?.SalePrice || 0));
const flashSaleItemSummaryLabel = computed(() => {
  if (!FlashSaleItemForm.ProductVariantId) return "Chưa chọn biến thể.";
  return `${FlashSaleSelectedVariant.value?.Label || FlashSaleItemForm.ProductVariantId} · giá gốc ${formatCurrency(flashSaleSelectedVariantSalePrice.value)}`;
});
const fillFlashSaleItemForm = (FlashSaleId = FlashSaleItemForm.FlashSaleId) => {
  FlashSaleItemForm.FlashSaleId = FlashSaleId || "";
};
const onFlashSaleProductChange = async (ProductId) => {
  FlashSaleItemForm.ProductId = ProductId || "";
  await loadFlashSaleVariants(ProductId);
};
const onFlashSaleVariantChange = (VariantId) => {
  FlashSaleItemForm.ProductVariantId = VariantId || "";
};

const toIsoOrNull = (Value) => Value ? new Date(Value).toISOString() : null;

const loadPromotions = async () => {
  IsLoading.value = true;
  ErrorMessage.value = "";

  try {
    const [VoucherData, FlashSaleData, ProductData] = await Promise.all([
      getAdminVouchers(),
      getAdminFlashSales(),
      getAdminProducts({ PageIndex: 1, PageSize: 100 }),
    ]);
    Vouchers.value = Array.isArray(VoucherData) ? VoucherData : [];
    FlashSales.value = Array.isArray(FlashSaleData) ? FlashSaleData : [];
    Products.value = Array.isArray(ProductData?.Items) ? ProductData.Items : [];
    if (!FlashSaleItemForm.FlashSaleId) {
      resetFlashSaleItemForm();
    }
    SuccessMessage.value = `Đã tải ${Vouchers.value.length} voucher và ${FlashSales.value.length} flash sale.`;
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
    ErrorMessage.value = "Giá trị giảm phải lớn hơn 0.";
    return;
  }

  if (Number(VoucherForm.DiscountType) === 0 && Number(VoucherForm.MaxDiscountAmount || 0) <= 0 && VoucherForm.MaxDiscountAmount !== "") {
    ErrorMessage.value = "Voucher Percent nên có giới hạn giảm tối đa hoặc để trống nếu không cần.";
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
  SuccessMessage.value = `Đang sửa voucher ${Voucher.Code || Voucher.VoucherId}.`;
};

const editFlashSale = (FlashSale) => {
  FlashSaleForm.FlashSaleId = FlashSale.FlashSaleId;
  FlashSaleForm.Name = FlashSale.Name || "";
  FlashSaleForm.StartsAt = FlashSale.StartsAt ? String(FlashSale.StartsAt).slice(0, 16) : "";
  FlashSaleForm.EndsAt = FlashSale.EndsAt ? String(FlashSale.EndsAt).slice(0, 16) : "";
  FlashSaleForm.IsActive = Boolean(FlashSale.IsActive);
  SuccessMessage.value = `Đang sửa flash sale ${FlashSale.Name || FlashSale.FlashSaleId}.`;
};

const removeVoucher = async (VoucherId) => {
  if (!window.confirm("Xóa voucher này?")) return;

  try {
    await deleteAdminVoucher(VoucherId);
    SuccessMessage.value = "Đã xóa voucher.";
    await loadPromotions();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

const removeFlashSale = async (FlashSaleId) => {
  if (!window.confirm("Xóa flash sale này?")) return;

  try {
    await deleteAdminFlashSale(FlashSaleId);
    SuccessMessage.value = "Đã xóa flash sale.";
    await loadPromotions();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

const submitFlashSaleItem = async () => {
  ErrorMessage.value = "";

  if (!FlashSaleItemForm.FlashSaleId) {
    ErrorMessage.value = "Chọn flash sale trước khi thêm item.";
    return;
  }

  if (!FlashSaleItemForm.ProductId) {
    ErrorMessage.value = "Chọn sản phẩm trước khi chọn biến thể.";
    return;
  }

  if (!FlashSaleItemForm.ProductVariantId) {
    ErrorMessage.value = "Chọn biến thể trước khi thêm item.";
    return;
  }

  if (Number(FlashSaleItemForm.FlashPrice) <= 0) {
    ErrorMessage.value = "Giá flash sale phải lớn hơn 0.";
    return;
  }

  if (Number(FlashSaleItemForm.FlashStock) <= 0) {
    ErrorMessage.value = "Stock flash sale phải lớn hơn 0.";
    return;
  }

  try {
    await addAdminFlashSaleItem(FlashSaleItemForm.FlashSaleId, {
      ProductVariantId: FlashSaleItemForm.ProductVariantId,
      FlashPrice: Number(FlashSaleItemForm.FlashPrice),
      FlashStock: Number(FlashSaleItemForm.FlashStock),
    });
    SuccessMessage.value = "Đã thêm item vào flash sale.";
    resetFlashSaleItemForm();
    await loadPromotions();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

const removeFlashSaleItem = async (FlashSaleId, FlashSaleItemId) => {
  if (!window.confirm("Xóa item flash sale này?")) return;

  try {
    await deleteAdminFlashSaleItem(FlashSaleId, FlashSaleItemId);
    SuccessMessage.value = "Đã xóa item flash sale.";
    await loadPromotions();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

onMounted(loadPromotions);
</script>

<!-- ponytail: CRUD hiện cover voucher và flash sale header; add flash sale item mutations khi cần test item-level admin flow. -->

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
          <DMBadge :type="VoucherForm.IsActive ? 'success' : 'warning'" dot>{{ VoucherForm.IsActive ? 'Đang bật' : 'Bản nháp' }}</DMBadge>
        </div>
        <div class="admin-promotions__grid">
          <div class="admin-promotions__field">
            <DMInput v-model="VoucherForm.Code" label="Mã" placeholder="VD: SALE10" />
            <p class="admin-promotions__help">{{ voucherHelpText('Code') }}</p>
          </div>
          <div class="admin-promotions__field">
            <DMSelect
              v-model="VoucherForm.DiscountType"
              labelText="Loại giảm"
              :data="VoucherDiscountTypeOptions"
              optionLabel="label"
              trackBy="value"
              :allowEmpty="false"
              :searchable="false"
              :width="'100%'"
            />
            <p class="admin-promotions__help">{{ voucherHelpText('DiscountType') }}</p>
          </div>
          <div class="admin-promotions__field">
            <DMInput v-model="VoucherForm.DiscountValue" label="Giá trị giảm" type="number" min="0" placeholder="VD: 10 hoặc 50000" />
            <p class="admin-promotions__help">{{ voucherHelpText('DiscountValue') }}</p>
          </div>
          <div class="admin-promotions__field">
            <DMInput v-model="VoucherForm.MinOrderAmount" label="Đơn tối thiểu" type="number" min="0" placeholder="VD: 200000" />
            <p class="admin-promotions__help">{{ voucherHelpText('MinOrderAmount') }}</p>
          </div>
          <div class="admin-promotions__field">
            <DMInput v-model="VoucherForm.MaxDiscountAmount" label="Giảm tối đa" type="number" min="0" placeholder="Chỉ cho Percent" />
            <p class="admin-promotions__help" :class="{ 'admin-promotions__help--muted': !isPercentVoucher }">{{ voucherHelpText('MaxDiscountAmount') }}</p>
          </div>
          <div class="admin-promotions__field">
            <DMInput v-model="VoucherForm.MaxUsageCount" label="Tổng lượt dùng" type="number" min="0" placeholder="Bỏ trống nếu không giới hạn" />
            <p class="admin-promotions__help">{{ voucherHelpText('MaxUsageCount') }}</p>
          </div>
          <div class="admin-promotions__field">
            <DMInput v-model="VoucherForm.PerUserLimit" label="Giới hạn mỗi user" type="number" min="0" placeholder="Bỏ trống nếu không giới hạn" />
            <p class="admin-promotions__help">{{ voucherHelpText('PerUserLimit') }}</p>
          </div>
          <div class="admin-promotions__field">
            <DMInput v-model="VoucherForm.StartsAt" label="Bắt đầu" type="datetime-local" />
            <p class="admin-promotions__help">{{ voucherHelpText('StartsAt') }}</p>
          </div>
          <div class="admin-promotions__field">
            <DMInput v-model="VoucherForm.ExpiresAt" label="Hết hạn" type="datetime-local" />
            <p class="admin-promotions__help">{{ voucherHelpText('ExpiresAt') }}</p>
          </div>
          <label class="admin-promotions__toggle">
            <span>Kích hoạt</span>
            <input v-model="VoucherForm.IsActive" type="checkbox" />
            <small>{{ voucherHelpText('IsActive') }}</small>
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
          <DMBadge :type="FlashSaleForm.IsActive ? 'success' : 'warning'" dot>{{ flashSaleStatusLabel(FlashSaleForm.IsActive) }}</DMBadge>
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

        <div class="admin-panel__header" style="margin-top: 18px;">
          <div>
            <h2>Thêm item vào flash sale</h2>
            <p>Chọn chương trình flash sale, biến thể sản phẩm, giá bán sau giảm và số lượng. Item mới sẽ hiện rõ ở bảng bên dưới.</p>
          </div>
        </div>
        <div class="admin-promotions__grid">
          <DMSelect
            v-model="FlashSaleItemForm.FlashSaleId"
            labelText="Chương trình flash sale"
            :data="FlashSaleOptions"
            optionLabel="Label"
            trackBy="Value"
            :allowEmpty="false"
            :searchable="false"
            :width="'100%'"
            @update:modelValue="fillFlashSaleItemForm"
          />
          <DMSelect
            v-model="FlashSaleItemForm.ProductId"
            labelText="Sản phẩm"
            :data="FlashSaleProductOptions"
            optionLabel="Label"
            trackBy="Value"
            :allowEmpty="false"
            :searchable="true"
            :width="'100%'"
            @update:modelValue="onFlashSaleProductChange"
          />
          <DMSelect
            v-model="FlashSaleItemForm.ProductVariantId"
            labelText="Biến thể sản phẩm"
            :data="FlashSaleVariantOptions"
            optionLabel="Label"
            trackBy="Value"
            :allowEmpty="false"
            :searchable="true"
            :width="'100%'"
            @update:modelValue="onFlashSaleVariantChange"
          />
          <DMInput v-model="FlashSaleItemForm.FlashPrice" label="Giá bán sau giảm" type="number" min="0" placeholder="Giá sau giảm" />
          <DMInput v-model="FlashSaleItemForm.FlashStock" label="Số lượng bán flash" type="number" min="1" />
          <p class="admin-promotions__help" v-if="FlashSaleSelectedVariant">
            Biến thể thường đang có giá {{ formatCurrency(flashSaleSelectedVariantSalePrice) }}.
            Giá bán sau giảm phải thấp hơn giá gốc; backend sẽ giữ item này trong khung giờ flash sale.
          </p>
          <p class="admin-promotions__help" v-else>
            {{ flashSaleVariantHelpText }}
          </p>
          <div v-if="SelectedFlashSaleItems.length" class="admin-promotions__help">
            Flash sale đang chọn có {{ flashSaleItemCountLabel(SelectedFlashSaleItems.length) }}.
          </div>
          <div class="admin-promotions__help">
            {{ flashSaleItemSummaryLabel }}
          </div>
          <div class="admin-promotions__help">
            {{ flashSaleVariantHelpText }}
          </div>
        </div>
        <div class="admin-toolbar">
          <DMButton type="none" :is-tooltip="false" message="Thêm item flash sale" class="admin-button" @click="submitFlashSaleItem" />
          <DMButton type="none" :is-tooltip="false" message="Reset item flash sale" class="admin-button" @click="resetFlashSaleItemForm" />
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
            <td><DMBadge :type="Voucher.IsActive ? 'success' : 'error'" dot>{{ Voucher.IsActive ? 'Active' : 'Inactive' }}</DMBadge></td>
            <td>
              <div class="admin-table-actions">
                <DMButton type="none" :is-tooltip="false" message="Sửa" class="admin-button" @click="editVoucher(Voucher)" />
                <DMButton type="none" :is-tooltip="false" message="Xóa" class="admin-button admin-button--danger" @click="removeVoucher(Voucher.VoucherId)" />
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
          <p>Header + item CRUD cùng nhìn ở đây. Item hiện lên theo flash sale đã chọn.</p>
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
          <template v-for="FlashSale in FlashSales" :key="FlashSale.FlashSaleId">
            <tr>
              <td><strong>{{ FlashSale.Name }}</strong></td>
              <td>{{ formatDateTime(FlashSale.StartsAt) }}</td>
              <td>{{ formatDateTime(FlashSale.EndsAt) }}</td>
              <td><DMBadge :type="FlashSale.IsActive ? 'success' : 'error'" dot>{{ FlashSale.IsActive ? 'Active' : 'Inactive' }}</DMBadge></td>
              <td>{{ FlashSale.Items?.length || 0 }}</td>
              <td>{{ FlashSale.Items?.[0]?.Sku || '-' }}</td>
              <td>
                <div class="admin-table-actions">
                  <DMButton type="none" :is-tooltip="false" message="Sửa" class="admin-button" @click="editFlashSale(FlashSale)" />
                  <DMButton type="none" :is-tooltip="false" message="Xóa" class="admin-button admin-button--danger" @click="removeFlashSale(FlashSale.FlashSaleId)" />
                </div>
              </td>
            </tr>
            <tr>
              <td colspan="7">
                <div class="admin-flashsale-items">
                  <div class="admin-flashsale-items__header">
                    <strong>Items</strong>
                    <DMButton type="none" :is-tooltip="false" message="Gắn form sang flash sale này" class="admin-button" @click="fillFlashSaleItemForm(FlashSale.FlashSaleId)" />
                  </div>
                  <table class="dm-table admin-flashsale-items__table">
                    <thead>
                      <tr>
                        <th>Variant</th>
                        <th>Giá gốc</th>
                        <th>Giá sale</th>
                        <th>Stock sale</th>
                        <th>Đã bán</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="Item in FlashSale.Items || []" :key="Item.FlashSaleItemId">
                        <td>
                          <strong>{{ Item.Sku }}</strong>
                          <div class="admin-flashsale-items__sub">{{ Item.VariantName }}</div>
                        </td>
                        <td>{{ formatCurrency(Item.OriginalPrice) }}</td>
                        <td>{{ formatCurrency(Item.FlashPrice) }}</td>
                        <td>{{ Item.FlashStock }}</td>
                        <td>{{ Item.SoldCount }}</td>
                        <td>
                          <DMButton type="none" :is-tooltip="false" message="Xóa item" class="admin-button admin-button--danger" @click="removeFlashSaleItem(FlashSale.FlashSaleId, Item.FlashSaleItemId)" />
                        </td>
                      </tr>
                      <tr v-if="!FlashSale.Items?.length">
                        <td colspan="6" style="text-align: center; color: var(--dm-text-soft);">Chưa có item.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          </template>
          <tr v-if="!FlashSales.length && !IsLoading">
            <td colspan="7" style="text-align: center; padding: 20px; color: var(--dm-text-soft);">Chưa có flash sale từ API.</td>
          </tr>
        </tbody>
      </table>
    </article>
  </section>
</template>

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
  grid-template-columns: 1fr;
  gap: 18px;
}

@media (min-width: 961px) {
  .admin-promotions__forms {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.admin-promotions__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.admin-promotions__field {
  display: grid;
  gap: 6px;
}

.admin-promotions__help {
  margin: 0;
  color: var(--dm-text-soft);
  font-size: 12px;
  line-height: 1.4;
}

.admin-promotions__help--muted {
  opacity: 0.75;
}

.admin-promotions__toggle {
  display: grid;
  gap: 8px;
  align-content: start;
  color: var(--dm-text);
  font-size: 14px;
  font-weight: 700;
}

.admin-promotions__toggle small {
  color: var(--dm-text-soft);
  font-size: 12px;
  font-weight: 400;
}

.admin-promotions__toggle input {
  width: 18px;
  height: 18px;
}

.admin-panel__header p {
  margin: 6px 0 0;
}

.admin-flashsale-items {
  padding: 12px 0 4px;
}

.admin-flashsale-items__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.admin-flashsale-items__table {
  min-width: 980px;
}

.admin-flashsale-items__sub {
  margin-top: 4px;
  color: var(--dm-text-soft);
  font-size: 12px;
}

.admin-flashsale-items__table .dm-table {
  min-width: 980px;
}

@media (max-width: 960px) {
  .admin-promotions__forms {
    grid-template-columns: 1fr;
  }
}
</style>
