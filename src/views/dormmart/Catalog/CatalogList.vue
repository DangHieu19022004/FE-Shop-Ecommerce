<template>
  <section style="display: flex; flex-direction: column; gap: 20px;">
    <div>
      <h1 style="font-size: 32px; margin-bottom: 6px;">{{ pageTitle }}</h1>
      <p style="color: var(--dm-text-soft);">{{ Paging.Total }} sản phẩm</p>
    </div>

    <div v-if="ErrorMessage" class="dm-card" style="padding: 16px; color: var(--dm-danger);">{{ ErrorMessage }}</div>

    <div style="display: grid; grid-template-columns: minmax(240px, 280px) minmax(0, 1fr); gap: 20px; align-items: start;">
      <aside class="dm-card" style="padding: 18px; position: sticky; top: 110px;">
        <h2 style="display: flex; align-items: center; gap: 8px; font-size: 18px; margin-bottom: 16px; color: var(--dm-primary);">
          <span class="material-symbols-outlined">filter_alt</span>
          {{ Text.FilterTitle }}
        </h2>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <section>
            <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--dm-text-soft); margin-bottom: 10px;">Category</div>
            <div v-for="item in Categories" :key="item.Id" style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
              <input :checked="Filters.CategoryId === item.Id" type="radio" name="category" @change="$router.push({ query: { ...$route.query, CategoryId: item.Id, PageIndex: 1 } })" />
              <span>{{ item.Name }}</span>
            </div>
            <div v-if="!Categories.length" style="color: var(--dm-text-soft);">{{ Text.DataFakeCategories }}</div>
          </section>
          <section>
            <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--dm-text-soft); margin-bottom: 10px;">Brand</div>
            <select class="dm-field" :value="Filters.BrandId" @change="$router.push({ query: { ...$route.query, BrandId: $event.target.value, PageIndex: 1 } })">
              <option value="">Tất cả</option>
              <option v-if="!Brands.length" disabled>{{ Text.DataFakeBrands }}</option>
              <option v-for="item in Brands" :key="item.Id" :value="item.Id">{{ item.Name }}</option>
            </select>
          </section>
          <section>
            <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--dm-text-soft); margin-bottom: 10px;">{{ Text.PriceRange }}</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <input class="dm-field" :value="Filters.MinPrice" placeholder="Min" @change="$router.push({ query: { ...$route.query, MinPrice: $event.target.value, PageIndex: 1 } })" />
              <input class="dm-field" :value="Filters.MaxPrice" placeholder="Max" @change="$router.push({ query: { ...$route.query, MaxPrice: $event.target.value, PageIndex: 1 } })" />
            </div>
          </section>
        </div>
      </aside>

      <div style="display: flex; flex-direction: column; gap: 18px; min-width: 0;">
        <div class="dm-card" style="padding: 14px 16px; display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; align-items: center;">
          <div style="display: flex; align-items: center; gap: 8px; color: var(--dm-text-soft);">
            <span>Sort by:</span>
            <button v-for="Option in SortOptions" :key="Option.Value" type="button" class="dm-pill" :style="Filters.Sort === Option.Value ? 'background: var(--dm-primary); color: #fff;' : 'background: var(--dm-surface-soft); color: var(--dm-text);'" @click="$router.push({ query: { ...$route.query, Sort: Option.Value, PageIndex: 1 } })">{{ Option.Label }}</button>
          </div>
          <div class="dm-pill" style="background: var(--dm-surface-soft); color: var(--dm-text);">{{ Paging.PageIndex }} / {{ totalPages }}</div>
        </div>

        <div v-if="IsLoading" class="dm-card" style="padding: 16px; text-align: center;">Đang tải sản phẩm...</div>
        <div v-else-if="Products.length" class="dm-grid dm-grid--products">
          <ProductCard v-for="ProductItem in Products" :key="ProductItem.ProductId" :Product="ProductItem" />
        </div>
        <div v-else class="dm-card" style="padding: 16px;">{{ Text.DataFakeProducts }}</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, inject, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import ProductCard from "@/components/dormmart/ProductCard.vue";
import { getBrands, getCategories, getProducts } from "@/services/catalogService";
import { formatI18nText } from "@/utils/i18n";

const Text = inject("i18nCommon").ProductList;

const Route = useRoute();
const Categories = ref([]);
const Brands = ref([]);
const Products = ref([]);
const IsLoading = ref(false);
const ErrorMessage = ref("");
const Paging = reactive({ Total: 0, PageIndex: 1, PageSize: 12 });
const Filters = reactive({
  Search: "",
  CategoryId: "",
  BrandId: "",
  MinPrice: "",
  MaxPrice: "",
  Sort: "newest",
});

const SortOptions = [
  { Value: "newest", Label: "Mới nhất" },
  { Value: "price_asc", Label: "Giá tăng dần" },
  { Value: "price_desc", Label: "Giá giảm dần" },
  { Value: "name", Label: "Tên A-Z" },
];

const pageTitle = computed(() => {
  const Category = Categories.value.find((Item) => Item.Id === Filters.CategoryId);
  if (Category) return Category.Name;
  return Filters.Search ? formatI18nText(Text.SearchResultTitle, { search: Filters.Search }) : Text.DefaultTitle;
});

const totalPages = computed(() => Math.max(1, Math.ceil((Paging.Total || 0) / Paging.PageSize)));

const syncQueryToFilters = () => {
  Filters.Search = typeof Route.query.Search === "string" ? Route.query.Search : "";
  Filters.CategoryId = typeof Route.query.CategoryId === "string" ? Route.query.CategoryId : "";
  Filters.BrandId = typeof Route.query.BrandId === "string" ? Route.query.BrandId : "";
  Filters.MinPrice = typeof Route.query.MinPrice === "string" ? Route.query.MinPrice : "";
  Filters.MaxPrice = typeof Route.query.MaxPrice === "string" ? Route.query.MaxPrice : "";
  Filters.Sort = typeof Route.query.Sort === "string" ? Route.query.Sort : "newest";
  Paging.PageIndex = Number(Route.query.PageIndex) || 1;
};

const loadCatalog = async () => {
  IsLoading.value = true;
  ErrorMessage.value = "";

  try {
    const [CategoryData, BrandData, ProductData] = await Promise.all([
      getCategories(),
      getBrands(),
      getProducts({ ...Filters, PageIndex: Paging.PageIndex, PageSize: Paging.PageSize }),
    ]);

    Categories.value = CategoryData;
    Brands.value = BrandData;
    Products.value = ProductData.Items || [];
    Paging.Total = ProductData.Total || 0;
    Paging.PageIndex = ProductData.PageIndex || 1;
    Paging.PageSize = ProductData.PageSize || 12;
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsLoading.value = false;
  }
};

watch(() => Route.query, async () => {
  syncQueryToFilters();
  await loadCatalog();
}, { deep: true });

onMounted(async () => {
  syncQueryToFilters();
  await loadCatalog();
});
</script>
