<template>
  <div class="ms-select" :class="{ 'ms-select--horizontal': horizontal }">
    <!-- Label -->
    <label v-if="labelText" class="ms-select__label">
      {{ labelText }}
      <span v-if="isRequired" class="ms-select__required">*</span>
    </label>

    <!-- Multiselect -->
    <div class="ms-select__control">
      <Multiselect ref="multiselectRef" v-model="selected" :options="data" :label="optionLabel" :track-by="trackBy"
        :placeholder="placeholder" :searchable="searchable" :allow-empty="allowEmpty" :show-labels="false"
        :disabled="disabled" class="ms-multiselect" :class="{ 'ms-multiselect--error': errorMessages }"
        :style="width ? { width: typeof width === 'number' ? width + 'px' : width } : {}" @select="handleSelect"
        @remove="handleRemove" @open="handleFocus" @close="handleBlur">
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
        <template #singleLabel="slotProps">
          <slot name="singleLabel" v-bind="slotProps">
            <span class="ms-multiselect__option-content">
              <span class="ms-multiselect__option-label">
                {{ slotProps.option?.[optionLabel] }}
              </span>
            </span>
          </slot>
        </template>
        <!-- Custom caret: dùng icon font mi-chevron-down, xoay khi mở -->
        <template #caret="{ toggle }">
          <span class="ms-multiselect__caret" :class="{ 'ms-multiselect__caret--open': isOpen }"
            @mousedown.prevent.stop="toggle">
            <i class="mi-chevron-down"></i>
          </span>
        </template>
      </Multiselect>

      <!-- Error tooltip -->
      <!-- <div v-if="errorMessages" class="ms-input__tooltip">
        {{ errorMessages }}
      </div> -->
    </div>
  </div>
</template>

<script setup>
import Multiselect from "vue-multiselect";
import { ref, watch } from "vue";

// Trạng thái đóng/mở dropdown của multiselect
const isOpen = ref(false);
// Tham chiếu đến component Multiselect để gọi các method nội tại (như focus, activate)
const multiselectRef = ref(null);

const props = defineProps({
  name: { type: String, default: "" },
  id: { type: String, default: "" },
  /** Danh sách options */
  data: { type: Array, default: () => [] },
  /** v-model (theo trackBy key) */
  modelValue: { default: null },
  /** Text label hiển thị phía trên (hoặc bên trái khi horizontal) */
  labelText: { type: String, default: "" },
  /** Key trong object dùng hiển thị text option */
  optionLabel: { type: String, default: "label" },
  /** Key trong object dùng làm value */
  trackBy: { type: String, default: "value" },
  placeholder: { type: String, default: "" },
  searchable: { type: Boolean, default: false },
  allowEmpty: { type: Boolean, default: true },
  errorMessages: { type: String, default: "" },
  isRequired: { type: Boolean, default: false },
  /** Nếu true: label & input nằm cùng hàng ngang */
  horizontal: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  /**
   * Set cứng width cho phần ô input (không tính label).
   * Nhận số (px) hoặc string CSS: :width="315" hoặc width="315px"
   */
  width: { type: [Number, String], default: null },
});

const emit = defineEmits(["update:modelValue", "blur", "change", "focus"]);

// State lưu giá trị đã chọn (object chứa data tương ứng với modelValue)
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

/**
 * Xử lý sự kiện khi chọn một option.
 *
 * Sử dụng khi: Người dùng click vào một dòng trong dropdown list.
 *
 * @param {Object} option Option vừa được chọn
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const handleSelect = (option) => {
  emit("update:modelValue", option?.[props.trackBy] ?? null);
  emit("change", option);
};

/**
 * Xử lý sự kiện khi xóa option đã chọn.
 *
 * Sử dụng khi: Người dùng xóa dữ liệu trong ô select.
 *
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const handleRemove = () => {
  emit("update:modelValue", null);
  emit("change", null);
};

/**
 * Xử lý sự kiện mất focus (blur) khỏi input select.
 *
 * Sử dụng khi: Đóng dropdown và emit sự kiện blur ra bên ngoài.
 *
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const handleBlur = () => { isOpen.value = false; emit("blur"); };

/**
 * Xử lý sự kiện focus vào input select.
 *
 * Sử dụng khi: Mở dropdown và emit sự kiện focus ra bên ngoài.
 *
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const handleFocus = () => { isOpen.value = true; emit("focus"); };

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
  min-height: 32px;
  /* padding-right nhường chỗ cho icon (36px) */
  padding: 0 32px 0 12px;
  border: 1.5px solid #d0d5dd;
  border-radius: 8px;
  background: #fff;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: border-color 0.2s;
  box-shadow: none;
}

.ms-multiselect .multiselect__tags:hover {
  border-color: #0E9A62;
}

.ms-multiselect.multiselect--active .multiselect__tags {
  border-color: #0E9A62;
  border-radius: 8px;
}

.ms-multiselect.ms-multiselect--error .multiselect__tags {
  border-color: #f44336 !important;
}

.ms-multiselect.multiselect--disabled {
  opacity: 0.8;
  background: transparent;
  pointer-events: none;
}

.ms-multiselect.multiselect--disabled .multiselect__tags {
  background: #eff1f4 !important;
  border-color: #d1d5db !important;
  cursor: not-allowed;
}

/* ══════════════════════════
   Text đã chọn & placeholder
══════════════════════════ */
.ms-multiselect .multiselect__single {
  font-size: 13px;
  color: #1d2939;
  line-height: 22px;
  margin: 0;
  padding: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: transparent;
  width: 100%;
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
  color: #0E9A62;
}

/* ══════════════════════════
   Dropdown panel
══════════════════════════ */
.ms-multiselect .multiselect__content-wrapper {
  border: 1.5px solid #D5D7DA;
  border-radius: 8px;
  background: #fff;
  overflow-y: auto;
  max-height: 280px;
  scrollbar-width: thin;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
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
  color: #1f2937;
  /* màu chữ mặc định: đen */
  padding: 10px 16px;
  min-height: unset;
  line-height: 20px;
  white-space: normal;
  cursor: pointer;
  background: transparent;
  transition: background 0.12s, color 0.12s;
}

/* Hover → nền xám nhạt */
.ms-multiselect .multiselect__option:hover,
.ms-multiselect .multiselect__option--highlight {
  background: #f3f4f6;
  color: #111827;
}

/* Đang được chọn → nền xanh lá nhạt, chữ xanh lá đậm */
.ms-multiselect .multiselect__option--selected {
  font-weight: 500;
  color: #15803d;
  background: #dcfce7;
}

/* Hover khi đang được chọn */
.ms-multiselect .multiselect__option--selected.multiselect__option--highlight {
  background: #bbf7d0;
  color: #15803d;
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
