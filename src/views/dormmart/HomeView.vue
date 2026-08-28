<script setup>
import { inject } from "vue";
import { Categories, FlashProducts, Products } from "@/views/dormmart/mock/catalog";
import { computed, onMounted, ref } from "vue";
import QuickAddCartButton from "@/components/dormmart/QuickAddCartButton.vue";
import { getCategories, getProducts } from "@/services/catalogService";
import { formatCompactNumber, formatCurrency } from "@/utils/shopFormatters";

const DiscoverProducts = Products.slice(0, 4);
const Text = inject("i18nCommon").Home;
const Categories = ref([]);
const FlashProducts = ref([]);
const DiscoverProducts = ref([]);
const IsLoading = ref(false);
const ErrorMessage = ref("");

const HeroProducts = computed(() => DiscoverProducts.value.slice(0, 4));

const loadHomeData = async () => {
  IsLoading.value = true;
  ErrorMessage.value = "";

  try {
    const [CategoryData, ProductData] = await Promise.all([
      getCategories(),
      getProducts({ PageSize: 8, Sort: "newest" }),
    ]);

    Categories.value = CategoryData;
    FlashProducts.value = (ProductData.Items || []).slice(0, 4);
    DiscoverProducts.value = ProductData.Items || [];
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsLoading.value = false;
  }
};

onMounted(loadHomeData);
</script>

<template>
  <section class="dm-card" style="overflow: hidden; position: relative; min-height: 360px; margin-bottom: 24px;">
    <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80" :alt="Text.HeroAlt" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;" />
    <div style="position: absolute; inset: 0; background: linear-gradient(90deg, rgba(0, 23, 66, 0.86), rgba(0, 23, 66, 0.18));"></div>
    <div style="position: relative; z-index: 1; padding: 36px; max-width: 520px; color: #fff;">
      <div class="dm-pill" style="background: var(--dm-secondary); color: var(--dm-secondary-text); margin-bottom: 18px;">{{ Text.PromotionBadge }}</div>
      <h1 style="font-size: clamp(28px, 4vw, 44px); line-height: 1.05; margin-bottom: 12px;">{{ Text.HeroTitle }}</h1>
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 22px;">{{ Text.HeroDescription }}</p>
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <router-link to="/products" class="dm-btn-ghost" style="background: #fff;">{{ Text.ShopCatalog }}</router-link>
        <router-link to="/admin" class="dm-btn" style="background: var(--dm-secondary); color: var(--dm-secondary-text);">{{ Text.OpenAdmin }}</router-link>
      </div>
    </div>
  </section>

  <div v-if="ErrorMessage" class="dm-card" style="padding: 16px; margin-bottom: 24px; color: var(--dm-danger);">
    {{ ErrorMessage }}
  </div>

  <section style="margin-bottom: 24px;">
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px;">
      <h2 style="font-size: 24px;">{{ Text.CategoryTitle }}</h2>
      <router-link to="/products" style="color: var(--dm-primary); font-weight: 600;">{{ Text.SeeAll }}</router-link>
    </div>
    <div class="dm-grid" style="grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));">
      <router-link v-for="CategoryItem in Categories" :key="CategoryItem.Id" :to="`/products?CategoryId=${CategoryItem.Id}`" class="dm-card" style="padding: 18px 12px; text-align: center; display: block; color: inherit;">
        <div style="width: 52px; height: 52px; border-radius: 50%; margin: 0 auto 10px; background: var(--dm-primary-soft); color: var(--dm-primary); display: grid; place-items: center;">
          <span class="material-symbols-outlined">category</span>
        </div>
        <div style="font-weight: 600;">{{ CategoryItem.Name }}</div>
      </router-link>
    </div>
  </section>

  <section class="dm-card" style="padding: 20px; margin-bottom: 24px;">
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
      <h2 style="display: flex; align-items: center; gap: 8px; color: var(--dm-danger);">
        <span class="material-symbols-outlined">bolt</span>
        {{ Text.FlashSale }}
      </h2>
      <div class="dm-pill" style="background: rgba(186, 26, 26, 0.08); color: var(--dm-danger);">{{ Text.FlashSaleCountdown }}</div>
    </div>
    <div v-if="IsLoading" class="dm-card" style="padding: 16px; text-align: center;">Đang tải sản phẩm...</div>
    <div v-else class="dm-grid dm-grid--products">
      <article v-for="ProductItem in FlashProducts" :key="ProductItem.ProductId" class="dm-card dm-product-card">
        <router-link :to="`/products/${ProductItem.Slug}`"><img :src="ProductItem.PrimaryImageUrl || 'https://placehold.co/400x400?text=No+Image'" :alt="ProductItem.Name" class="dm-product-card__image" /></router-link>
        <div class="dm-product-card__body">
          <div class="dm-pill" style="align-self: flex-start; background: var(--dm-secondary); color: var(--dm-secondary-text);">{{ ProductItem.BrandName || 'Dorm Mart' }}</div>
          <strong>{{ ProductItem.Name }}</strong>
          <div style="color: var(--dm-danger); font-size: 20px; font-weight: 800;">{{ formatCurrency(ProductItem.MinSalePrice) }}</div>
          <div style="color: var(--dm-text-soft); font-size: 13px;">{{ ProductItem.CategoryName }}</div>
        </div>
        <QuickAddCartButton :ProductSlug="ProductItem.Slug" :ImageUrl="ProductItem.PrimaryImageUrl || ''" />
      </article>
    </div>
  </section>

  <section>
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px;">
      <h2 style="font-size: 24px;">{{ Text.DailyDiscover }}</h2>
      <router-link to="/products" style="color: var(--dm-primary); font-weight: 600;">{{ Text.BrowseCatalog }}</router-link>
    </div>
    <div v-if="!IsLoading" class="dm-grid dm-grid--products">
      <article v-for="ProductItem in HeroProducts" :key="ProductItem.ProductId" class="dm-card dm-product-card">
        <router-link :to="`/products/${ProductItem.Slug}`"><img :src="ProductItem.PrimaryImageUrl || 'https://placehold.co/400x400?text=No+Image'" :alt="ProductItem.Name" class="dm-product-card__image" /></router-link>
        <div class="dm-product-card__body">
          <div class="dm-pill" style="align-self: flex-start; background: var(--dm-primary-soft); color: var(--dm-primary);">{{ ProductItem.CategoryName }}</div>
          <router-link :to="`/products/${ProductItem.Slug}`"><strong style="line-height: 1.4;">{{ ProductItem.Name }}</strong></router-link>
          <div style="display: flex; justify-content: space-between; gap: 10px; align-items: baseline;">
            <span style="color: var(--dm-danger); font-size: 18px; font-weight: 800;">{{ formatCurrency(ProductItem.MinSalePrice) }}</span>
            <span style="color: var(--dm-text-soft); font-size: 12px;">{{ formatCompactNumber(ProductItem.MaxSalePrice) }}</span>
          </div>
        </div>
        <QuickAddCartButton :ProductSlug="ProductItem.Slug" :ImageUrl="ProductItem.PrimaryImageUrl || ''" />
      </article>
    </div>
  </section>
</template>
