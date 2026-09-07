<template>
  <section class="dm-card dm-home-hero" style="overflow: hidden; position: relative; min-height: 360px; margin-bottom: 24px;">
    <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80" :alt="Text.HeroAlt" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;" />
    <div style="position: absolute; inset: 0; background: linear-gradient(90deg, rgba(0, 23, 66, 0.86), rgba(0, 23, 66, 0.18));"></div>
    <div style="position: relative; z-index: 1; padding: 36px; max-width: 520px; color: #fff;">
      <DMBadge warning style="margin-bottom: 18px;">{{ Text.PromotionBadge }}</DMBadge>
      <h1 style="font-size: clamp(28px, 4vw, 44px); line-height: 1.05; margin-bottom: 12px;">{{ Text.HeroTitle }}</h1>
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 22px;">{{ Text.HeroDescription }}</p>
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <router-link to="/products" class="dm-btn-ghost" style="background: #fff;">{{ Text.ShopCatalog }}</router-link>
        <router-link :to="{ name: 'comboList' }" class="dm-btn-ghost" style="background: var(--dm-primary-soft); color: var(--dm-primary);">{{ Text.ExploreCombos }}</router-link>
      </div>
    </div>
  </section>

  <div v-if="ErrorMessage" class="dm-card" style="padding: 16px; margin-bottom: 24px; color: var(--dm-danger);">
    {{ ErrorMessage }}
  </div>

  <section style="margin-bottom: 24px;">
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px;">
      <h2 style="font-size: 24px;">{{ Text.CategoryTitle }}
      </h2>
      <router-link to="/products" style="color: var(--dm-primary); font-weight: 600;">{{ Text.SeeAll }}</router-link>
    </div>
    <div class="dm-grid" style="grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));">
      <router-link v-for="CategoryItem in Categories" :key="CategoryItem.Id" :to="`/products?CategoryId=${CategoryItem.Id}`" class="dm-card" style="padding: 18px 12px; text-align: center; display: block; color: inherit;">
        <div style="width: 52px; height: 52px; border-radius: 50%; margin: 0 auto 10px; background: var(--dm-primary-soft); color: var(--dm-primary); display: grid; place-items: center;">
          <span class="material-symbols-outlined">category</span>
        </div>
        <div style="font-weight: 600;">{{ CategoryItem.Name }}</div>
      </router-link>
      <div v-if="!Categories.length && !IsLoading" class="dm-card" style="padding: 18px; color: var(--dm-text-soft);">{{ Text.DataFakeCategories }}</div>
    </div>
  </section>

  <section class="dm-home-flash dm-card" v-if="FlashProducts.length">
    <div class="dm-home-flash__header">
      <div>
        <div class="dm-home-flash__title">
          <span class="material-symbols-outlined">bolt</span>
          <h2>{{ Text.FlashSale }}</h2>
        </div>
      </div>
      <div class="dm-home-flash__badges">
        <DMBadge error icon-name="timer">{{ FlashSaleCountdownText }}</DMBadge>
        <DMBadge neutral>{{ FlashSaleCount }} sản phẩm</DMBadge>
      </div>
    </div>

    <div v-if="IsLoading" class="dm-card" style="padding: 16px; text-align: center;">Đang tải sản phẩm...</div>
    <div v-else-if="FlashProducts.length" class="dm-grid dm-grid--products">
      <ProductCard v-for="ProductItem in FlashProducts" :key="ProductItem.ProductId" :Product="ProductItem" />
    </div>
    <div v-else class="dm-card" style="padding: 16px; text-align: center; color: var(--dm-text-soft);">Chưa có flash sale đang hoạt động.</div>

    <div class="dm-home-flash__note" v-if="Text.FlashSaleNote">
      <span class="material-symbols-outlined">info</span>
      <span >{{ Text.FlashSaleNote }}</span>
    </div>
  </section>

  <section class="dm-home-discover">
    <div class="dm-home-discover__header">
      <div>
        <h2>{{ Text.DailyDiscover }}</h2>
        <p>Sản phẩm thiết yếu được chia theo từng nhu cầu để bạn dễ lựa chọn.</p>
      </div>
      <router-link to="/products" class="dm-home-discover__all-link">{{ Text.BrowseCatalog }}</router-link>
    </div>

    <div v-if="IsLoading" class="dm-card dm-home-discover__state">Đang tải sản phẩm...</div>
    <div v-else-if="ProductSections.length" class="dm-home-category-list">
      <section v-for="SectionItem in ProductSections" :key="SectionItem.Id || SectionItem.Name" class="dm-home-category-section">
        <div class="dm-home-category-section__header">
          <div class="dm-home-category-section__title">
            <span class="material-symbols-outlined" aria-hidden="true">category</span>
            <div>
              <h3>{{ SectionItem.Name }}</h3>
              <span>{{ SectionItem.Products.length }} sản phẩm</span>
            </div>
          </div>
          <router-link :to="SectionItem.Link" class="dm-home-category-section__link">
            Xem danh mục
            <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
          </router-link>
        </div>

        <div class="dm-grid dm-grid--products dm-home-category-section__grid">
          <ProductCard v-for="ProductItem in SectionItem.Products" :key="ProductItem.ProductId" :Product="ProductItem" />
        </div>
      </section>
    </div>
    <div v-else class="dm-card dm-home-discover__state">{{ Text.DataFakeProducts }}</div>
  </section>
</template>

<script setup>
import { computed, inject, onMounted, onUnmounted, ref } from "vue";
import ProductCard from "@/components/dormmart/ProductCard.vue";
import { getCategories, getProducts } from "@/services/catalogService";
import { getActiveFlashSales } from "@/services/checkoutService";

const Text = inject("i18nCommon").Home;
const Categories = ref([]);
const FlashSales = ref([]);
const FlashProducts = ref([]);
const DiscoverProducts = ref([]);
const IsLoading = ref(false);
const ErrorMessage = ref("");
const Now = ref(Date.now());
let CountdownTimer = null;

const FlashSaleCount = computed(() => FlashProducts.value.length);
const ActiveFlashSale = computed(() => FlashSales.value[0] || null);
const ActiveFlashSaleEndsAt = computed(() => ActiveFlashSale.value?.EndsAt ? new Date(ActiveFlashSale.value.EndsAt).getTime() : 0);
const CountdownParts = computed(() => {
  const Remaining = Math.max(0, ActiveFlashSaleEndsAt.value - Now.value);
  const TotalSeconds = Math.floor(Remaining / 1000);
  const Hours = Math.floor(TotalSeconds / 3600);
  const Minutes = Math.floor((TotalSeconds % 3600) / 60);
  const Seconds = TotalSeconds % 60;
  return { Hours, Minutes, Seconds, Remaining };
});
const FlashSaleCountdownText = computed(() => {
  if (!ActiveFlashSale.value) return Text.FlashSaleCountdown;
  if (CountdownParts.value.Remaining <= 0) return "Flash sale đã kết thúc";
  const { Hours, Minutes, Seconds } = CountdownParts.value;
  if (Hours > 0) return `Còn ${Hours}h ${String(Minutes).padStart(2, "0")}m ${String(Seconds).padStart(2, "0")}s`;
  if (Minutes > 0) return `Còn ${Minutes}m ${String(Seconds).padStart(2, "0")}s`;
  return `Còn ${Seconds}s`;
});
const ProductSections = computed(() => {
  const SectionsByKey = new Map();
  const CategoriesByName = new Map(Categories.value.map((CategoryItem) => [CategoryItem.Name.trim().toLocaleLowerCase("vi"), CategoryItem]));

  DiscoverProducts.value.forEach((ProductItem) => {
    const CategoryById = Categories.value.find((CategoryItem) => CategoryItem.Id === ProductItem.CategoryId);
    const CategoryByName = CategoriesByName.get((ProductItem.CategoryName || "").trim().toLocaleLowerCase("vi"));
    const CategoryItem = CategoryById || CategoryByName;
    const CategoryId = CategoryItem?.Id || ProductItem.CategoryId || "";
    const CategoryName = CategoryItem?.Name || ProductItem.CategoryName || "Sản phẩm khác";
    const CategoryKey = CategoryId || CategoryName;

    if (!SectionsByKey.has(CategoryKey)) {
      SectionsByKey.set(CategoryKey, {
        Id: CategoryKey,
        Name: CategoryName,
        Products: [],
        Link: CategoryId ? { path: "/products", query: { CategoryId } } : "/products",
      });
    }

    SectionsByKey.get(CategoryKey).Products.push(ProductItem);
  });

  const OrderedCategoryKeys = Categories.value.map((CategoryItem) => CategoryItem.Id);
  return [
    ...OrderedCategoryKeys.map((CategoryKey) => SectionsByKey.get(CategoryKey)).filter(Boolean),
    ...Array.from(SectionsByKey.entries())
      .filter(([CategoryKey]) => !OrderedCategoryKeys.includes(CategoryKey))
      .map(([, SectionItem]) => SectionItem),
  ];
});

const loadHomeData = async () => {
  IsLoading.value = true;
  ErrorMessage.value = "";

  try {
    const [CategoryData, ProductData, FlashSaleData] = await Promise.all([
      getCategories(),
      getProducts({ PageSize: 48, Sort: "newest" }),
      getActiveFlashSales().catch(() => []),
    ]);

    Categories.value = CategoryData;
    FlashSales.value = Array.isArray(FlashSaleData) ? FlashSaleData : [];
    FlashProducts.value = FlashSales.value.flatMap((FlashSale) => (FlashSale.Items || []).map((Item) => {
      const RemainingStock = Math.max(0, Number(Item.FlashStock || 0) - Number(Item.SoldCount || 0));
      return {
        ProductId: Item.ProductVariantId,
        ProductVariantId: Item.ProductVariantId,
        Slug: Item.ProductSlug || Item.Slug || Item.Sku,
        Name: Item.VariantName || Item.ProductName || Item.Sku,
        PrimaryImageUrl: Item.PrimaryImageUrl,
        BrandName: Item.BrandName || Item.ProductBrandName || "Flash Sale",
        CampaignName: FlashSale.Name || "Khuyến mãi",
        BadgeText: Item.SoldCount || Item.FlashStock ? `Còn ${RemainingStock} sp` : "",
        ShortDescription: Item.ShortDescription || `Ưu đãi thuộc ${FlashSale.Name || "chương trình flash sale"}`,
        ProductCode: Item.Sku,
        Status: 1,
        AvailableStock: RemainingStock,
        HasSellableVariant: RemainingStock > 0,
        MinSalePrice: Item.FlashPrice,
        MaxSalePrice: Item.FlashPrice,
        BaseMinSalePrice: Item.OriginalPrice,
        BaseMaxSalePrice: Item.OriginalPrice,
      };
    })).slice(0, 4);
    DiscoverProducts.value = ProductData.Items || [];
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsLoading.value = false;
  }
};

onMounted(() => {
  loadHomeData();
  CountdownTimer = window.setInterval(() => {
    Now.value = Date.now();
  }, 1000);
});

onUnmounted(() => {
  if (CountdownTimer) window.clearInterval(CountdownTimer);
});
</script>

<style scoped lang="scss">
.dm-home-flash {
  display: grid;
  gap: 18px;
  padding: 22px;
  margin-bottom: 24px;
  background: linear-gradient(180deg, rgba(186, 26, 26, 0.05), transparent 36%), var(--dm-surface);
}

.dm-home-flash__header,
.dm-home-flash__badges,
.dm-home-flash__title,
.dm-home-flash__note {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dm-home-flash__header {
  justify-content: space-between;
  flex-wrap: wrap;
}

.dm-home-flash__title h2,
.dm-home-flash__header p {
  margin: 0;
}

.dm-home-flash__title {
  color: var(--dm-danger);
  margin-bottom: 6px;
}

.dm-home-flash__note {
  padding-top: 6px;
  border-top: 1px solid var(--dm-border);
  font-size: 13px;
}

.dm-home-flash__note .material-symbols-outlined {
  color: var(--dm-primary);
  font-size: 18px;
}

.dm-home-discover {
  display: grid;
  gap: 20px;
}

.dm-home-discover__header,
.dm-home-category-section__header,
.dm-home-category-section__title,
.dm-home-category-section__link {
  display: flex;
  align-items: center;
}

.dm-home-discover__header,
.dm-home-category-section__header {
  justify-content: space-between;
  gap: 16px;
}

.dm-home-discover__header h2,
.dm-home-discover__header p,
.dm-home-category-section__title h3 {
  margin: 0;
}

.dm-home-discover__header h2 {
  font-size: 24px;
}

.dm-home-discover__header p {
  margin-top: 5px;
  color: var(--dm-text-soft);
  font-size: 14px;
}

.dm-home-discover__all-link,
.dm-home-category-section__link {
  flex-shrink: 0;
  color: var(--dm-primary);
  font-weight: 700;
}

.dm-home-category-list {
  display: grid;
  gap: 30px;
}

.dm-home-category-section {
  display: grid;
  gap: 16px;
}

.dm-home-category-section__header {
  padding-bottom: 12px;
  border-bottom: 2px solid var(--dm-primary-soft);
}

.dm-home-category-section__title {
  gap: 10px;
}

.dm-home-category-section__title > .material-symbols-outlined {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 12px;
  background: var(--dm-primary-soft);
  color: var(--dm-primary);
}

.dm-home-category-section__title h3 {
  color: var(--dm-primary);
  font-size: 20px;
}

.dm-home-category-section__title div > span {
  color: var(--dm-text-soft);
  font-size: 12px;
}

.dm-home-category-section__link {
  gap: 4px;
  font-size: 14px;
}

.dm-home-category-section__link .material-symbols-outlined {
  font-size: 18px;
}

.dm-home-category-section__grid {
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
}

.dm-home-discover__state {
  padding: 18px;
  color: var(--dm-text-soft);
}

@media (max-width: 720px) {
  .dm-home-flash {
    padding: 16px;
  }

  .dm-home-discover__header,
  .dm-home-category-section__header {
    align-items: flex-start;
  }

  .dm-home-category-section__grid {
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  }
}
</style>
