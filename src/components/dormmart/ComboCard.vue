<template>
  <article class="combo-card" :class="`combo-card--${Combo.Theme.toLowerCase()}`">
    <router-link :to="{ name: 'comboDetail', params: { slug: Combo.Slug } }" class="combo-card__visual">
      <img :src="Combo.ImageUrl" :alt="Combo.Name" class="combo-card__image" />
      <div class="combo-card__visual-overlay"></div>
      <span class="combo-card__badge">{{ Combo.Badge }}</span>
      <span class="material-symbols-outlined combo-card__icon" aria-hidden="true">{{ Combo.Icon }}</span>
      <span class="combo-card__saving">-{{ SavingPercent }}%</span>
    </router-link>

    <div class="combo-card__content">
      <div class="combo-card__meta">
        <span>{{ Combo.CategoryName }}</span>
        <span class="combo-card__rating"><span class="material-symbols-outlined" aria-hidden="true">star</span>{{ Combo.Rating }}</span>
      </div>
      <router-link :to="{ name: 'comboDetail', params: { slug: Combo.Slug } }" class="combo-card__name">{{ Combo.Name }}</router-link>
      <p class="combo-card__description">{{ Combo.Description }}</p>

      <div class="combo-card__items">
        <div class="combo-card__item-images" aria-hidden="true">
          <span v-for="Item in Combo.Items.slice(0, 3)" :key="Item.ComboItemId" :title="Item.ProductName">
            <img :src="Item.ImageUrl" alt="" />
          </span>
          <span v-if="Combo.Items.length > 3" class="combo-card__more">+{{ Combo.Items.length - 3 }}</span>
        </div>
        <div class="combo-card__item-count">
          <span class="material-symbols-outlined" aria-hidden="true">inventory_2</span>
          <strong>{{ formatI18nText(Text.ProductCount, { count: TotalQuantity }) }}</strong>
        </div>
      </div>

      <div class="combo-card__price-row">
        <div>
          <span>{{ Text.ComboPrice }}</span>
          <strong>{{ formatCurrency(Combo.ComboPrice) }}</strong>
          <del>{{ formatCurrency(Combo.OriginalPrice) }}</del>
        </div>
        <small>{{ formatI18nText(Text.SoldCount, { count: formatCompactNumber(Combo.SoldCount) }) }}</small>
      </div>

      <div class="combo-card__actions">
        <router-link :to="{ name: 'comboDetail', params: { slug: Combo.Slug } }" class="dm-btn-ghost">{{ Text.ViewDetail }}</router-link>
        <DMButton
          type="warning"
          :is-tooltip="false"
          icon-name="add_shopping_cart"
          :message="IsAdding ? Text.AddingCombo : Text.AddCombo"
          :un-active="IsAdding"
          @click="Emit('add', Combo)"
        />
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed, inject } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import { formatI18nText } from "@/utils/i18n";
import { formatCompactNumber, formatCurrency } from "@/utils/shopFormatters";

const Props = defineProps({
  Combo: {
    type: Object,
    required: true,
  },
  IsAdding: {
    type: Boolean,
    default: false,
  },
});

const Emit = defineEmits(["add"]);
const Text = inject("i18nCommon").Combo;
const SavingAmount = computed(() => Math.max(0, Props.Combo.OriginalPrice - Props.Combo.ComboPrice));
const SavingPercent = computed(() => Props.Combo.OriginalPrice
  ? Math.round((SavingAmount.value / Props.Combo.OriginalPrice) * 100)
  : 0);
const TotalQuantity = computed(() => Props.Combo.Items.reduce((Total, Item) => Total + Item.Quantity, 0));
</script>
