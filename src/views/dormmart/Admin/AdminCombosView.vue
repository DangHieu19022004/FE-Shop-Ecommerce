<script setup>
import { computed, inject, onMounted, reactive, ref } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import AdminProductVariantCombobox from "@/components/dormmart/AdminProductVariantCombobox.vue";
import {
  createAdminCombo,
  createAdminComboDiscount,
  deleteAdminCombo,
  deleteAdminComboDiscount,
  getAdminComboById,
  getAdminCombos,
  getAdminProductById,
  getAdminProducts,
  updateAdminCombo,
  updateAdminComboDiscount,
} from "@/services/adminService";
import { confirmDelete } from "@/stores/confirmStore";
import { formatCurrency, formatDateTime } from "@/utils/shopFormatters";

const Text = inject("i18nCommon").AdminCombos;
const Combos = ref([]);
const ProductVariants = ref([]);
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
const ModeLabel = computed(() => ComboForm.ComboId ? Text.EditingMode : Text.CreatingMode);
const ProductVariantOptions = computed(() => ProductVariants.value.map((Variant) => ({
  Value: Variant.ProductVariantId,
  Label: `${Variant.ProductName} · ${Variant.Name || Variant.Sku || Variant.ProductVariantId}`,
  ProductName: Variant.ProductName,
  ProductCode: Variant.ProductCode,
  Description: Variant.ShortDescription || Variant.Description || Variant.Sku || Variant.ProductCode,
  Price: Number(Variant.SalePrice) || 0,
  ImageUrl: Variant.ImageUrl,
})));
const buildFieldDescription = (...Parts) => Parts.filter(Boolean).join(" · ");

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
  ComboForm.IsFeatured = false;
  ComboForm.IsActive = true;
  ComboForm.Items = [
    { ProductVariantId: "", Quantity: 1, SortOrder: 1, IsRequired: true },
    { ProductVariantId: "", Quantity: 1, SortOrder: 2, IsRequired: true },
  ];
};

const toIsoOrNull = (Value) => Value ? new Date(Value).toISOString() : null;

const loadProductVariants = async () => {
  const ProductData = await getAdminProducts({ PageIndex: 1, PageSize: 100 });
  const ProductItems = Array.isArray(ProductData?.Items) ? ProductData.Items : [];

  const ProductDetails = await Promise.all(ProductItems.map((Product) => getAdminProductById(Product.ProductId)));
  ProductVariants.value = ProductDetails.flatMap((Product) => {
    const ImageUrl = Product.Images?.find((Image) => Image.IsPrimary)?.ImageUrl || Product.PrimaryImageUrl || "";
    return (Product.Variants || []).map((Variant) => ({
      ...Variant,
      ProductName: Product.Name,
      ProductCode: Product.ProductCode,
      ShortDescription: Product.ShortDescription,
      Description: Product.Description,
      ImageUrl,
    }));
  });
};

const loadCombos = async () => {
  IsLoading.value = true;
  ErrorMessage.value = "";

  try {
    const [ComboData] = await Promise.all([
      getAdminCombos(),
      loadProductVariants(),
    ]);
    Combos.value = ComboData;
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

const removeItemRow = async (Index) => {
  if (ComboForm.Items.length <= 2) return;
  if (!await confirmDelete(`Xóa item số ${Index + 1} khỏi combo?`)) return;
  ComboForm.Items.splice(Index, 1);
  ComboForm.Items.forEach((Item, ItemIndex) => {
    Item.SortOrder = ItemIndex + 1;
  });
};

const submitCombo = async () => {
  ErrorMessage.value = "";
  SuccessMessage.value = "";

  if (!ComboForm.ComboCode.trim() || !ComboForm.Name.trim()) {
    ErrorMessage.value = Text.ValidationCodeAndNameRequired;
    return;
  }

  const Items = ComboForm.Items
    .map(normalizeItem)
    .filter((Item) => Item.ProductVariantId && Item.Quantity > 0);

  if (Items.length < 2) {
    ErrorMessage.value = Text.ValidationItemsRequired;
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
    Icon: null,
    Theme: null,
    IsFeatured: ComboForm.IsFeatured,
    IsActive: ComboForm.IsActive,
    Items,
  };

  IsSaving.value = true;
  try {
    if (ComboForm.ComboId) {
      await updateAdminCombo(ComboForm.ComboId, Payload);
      SuccessMessage.value = Text.UpdateSuccess;
    } else {
      await createAdminCombo(Payload);
      SuccessMessage.value = Text.CreateSuccess;
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
    ComboForm.IsFeatured = Boolean(Combo.IsFeatured);
    ComboForm.IsActive = Boolean(Combo.IsActive);
    ComboForm.Items = (Combo.Items || []).map((Item, Index) => ({
      ProductVariantId: Item.ProductVariantId || "",
      Quantity: Number(Item.Quantity || 1),
      SortOrder: Number(Item.SortOrder || Index + 1),
      IsRequired: Boolean(Item.IsRequired),
    }));
    SuccessMessage.value = Text.EditingSuccess.replace("{name}", Combo.Name || Combo.ComboCode);
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

const removeCombo = async (ComboId) => {
  if (!await confirmDelete(Text.ConfirmDelete)) return;

  try {
    await deleteAdminCombo(ComboId);
    SuccessMessage.value = Text.DeleteSuccess;
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
  SuccessMessage.value = Text.DiscountLoaded;
};

const submitDiscount = async (ComboId) => {
  const Form = ensureDiscountForm(ComboId);
  ErrorMessage.value = "";
  SuccessMessage.value = "";

  if ((Number(Form.DiscountValue) || 0) <= 0) {
    ErrorMessage.value = Text.ValidationDiscountValueRequired;
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
      SuccessMessage.value = Text.DiscountUpdateSuccess;
    } else {
      await createAdminComboDiscount(ComboId, Payload);
      SuccessMessage.value = Text.DiscountCreateSuccess;
    }
    resetDiscountForm(ComboId);
    await loadCombos();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

const removeDiscount = async (ComboId, DiscountId) => {
  if (!await confirmDelete(Text.ConfirmDeleteDiscount)) return;

  try {
    await deleteAdminComboDiscount(ComboId, DiscountId);
    SuccessMessage.value = Text.DiscountDeleteSuccess;
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
        <h1>{{ Text.Title }}</h1>
        <p>{{ Text.Subtitle }}</p>
      </div>
      <DMButton type="none" :is-tooltip="false" :message="Text.Reload" class="admin-button" @click="loadCombos" />
    </header>

    <div class="admin-metrics admin-combos__metrics">
      <article class="dm-card admin-metric">
        <span class="material-symbols-outlined">redeem</span>
        <div class="admin-metric__label">{{ Text.TotalCombo }}</div>
        <div class="admin-metric__value">{{ Combos.length }}</div>
      </article>
      <article class="dm-card admin-metric admin-metric--success">
        <span class="material-symbols-outlined">check_circle</span>
        <div class="admin-metric__label">{{ Text.ActiveCount }}</div>
        <div class="admin-metric__value">{{ ActiveCount }}</div>
      </article>
      <article class="dm-card admin-metric admin-metric--warning">
        <span class="material-symbols-outlined">star</span>
        <div class="admin-metric__label">{{ Text.FeaturedCount }}</div>
        <div class="admin-metric__value">{{ FeaturedCount }}</div>
      </article>
    </div>

    <div v-if="ErrorMessage" class="admin-combos__alert admin-combos__alert--danger dm-card">{{ ErrorMessage }}</div>
    <div v-if="SuccessMessage" class="admin-combos__alert dm-card">{{ SuccessMessage }}</div>
    <div v-if="IsLoading" class="admin-combos__alert dm-card">{{ Text.Loading }}</div>

    <article class="dm-card admin-panel admin-form">
      <div class="admin-panel__header">
        <div>
          <h2>{{ ComboForm.ComboId ? Text.UpdateTitle : Text.CreateTitle }}</h2>
          <p>{{ ModeLabel }}</p>
        </div>
        <DMBadge :type="ComboForm.IsActive ? 'success' : 'error'" dot>{{ ComboForm.IsActive ? Text.Active : Text.Inactive }}</DMBadge>
      </div>

      <div class="admin-combos__grid">
        <DMInput v-model="ComboForm.ComboCode" :label="Text.ComboCode" :description="buildFieldDescription(Text.ComboCodeHint, Text.ComboCodePlaceholder)" :placeholder="Text.ComboCodePlaceholder" />
        <DMInput v-model="ComboForm.Name" :label="Text.Name" :description="buildFieldDescription(Text.NameHint, Text.NamePlaceholder)" :placeholder="Text.NamePlaceholder" />
        <DMInput v-model="ComboForm.Slug" :label="Text.Slug" :description="buildFieldDescription(Text.SlugHint, Text.SlugPlaceholder)" :placeholder="Text.SlugPlaceholder" />
        <DMInput v-model="ComboForm.CategoryCode" :label="Text.CategoryCode" :description="buildFieldDescription(Text.CategoryCodeHint, Text.CategoryCodePlaceholder)" :placeholder="Text.CategoryCodePlaceholder" />
        <DMInput v-model="ComboForm.CategoryName" :label="Text.CategoryName" :description="buildFieldDescription(Text.CategoryNameHint, Text.CategoryNamePlaceholder)" :placeholder="Text.CategoryNamePlaceholder" />
        <DMInput v-model="ComboForm.Badge" :label="Text.Badge" :description="buildFieldDescription(Text.BadgeHint, Text.BadgePlaceholder)" :placeholder="Text.BadgePlaceholder" />
        <DMInput v-model="ComboForm.Description" :label="Text.Description" :description="buildFieldDescription(Text.DescriptionHint, Text.DescriptionPlaceholder)" :placeholder="Text.DescriptionPlaceholder" />
        <label class="admin-combos__toggle">
          <span>{{ Text.IsFeatured }}</span>
          <input v-model="ComboForm.IsFeatured" type="checkbox" />
        </label>
        <label class="admin-combos__toggle">
          <span>{{ Text.IsActive }}</span>
          <input v-model="ComboForm.IsActive" type="checkbox" />
        </label>
      </div>

      <div class="admin-panel__header" style="margin-top: 18px;">
        <div>
          <h3>{{ Text.ItemsTitle }}</h3>
          <p>{{ Text.ItemsSubtitle }}</p>
        </div>
        <DMButton type="none" :is-tooltip="false" :message="Text.AddItem" class="admin-button" @click="addItemRow" />
      </div>

      <div class="admin-combos__items">
        <div v-for="(Item, Index) in ComboForm.Items" :key="Index" class="admin-combos__item-row">
          <AdminProductVariantCombobox
            v-model="Item.ProductVariantId"
            :Options="ProductVariantOptions"
            :Label="Text.ProductVariantId"
            :Description="Text.ProductVariantIdHint"
            :Placeholder="Text.SelectProductVariant"
          />
          <DMInput v-model="Item.Quantity" :label="Text.Quantity" type="number" :description="buildFieldDescription(Text.QuantityHint, Text.QuantityPlaceholder)" :placeholder="Text.QuantityPlaceholder" />
          <DMInput v-model="Item.SortOrder" :label="Text.SortOrder" type="number" :description="buildFieldDescription(Text.SortOrderHint, Text.SortOrderPlaceholder)" :placeholder="Text.SortOrderPlaceholder" />
          <label class="admin-combos__toggle">
            <span>{{ Text.Required }}</span>
            <input v-model="Item.IsRequired" type="checkbox" />
          </label>
          <DMButton type="none" :is-tooltip="false" :message="Text.RemoveItem" class="admin-button admin-button--danger" :un-active="ComboForm.Items.length <= 2" @click="removeItemRow(Index)" />
        </div>
      </div>

      <div class="admin-toolbar">
        <DMButton type="none" :is-tooltip="false" :message="IsSaving ? Text.Saving : (ComboForm.ComboId ? Text.SaveUpdating : Text.SaveCreating)" class="admin-button" :un-active="IsSaving" @click="submitCombo" />
        <DMButton type="none" :is-tooltip="false" :message="Text.ResetForm" class="admin-button" @click="resetComboForm" />
      </div>
    </article>

    <article class="dm-card admin-panel admin-table-wrap">
      <div class="admin-panel__header">
        <div>
          <h2>{{ Text.ListTitle }}</h2>
          <p>{{ Text.ListSubtitle }}</p>
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
                <span>{{ Text.ProductCount.replace('{count}', Combo.Items?.length || 0) }}</span>
              </div>
            </div>
            <DMBadge :type="Combo.IsActive ? 'success' : 'error'" dot>{{ Combo.IsActive ? Text.Active : Text.Inactive }}</DMBadge>
          </div>

          <div class="admin-combos__price-row">
            <span>{{ Text.OriginalPrice }}: {{ formatCurrency(Combo.OriginalPrice || 0) }}</span>
            <strong>{{ Text.ComboPrice }}: {{ formatCurrency(Combo.ComboPrice || 0) }}</strong>
          </div>

          <ul class="admin-combos__combo-items">
            <li v-for="Item in Combo.Items || []" :key="Item.ComboItemId || `${Combo.ComboId}-${Item.ProductVariantId}`">
              {{ Item.ProductName || Item.ProductVariantId }} × {{ Item.Quantity }}
            </li>
          </ul>

          <div class="admin-table-actions">
            <DMButton type="none" :is-tooltip="false" :message="Text.Edit" class="admin-button" @click="editCombo(Combo.ComboId)" />
            <DMButton type="none" :is-tooltip="false" :message="Text.Delete" class="admin-button admin-button--danger" @click="removeCombo(Combo.ComboId)" />
          </div>

          <div class="admin-combos__discount-box">
            <h3>{{ Text.DiscountTitle }}</h3>
            <div class="admin-combos__discount-grid">
              <DMInput v-model="ensureDiscountForm(Combo.ComboId).DiscountType" :label="Text.DiscountType" type="number" :description="buildFieldDescription(Text.DiscountTypeHint, Text.DiscountTypePlaceholder)" :placeholder="Text.DiscountTypePlaceholder" />
              <DMInput v-model="ensureDiscountForm(Combo.ComboId).DiscountValue" :label="Text.DiscountValue" type="number" :description="buildFieldDescription(Text.DiscountValueHint, Text.DiscountValuePlaceholder)" :placeholder="Text.DiscountValuePlaceholder" />
              <DMInput v-model="ensureDiscountForm(Combo.ComboId).StartsAt" :label="Text.StartsAt" type="datetime-local" :description="Text.StartsAtHint" />
              <DMInput v-model="ensureDiscountForm(Combo.ComboId).ExpiresAt" :label="Text.ExpiresAt" type="datetime-local" :description="Text.ExpiresAtHint" />
              <label class="admin-combos__toggle">
                <span>{{ Text.IsActive }}</span>
                <input v-model="ensureDiscountForm(Combo.ComboId).IsActive" type="checkbox" />
              </label>
            </div>
            <div class="admin-table-actions">
              <DMButton type="none" :is-tooltip="false" :message="ensureDiscountForm(Combo.ComboId).ComboDiscountId ? Text.SaveDiscountUpdating : Text.SaveDiscountCreating" class="admin-button" @click="submitDiscount(Combo.ComboId)" />
              <DMButton type="none" :is-tooltip="false" :message="Text.ResetDiscount" class="admin-button" @click="resetDiscountForm(Combo.ComboId)" />
            </div>
            <table class="dm-table" style="min-width: 720px;">
              <thead>
                <tr>
                  <th>{{ Text.DiscountTypeColumn }}</th>
                  <th>{{ Text.DiscountValueColumn }}</th>
                  <th>{{ Text.StartsAt }}</th>
                  <th>{{ Text.ExpiresAt }}</th>
                  <th>{{ Text.Status }}</th>
                  <th>{{ Text.Actions }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="Discount in Combo.Discounts || []" :key="Discount.ComboDiscountId">
                  <td>{{ Number(Discount.DiscountType) === 0 ? '%' : 'VND' }}</td>
                  <td>{{ formatCurrency(Discount.DiscountValue || 0) }}</td>
                  <td>{{ formatDateTime(Discount.StartsAt) }}</td>
                  <td>{{ formatDateTime(Discount.ExpiresAt) }}</td>
                  <td>{{ Discount.IsActive ? Text.Active : Text.Inactive }}</td>
                  <td>
                    <div class="admin-table-actions">
                      <DMButton type="none" :is-tooltip="false" :message="Text.Edit" class="admin-button" @click="editDiscount(Combo.ComboId, Discount)" />
                      <DMButton type="none" :is-tooltip="false" :message="Text.Delete" class="admin-button admin-button--danger" @click="removeDiscount(Combo.ComboId, Discount.ComboDiscountId)" />
                    </div>
                  </td>
                </tr>
                <tr v-if="!(Combo.Discounts || []).length">
                  <td colspan="6" style="text-align: center; padding: 16px; color: var(--dm-text-soft);">{{ Text.NoDiscounts }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <div v-if="!Combos.length && !IsLoading" class="admin-combos__alert dm-card">{{ Text.EmptyState }}</div>
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
