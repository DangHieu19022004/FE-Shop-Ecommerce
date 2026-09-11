<script setup>
import { computed } from "vue";
import DMSelect from "@/components/base/DMSelect.vue";
import { formatCurrency } from "@/utils/shopFormatters";

const props = defineProps({
  modelValue: {
    type: [String, null],
    default: "",
  },
  Options: {
    type: Array,
    default: () => [],
  },
  Label: {
    type: String,
    default: "",
  },
  Description: {
    type: String,
    default: "",
  },
  Placeholder: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);

const InnerValue = computed(() => props.modelValue || null);

const updateValue = (Value) => {
  emit("update:modelValue", Value || "");
};
</script>

<template>
  <div class="admin-product-variant-combobox">
    <DMSelect
      :model-value="InnerValue"
      :data="Options"
      :label-text="Label"
      :placeholder="Placeholder"
      option-label="Label"
      track-by="Value"
      searchable
      @update:model-value="updateValue"
    >
      <template #option="{ option }">
        <span class="admin-product-variant-combobox__option">
          <img v-if="option.ImageUrl" :src="option.ImageUrl" :alt="option.ProductName" />
          <span v-else class="admin-product-variant-combobox__fallback material-symbols-outlined" aria-hidden="true">inventory_2</span>
          <span class="admin-product-variant-combobox__content">
            <strong>{{ option.ProductName }}</strong>
            <small>{{ option.Description || option.ProductCode }}</small>
            <em>{{ formatCurrency(option.Price || 0) }}</em>
          </span>
        </span>
      </template>

      <template #singleLabel="{ option }">
        <span class="admin-product-variant-combobox__selected">
          <img v-if="option.ImageUrl" :src="option.ImageUrl" :alt="option.ProductName" />
          <span v-else class="admin-product-variant-combobox__selected-fallback material-symbols-outlined" aria-hidden="true">inventory_2</span>
          <span>{{ option.Label }}</span>
        </span>
      </template>
    </DMSelect>
    <p v-if="Description" class="admin-product-variant-combobox__description">{{ Description }}</p>
  </div>
</template>

<style scoped lang="scss">
.admin-product-variant-combobox {
  display: grid;
  gap: 7px;
  min-width: 0;
}

.admin-product-variant-combobox__description {
  order: -1;
  margin: 21px 0 -2px;
  color: var(--dm-text-soft);
  font-size: 12px;
  font-weight: 400;
  line-height: 1.45;
  user-select: text;
}

.admin-product-variant-combobox__option {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  width: 100%;
}

.admin-product-variant-combobox__option img,
.admin-product-variant-combobox__fallback {
  width: 48px;
  height: 48px;
  border-radius: 12px;
}

.admin-product-variant-combobox__option img {
  object-fit: cover;
}

.admin-product-variant-combobox__fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--dm-surface-soft);
  color: var(--dm-text-soft);
}

.admin-product-variant-combobox__content {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.admin-product-variant-combobox__content strong,
.admin-product-variant-combobox__content small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-product-variant-combobox__content strong {
  color: var(--dm-text);
  font-size: 13px;
  font-weight: 700;
}

.admin-product-variant-combobox__content small {
  color: var(--dm-text-soft);
  font-size: 12px;
  font-weight: 400;
}

.admin-product-variant-combobox__content em {
  color: var(--dm-primary);
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
}

.admin-product-variant-combobox__selected {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.admin-product-variant-combobox__selected img,
.admin-product-variant-combobox__selected-fallback {
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  border-radius: 8px;
}

.admin-product-variant-combobox__selected img {
  object-fit: cover;
}

.admin-product-variant-combobox__selected-fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--dm-surface-soft);
  color: var(--dm-text-soft);
  font-size: 18px;
}

.admin-product-variant-combobox__selected span:last-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
