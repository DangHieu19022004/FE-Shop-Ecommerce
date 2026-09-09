<script setup>
import { computed, inject, onMounted, reactive, ref } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import DMPagingFooter from "@/components/base/DMPagingFooter.vue";
import DMRadio from "@/components/base/DMRadio.vue";
import {
  createAdminBrand,
  createAdminCategory,
  createAdminProduct,
  deleteAdminProduct,
  getAdminProductById,
  getAdminProducts,
  updateAdminProduct,
} from "@/services/adminService";
import { getBrands, getCategories } from "@/services/catalogService";
import { confirmDelete } from "@/stores/confirmStore";
import { formatCurrency } from "@/utils/shopFormatters";

const Text = inject("i18nCommon").AdminProducts;
const Products = ref([]);
const Categories = ref([]);
const Brands = ref([]);
const ErrorMessage = ref("");
const SuccessMessage = ref("");
const IsLoading = ref(false);
const IsSaving = ref(false);
const IsCreatingCategory = ref(false);
const IsCreatingBrand = ref(false);
const EditingProductId = ref("");
const Paging = reactive({ Total: 0, PageIndex: 1, PageSize: 12 });

const CategoryForm = reactive({
  Name: "",
  Description: "",
});

const BrandForm = reactive({
  Name: "",
  Description: "",
});

const createEmptyVariant = () => ({
  ProductVariantId: null,
  Name: "",
  Sku: "",
  SalePrice: 0,
  CostPrice: 0,
  Color: "",
  Size: "",
  IsDefault: false,
});

const createEmptyImage = () => ({
  ProductImageId: null,
  ImageUrl: "",
  AltText: "",
  SortOrder: 0,
  IsPrimary: false,
});

const createEmptyForm = () => ({
  Name: "",
  ProductCode: "",
  CategoryId: "",
  BrandId: "",
  ShortDescription: "",
  Description: "",
  Status: 1,
  Variants: [{ ...createEmptyVariant(), IsDefault: true }],
  Images: [{ ...createEmptyImage(), IsPrimary: true }],
});

const ProductForm = reactive(createEmptyForm());

const statusOptions = [
  { Value: 0, Label: Text.Draft },
  { Value: 1, Label: Text.Active },
  { Value: 2, Label: Text.Inactive },
  { Value: 3, Label: Text.OutOfStock },
];

const formatText = (Template, Values = {}) =>
  Object.entries(Values).reduce((Result, [Key, Value]) => Result.replaceAll(`{${Key}}`, Value), Template);

const isEditing = computed(() => Boolean(EditingProductId.value));
const defaultVariantIndex = computed(() => ProductForm.Variants.findIndex((Item) => Item.IsDefault));
const primaryImageIndex = computed(() => ProductForm.Images.findIndex((Item) => Item.IsPrimary));

const resetMessages = () => {
  ErrorMessage.value = "";
  SuccessMessage.value = "";
};

const resetCategoryForm = () => {
  CategoryForm.Name = "";
  CategoryForm.Description = "";
};

const resetBrandForm = () => {
  BrandForm.Name = "";
  BrandForm.Description = "";
};

const resetForm = () => {
  Object.assign(ProductForm, createEmptyForm());
  EditingProductId.value = "";
};

const validateCategoryForm = () => {
  if (!CategoryForm.Name.trim()) return Text.ValidationCategoryNameRequired;
  return "";
};

const validateBrandForm = () => {
  if (!BrandForm.Name.trim()) return Text.ValidationBrandNameRequired;
  return "";
};

const buildBrandSlug = (Value) => {
  const Slug = String(Value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return Slug || `brand-${Date.now()}`;
};

const normalizeSingleDefault = (Items, Key) => {
  const FirstEnabledIndex = Items.findIndex((Item) => Item[Key]);
  Items.forEach((Item, Index) => {
    Item[Key] = FirstEnabledIndex === -1 ? Index === 0 : Index === FirstEnabledIndex;
  });
};

const ensureVariantDefaults = () => {
  if (!ProductForm.Variants.length) {
    ProductForm.Variants.push({ ...createEmptyVariant(), IsDefault: true });
    return;
  }
  normalizeSingleDefault(ProductForm.Variants, "IsDefault");
};

const ensureImageDefaults = () => {
  const ActiveImages = ProductForm.Images.filter((Item) => Item.ImageUrl?.trim());
  if (!ActiveImages.length && ProductForm.Images.length) {
    ProductForm.Images.forEach((Item, Index) => {
      Item.IsPrimary = Index === 0;
    });
    return;
  }
  normalizeSingleDefault(ProductForm.Images, "IsPrimary");
};

const fillForm = (Product) => {
  ProductForm.Name = Product?.Name || "";
  ProductForm.ProductCode = Product?.ProductCode || "";
  ProductForm.CategoryId = Product?.CategoryId || "";
  ProductForm.BrandId = Product?.BrandId || "";
  ProductForm.ShortDescription = Product?.ShortDescription || "";
  ProductForm.Description = Product?.Description || "";
  ProductForm.Status = Number(Product?.Status ?? 1);
  ProductForm.Variants = Array.isArray(Product?.Variants) && Product.Variants.length
    ? Product.Variants.map((Item, Index) => ({
      ProductVariantId: Item.ProductVariantId || null,
      Name: Item.Name || "",
      Sku: Item.Sku || "",
      SalePrice: Number(Item.SalePrice) || 0,
      CostPrice: Number(Item.CostPrice) || 0,
      Color: Item.Color || "",
      Size: Item.Size || "",
      IsDefault: Boolean(Item.IsDefault || Index === 0),
    }))
    : [{ ...createEmptyVariant(), IsDefault: true }];
  ProductForm.Images = Array.isArray(Product?.Images) && Product.Images.length
    ? Product.Images.map((Item, Index) => ({
      ProductImageId: Item.ProductImageId || null,
      ImageUrl: Item.ImageUrl || "",
      AltText: Item.AltText || "",
      SortOrder: Number(Item.SortOrder) || 0,
      IsPrimary: Boolean(Item.IsPrimary || Index === 0),
    }))
    : [{ ...createEmptyImage(), IsPrimary: true }];
  ensureVariantDefaults();
  ensureImageDefaults();
};

const buildPayload = () => {
  ensureVariantDefaults();
  ensureImageDefaults();

  return {
    Name: ProductForm.Name.trim(),
    ProductCode: ProductForm.ProductCode.trim(),
    CategoryId: ProductForm.CategoryId,
    BrandId: ProductForm.BrandId || null,
    ShortDescription: ProductForm.ShortDescription.trim() || null,
    Description: ProductForm.Description.trim() || null,
    Status: Number(ProductForm.Status),
    Variants: ProductForm.Variants.map((Item) => ({
      ProductVariantId: Item.ProductVariantId || null,
      Name: Item.Name.trim(),
      Sku: Item.Sku.trim(),
      SalePrice: Number(Item.SalePrice) || 0,
      CostPrice: Number(Item.CostPrice) || 0,
      Color: Item.Color.trim() || null,
      Size: Item.Size.trim() || null,
      IsDefault: Boolean(Item.IsDefault),
    })),
    Images: ProductForm.Images.filter((Item) => Item.ImageUrl?.trim()).map((Item, Index) => ({
      ProductImageId: Item.ProductImageId || null,
      ImageUrl: Item.ImageUrl.trim(),
      AltText: Item.AltText.trim() || null,
      SortOrder: Number.isFinite(Number(Item.SortOrder)) ? Number(Item.SortOrder) : Index,
      IsPrimary: Boolean(Item.IsPrimary),
    })),
  };
};

const validateForm = () => {
  if (!ProductForm.Name.trim()) return Text.ValidationNameRequired;
  if (!ProductForm.ProductCode.trim()) return Text.ValidationProductCodeRequired;
  if (!ProductForm.CategoryId) return Text.ValidationCategoryRequired;
  if (!ProductForm.Variants.length) return Text.ValidationVariantRequired;
  if (ProductForm.Variants.some((Item) => !Item.Name.trim() || !Item.Sku.trim())) return Text.ValidationVariantFieldsRequired;
  if (ProductForm.Variants.some((Item) => Number(Item.SalePrice) < 0 || Number(Item.CostPrice) < 0)) return Text.ValidationPriceNonNegative;
  return "";
};

const loadAdminData = async () => {
  IsLoading.value = true;
  ErrorMessage.value = "";

  try {
    const [CategoryData, BrandData, ProductData] = await Promise.all([
      getCategories(),
      getBrands(),
      getAdminProducts({ PageIndex: Paging.PageIndex, PageSize: Paging.PageSize }),
    ]);
    Categories.value = CategoryData;
    Brands.value = BrandData;
    Products.value = Array.isArray(ProductData?.Items) ? ProductData.Items : [];
    Paging.Total = Number(ProductData?.Total) || 0;
    Paging.PageIndex = Number(ProductData?.PageIndex) || Paging.PageIndex;
    Paging.PageSize = Number(ProductData?.PageSize) || Paging.PageSize;
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsLoading.value = false;
  }
};

const changePage = async (PageIndex) => {
  Paging.PageIndex = PageIndex;
  await loadAdminData();
};

const submitCategoryForm = async () => {
  resetMessages();
  const ValidationError = validateCategoryForm();
  if (ValidationError) {
    ErrorMessage.value = ValidationError;
    return;
  }

  IsCreatingCategory.value = true;

  try {
    const CreatedCategory = await createAdminCategory({
      Name: CategoryForm.Name.trim(),
      Description: CategoryForm.Description.trim() || null,
    });
    await loadAdminData();
    ProductForm.CategoryId = CreatedCategory?.CategoryId || CreatedCategory?.Id || ProductForm.CategoryId;
    SuccessMessage.value = formatText(Text.CreateCategorySuccess, { name: CategoryForm.Name.trim() });
    resetCategoryForm();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsCreatingCategory.value = false;
  }
};

const submitBrandForm = async () => {
  resetMessages();
  const ValidationError = validateBrandForm();
  if (ValidationError) {
    ErrorMessage.value = ValidationError;
    return;
  }

  IsCreatingBrand.value = true;

  try {
    const CreatedBrand = await createAdminBrand({
      Name: BrandForm.Name.trim(),
      Slug: buildBrandSlug(BrandForm.Name),
      Description: BrandForm.Description.trim() || null,
    });
    await loadAdminData();
    ProductForm.BrandId = CreatedBrand?.BrandId || CreatedBrand?.Id || ProductForm.BrandId;
    SuccessMessage.value = formatText(Text.CreateBrandSuccess, { name: BrandForm.Name.trim() });
    resetBrandForm();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsCreatingBrand.value = false;
  }
};

const startCreate = () => {
  resetMessages();
  resetForm();
};

const startEdit = async (ProductId) => {
  resetMessages();
  IsLoading.value = true;

  try {
    const Product = await getAdminProductById(ProductId);
    fillForm(Product);
    EditingProductId.value = ProductId;
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsLoading.value = false;
  }
};

const submitForm = async () => {
  resetMessages();
  const ValidationError = validateForm();
  if (ValidationError) {
    ErrorMessage.value = ValidationError;
    return;
  }

  const Payload = buildPayload();
  IsSaving.value = true;

  try {
    if (isEditing.value) {
      await updateAdminProduct(EditingProductId.value, Payload);
      SuccessMessage.value = formatText(Text.UpdateSuccess, { name: Payload.Name });
    } else {
      await createAdminProduct(Payload);
      SuccessMessage.value = formatText(Text.CreateSuccess, { name: Payload.Name });
    }
    resetForm();
    await loadAdminData();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsSaving.value = false;
  }
};

const removeProduct = async (Product) => {
  resetMessages();
  const Confirmed = await confirmDelete(formatText(Text.ConfirmDelete, { name: Product.Name }));
  if (!Confirmed) return;

  try {
    await deleteAdminProduct(Product.ProductId);
    if (EditingProductId.value === Product.ProductId) {
      resetForm();
    }
    SuccessMessage.value = formatText(Text.DeleteSuccess, { name: Product.Name });
    await loadAdminData();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

const addVariant = () => {
  ProductForm.Variants.push(createEmptyVariant());
  ensureVariantDefaults();
};

const removeVariant = async (Index) => {
  if (ProductForm.Variants.length === 1) {
    ErrorMessage.value = Text.KeepOneVariant;
    return;
  }
  if (!await confirmDelete(`Xóa biến thể ${ProductForm.Variants[Index]?.Name || Index + 1} khỏi sản phẩm?`)) return;
  ProductForm.Variants.splice(Index, 1);
  ensureVariantDefaults();
};

const setDefaultVariant = (Index) => {
  ProductForm.Variants.forEach((Item, ItemIndex) => {
    Item.IsDefault = ItemIndex === Index;
  });
};

const addImage = () => {
  ProductForm.Images.push(createEmptyImage());
  ensureImageDefaults();
};

const removeImage = async (Index) => {
  if (!await confirmDelete(`Xóa ảnh số ${Index + 1} khỏi sản phẩm?`)) return;
  if (ProductForm.Images.length === 1) {
    ProductForm.Images[0] = { ...createEmptyImage(), IsPrimary: true };
    return;
  }
  ProductForm.Images.splice(Index, 1);
  ensureImageDefaults();
};

const setPrimaryImage = (Index) => {
  ProductForm.Images.forEach((Item, ItemIndex) => {
    Item.IsPrimary = ItemIndex === Index;
  });
};

const statusLabel = (Status) => statusOptions.find((Item) => Item.Value === Number(Status))?.Label || `Status ${Status}`;
const statusBadgeType = (Status) => ({
  0: "warning",
  1: "success",
  2: "error",
  3: "warning",
}[Number(Status)] || "neutral");

onMounted(async () => {
  resetForm();
  await loadAdminData();
});
</script>

<template>
  <section style="display: grid; gap: 18px;">
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
      <div>
        <h1 style="font-size: 36px; margin-bottom: 8px;">{{ Text.Title }}</h1>
        <p style="color: var(--dm-text-soft);">{{ Text.RealApiSubtitle }}</p>
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <DMButton type="none" :is-tooltip="false" :message="Text.CreateNew" class="admin-button" @click="startCreate" />
        <DMButton type="none" :is-tooltip="false" :message="Text.Reload" class="dm-btn" @click="loadAdminData" />
      </div>
    </div>

    <div v-if="ErrorMessage" class="dm-card" style="padding: 16px; color: var(--dm-danger);">{{ ErrorMessage }}</div>
    <div v-if="SuccessMessage" class="dm-card" style="padding: 16px; color: var(--dm-primary);">{{ SuccessMessage }}</div>
    <div v-if="IsLoading" class="dm-card" style="padding: 16px;">{{ Text.LoadMessage }}</div>

    <div style="display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(320px, 1fr); gap: 18px; align-items: start;">
      <article class="dm-card" style="overflow: hidden;">
        <div style="overflow-x: auto;">
          <table class="dm-table" style="min-width: 980px;">
            <thead>
              <tr>
                <th>{{ Text.TableImage }}</th>
                <th>{{ Text.Product }}</th>
                <th>{{ Text.ProductCode }}</th>
                <th>{{ Text.Category }}</th>
                <th>{{ Text.Brand }}</th>
                <th>{{ Text.SalesPriceRange }}</th>
                <th>{{ Text.Status }}</th>
                <th>{{ Text.Actions }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="Item in Products" :key="Item.ProductId">
                <td>
                  <img v-if="Item.PrimaryImageUrl" :src="Item.PrimaryImageUrl" :alt="Item.Name" style="width: 64px; height: 64px; object-fit: cover; border-radius: 10px;" />
                  <span v-else>-</span>
                </td>
                <td>
                  <div style="display: grid; gap: 4px; min-width: 220px;">
                    <strong>{{ Item.Name }}</strong>
                    <span style="color: var(--dm-text-soft);">{{ Text.TableSlugPrefix }}{{ Item.Slug }}</span>
                    <span style="color: var(--dm-text-soft);">{{ Item.ShortDescription || '-' }}</span>
                  </div>
                </td>
                <td>{{ Item.ProductCode }}</td>
                <td>{{ Item.CategoryName }}</td>
                <td>{{ Item.BrandName || '-' }}</td>
                <td>{{ formatCurrency(Item.MinSalePrice) }}<span v-if="Item.MinSalePrice !== Item.MaxSalePrice"> - {{ formatCurrency(Item.MaxSalePrice) }}</span></td>
                <td><DMBadge :type="statusBadgeType(Item.Status)" dot>{{ statusLabel(Item.Status) }}</DMBadge></td>
                <td>
                  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <DMButton type="none" :is-tooltip="false" :message="Text.Edit" class="admin-button" @click="startEdit(Item.ProductId)" />
                    <DMButton type="none" :is-tooltip="false" :message="Text.Delete" class="admin-button admin-button--danger" @click="removeProduct(Item)" />
                  </div>
                </td>
              </tr>
              <tr v-if="!Products.length && !IsLoading">
                <td colspan="8" style="text-align: center; padding: 24px; color: var(--dm-text-soft);">{{ Text.EmptyState }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <DMPagingFooter
          :Total="Paging.Total"
          :PageIndex="Paging.PageIndex"
          :PageSize="Paging.PageSize"
          :Disabled="IsLoading"
          @update:page-index="changePage"
        />
      </article>

      <article class="dm-card" style="padding: 18px; display: grid; gap: 16px;">
        <div>
          <h2 style="margin-bottom: 6px;">{{ isEditing ? Text.UpdateTitle : Text.CreateTitle }}</h2>
          <p style="color: var(--dm-text-soft); margin: 0;">{{ Text.FormSubtitle }}</p>
        </div>

        <DMInput v-model="ProductForm.Name" :label="Text.Name" />
        <DMInput v-model="ProductForm.ProductCode" :label="Text.ProductCode" />

        <section style="display: grid; gap: 12px; padding: 12px; border: 1px solid var(--dm-border); border-radius: 12px;">
          <label style="display: grid; gap: 8px;">
            <span style="font-weight: 600;">{{ Text.Category }}</span>
            <select v-model="ProductForm.CategoryId" class="dm-field">
              <option value="">{{ Text.SelectCategory }}</option>
              <option v-for="Item in Categories" :key="Item.Id" :value="Item.Id">{{ Item.Name }}</option>
            </select>
          </label>

          <div style="display: grid; gap: 10px;">
            <strong>{{ Text.CreateCategory }}</strong>
            <DMInput v-model="CategoryForm.Name" :label="Text.CategoryName" />
            <DMInput v-model="CategoryForm.Description" :label="Text.CategoryDescription" />
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <DMButton type="none" :is-tooltip="false" :message="IsCreatingCategory ? Text.CreatingCategory : Text.CreateCategory" class="admin-button" @click="submitCategoryForm" />
            </div>
          </div>
        </section>

        <section style="display: grid; gap: 12px; padding: 12px; border: 1px solid var(--dm-border); border-radius: 12px;">
          <label style="display: grid; gap: 8px;">
            <span style="font-weight: 600;">{{ Text.Brand }}</span>
            <select v-model="ProductForm.BrandId" class="dm-field">
              <option value="">{{ Text.NoBrand }}</option>
              <option v-for="Item in Brands" :key="Item.Id" :value="Item.Id">{{ Item.Name }}</option>
            </select>
          </label>

          <div style="display: grid; gap: 10px;">
            <strong>{{ Text.CreateBrand }}</strong>
            <DMInput v-model="BrandForm.Name" :label="Text.BrandName" />
            <DMInput v-model="BrandForm.Description" :label="Text.BrandDescription" />
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <DMButton type="none" :is-tooltip="false" :message="IsCreatingBrand ? Text.CreatingBrand : Text.CreateBrand" class="admin-button" @click="submitBrandForm" />
            </div>
          </div>
        </section>

        <label style="display: grid; gap: 8px;">
          <span style="font-weight: 600;">{{ Text.Status }}</span>
          <select v-model.number="ProductForm.Status" class="dm-field">
            <option v-for="Item in statusOptions" :key="Item.Value" :value="Item.Value">{{ Item.Label }}</option>
          </select>
        </label>

        <DMInput v-model="ProductForm.ShortDescription" :label="Text.ShortDescription" />
        <label style="display: grid; gap: 8px;">
          <span style="font-weight: 600;">{{ Text.Description }}</span>
          <textarea v-model="ProductForm.Description" class="dm-field" rows="4"></textarea>
        </label>

        <section style="display: grid; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
            <h3 style="margin: 0;">{{ Text.Variant }}</h3>
            <DMButton type="none" :is-tooltip="false" :message="Text.AddVariant" class="admin-button" @click="addVariant" />
          </div>
          <div v-for="(Item, Index) in ProductForm.Variants" :key="Item.ProductVariantId || `variant-${Index}`" style="padding: 12px; border: 1px solid var(--dm-border); border-radius: 12px; display: grid; gap: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
              <strong>{{ Text.Variant }} {{ Index + 1 }}</strong>
              <DMButton type="none" :is-tooltip="false" :message="Text.RemoveVariant" class="admin-button admin-button--danger" @click="removeVariant(Index)" />
            </div>
            <DMInput v-model="Item.Name" :label="Text.VariantName" />
            <DMInput v-model="Item.Sku" :label="Text.VariantSku" />
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <DMInput v-model="Item.SalePrice" :label="Text.Price" type="number" />
              <DMInput v-model="Item.CostPrice" :label="Text.Cost" type="number" />
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <DMInput v-model="Item.Color" :label="Text.VariantColor" />
              <DMInput v-model="Item.Size" :label="Text.VariantSize" />
            </div>
            <DMRadio
              :model-value="defaultVariantIndex"
              :options="[{ value: Index, label: Text.DefaultVariant }]"
              name="defaultVariant"
              @update:model-value="setDefaultVariant"
            />
          </div>
        </section>

        <section style="display: grid; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
            <h3 style="margin: 0;">{{ Text.Image }}</h3>
            <DMButton type="none" :is-tooltip="false" :message="Text.AddImage" class="admin-button" @click="addImage" />
          </div>
          <div v-for="(Item, Index) in ProductForm.Images" :key="Item.ProductImageId || `image-${Index}`" style="padding: 12px; border: 1px solid var(--dm-border); border-radius: 12px; display: grid; gap: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
              <strong>{{ Text.Image }} {{ Index + 1 }}</strong>
              <DMButton type="none" :is-tooltip="false" :message="Text.RemoveImage" class="admin-button admin-button--danger" @click="removeImage(Index)" />
            </div>
            <DMInput v-model="Item.ImageUrl" :label="Text.ImageUrl" />
            <DMInput v-model="Item.AltText" :label="Text.AltText" />
            <DMInput v-model="Item.SortOrder" :label="Text.SortOrder" type="number" />
            <DMRadio
              :model-value="primaryImageIndex"
              :options="[{ value: Index, label: Text.PrimaryImage }]"
              name="primaryImage"
              @update:model-value="setPrimaryImage"
            />
          </div>
        </section>

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <DMButton type="none" :is-tooltip="false" :message="IsSaving ? Text.Saving : (isEditing ? Text.SaveUpdating : Text.SaveCreating)" class="admin-button" @click="submitForm" />
          <DMButton type="none" :is-tooltip="false" :message="Text.Reset" class="dm-btn" @click="resetForm" />
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped lang="scss" src="@/assets/styles/screens/admin-operations.scss"></style>

<!-- ponytail: giữ CRUD + form trong cùng view; tách composable/component khi admin product flow lớn thêm hoặc cần paging/filter thật. -->
