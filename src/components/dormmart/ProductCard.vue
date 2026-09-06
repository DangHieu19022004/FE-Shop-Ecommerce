<template>
  <article class="dm-card product-card">
    <router-link :to="ProductLink" class="product-card__media">
      <img
        :src="Product.PrimaryImageUrl || 'https://placehold.co/600x450?text=No+Image'"
        :alt="Product.Name"
        class="product-card__image"
      />
      <DMBadge v-if="StatusBadgeText" :type="StatusBadgeType" class="product-card__status">{{ StatusBadgeText }}</DMBadge>
    </router-link>

    <div class="product-card__body">
      <div class="product-card__meta">
        <DMBadge primary class="product-card__category">{{ Product.CategoryName || Text.Uncategorized }}</DMBadge>
        <span v-if="Product.ProductCode" class="product-card__code">{{ Product.ProductCode }}</span>
      </div>

      <router-link :to="ProductLink" class="product-card__name">{{ Product.Name }}</router-link>
      <p class="product-card__description">{{ Product.ShortDescription || Text.NoDescription }}</p>

      <div class="product-card__footer">
        <div class="product-card__brand">
          <span class="material-symbols-outlined" aria-hidden="true">verified</span>
          {{ Product.BrandName || Text.NoBrand }}
        </div>
        <div class="product-card__price">
          <strong v-if="HasPrice">{{ formatCurrency(Product.MinSalePrice) }}</strong>
          <strong v-else class="product-card__price--pending">{{ Text.PricePending }}</strong>
          <span v-if="HasPriceRange">{{ formatI18nText(Text.ToPriceAmount, { amount: formatCurrency(Product.MaxSalePrice) }) }}</span>
        </div>
      </div>
    </div>

    <QuickAddCartButton
      v-if="CanQuickAdd"
      :ProductSlug="Product.Slug"
      :ImageUrl="Product.PrimaryImageUrl || ''"
    />
  </article>
</template>

<script setup>
import { computed, inject } from "vue";
import QuickAddCartButton from "@/components/dormmart/QuickAddCartButton.vue";
import { getCartQuantityByProductSlug } from "@/stores/cartStore";
import { formatI18nText } from "@/utils/i18n";
import { formatCurrency } from "@/utils/shopFormatters";

const Props = defineProps({
  Product: {
    type: Object,
    required: true,
  },
});

const Text = inject("i18nCommon").ProductCard;
const ProductLink = computed(() => `/products/${Props.Product.Slug}`);
const HasPrice = computed(() => Number(Props.Product.MinSalePrice) > 0);
const HasPriceRange = computed(() => Number(Props.Product.MaxSalePrice) > Number(Props.Product.MinSalePrice));
const IsAvailable = computed(() => Number(Props.Product.Status) === 1);
const RemainingStock = computed(() => Math.max(0, Number(Props.Product.AvailableStock ?? 0) - getCartQuantityByProductSlug(Props.Product.Slug)));
const HasSellableVariant = computed(() => {
  if (typeof Props.Product.HasSellableVariant === "boolean") {
    return Props.Product.HasSellableVariant && RemainingStock.value > 0;
  }

  return (Props.Product.Variants || []).some((VariantItem) => Number(VariantItem?.Status ?? 1) === 1 && Number(VariantItem?.AvailableStock ?? 0) > 0);
});
const CanQuickAdd = computed(() => IsAvailable.value && HasSellableVariant.value);
const StatusBadgeText = computed(() => {
  if (!IsAvailable.value) {
    return Text.Unavailable;
  }

  if (!HasSellableVariant.value) {
    return Text.OutOfStock;
  }

  return "";
});
const StatusBadgeType = computed(() => IsAvailable.value ? "warning" : "error");
</script>

<style scoped lang="scss">
.product-card {
  position: relative;
  display: flex;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  flex-direction: column;
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.product-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--dm-shadow);
}

.product-card__media {
  position: relative;
  display: block;
  overflow: hidden;
  background: var(--dm-surface-soft);
}

.product-card__image {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  transition: transform 220ms ease;
}

.product-card:hover .product-card__image {
  transform: scale(1.025);
}

.product-card__status {
  position: absolute;
  top: 10px;
  right: 10px;
}

.product-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  padding: 14px 14px 16px;
}

.product-card__meta,
.product-card__footer {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.product-card__meta {
  align-items: center;
  min-width: 0;
}

.product-card__category {
  max-width: 70%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-card__code {
  flex-shrink: 0;
  color: var(--dm-text-soft);
  font-size: 11px;
}

.product-card__name {
  display: -webkit-box;
  min-height: 44px;
  overflow: hidden;
  color: var(--dm-text);
  font-size: 16px;
  font-weight: 800;
  line-height: 1.4;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.product-card__description {
  display: -webkit-box;
  min-height: 40px;
  margin: 0;
  overflow: hidden;
  color: var(--dm-text-soft);
  font-size: 13px;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.product-card__footer {
  align-items: flex-end;
  margin-top: auto;
  padding-top: 10px;
  padding-right: 48px;
  border-top: 1px solid var(--dm-border);
}

.product-card__brand {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  color: var(--dm-text-soft);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-card__brand .material-symbols-outlined {
  flex-shrink: 0;
  color: var(--dm-primary);
  font-size: 16px;
}

.product-card__price {
  display: grid;
  flex-shrink: 0;
  justify-items: end;
  gap: 2px;
  color: var(--dm-danger);
}

.product-card__price strong {
  font-size: 17px;
}

.product-card__price span {
  color: var(--dm-text-soft);
  font-size: 10px;
}

.product-card__price .product-card__price--pending {
  color: var(--dm-primary);
  font-size: 13px;
}
</style>
