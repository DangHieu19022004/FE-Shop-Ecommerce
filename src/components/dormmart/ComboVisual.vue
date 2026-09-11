<script setup>
import { computed } from "vue";

const Props = defineProps({
  Items: {
    type: Array,
    default: () => [],
  },
  AltText: {
    type: String,
    default: "",
  },
  Icon: {
    type: String,
    default: "inventory_2",
  },
});

const VisualItems = computed(() => Props.Items
  .filter((Item) => Item?.ImageUrl)
  .slice(0, 4));
const LayoutCount = computed(() => Math.min(VisualItems.value.length, 4));
</script>

<template>
  <figure class="combo-visual" :class="`combo-visual--${LayoutCount}`" :aria-label="AltText">
    <template v-if="VisualItems.length">
      <span v-for="Item in VisualItems" :key="Item.ComboItemId || Item.ProductVariantId" class="combo-visual__item">
        <img :src="Item.ImageUrl" :alt="Item.ProductName || AltText" />
      </span>
    </template>
    <span v-else class="combo-visual__fallback material-symbols-outlined" aria-hidden="true">{{ Icon }}</span>
  </figure>
</template>

<style scoped lang="scss">
.combo-visual {
  display: grid;
  width: 100%;
  height: 100%;
  min-height: inherit;
  margin: 0;
  overflow: hidden;
  background: linear-gradient(135deg, var(--dm-primary-soft), var(--dm-surface-soft));
}

.combo-visual--1 {
  grid-template-columns: 1fr;
}

.combo-visual--2,
.combo-visual--4 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.combo-visual--3 {
  grid-template-columns: 1.35fr 1fr;
  grid-template-rows: repeat(2, minmax(0, 1fr));
}

.combo-visual--3 .combo-visual__item:first-child {
  grid-row: 1 / -1;
}

.combo-visual__item,
.combo-visual__fallback {
  display: grid;
  min-width: 0;
  min-height: 0;
  place-items: center;
}

.combo-visual__item {
  overflow: hidden;
}

.combo-visual__item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.combo-visual__fallback {
  color: var(--dm-primary);
  font-size: clamp(54px, 10vw, 96px);
}
</style>
