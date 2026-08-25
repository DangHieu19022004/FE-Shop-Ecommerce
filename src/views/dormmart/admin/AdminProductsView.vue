<script setup>
import { inject } from "vue";
import AdminData from "@/data/adminData.json";

const Text = inject("i18nCommon").AdminProducts;
const Products = AdminData.Products;

const statusStyle = (StatusCode) => {
  if (StatusCode === "ACTIVE") return "background: rgba(0,191,165,0.1); color: var(--dm-success);";
  if (StatusCode === "LOW_STOCK") return "background: rgba(253,192,3,0.18); color: var(--dm-secondary-text);";
  return "background: var(--dm-surface-soft); color: var(--dm-text-soft);";
};
const formatCurrency = (Amount) => new Intl.NumberFormat(Text.CurrencyLocale, { style: "currency", currency: Text.CurrencyCode }).format(Amount);
</script>

<template>
  <section style="display: grid; gap: 18px;">
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
      <div>
        <h1 style="font-size: 36px; margin-bottom: 8px;">{{ Text.Title }}</h1>
        <p style="color: var(--dm-text-soft);">{{ Text.Subtitle }}</p>
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button type="button" class="dm-btn-ghost dm-icon-btn" :aria-label="Text.Export" :title="Text.Export"><span class="material-symbols-outlined" aria-hidden="true">download</span></button>
        <button type="button" class="dm-btn dm-icon-btn" :aria-label="Text.AddProduct" :title="Text.AddProduct"><span class="material-symbols-outlined" aria-hidden="true">add</span></button>
      </div>
    </div>

    <article class="dm-card" style="overflow: hidden;">
      <div style="padding: 16px; border-bottom: 1px solid var(--dm-border); background: var(--dm-surface-soft); display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; align-items: center;">
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <span class="dm-pill" style="background: #fff; color: var(--dm-text); border: 1px solid var(--dm-border);">{{ Text.AllProducts }}</span>
          <span class="dm-pill" style="background: transparent; color: var(--dm-text-soft);">{{ Text.Active }}</span>
          <span class="dm-pill" style="background: transparent; color: var(--dm-text-soft);">{{ Text.Draft }}</span>
          <span class="dm-pill" style="background: transparent; color: var(--dm-text-soft);">{{ Text.OutOfStock }}</span>
        </div>
        <div style="display: flex; gap: 8px;">
          <button type="button" class="dm-btn-ghost dm-icon-btn" :aria-label="Text.Filter" :title="Text.Filter"><span class="material-symbols-outlined" aria-hidden="true">filter_alt</span></button>
          <button type="button" class="dm-btn-ghost dm-icon-btn" :aria-label="Text.Sort" :title="Text.Sort"><span class="material-symbols-outlined" aria-hidden="true">sort</span></button>
        </div>
      </div>

      <div style="overflow-x: auto;">
        <table class="dm-table" style="min-width: 880px;">
          <thead>
            <tr>
              <th>{{ Text.Product }}</th>
              <th>{{ Text.Category }}</th>
              <th>{{ Text.Status }}</th>
              <th>{{ Text.Inventory }}</th>
              <th>{{ Text.Price }}</th>
              <th style="text-align: right;">{{ Text.Actions }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ProductItem in Products" :key="ProductItem.ProductId">
              <td>
                <div style="font-weight: 700; margin-bottom: 4px;">{{ ProductItem.ProductName }}</div>
                <div style="font-size: 13px; color: var(--dm-text-soft);">{{ Text.ProductCode }}: {{ ProductItem.Sku }}</div>
              </td>
              <td>{{ ProductItem.CategoryName }}</td>
              <td><span class="dm-pill" :style="statusStyle(ProductItem.StatusCode)">{{ Text.Statuses[ProductItem.StatusCode] }}</span></td>
              <td>{{ ProductItem.InventoryQuantity }} {{ Text.InStockSuffix }}</td>
              <td>
                <div style="font-weight: 700;">{{ formatCurrency(ProductItem.Price) }}</div>
                <div style="font-size: 13px; color: var(--dm-text-soft);">{{ Text.Cost }}: {{ formatCurrency(ProductItem.CostPrice) }}</div>
              </td>
              <td style="text-align: right;">
                <div style="display: inline-flex; gap: 8px;">
                  <button type="button" class="dm-btn-ghost dm-icon-btn" :aria-label="Text.Edit" :title="Text.Edit"><span class="material-symbols-outlined" aria-hidden="true">edit</span></button>
                  <button type="button" class="dm-btn-danger dm-icon-btn" :aria-label="Text.Delete" :title="Text.Delete"><span class="material-symbols-outlined" aria-hidden="true">delete</span></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</template>
