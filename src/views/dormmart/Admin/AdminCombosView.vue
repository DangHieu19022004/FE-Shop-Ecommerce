<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import {
  createAdminCombo,
  createAdminComboDiscount,
  deleteAdminCombo,
  deleteAdminComboDiscount,
  getAdminComboById,
  getAdminCombos,
  updateAdminCombo,
  updateAdminComboDiscount,
} from "@/services/adminService";
import { formatCurrency, formatDateTime } from "@/utils/shopFormatters";

const Combos = ref([]);
const ErrorMessage = ref("");
const SuccessMessage = ref("");
const IsLoading = ref(false);
const IsSaving = ref(false);
const ComboForm = reactive({
  ComboId: "",
  ComboCode: "",
  Name: "",
  Slug: "",
  CategoryCode: "",
  CategoryName: "",
  Description: "",
  Badge: "",
  Icon: "inventory_2",
  Theme: "BLUE",
  ImageUrl: "",
  IsFeatured: false,
  IsActive: true,
  Items: [
    { ProductVariantId: "", Quantity: 1, SortOrder: 1, IsRequired: true },
    { ProductVariantId: "", Quantity: 1, SortOrder: 2, IsRequired: true },
  ],
});
const DiscountForms = reactive({});

const ActiveCount = computed(() => Combos.value.filter((Item) => Item.IsActive).length);
const FeaturedCount = computed(() => Combos.value.filter((Item) => Item.IsFeatured).length);
const ModeLabel = computed(() => ComboForm.ComboId ? "Đang sửa combo" : "Tạo combo mới");

const createEmptyDiscountForm = () => ({
  ComboDiscountId: "",
  DiscountType: 1,
  DiscountValue: 0,
  StartsAt: "",
  ExpiresAt: "",
  IsActive: true,
});

const ensureDiscountForm = (ComboId) => {
  if (!DiscountForms[ComboId]) {
    DiscountForms[ComboId] = createEmptyDiscountForm();
  }
  return DiscountForms[ComboId];
};

const resetDiscountForm = (ComboId) => {
  DiscountForms[ComboId] = createEmptyDiscountForm();
};

const normalizeItem = (Item, Index) => ({
  ProductVariantId: String(Item.ProductVariantId || "").trim(),
  Quantity: Number(Item.Quantity) || 0,
  SortOrder: Number(Item.SortOrder) || Index + 1,
  IsRequired: Boolean(Item.IsRequired),
});

const resetComboForm = () => {
  ComboForm.ComboId = "";
  ComboForm.ComboCode = "";
  ComboForm.Name = "";
  ComboForm.Slug = "";
  ComboForm.CategoryCode = "";
  ComboForm.CategoryName = "";
  ComboForm.Description = "";
  ComboForm.Badge = "";
  ComboForm.Icon = "inventory_2";
  ComboForm.Theme = "BLUE";
  ComboForm.ImageUrl = "";
  ComboForm.IsFeatured = false;
  ComboForm.IsActive = true;
  ComboForm.Items = [
    { ProductVariantId: "", Quantity: 1, SortOrder: 1, IsRequired: true },
    { ProductVariantId: "", Quantity: 1, SortOrder: 2, IsRequired: true },
  ];
};

const toIsoOrNull = (Value) => Value ? new Date(Value).toISOString() : null;

const loadCombos = async () => {
  IsLoading.value = true;
  ErrorMessage.value = "";

  try {
    Combos.value = await getAdminCombos();
    Combos.value.forEach((Item) => ensureDiscountForm(Item.ComboId));
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsLoading.value = false;
  }
};

const addItemRow = () => {
  ComboForm.Items.push({
    ProductVariantId: "",
    Quantity: 1,
    SortOrder: ComboForm.Items.length + 1,
    IsRequired: true,
  });
};

const removeItemRow = (Index) => {
  if (ComboForm.Items.length <= 2) return;
  ComboForm.Items.splice(Index, 1);
  ComboForm.Items.forEach((Item, ItemIndex) => {
    Item.SortOrder = ItemIndex + 1;
  });
};

const submitCombo = async () => {
  ErrorMessage.value = "";
  SuccessMessage.value = "";

  if (!ComboForm.ComboCode.trim() || !ComboForm.Name.trim()) {
    ErrorMessage.value = "Nhập mã combo và tên combo.";
    return;
  }

  const Items = ComboForm.Items
    .map(normalizeItem)
    .filter((Item) => Item.ProductVariantId && Item.Quantity > 0);

  if (Items.length < 2) {
    ErrorMessage.value = "Combo cần ít nhất 2 item hợp lệ.";
    return;
  }

  const Payload = {
    ComboCode: ComboForm.ComboCode.trim(),
    Name: ComboForm.Name.trim(),
    Slug: ComboForm.Slug.trim() || null,
    CategoryCode: ComboForm.CategoryCode.trim(),
    CategoryName: ComboForm.CategoryName.trim(),
    Description: ComboForm.Description.trim() || null,
    Badge: ComboForm.Badge.trim() || null,
    Icon: ComboForm.Icon.trim() || null,
    Theme: ComboForm.Theme.trim() || null,
    ImageUrl: ComboForm.ImageUrl.trim() || null,
    IsFeatured: ComboForm.IsFeatured,
    IsActive: ComboForm.IsActive,
    Items,
  };

  IsSaving.value = true;
  try {
    if (ComboForm.ComboId) {
      await updateAdminCombo(ComboForm.ComboId, Payload);
      SuccessMessage.value = "Đã cập nhật combo.";
    } else {
      await createAdminCombo(Payload);
      SuccessMessage.value = "Đã tạo combo.";
    }
    resetComboForm();
    await loadCombos();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsSaving.value = false;
  }
};

const editCombo = async (ComboId) => {
  ErrorMessage.value = "";
  SuccessMessage.value = "";

  try {
    const Combo = await getAdminComboById(ComboId);
    ComboForm.ComboId = Combo.ComboId;
    ComboForm.ComboCode = Combo.ComboCode || "";
    ComboForm.Name = Combo.Name || "";
    ComboForm.Slug = Combo.Slug || "";
    ComboForm.CategoryCode = Combo.CategoryCode || "";
    ComboForm.CategoryName = Combo.CategoryName || "";
    ComboForm.Description = Combo.Description || "";
    ComboForm.Badge = Combo.Badge || "";
    ComboForm.Icon = Combo.Icon || "inventory_2";
    ComboForm.Theme = Combo.Theme || "BLUE";
    ComboForm.ImageUrl = Combo.ImageUrl || "";
    ComboForm.IsFeatured = Boolean(Combo.IsFeatured);
    ComboForm.IsActive = Boolean(Combo.IsActive);
    ComboForm.Items = (Combo.Items || []).map((Item, Index) => ({
      ProductVariantId: Item.ProductVariantId || "",
      Quantity: Number(Item.Quantity || 1),
      SortOrder: Number(Item.SortOrder || Index + 1),
      IsRequired: Boolean(Item.IsRequired),
    }));
    SuccessMessage.value = `Đang sửa combo ${Combo.Name || Combo.ComboCode}.`;
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

const removeCombo = async (ComboId) => {
  if (!window.confirm("Xóa combo này?")) return;

  try {
    await deleteAdminCombo(ComboId);
    SuccessMessage.value = "Đã xóa combo.";
    await loadCombos();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

const editDiscount = (ComboId, Discount) => {
  DiscountForms[ComboId] = {
    ComboDiscountId: Discount.ComboDiscountId,
    DiscountType: Number(Discount.DiscountType ?? 1),
    DiscountValue: Number(Discount.DiscountValue || 0),
    StartsAt: Discount.StartsAt ? String(Discount.StartsAt).slice(0, 16) : "",
    ExpiresAt: Discount.ExpiresAt ? String(Discount.ExpiresAt).slice(0, 16) : "",
    IsActive: Boolean(Discount.IsActive),
  };
  SuccessMessage.value = "Đã nạp discount vào form sửa.";
};

const submitDiscount = async (ComboId) => {
  const Form = ensureDiscountForm(ComboId);
  ErrorMessage.value = "";
  SuccessMessage.value = "";

  if ((Number(Form.DiscountValue) || 0) <= 0) {
    ErrorMessage.value = "Giá trị discount phải lớn hơn 0.";
    return;
  }

  const Payload = {
    DiscountType: Number(Form.DiscountType),
    DiscountValue: Number(Form.DiscountValue) || 0,
    StartsAt: toIsoOrNull(Form.StartsAt),
    ExpiresAt: toIsoOrNull(Form.ExpiresAt),
    IsActive: Boolean(Form.IsActive),
  };

  try {
    if (Form.ComboDiscountId) {
      await updateAdminComboDiscount(ComboId, Form.ComboDiscountId, Payload);
      SuccessMessage.value = "Đã cập nhật discount combo.";
    } else {
      await createAdminComboDiscount(ComboId, Payload);
      SuccessMessage.value = "Đã tạo discount combo.";
    }
    resetDiscountForm(ComboId);
    await loadCombos();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

const removeDiscount = async (ComboId, DiscountId) => {
  if (!window.confirm("Xóa discount combo này?")) return;

  try {
    await deleteAdminComboDiscount(ComboId, DiscountId);
    SuccessMessage.value = "Đã xóa discount combo.";
    await loadCombos();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

onMounted(loadCombos);
</script>

<template>
  <section class="admin-page admin-combos">
    <header class="admin-page__header">
      <div>
        <h1>Combo</h1>
        <p>CRUD combo và discount combo trên API thật.</p>
      </div>
      <DMButton type="none" :is-tooltip="false" message="Tải lại" class="admin-button" @click="loadCombos" />
    </header>

    <div class="admin-metrics admin-combos__metrics">
      <article class="dm-card admin-metric">
        <span class="material-symbols-outlined">redeem</span>
        <div class="admin-metric__label">Tổng combo</div>
        <div class="admin-metric__value">{{ Combos.length }}</div>
      </article>
      <article class="dm-card admin-metric admin-metric--success">
        <span class="material-symbols-outlined">check_circle</span>
        <div class="admin-metric__label">Đang bật</div>
        <div class="admin-metric__value">{{ ActiveCount }}</div>
      </article>
      <article class="dm-card admin-metric admin-metric--warning">
        <span class="material-symbols-outlined">star</span>
        <div class="admin-metric__label">Nổi bật</div>
        <div class="admin-metric__value">{{ FeaturedCount }}</div>
      </article>
    </div>

    <div v-if="ErrorMessage" class="admin-combos__alert admin-combos__alert--danger dm-card">{{ ErrorMessage }}</div>
    <div v-if="SuccessMessage" class="admin-combos__alert dm-card">{{ SuccessMessage }}</div>
    <div v-if="IsLoading" class="admin-combos__alert dm-card">Đang tải combo...</div>

    <article class="dm-card admin-panel admin-form">
      <div class="admin-panel__header">
        <div>
          <h2>{{ ComboForm.ComboId ? 'Cập nhật combo' : 'Tạo combo' }}</h2>
          <p>{{ ModeLabel }}</p>
        </div>
        <DMBadge :type="ComboForm.IsActive ? 'success' : 'error'" dot>{{ ComboForm.IsActive ? 'Active' : 'Inactive' }}</DMBadge>
      </div>

      <div class="admin-combos__grid">
        <DMInput v-model="ComboForm.ComboCode" label="Mã combo" />
        <DMInput v-model="ComboForm.Name" label="Tên combo" />
        <DMInput v-model="ComboForm.Slug" label="Slug" />
        <DMInput v-model="ComboForm.CategoryCode" label="Mã nhóm" />
        <DMInput v-model="ComboForm.CategoryName" label="Tên nhóm" />
        <DMInput v-model="ComboForm.Badge" label="Badge" />
        <DMInput v-model="ComboForm.Icon" label="Icon" />
        <DMInput v-model="ComboForm.Theme" label="Theme" />
        <DMInput v-model="ComboForm.ImageUrl" label="Ảnh" />
        <DMInput v-model="ComboForm.Description" label="Mô tả" />
        <label class="admin-combos__toggle">
          <span>Nổi bật</span>
          <input v-model="ComboForm.IsFeatured" type="checkbox" />
        </label>
        <label class="admin-combos__toggle">
          <span>Kích hoạt</span>
          <input v-model="ComboForm.IsActive" type="checkbox" />
        </label>
      </div>

      <div class="admin-panel__header" style="margin-top: 18px;">
        <div>
          <h3>Item trong combo</h3>
          <p>Cần ít nhất 2 `ProductVariantId`.</p>
        </div>
        <DMButton type="none" :is-tooltip="false" message="Thêm item" class="admin-button" @click="addItemRow" />
      </div>

      <div class="admin-combos__items">
        <div v-for="(Item, Index) in ComboForm.Items" :key="Index" class="admin-combos__item-row">
          <DMInput v-model="Item.ProductVariantId" label="ProductVariantId" />
          <DMInput v-model="Item.Quantity" label="Số lượng" type="number" />
          <DMInput v-model="Item.SortOrder" label="Thứ tự" type="number" />
          <label class="admin-combos__toggle">
            <span>Bắt buộc</span>
            <input v-model="Item.IsRequired" type="checkbox" />
          </label>
          <DMButton type="none" :is-tooltip="false" message="Xóa item" class="admin-button admin-button--danger" :un-active="ComboForm.Items.length <= 2" @click="removeItemRow(Index)" />
        </div>
      </div>

      <div class="admin-toolbar">
        <DMButton type="none" :is-tooltip="false" :message="IsSaving ? 'Đang lưu...' : (ComboForm.ComboId ? 'Cập nhật combo' : 'Tạo combo')" class="admin-button" :un-active="IsSaving" @click="submitCombo" />
        <DMButton type="none" :is-tooltip="false" message="Reset form" class="admin-button" @click="resetComboForm" />
      </div>
    </article>

    <article class="dm-card admin-panel admin-table-wrap">
      <div class="admin-panel__header">
        <div>
          <h2>Danh sách combo</h2>
          <p>Dùng `/api/admin/combos` và discount CRUD theo từng combo.</p>
        </div>
      </div>

      <div class="admin-combos__list">
        <article v-for="Combo in Combos" :key="Combo.ComboId" class="admin-combos__card">
          <div class="admin-combos__card-head">
            <div>
              <strong>{{ Combo.Name }}</strong>
              <div class="admin-combos__meta">
                <span>{{ Combo.ComboCode }}</span>
                <span>{{ Combo.CategoryName || Combo.CategoryCode || '-' }}</span>
                <span>{{ Combo.Items?.length || 0 }} item</span>
              </div>
            </div>
            <DMBadge :type="Combo.IsActive ? 'success' : 'error'" dot>{{ Combo.IsActive ? 'Active' : 'Inactive' }}</DMBadge>
          </div>

          <div class="admin-combos__price-row">
            <span>Mua lẻ: {{ formatCurrency(Combo.OriginalPrice || 0) }}</span>
            <strong>Combo: {{ formatCurrency(Combo.ComboPrice || 0) }}</strong>
          </div>

          <ul class="admin-combos__combo-items">
            <li v-for="Item in Combo.Items || []" :key="Item.ComboItemId || `${Combo.ComboId}-${Item.ProductVariantId}`">
              {{ Item.ProductName || Item.ProductVariantId }} × {{ Item.Quantity }}
            </li>
          </ul>

          <div class="admin-table-actions">
            <DMButton type="none" :is-tooltip="false" message="Sửa" class="admin-button" @click="editCombo(Combo.ComboId)" />
            <DMButton type="none" :is-tooltip="false" message="Xóa" class="admin-button admin-button--danger" @click="removeCombo(Combo.ComboId)" />
          </div>

          <div class="admin-combos__discount-box">
            <h3>Discount combo</h3>
            <div class="admin-combos__discount-grid">
              <DMInput v-model="ensureDiscountForm(Combo.ComboId).DiscountType" label="Loại giảm (0=%,1=VND)" type="number" />
              <DMInput v-model="ensureDiscountForm(Combo.ComboId).DiscountValue" label="Giá trị" type="number" />
              <DMInput v-model="ensureDiscountForm(Combo.ComboId).StartsAt" label="Bắt đầu" type="datetime-local" />
              <DMInput v-model="ensureDiscountForm(Combo.ComboId).ExpiresAt" label="Hết hạn" type="datetime-local" />
              <label class="admin-combos__toggle">
                <span>Kích hoạt</span>
                <input v-model="ensureDiscountForm(Combo.ComboId).IsActive" type="checkbox" />
              </label>
            </div>
            <div class="admin-table-actions">
              <DMButton type="none" :is-tooltip="false" :message="ensureDiscountForm(Combo.ComboId).ComboDiscountId ? 'Cập nhật discount' : 'Tạo discount'" class="admin-button" @click="submitDiscount(Combo.ComboId)" />
              <DMButton type="none" :is-tooltip="false" message="Reset discount" class="admin-button" @click="resetDiscountForm(Combo.ComboId)" />
            </div>
            <table class="dm-table" style="min-width: 720px;">
              <thead>
                <tr>
                  <th>Loại</th>
                  <th>Giá trị</th>
                  <th>Bắt đầu</th>
                  <th>Hết hạn</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="Discount in Combo.Discounts || []" :key="Discount.ComboDiscountId">
                  <td>{{ Number(Discount.DiscountType) === 0 ? '%' : 'VND' }}</td>
                  <td>{{ formatCurrency(Discount.DiscountValue || 0) }}</td>
                  <td>{{ formatDateTime(Discount.StartsAt) }}</td>
                  <td>{{ formatDateTime(Discount.ExpiresAt) }}</td>
                  <td>{{ Discount.IsActive ? 'Active' : 'Inactive' }}</td>
                  <td>
                    <div class="admin-table-actions">
                      <DMButton type="none" :is-tooltip="false" message="Sửa" class="admin-button" @click="editDiscount(Combo.ComboId, Discount)" />
                      <DMButton type="none" :is-tooltip="false" message="Xóa" class="admin-button admin-button--danger" @click="removeDiscount(Combo.ComboId, Discount.ComboDiscountId)" />
                    </div>
                  </td>
                </tr>
                <tr v-if="!(Combo.Discounts || []).length">
                  <td colspan="6" style="text-align: center; padding: 16px; color: var(--dm-text-soft);">Chưa có discount cho combo này.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <div v-if="!Combos.length && !IsLoading" class="admin-combos__alert dm-card">Chưa có combo từ API.</div>
      </div>
    </article>
  </section>
</template>

<style scoped lang="scss" src="@/assets/styles/screens/admin-operations.scss"></style>
<style scoped lang="scss">
.admin-combos__metrics {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.admin-combos__alert {
  padding: 16px 18px;
  color: var(--dm-primary);
}

.admin-combos__alert--danger {
  color: var(--dm-danger);
}

.admin-combos__grid,
.admin-combos__discount-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.admin-combos__toggle {
  display: grid;
  gap: 8px;
  align-content: start;
  color: var(--dm-text);
  font-size: 14px;
  font-weight: 700;
}

.admin-combos__toggle input {
  width: 18px;
  height: 18px;
}

.admin-combos__items,
.admin-combos__list {
  display: grid;
  gap: 16px;
}

.admin-combos__item-row,
.admin-combos__card,
.admin-combos__discount-box {
  display: grid;
  gap: 12px;
}

.admin-combos__card {
  padding: 18px;
  border: 1px solid var(--dm-border);
  border-radius: 20px;
  background: var(--dm-surface);
}

.admin-combos__card-head,
.admin-combos__price-row,
.admin-combos__meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
}

.admin-combos__meta {
  justify-content: flex-start;
  color: var(--dm-text-soft);
  font-size: 13px;
}

.admin-combos__combo-items {
  margin: 0;
  padding-left: 18px;
  color: var(--dm-text-soft);
}
</style>
