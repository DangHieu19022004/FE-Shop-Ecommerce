<template>
  <div v-if="IsLoading" class="combo-detail-state dm-card">
    <span class="material-symbols-outlined combo-detail-state__loading" aria-hidden="true">progress_activity</span>
  </div>

  <article v-else-if="Combo" class="combo-detail">
    <nav class="combo-breadcrumb" :aria-label="Text.BreadcrumbCombo">
      <router-link :to="{ name: 'home' }">{{ Text.BreadcrumbHome }}</router-link>
      <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
      <router-link :to="{ name: 'comboList' }">{{ Text.BreadcrumbCombo }}</router-link>
      <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
      <strong>{{ Combo.Name }}</strong>
    </nav>

    <section class="combo-detail-hero">
      <div class="combo-detail-hero__visual">
        <img :src="Combo.ImageUrl" :alt="Combo.Name" />
        <span class="combo-detail-hero__badge">{{ Combo.Badge }}</span>
      </div>
      <div class="combo-detail-hero__content">
        <span class="combo-section__eyebrow">{{ Combo.CategoryName }} · {{ Combo.ComboCode }}</span>
        <h1>{{ Combo.Name }}</h1>
        <p>{{ Combo.Description }}</p>
        <div class="combo-detail-hero__social">
          <span><span class="material-symbols-outlined" aria-hidden="true">star</span>{{ Combo.Rating }}</span>
          <span>{{ formatI18nText(Text.SoldCount, { count: Combo.SoldCount }) }}</span>
          <span>{{ formatI18nText(Text.ProductCount, { count: TotalQuantity }) }}</span>
        </div>
        <div class="combo-detail-hero__price">
          <span>{{ Text.ComboPrice }}</span>
          <strong>{{ formatCurrency(Combo.ComboPrice) }}</strong>
          <del>{{ formatCurrency(Combo.OriginalPrice) }}</del>
          <em>-{{ SavingPercent }}%</em>
        </div>
      </div>
    </section>

    <div v-if="ActionMessage" class="combo-alert" :class="`combo-alert--${ActionTone}`" role="status">
      <span class="material-symbols-outlined" aria-hidden="true">{{ ActionTone === 'success' ? 'check_circle' : 'error' }}</span>
      {{ ActionMessage }}
      <router-link v-if="ActionTone === 'success'" :to="{ name: 'cart' }">{{ Text.ViewCart }}</router-link>
    </div>

    <div class="combo-detail__layout">
      <section class="combo-detail__products dm-card">
        <header>
          <div>
            <span class="combo-section__eyebrow">{{ formatI18nText(Text.ProductCount, { count: Combo.Items.length }) }}</span>
            <h2>{{ Text.IncludedTitle }}</h2>
            <p>{{ Text.IncludedSubtitle }}</p>
          </div>
        </header>
        <div class="combo-product-list">
          <article v-for="Item in Combo.Items" :key="Item.ComboItemId" class="combo-product">
            <img :src="Item.ImageUrl" :alt="Item.ProductName" />
            <div>
              <span>{{ formatI18nText(Text.ProductCode, { code: Item.ProductCode }) }}</span>
              <strong>{{ Item.ProductName }}</strong>
              <small>{{ formatI18nText(Text.Quantity, { quantity: Item.Quantity }) }}</small>
            </div>
            <strong>{{ formatCurrency(Item.UnitPrice * Item.Quantity) }}</strong>
            <span class="material-symbols-outlined combo-product__check" aria-hidden="true">check_circle</span>
          </article>
        </div>
      </section>

      <aside class="combo-summary dm-card">
        <h2>{{ Text.SummaryTitle }}</h2>
        <dl>
          <div><dt>{{ Text.TotalItems }}</dt><dd>{{ TotalQuantity }}</dd></div>
          <div><dt>{{ Text.OriginalPrice }}</dt><dd><del>{{ formatCurrency(Combo.OriginalPrice) }}</del></dd></div>
          <div class="combo-summary__saving"><dt>{{ Text.YouSave }}</dt><dd>{{ formatCurrency(SavingAmount) }}</dd></div>
          <div class="combo-summary__total"><dt>{{ Text.ComboPrice }}</dt><dd>{{ formatCurrency(Combo.ComboPrice) }}</dd></div>
        </dl>
        <DMButton
          type="warning"
          :is-tooltip="false"
          icon-name="shopping_cart"
          :message="IsAdding ? Text.AddingCombo : Text.AddCombo"
          :un-active="IsAdding"
          class="combo-summary__button"
          @click="addCurrentCombo"
        />
        <router-link :to="{ name: 'comboList' }" class="combo-summary__continue">{{ Text.ContinueShopping }}</router-link>

        <div class="combo-benefits">
          <h3>{{ Text.BenefitTitle }}</h3>
          <p v-for="Benefit in Text.Benefits" :key="Benefit">
            <span class="material-symbols-outlined" aria-hidden="true">verified</span>{{ Benefit }}
          </p>
        </div>
      </aside>
    </div>
  </article>

  <section v-else class="combo-detail-state dm-card">
    <span class="material-symbols-outlined" aria-hidden="true">inventory_2</span>
    <h1>{{ Text.NotFoundTitle }}</h1>
    <p>{{ Text.NotFoundDescription }}</p>
    <router-link :to="{ name: 'comboList' }" class="dm-btn">{{ Text.BackToComboList }}</router-link>
  </section>
</template>

<script setup>
import { computed, inject, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import DMButton from "@/components/base/DMButton.vue";
import { getComboBySlug } from "@/services/comboService";
import { addComboToCart } from "@/stores/cartStore";
import { formatI18nText } from "@/utils/i18n";
import { formatCurrency } from "@/utils/shopFormatters";

const Route = useRoute();
const Text = inject("i18nCommon").Combo;
const Combo = ref(null);
const IsLoading = ref(false);
const IsAdding = ref(false);
const ActionMessage = ref("");
const ActionTone = ref("");

const SavingAmount = computed(() => Combo.value
  ? Math.max(0, Combo.value.OriginalPrice - Combo.value.ComboPrice)
  : 0);
const SavingPercent = computed(() => Combo.value?.OriginalPrice
  ? Math.round((SavingAmount.value / Combo.value.OriginalPrice) * 100)
  : 0);
const TotalQuantity = computed(() => Combo.value?.Items.reduce((Total, Item) => Total + Item.Quantity, 0) || 0);

const loadCombo = async () => {
  IsLoading.value = true;
  Combo.value = await getComboBySlug(Route.params.slug);
  IsLoading.value = false;
};

const addCurrentCombo = async () => {
  if (!Combo.value) return;
  IsAdding.value = true;
  ActionMessage.value = "";

  try {
    await addComboToCart(Combo.value.Items);
    ActionTone.value = "success";
    ActionMessage.value = Text.AddSuccess;
  } catch {
    ActionTone.value = "error";
    ActionMessage.value = Text.AddError;
  } finally {
    IsAdding.value = false;
  }
};

watch(() => Route.params.slug, loadCombo);
onMounted(loadCombo);
</script>
