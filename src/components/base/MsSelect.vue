<template>
  <div class="ms-select" :class="{ 'ms-select--horizontal': horizontal }">
    <!-- Label -->
    <label v-if="labelText" class="ms-select__label">
      {{ labelText }}
      <span v-if="isRequired" class="ms-select__required">*</span>
    </label>

    <!-- Multiselect -->
    <div class="ms-select__control">
      <Multiselect
        ref="multiselectRef"
        v-model="selected"
        :options="data"
        :label="optionLabel"
        :track-by="trackBy"
        :placeholder="placeholder"
        :searchable="searchable"
        :allow-empty="allowEmpty"
        :show-labels="false"
        class="ms-multiselect"
        :class="{ 'ms-multiselect--error': errorMessages }"
        :style="width ? { width: typeof width === 'number' ? width + 'px' : width } : {}"
        @select="handleSelect"
        @remove="handleRemove"
        @open="handleFocus"
        @close="handleBlur"
      >
        <template #noOptions>
          <span class="ms-multiselect__empty">Không có dữ liệu</span>
        </template>
        <template #noResult>
          <span class="ms-multiselect__empty">Không tìm thấy kết quả</span>
        </template>
        <template #option="slotProps">
          <slot name="option" v-bind="slotProps">
            <span class="ms-multiselect__option-content">
              <span class="ms-multiselect__option-label">
                {{ slotProps.option?.[optionLabel] }}
              </span>
            </span>
          </slot>
        </template>
        <!-- Custom caret: dùng icon font mi-chevron-down, xoay khi mở -->
        <template #caret="{ toggle }">
          <span
            class="ms-multiselect__caret"
            :class="{ 'ms-multiselect__caret--open': isOpen }"
            @mousedown.prevent.stop="toggle"
          >
            <i class="mi-chevron-down"></i>
          </span>
        </template>
      </Multiselect>

      <!-- Error tooltip -->
      <div v-if="errorMessages" class="ms-input__tooltip">
        {{ errorMessages }}
      </div>
    </div>
  </div>
</template>

<script setup>
import Multiselect from "vue-multiselect";
import { ref, watch } from "vue";

const isOpen = ref(false);
const multiselectRef = ref(null);

const props = defineProps({
  name:       { type: String,  default: "" },
  id:         { type: String,  default: "" },
  /** Danh sách options */
  data:       { type: Array,   default: () => [] },
  /** v-model (theo trackBy key) */
  modelValue: { default: null },
  /** Text label hiển thị phía trên (hoặc bên trái khi horizontal) */
  labelText:  { type: String,  default: "" },
  /** Key trong object dùng hiển thị text option */
  optionLabel:{ type: String,  default: "label" },
  /** Key trong object dùng làm value */
  trackBy:    { type: String,  default: "value" },
  placeholder:{ type: String,  default: "" },
  searchable: { type: Boolean, default: false },
  allowEmpty: { type: Boolean, default: true },
  errorMessages: { type: String,  default: "" },
  isRequired: { type: Boolean, default: false },
  /** Nếu true: label & input nằm cùng hàng ngang */
  horizontal: { type: Boolean, default: false },
  /**
   * Set cứng width cho phần ô input (không tính label).
   * Nhận số (px) hoặc string CSS: :width="315" hoặc width="315px"
   */
  width: { type: [Number, String], default: null },
});

const emit = defineEmits(["update:modelValue", "blur", "change", "focus"]);

const selected = ref(
  props.data.find((item) => item[props.trackBy] === props.modelValue) ?? null
);

watch(
  () => props.modelValue,
  (val) => {
    selected.value =
      props.data.find((item) => item[props.trackBy] === val) ?? null;
  }
);

const handleSelect = (option) => {
  emit("update:modelValue", option?.[props.trackBy] ?? null);
  emit("change", option);
};
const handleRemove = () => {
  emit("update:modelValue", null);
  emit("change", null);
};
const handleBlur  = () => { isOpen.value = false; emit("blur"); };
const handleFocus = () => { isOpen.value = true;  emit("focus"); };

defineExpose({
  focus: () => {
    multiselectRef.value?.activate?.();
    multiselectRef.value?.$el?.focus?.();
    multiselectRef.value?.$el?.click?.();
  },
});
</script>

<style>
@import "vue-multiselect/dist/vue-multiselect.css";

/* ══════════════════════════
   Wrapper
══════════════════════════ */
.ms-select {
  display: flex;
  flex-direction: column;
  /* Không set cứng width: 100% — để parent/class override tự do.
     display: flex block-level tự nhiên full-width trừng khi bị giới hạn */
  position: relative;
}

/* Layout ngang: label bên trái, control bên phải */
.ms-select--horizontal {
  flex-direction: row;
  align-items: center;
  gap: 0;
}
.ms-select--horizontal .ms-select__label {
  flex: 0 0 200px;
  max-width: 200px;
  margin-bottom: 0;
  padding-right: 12px;
  white-space: nowrap;
  line-height: 36px;
}
.ms-select--horizontal .ms-select__control {
  flex: 1 1 0;
  min-width: 0;
}


/* ══════════════════════════
   Label
══════════════════════════ */
.ms-select__label {
  display: block;
  margin-bottom: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #344054;
  line-height: 1.4;
}
.ms-select__required {
  color: #f44336;
  margin-left: 2px;
  font-weight: 600;
}

/* Control wrapper (relative context cho tooltip) */
.ms-select__control {
  position: relative;
  width: 100%;
}

/* ══════════════════════════
   Root multiselect element
══════════════════════════ */
.ms-multiselect.multiselect {
  min-height: 36px;
  /* QUAN TRỌNG: đây là positioning context của .multiselect__select */
  position: relative;
}

/* ══════════════════════════
   Tags (ô input trigger)
══════════════════════════ */
.ms-multiselect .multiselect__tags {
  min-height: 36px;
  /* padding-right nhường chỗ cho icon (36px) */
  padding: 0 36px 0 12px;
  border: 1.5px solid #d0d5dd;
  border-radius: 4px;
  background: #fff;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: border-color 0.2s;
  box-shadow: none;
}

.ms-multiselect .multiselect__tags:hover {
  border-color: #2ab5a8;
}

.ms-multiselect.multiselect--active .multiselect__tags {
  border-color: #2ab5a8;
  border-radius: 4px 4px 0 0;
}

.ms-multiselect.ms-multiselect--error .multiselect__tags {
  border-color: #f44336 !important;
}

/* ══════════════════════════
   Text đã chọn & placeholder
══════════════════════════ */
.ms-multiselect .multiselect__single {
  font-size: 14px;
  color: #1d2939;
  line-height: 22px;
  margin: 0;
  padding: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: transparent;
}

.ms-multiselect .multiselect__placeholder {
  font-size: 14px;
  color: #98a2b3;
  margin: 0;
  padding: 0;
  line-height: 22px;
}

/* ══════════════════════════
   Input (searchable)
══════════════════════════ */
.ms-multiselect .multiselect__input {
  font-size: 14px;
  color: #1d2939;
  padding: 0;
  margin: 0;
  line-height: 22px;
  border: none;
  background: transparent;
  box-shadow: none;
}
.ms-multiselect .multiselect__input:focus {
  outline: none;
}

/* ══════════════════════════
   Icon chevron — dùng slot #caret
══════════════════════════ */

/* Ẩn button mặc định của thư viện */
.ms-multiselect .multiselect__select {
  display: none;
}

.ms-multiselect__caret {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  pointer-events: auto;
  cursor: pointer;
  transition: transform 0.2s ease, color 0.2s ease;
  z-index: 2;
}

.ms-multiselect__caret--open {
  transform: translateY(-50%) rotate(180deg);
  color: #2ab5a8;
}

/* ══════════════════════════
   Dropdown panel
══════════════════════════ */
.ms-multiselect .multiselect__content-wrapper {
  border: 1.5px solid #2ab5a8;
  border-top: none;
  border-radius: 0 0 4px 4px;
  background: #fff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  overflow-y: auto;
  max-height: 280px;
  scrollbar-width: thin;
  scrollbar-color: #d0d5dd transparent;
}
.ms-multiselect .multiselect__content-wrapper::-webkit-scrollbar {
  width: 5px;
}
.ms-multiselect .multiselect__content-wrapper::-webkit-scrollbar-track {
  background: transparent;
}
.ms-multiselect .multiselect__content-wrapper::-webkit-scrollbar-thumb {
  background-color: #c5cdd9;
  border-radius: 3px;
}

/* ══════════════════════════
   Options
══════════════════════════ */
.ms-multiselect .multiselect__content {
  width: 100%;
}

.ms-multiselect .multiselect__option {
  font-size: 14px;
  color: #2ab5a8;
  padding: 10px 16px;
  min-height: unset;
  line-height: 20px;
  white-space: normal;
  cursor: pointer;
  background: transparent;
  transition: background 0.12s;
}

.ms-multiselect .multiselect__option:hover,
.ms-multiselect .multiselect__option--highlight {
  background: #f0fbfa;
  color: #1a9a8e;
}

.ms-multiselect .multiselect__option--selected {
  font-weight: 600;
  color: #1a9a8e;
  background: #e6f7f6;
}

.ms-multiselect .multiselect__option--selected.multiselect__option--highlight {
  background: #d0f0ee;
  color: #1a9a8e;
}

.ms-multiselect__option-content {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.ms-multiselect__option-icon {
  display: inline-flex;
  align-items: center;
}

/* ══════════════════════════
   Empty / no result
══════════════════════════ */
.ms-multiselect__empty {
  font-size: 13px;
  color: #98a2b3;
  padding: 10px 16px;
  display: block;
}

/* ══════════════════════════
   Error tooltip
══════════════════════════ */
.ms-input__tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  background: #f44336;
  color: #fff;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: 0.2s;
  z-index: 999;
}
.ms-select__control:hover .ms-input__tooltip {
  opacity: 1;
  visibility: visible;
}
</style>
