<template>
  <section class="combo-page">
    <header class="combo-hero">
      <div class="combo-hero__content">
        <span class="combo-hero__eyebrow"><span class="material-symbols-outlined" aria-hidden="true">auto_awesome</span>{{ Text.Eyebrow }}</span>
        <h1>{{ Text.Title }}</h1>
        <p>{{ Text.Subtitle }}</p>
        <div class="combo-hero__search">
          <span class="material-symbols-outlined" aria-hidden="true">search</span>
          <DMInput v-model="Search" :placeholder="Text.SearchPlaceholder" :aria-label="Text.SearchLabel" />
        </div>
      </div>
      <div class="combo-hero__stats" aria-hidden="true">
        <div><strong>{{ formatI18nText(Text.ComboCount, { count: AllCombos.length }) }}</strong></div>
        <div><strong>{{ formatCurrency(TotalSaving) }}</strong><span>{{ Text.SavingPrefix }}</span></div>
        <span class="material-symbols-outlined">redeem</span>
      </div>
    </header>

    <nav class="combo-categories" :aria-label="Text.CategoryLabel">
      <button
        v-for="Category in Categories"
        :key="Category.CategoryCode"
        type="button"
        class="combo-category"
        :class="{ 'combo-category--active': SelectedCategoryCode === Category.CategoryCode }"
        @click="selectCategory(Category.CategoryCode)"
      >
        <span class="material-symbols-outlined" aria-hidden="true">{{ Category.Icon }}</span>
        <span>{{ Category.Name }}</span>
      </button>
    </nav>

    <div v-if="ActionMessage" class="combo-alert" :class="`combo-alert--${ActionTone}`" role="status">
      <span class="material-symbols-outlined" aria-hidden="true">{{ ActionTone === 'success' ? 'check_circle' : 'error' }}</span>
      {{ ActionMessage }}
      <router-link v-if="ActionTone === 'success'" :to="{ name: 'cart' }">{{ Text.ViewCart }}</router-link>
    </div>

    <section v-if="FeaturedCombo" class="combo-featured">
      <div>
        <span class="combo-section__eyebrow">{{ Text.FeaturedTitle }}</span>
        <h2>{{ FeaturedCombo.Name }}</h2>
        <p>{{ FeaturedCombo.Description }}</p>
        <ul>
          <li v-for="Item in FeaturedCombo.Items.slice(0, 4)" :key="Item.ComboItemId">
            <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
            {{ Item.ProductName }} × {{ Item.Quantity }}
          </li>
        </ul>
        <router-link :to="{ name: 'comboDetail', params: { slug: FeaturedCombo.Slug } }" class="dm-btn combo-featured__action">
          {{ Text.ViewDetail }}
          <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
        </router-link>
      </div>
      <div class="combo-featured__visual">
        <ComboVisual :Items="FeaturedCombo.Items" :AltText="FeaturedCombo.Name" :Icon="FeaturedCombo.Icon" />
        <div><span>{{ Text.ComboPrice }}</span><strong>{{ formatCurrency(FeaturedCombo.ComboPrice) }}</strong></div>
      </div>
    </section>

    <section class="combo-catalog">
      <div class="combo-section__header">
        <div>
          <span class="combo-section__eyebrow">{{ formatI18nText(Text.ComboCount, { count: FilteredCombos.length }) }}</span>
          <h2>{{ Text.AllComboTitle }}</h2>
        </div>
      </div>

      <div v-if="FilteredCombos.length" class="combo-grid">
        <ComboCard
          v-for="Combo in FilteredCombos"
          :key="Combo.ComboId"
          :Combo="Combo"
          :IsAdding="AddingComboId === Combo.ComboId"
          @add="addCombo"
        />
      </div>
      <div v-else class="combo-empty dm-card">
        <span class="material-symbols-outlined" aria-hidden="true">search_off</span>
        <h2>{{ Text.EmptyTitle }}</h2>
        <p>{{ Text.EmptyDescription }}</p>
        <button type="button" class="dm-btn" @click="resetFilters">{{ Text.ResetFilter }}</button>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, inject, onMounted, ref } from "vue";
import ComboCard from "@/components/dormmart/ComboCard.vue";
import ComboVisual from "@/components/dormmart/ComboVisual.vue";
import DMInput from "@/components/base/DMInput.vue";
import { getComboCategories, getCombos } from "@/services/comboService";
import { addComboToCart } from "@/stores/cartStore";
import { formatI18nText } from "@/utils/i18n";
import { formatCurrency } from "@/utils/shopFormatters";

const Text = inject("i18nCommon").Combo;
const Categories = ref([]);
const AllCombos = ref([]);
const SelectedCategoryCode = ref("ALL");
const Search = ref("");
const AddingComboId = ref("");
const ActionMessage = ref("");
const ActionTone = ref("");

const FilteredCombos = computed(() => {
  const NormalizedSearch = Search.value.trim().toLocaleLowerCase("vi");
  return AllCombos.value
    .filter((Item) => SelectedCategoryCode.value === "ALL" || Item.CategoryCode === SelectedCategoryCode.value)
    .filter((Item) => !NormalizedSearch
      || Item.Name.toLocaleLowerCase("vi").includes(NormalizedSearch)
      || Item.Description.toLocaleLowerCase("vi").includes(NormalizedSearch)
      || Item.Items.some((ComboItem) => ComboItem.ProductName.toLocaleLowerCase("vi").includes(NormalizedSearch)));
});

const FeaturedCombo = computed(() => FilteredCombos.value.find((Item) => Item.IsFeatured) || FilteredCombos.value[0] || null);
const TotalSaving = computed(() => AllCombos.value.reduce(
  (Total, Item) => Total + Math.max(0, Item.OriginalPrice - Item.ComboPrice),
  0,
));

const loadCombos = async () => {
  [Categories.value, AllCombos.value] = await Promise.all([
    getComboCategories(),
    getCombos(),
  ]);
};

const selectCategory = (CategoryCode) => {
  SelectedCategoryCode.value = CategoryCode;
};

const resetFilters = () => {
  SelectedCategoryCode.value = "ALL";
  Search.value = "";
};

const addCombo = async (Combo) => {
  AddingComboId.value = Combo.ComboId;
  ActionMessage.value = "";

  try {
    await addComboToCart({ ComboId: Combo.ComboId, Quantity: 1 });
    ActionTone.value = "success";
    ActionMessage.value = Text.AddSuccess;
  } catch {
    ActionTone.value = "error";
    ActionMessage.value = Text.AddError;
  } finally {
    AddingComboId.value = "";
  }
};

onMounted(loadCombos);
</script>
