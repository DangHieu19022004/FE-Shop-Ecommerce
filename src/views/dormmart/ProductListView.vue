<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { Products } from "@/views/dormmart/mock/catalog";

const filters = ["Mini Fridges", "Cooling Fans", "Electric Kettles", "Microwaves"];
const route = useRoute();

const pageTitle = computed(() => {
  const category = route.query.category;
  if (typeof category === "string" && category) {
    return `Search Results for "${category}"`;
  }

  return 'Search Results for "appliances"';
});
</script>

<template>
  <section style="display: flex; flex-direction: column; gap: 20px;">
    <div>
      <h1 style="font-size: 32px; margin-bottom: 6px;">{{ pageTitle }}</h1>
      <p style="color: var(--dm-text-soft);">Showing 1 - 24 of 1,248 items</p>
    </div>

    <div style="display: grid; grid-template-columns: minmax(240px, 280px) minmax(0, 1fr); gap: 20px; align-items: start;">
      <aside class="dm-card" style="padding: 18px; position: sticky; top: 110px;">
        <h2 style="display: flex; align-items: center; gap: 8px; font-size: 18px; margin-bottom: 16px; color: var(--dm-primary);">
          <span class="material-symbols-outlined">filter_alt</span>
          Filters
        </h2>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <section>
            <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--dm-text-soft); margin-bottom: 10px;">Category</div>
            <label v-for="item in filters" :key="item" style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; cursor: pointer;">
              <input type="checkbox" :checked="item === 'Cooling Fans'" />
              <span>{{ item }}</span>
            </label>
          </section>
          <section>
            <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--dm-text-soft); margin-bottom: 10px;">Price Range</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <input class="dm-field" placeholder="Min" readonly />
              <input class="dm-field" placeholder="Max" readonly />
            </div>
            <button type="button" class="dm-btn" style="width: 100%; margin-top: 10px;">Apply</button>
          </section>
        </div>
      </aside>

      <div style="display: flex; flex-direction: column; gap: 18px; min-width: 0;">
        <div class="dm-card" style="padding: 14px 16px; display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; align-items: center;">
          <div style="display: flex; align-items: center; gap: 8px; color: var(--dm-text-soft);">
            <span>Sort by:</span>
            <div class="dm-pill" style="background: var(--dm-primary); color: #fff;">Relevance</div>
            <div class="dm-pill" style="background: var(--dm-surface-soft); color: var(--dm-text);">Latest</div>
            <div class="dm-pill" style="background: var(--dm-surface-soft); color: var(--dm-text);">Top Sales</div>
          </div>
          <div class="dm-pill" style="background: var(--dm-surface-soft); color: var(--dm-text);">1 / 52</div>
        </div>

        <div class="dm-grid dm-grid--products">
          <router-link v-for="ProductItem in Products" :key="ProductItem.Slug" :to="`/products/${ProductItem.Slug}`" class="dm-card dm-product-card" style="display: block;">
            <img :src="ProductItem.Image" :alt="ProductItem.Title" class="dm-product-card__image" />
            <div class="dm-product-card__body">
              <div class="dm-pill" style="align-self: flex-start; background: var(--dm-secondary); color: var(--dm-secondary-text);">{{ ProductItem.Badge }}</div>
              <strong style="line-height: 1.4;">{{ ProductItem.Title }}</strong>
              <div style="display: flex; justify-content: space-between; gap: 8px; align-items: baseline;">
                <span style="color: var(--dm-danger); font-size: 18px; font-weight: 800;">{{ ProductItem.Price }}</span>
                <span style="color: var(--dm-text-soft); font-size: 12px;">{{ ProductItem.Sold }}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; color: var(--dm-text-soft); font-size: 12px;">
                <span>{{ ProductItem.Location }}</span>
                <span class="material-symbols-outlined">add_shopping_cart</span>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>
