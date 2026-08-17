<script setup>
import { Categories, FlashProducts, Products } from "@/views/dormmart/mock/catalog";
import QuickAddCartButton from "@/components/dormmart/QuickAddCartButton.vue";

const DiscoverProducts = Products.slice(0, 4);
</script>

<template>
  <section class="dm-card" style="overflow: hidden; position: relative; min-height: 360px; margin-bottom: 24px;">
    <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80" alt="Dorm Mart hero" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;" />
    <div style="position: absolute; inset: 0; background: linear-gradient(90deg, rgba(0, 23, 66, 0.86), rgba(0, 23, 66, 0.18));"></div>
    <div style="position: relative; z-index: 1; padding: 36px; max-width: 520px; color: #fff;">
      <div class="dm-pill" style="background: var(--dm-secondary); color: var(--dm-secondary-text); margin-bottom: 18px;">BACK TO UNI SALE</div>
      <h1 style="font-size: clamp(28px, 4vw, 44px); line-height: 1.05; margin-bottom: 12px;">Upgrade Your Space.</h1>
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 22px;">Dorm Mart refined style vào app thật. Có route rõ ràng cho home, catalog, detail, cart, auth, admin.</p>
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <router-link to="/products" class="dm-btn-ghost" style="background: #fff;">Shop Catalog</router-link>
        <router-link to="/admin" class="dm-btn" style="background: var(--dm-secondary); color: var(--dm-secondary-text);">Open Admin</router-link>
      </div>
    </div>
  </section>

  <section style="margin-bottom: 24px;">
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px;">
      <h2 style="font-size: 24px;">Shop by Category</h2>
      <router-link to="/products" style="color: var(--dm-primary); font-weight: 600;">See All</router-link>
    </div>
    <div class="dm-grid" style="grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));">
      <router-link v-for="CategoryItem in Categories" :key="CategoryItem.Label" :to="`/products?category=${CategoryItem.Query}`" class="dm-card" style="padding: 18px 12px; text-align: center; display: block; color: inherit;">
        <div style="width: 52px; height: 52px; border-radius: 50%; margin: 0 auto 10px; background: var(--dm-primary-soft); color: var(--dm-primary); display: grid; place-items: center;">
          <span class="material-symbols-outlined">{{ CategoryItem.Icon }}</span>
        </div>
        <div style="font-weight: 600;">{{ CategoryItem.Label }}</div>
      </router-link>
    </div>
  </section>

  <section class="dm-card" style="padding: 20px; margin-bottom: 24px;">
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
      <h2 style="display: flex; align-items: center; gap: 8px; color: var(--dm-danger);">
        <span class="material-symbols-outlined">bolt</span>
        FLASH SALE
      </h2>
      <div class="dm-pill" style="background: rgba(186, 26, 26, 0.08); color: var(--dm-danger);">01 : 45 : 22</div>
    </div>
    <div class="dm-grid dm-grid--products">
      <article v-for="ProductItem in FlashProducts" :key="ProductItem.Slug" class="dm-card dm-product-card">
        <router-link :to="`/products/${ProductItem.Slug}`"><img :src="ProductItem.Image" :alt="ProductItem.Name" class="dm-product-card__image" /></router-link>
        <div class="dm-product-card__body">
          <div class="dm-pill" style="align-self: flex-start; background: var(--dm-secondary); color: var(--dm-secondary-text);">{{ ProductItem.Discount }}</div>
          <strong>{{ ProductItem.Name }}</strong>
          <div style="color: var(--dm-danger); font-size: 20px; font-weight: 800;">{{ ProductItem.Price }}</div>
          <div style="color: var(--dm-text-soft); font-size: 13px;">{{ ProductItem.Sold }}</div>
        </div>
        <QuickAddCartButton :ProductId="ProductItem.ProductId" :ImageUrl="ProductItem.Image" />
      </article>
    </div>
  </section>

  <section>
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px;">
      <h2 style="font-size: 24px;">Daily Discover</h2>
      <router-link to="/products" style="color: var(--dm-primary); font-weight: 600;">Browse catalog</router-link>
    </div>
    <div class="dm-grid dm-grid--products">
      <article v-for="ProductItem in DiscoverProducts" :key="ProductItem.Slug" class="dm-card dm-product-card">
        <router-link :to="`/products/${ProductItem.Slug}`"><img :src="ProductItem.Image" :alt="ProductItem.Title" class="dm-product-card__image" /></router-link>
        <div class="dm-product-card__body">
          <div class="dm-pill" style="align-self: flex-start; background: var(--dm-primary-soft); color: var(--dm-primary);">{{ ProductItem.Badge }}</div>
          <router-link :to="`/products/${ProductItem.Slug}`"><strong style="line-height: 1.4;">{{ ProductItem.Title }}</strong></router-link>
          <div style="display: flex; justify-content: space-between; gap: 10px; align-items: baseline;">
            <span style="color: var(--dm-danger); font-size: 18px; font-weight: 800;">{{ ProductItem.Price }}</span>
            <span style="color: var(--dm-text-soft); font-size: 12px;">{{ ProductItem.Sold }}</span>
          </div>
        </div>
        <QuickAddCartButton :ProductId="ProductItem.ProductId" :ImageUrl="ProductItem.Image" />
      </article>
    </div>
  </section>
</template>
