<script setup>
import { computed, inject } from "vue";
import { useRoute } from "vue-router";
import { Products } from "@/views/dormmart/mock/catalog";
import QuickAddCartButton from "@/components/dormmart/QuickAddCartButton.vue";

const Text = inject("i18nCommon").ProductList;
const Filters = Text.FilterOptions;
const route = useRoute();

const pageTitle = computed(() => {
  const category = route.query.category;
  if (typeof category === "string" && category) {
    return `${Text.SearchResultPrefix} "${category}"`;
  }

  return `${Text.SearchResultPrefix} "${Text.DefaultKeyword}"`;
});
</script>

<template>
  <section style="display: flex; flex-direction: column; gap: 20px;">
    <div>
      <h1 style="font-size: 32px; margin-bottom: 6px;">{{ pageTitle }}</h1>
      <p style="color: var(--dm-text-soft);">{{ Text.ResultSummary }}</p>
    </div>

    <div style="display: grid; grid-template-columns: minmax(240px, 280px) minmax(0, 1fr); gap: 20px; align-items: start;">
      <aside class="dm-card" style="padding: 18px; position: sticky; top: 110px;">
        <h2 style="display: flex; align-items: center; gap: 8px; font-size: 18px; margin-bottom: 16px; color: var(--dm-primary);">
          <span class="material-symbols-outlined">filter_alt</span>
          {{ Text.FilterTitle }}
        </h2>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <section>
            <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--dm-text-soft); margin-bottom: 10px;">{{ Text.Category }}</div>
            <label v-for="FilterItem in Filters" :key="FilterItem" style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; cursor: pointer;">
              <input type="checkbox" :checked="FilterItem === Text.SelectedFilter" />
              <span>{{ FilterItem }}</span>
            </label>
          </section>
          <section>
            <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--dm-text-soft); margin-bottom: 10px;">{{ Text.PriceRange }}</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <input class="dm-field" :placeholder="Text.MinimumPrice" readonly />
              <input class="dm-field" :placeholder="Text.MaximumPrice" readonly />
            </div>
            <button type="button" class="dm-btn dm-icon-btn" style="width: 100%; margin-top: 10px;" :aria-label="Text.ApplyFilter" :title="Text.ApplyFilter"><span class="material-symbols-outlined" aria-hidden="true">filter_alt</span></button>
          </section>
        </div>
      </aside>

      <div style="display: flex; flex-direction: column; gap: 18px; min-width: 0;">
        <div class="dm-card" style="padding: 14px 16px; display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; align-items: center;">
          <div style="display: flex; align-items: center; gap: 8px; color: var(--dm-text-soft);">
            <span>{{ Text.SortBy }}</span>
            <div class="dm-pill" style="background: var(--dm-primary); color: #fff;">{{ Text.Relevance }}</div>
            <div class="dm-pill" style="background: var(--dm-surface-soft); color: var(--dm-text);">{{ Text.Latest }}</div>
            <div class="dm-pill" style="background: var(--dm-surface-soft); color: var(--dm-text);">{{ Text.TopSales }}</div>
          </div>
          <div class="dm-pill" style="background: var(--dm-surface-soft); color: var(--dm-text);">{{ Text.Pagination }}</div>
        </div>

        <div class="dm-grid dm-grid--products">
          <article v-for="ProductItem in Products" :key="ProductItem.Slug" class="dm-card dm-product-card">
            <router-link :to="`/products/${ProductItem.Slug}`"><img :src="ProductItem.Image" :alt="ProductItem.Title" class="dm-product-card__image" /></router-link>
            <div class="dm-product-card__body">
              <div class="dm-pill" style="align-self: flex-start; background: var(--dm-secondary); color: var(--dm-secondary-text);">{{ ProductItem.Badge }}</div>
              <router-link :to="`/products/${ProductItem.Slug}`"><strong style="line-height: 1.4;">{{ ProductItem.Title }}</strong></router-link>
              <div style="display: flex; justify-content: space-between; gap: 8px; align-items: baseline;">
                <span style="color: var(--dm-danger); font-size: 18px; font-weight: 800;">{{ ProductItem.Price }}</span>
                <span style="color: var(--dm-text-soft); font-size: 12px;">{{ ProductItem.Sold }}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; color: var(--dm-text-soft); font-size: 12px;">
                <span>{{ ProductItem.Location }}</span>
              </div>
            </div>
            <QuickAddCartButton :ProductId="ProductItem.ProductId" :ImageUrl="ProductItem.Image" />
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
