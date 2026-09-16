<template>
  <main class="promotion-page">
    <header class="promotion-hero">
      <div class="promotion-hero__content">
        <span class="promotion-hero__eyebrow">
          <span class="material-symbols-outlined" aria-hidden="true">local_fire_department</span>
          {{ Text.Eyebrow }}
        </span>
        <h1>{{ Text.Title }}</h1>
        <p>{{ Text.Subtitle }}</p>
      </div>
      <div class="promotion-hero__art" aria-hidden="true">
        <span class="material-symbols-outlined">percent</span>
        <strong>{{ TotalOfferCount }}</strong>
        <small>ưu đãi</small>
      </div>
    </header>

    <nav class="promotion-filters" aria-label="Lọc loại khuyến mãi">
      <button
        v-for="Filter in Filters"
        :key="Filter.Value"
        type="button"
        class="promotion-filter"
        :class="{ 'promotion-filter--active': ActiveFilter === Filter.Value }"
        :aria-pressed="ActiveFilter === Filter.Value"
        @click="selectFilter(Filter.Value)"
      >
        <span class="material-symbols-outlined" aria-hidden="true">{{ Filter.Icon }}</span>
        {{ Filter.Label }}
      </button>
    </nav>

    <div v-if="ActionMessage" class="promotion-alert" :class="`promotion-alert--${ActionTone}`" role="status">
      <span class="material-symbols-outlined" aria-hidden="true">{{ ActionTone === 'success' ? 'check_circle' : 'error' }}</span>
      <span>{{ ActionMessage }}</span>
      <router-link v-if="ActionTone === 'success'" :to="{ name: 'cart' }">{{ Text.ViewCart }}</router-link>
    </div>

    <section v-if="IsLoading" class="promotion-state dm-card" aria-live="polite">
      <span class="material-symbols-outlined promotion-state__spinner" aria-hidden="true">progress_activity</span>
      <p>{{ Text.Loading }}</p>
    </section>

    <section v-else-if="LoadError" class="promotion-state promotion-state--error dm-card" role="alert">
      <span class="material-symbols-outlined" aria-hidden="true">cloud_off</span>
      <h2>{{ Text.LoadError }}</h2>
      <button type="button" class="dm-btn" @click="loadPromotions">Thử lại</button>
    </section>

    <div v-else-if="VisibleGroups.length" class="promotion-groups">
      <section
        v-for="Group in VisibleGroups"
        :key="Group.Key"
        class="promotion-group"
        :data-sort-order="Group.SortOrder ?? 'unsorted'"
      >
        <header class="promotion-group__header">
          <div>
            <span class="promotion-group__index">{{ groupLabel(Group) }}</span>
            <h2>{{ groupTitle(Group) }}</h2>
          </div>
          <div class="promotion-group__counts">
            <DMBadge v-if="Group.FlashSales.length" error icon-name="bolt">
              {{ formatI18nText(Text.FlashSaleCount, { count: Group.FlashSales.length }) }}
            </DMBadge>
            <DMBadge v-if="Group.Combos.length" warning icon-name="redeem">
              {{ formatI18nText(Text.ComboCount, { count: Group.Combos.length }) }}
            </DMBadge>
          </div>
        </header>

        <section v-for="FlashSale in Group.FlashSales" :key="FlashSale.Id || FlashSale.Name" class="promotion-flash">
          <header class="promotion-subsection__header">
            <div>
              <span class="promotion-subsection__type"><span class="material-symbols-outlined" aria-hidden="true">bolt</span>Flash Sale</span>
              <h3>{{ FlashSale.Name }}</h3>
            </div>
            <time v-if="FlashSale.EndsAt" :datetime="FlashSale.EndsAt">{{ formatI18nText(Text.EndsAt, { time: formatDateTime(FlashSale.EndsAt) }) }}</time>
          </header>
          <div v-if="FlashSale.Products.length" class="dm-grid dm-grid--products promotion-product-grid">
            <ProductCard v-for="Product in FlashSale.Products" :key="`${FlashSale.Id}-${Product.ProductVariantId || Product.ProductId}`" :Product="Product" />
          </div>
        </section>

        <section v-if="Group.Combos.length" class="promotion-combos">
          <header class="promotion-subsection__header">
            <div>
              <span class="promotion-subsection__type promotion-subsection__type--combo"><span class="material-symbols-outlined" aria-hidden="true">redeem</span>Combo</span>
              <h3>Combo tiết kiệm</h3>
            </div>
          </header>
          <div class="combo-grid promotion-combo-grid">
            <ComboCard
              v-for="Combo in Group.Combos"
              :key="Combo.ComboId"
              :Combo="Combo"
              :IsAdding="AddingComboId === Combo.ComboId"
              @add="addCombo"
            />
          </div>
        </section>
      </section>
    </div>

    <section v-else class="promotion-state dm-card">
      <span class="material-symbols-outlined" aria-hidden="true">sell</span>
      <h2>{{ Text.EmptyTitle }}</h2>
      <p>{{ Text.EmptyDescription }}</p>
    </section>
  </main>
</template>

<script setup>
import { computed, inject, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import ComboCard from "@/components/dormmart/ComboCard.vue";
import ProductCard from "@/components/dormmart/ProductCard.vue";
import { getPromotionGroups } from "@/services/promotionService";
import { addComboToCart } from "@/stores/cartStore";
import { formatI18nText } from "@/utils/i18n";

const Text = inject("i18nCommon").Promotion;
const Route = useRoute();
const Router = useRouter();
const PromotionGroups = ref([]);
const IsLoading = ref(true);
const LoadError = ref("");
const AddingComboId = ref("");
const ActionMessage = ref("");
const ActionTone = ref("");

const normalizeFilter = (Value) => ["all", "flash-sale", "combo"].includes(Value) ? Value : "all";
const ActiveFilter = computed(() => normalizeFilter(Route.query.type));
const Filters = computed(() => [
  { Value: "all", Label: Text.AllFilter, Icon: "sell" },
  { Value: "flash-sale", Label: Text.FlashSaleFilter, Icon: "bolt" },
  { Value: "combo", Label: Text.ComboFilter, Icon: "redeem" },
]);
const TotalOfferCount = computed(() => PromotionGroups.value.reduce((Total, Group) => (
  Total + Group.FlashSales.length + Group.Combos.length
), 0));
const VisibleGroups = computed(() => PromotionGroups.value.map((Group) => ({
  ...Group,
  FlashSales: ActiveFilter.value === "combo" ? [] : Group.FlashSales,
  Combos: ActiveFilter.value === "flash-sale" ? [] : Group.Combos,
})).filter((Group) => Group.FlashSales.length || Group.Combos.length));

const selectFilter = (FilterValue) => Router.replace({
  name: "promotionList",
  query: FilterValue === "all" ? {} : { type: FilterValue },
});

const groupLabel = (Group) => Group.SortOrder === null
  ? Text.OtherGroupLabel
  : formatI18nText(Text.GroupLabel, { order: Group.SortOrder });

const groupTitle = (Group) => {
  if (Group.FlashSales.length && Group.Combos.length) return "Flash Sale và combo cùng đợt";
  if (Group.FlashSales.length) return "Giá sốc trong thời gian giới hạn";
  return "Combo mua chung giá tốt";
};

const formatDateTime = (Value) => {
  const DateValue = new Date(Value);
  if (Number.isNaN(DateValue.getTime())) return Value;
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  }).format(DateValue);
};

const loadPromotions = async () => {
  IsLoading.value = true;
  LoadError.value = "";
  try {
    PromotionGroups.value = await getPromotionGroups();
  } catch {
    LoadError.value = Text.LoadError;
  } finally {
    IsLoading.value = false;
  }
};

const addCombo = async (Combo) => {
  AddingComboId.value = Combo.ComboId;
  ActionMessage.value = "";
  try {
    await addComboToCart({ ComboId: Combo.ComboId, Quantity: 1 });
    ActionTone.value = "success";
    ActionMessage.value = Text.AddComboSuccess;
  } catch {
    ActionTone.value = "error";
    ActionMessage.value = Text.AddComboError;
  } finally {
    AddingComboId.value = "";
  }
};

onMounted(loadPromotions);
</script>

<style scoped lang="scss">
.promotion-page {
  display: grid;
  gap: 24px;
  padding-bottom: 48px;
}

.promotion-hero {
  position: relative;
  display: grid;
  min-height: 280px;
  overflow: hidden;
  grid-template-columns: minmax(0, 1fr) 220px;
  align-items: center;
  gap: 32px;
  padding: 48px;
  border-radius: 28px;
  background: linear-gradient(125deg, #7f1d1d 0%, #dc2626 48%, #f59e0b 100%);
  color: #fff;
  box-shadow: 0 24px 60px rgba(185, 28, 28, 0.2);
}

.promotion-hero::after {
  position: absolute;
  width: 360px;
  height: 360px;
  border: 70px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  content: "";
  right: -160px;
  top: -160px;
}

.promotion-hero__content {
  position: relative;
  z-index: 1;
  max-width: 720px;
}

.promotion-hero__eyebrow,
.promotion-subsection__type {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.promotion-hero h1 {
  max-width: 660px;
  margin: 14px 0 12px;
  font-size: clamp(32px, 5vw, 54px);
  line-height: 1.05;
}

.promotion-hero p {
  max-width: 640px;
  margin: 0;
  color: rgba(255, 255, 255, 0.86);
  font-size: 17px;
  line-height: 1.65;
}

.promotion-hero__art {
  position: relative;
  z-index: 1;
  display: grid;
  width: 190px;
  height: 190px;
  place-content: center;
  justify-items: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(12px);
}

.promotion-hero__art .material-symbols-outlined { font-size: 42px; }
.promotion-hero__art strong { font-size: 52px; line-height: 1; }
.promotion-hero__art small { font-size: 14px; font-weight: 700; }

.promotion-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.promotion-filter {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  gap: 7px;
  padding: 0 18px;
  border: 1px solid var(--dm-border);
  border-radius: 999px;
  background: var(--dm-surface);
  color: var(--dm-text);
  cursor: pointer;
  font: inherit;
  font-weight: 750;
  transition: 160ms ease;
}

.promotion-filter:hover,
.promotion-filter--active {
  border-color: var(--dm-danger);
  background: #fff1f2;
  color: var(--dm-danger);
}

.promotion-filter .material-symbols-outlined { font-size: 20px; }

.promotion-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-radius: 14px;
  background: var(--dm-surface-soft);
  color: var(--dm-text);
}

.promotion-alert--success { background: #ecfdf5; color: #047857; }
.promotion-alert--error { background: #fff1f2; color: #be123c; }
.promotion-alert a { margin-left: auto; color: inherit; font-weight: 800; }

.promotion-groups,
.promotion-group,
.promotion-flash,
.promotion-combos {
  display: grid;
  gap: 20px;
}

.promotion-groups { gap: 32px; }

.promotion-group {
  padding: 24px;
  border: 1px solid var(--dm-border);
  border-radius: 24px;
  background: var(--dm-surface);
  box-shadow: var(--dm-shadow-soft, 0 12px 36px rgba(15, 23, 42, 0.06));
}

.promotion-group__header,
.promotion-subsection__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.promotion-group__index {
  color: var(--dm-danger);
  font-size: 12px;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.promotion-group__header h2,
.promotion-subsection__header h3 {
  margin: 5px 0 0;
  color: var(--dm-text);
}

.promotion-group__header h2 { font-size: 24px; }
.promotion-subsection__header h3 { font-size: 19px; }

.promotion-group__counts {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.promotion-flash,
.promotion-combos {
  padding-top: 20px;
  border-top: 1px solid var(--dm-border);
}

.promotion-subsection__type { color: var(--dm-danger); }
.promotion-subsection__type--combo { color: var(--dm-warning-dark, #b45309); }
.promotion-subsection__type .material-symbols-outlined { font-size: 20px; }
.promotion-subsection__header time { color: var(--dm-text-soft); font-size: 13px; font-weight: 700; }

.promotion-product-grid,
.promotion-combo-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.promotion-state {
  display: grid;
  min-height: 280px;
  place-content: center;
  justify-items: center;
  gap: 12px;
  padding: 36px;
  text-align: center;
}

.promotion-state > .material-symbols-outlined { color: var(--dm-primary); font-size: 50px; }
.promotion-state h2,
.promotion-state p { margin: 0; }
.promotion-state p { color: var(--dm-text-soft); }
.promotion-state--error > .material-symbols-outlined { color: var(--dm-danger); }
.promotion-state__spinner { animation: promotion-spin 900ms linear infinite; }

@keyframes promotion-spin { to { transform: rotate(360deg); } }

@media (max-width: 1100px) {
  .promotion-product-grid,
  .promotion-combo-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 720px) {
  .promotion-hero {
    min-height: 0;
    grid-template-columns: 1fr;
    padding: 32px 24px;
  }

  .promotion-hero__art { display: none; }
  .promotion-group { padding: 18px; }
  .promotion-group__header,
  .promotion-subsection__header { align-items: flex-start; flex-direction: column; }
  .promotion-group__counts { justify-content: flex-start; }
  .promotion-product-grid,
  .promotion-combo-grid { grid-template-columns: 1fr; }
}
</style>
