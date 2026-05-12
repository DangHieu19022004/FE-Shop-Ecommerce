<template lang="">
  <div class="ms-select">
    <select
      :name="name"
      :id="id"
      :class="['hvp', { 'ms-select--error': props.errorMessages }]"
      :value="modelValue"
      @change="handleSelect"
      @blur="handleBlur"
      @focus="handleFocus"
    >
      <option value="" disabled>Chọn {{ props.keyChosen }}</option>
      <option v-for="(item, index) in data" :key="index" :value="item.value">
        {{ item.label }}
      </option>
    </select>
    <!-- <p
      v-if="props.errorMessages"
      :class="[
        'ms-select__error',
        { 'ms-select__error--visible': props.errorMessages }
      ]"
    >
      {{ props.errorMessages || "\u00A0" }}
    </p> -->
    <div v-if="props.errorMessages" class="ms-input__tooltip">
      {{ props.errorMessages || "" }}
    </div>
  </div>
</template>
<script setup>
import { defineProps, defineEmits } from "vue";
/**
 * NOTICE: PROP
 */
const props = defineProps({
  name: {
    type: String,
    default: "",
  },
  id: {
    type: String,
    default: "",
  },
  data: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: String,
    default: "",
  },
  keyChosen: {
    type: String,
    default: "",
  },
  errorMessages: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(["update:modelValue", "blur", "change", "focus"]);

/**
 * FUNCTION:
 */
const handleSelect = (event) => {
  const target = event.target;
  emit("update:modelValue", target.value);
  emit("change");
};
const handleBlur = () => {
  emit("blur");
};
const handleFocus = () => {
  emit("focus");
};
</script>
<style>
.hvp {
  cursor: pointer;
}
.ms-select {
  position: relative;
}
.ms-select select.ms-select--error {
  border: 1px solid #f44336 !important;
}
.ms-select__error {
  min-height: 16px;
  font-size: 12px;
  color: transparent;
}
.ms-select__error--visible {
  color: #f44336 !important;
}

.ms-input__tooltip {
  position: absolute;

  bottom: calc(100% + 8px);
  left: 0;

  background: #f44336 !important;
  color: white;

  padding: 6px 10px;
  border-radius: 4px;

  font-size: 12px;
  white-space: nowrap;

  opacity: 0;
  visibility: hidden;

  transition: 0.2s;
  z-index: 999;
}

/* hover input -> hiện tooltip */
.ms-select:hover .ms-input__tooltip {
  opacity: 1;
  visibility: visible;
}
</style>