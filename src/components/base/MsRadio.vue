<template>
  <div class="ms-radio" :class="{ 'ms-radio--horizontal': horizontal }">
    <!-- Label của cả nhóm -->
    <label v-if="labelText" class="ms-radio__group-label">
      {{ labelText }}
      <span v-if="isRequired" class="ms-radio__required">*</span>
    </label>

    <!-- Danh sách option -->
    <div
      :class="[
        'ms-radio__options',
        { 'ms-radio__options--horizontal': horizontalInput }
      ]"
    >
      <label
        v-for="option in options"
        :key="option.value"
        class="ms-radio__item"
        :class="{ 'ms-radio__item--checked': modelValue === option.value, 'ms-radio__item--disabled': option.disabled }"
      >
        <input
          type="radio"
          class="ms-radio__input"
          :name="name"
          :value="option.value"
          :checked="modelValue === option.value"
          :disabled="option.disabled"
          @change="emit('update:modelValue', option.value)"
        />
        <!-- Custom radio circle -->
        <span class="ms-radio__circle">
          <span class="ms-radio__dot"></span>
        </span>
        <!-- Option label -->
        <span class="ms-radio__label">{{ option.label }}</span>
      </label>
    </div>

    <!-- Error tooltip -->
    <div v-if="errorMessages" class="ms-radio__tooltip">
      {{ errorMessages }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  /** Tên nhóm radio (dùng cho HTML name attr) */
  name:       { type: String,  default: "ms-radio-group" },
  /** Danh sách option: [{ value, label, disabled? }] */
  options:    { type: Array,   default: () => [] },
  /** v-model: value của option đang được chọn */
  modelValue: { default: null },
  /** Label phía trên (hoặc bên trái khi horizontal) */
  labelText:  { type: String,  default: "" },
  /** Bắt buộc */
  isRequired: { type: Boolean, default: false },
  /** Layout: label nhóm + options nằm trên cùng 1 hàng */
  horizontal: { type: Boolean, default: false },
  /** Layout items: dọc (default) hoặc ngang */
  horizontalInput: { type: Boolean, default: false },
  errorMessages: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue"]);
</script>

<style scoped>
/* ══════════════════════════════════
   Wrapper
══════════════════════════════════ */
.ms-radio {
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
}

.ms-radio--horizontal {
  flex-direction: row;
  align-items: center;
  gap: 0;
}

/* ══════════════════════════════════
   Group label (bên trái khi horizontal)
══════════════════════════════════ */
.ms-radio__group-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  line-height: 36px;
  white-space: nowrap;
  user-select: none;
}

.ms-radio--horizontal .ms-radio__group-label {
  flex: 0 0 200px;
  max-width: 200px;
  padding-right: 12px;
  margin-bottom: 0;
}

.ms-radio__required {
  color: #f44336;
  margin-left: 2px;
  font-weight: 600;
}

/* ══════════════════════════════════
   Options container
══════════════════════════════════ */
.ms-radio__options {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.ms-radio__options--horizontal {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px;
  min-height: 36px;
}

/* ══════════════════════════════════
   Mỗi radio item
══════════════════════════════════ */
.ms-radio__item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  line-height: 1;
}

.ms-radio__item--disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* Ẩn input native */
.ms-radio__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

/* ══════════════════════════════════
   Custom radio circle
══════════════════════════════════ */
.ms-radio__circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  background: #fff;
  flex-shrink: 0;
}

/* Dot bên trong */
.ms-radio__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fff;
}

/* Checked state */
.ms-radio__item--checked .ms-radio__circle {
  border-color: #0e9a62;
}

.ms-radio__item--checked .ms-radio__circle .ms-radio__dot {
  background-color: #0e9a62;
}


/* Hover (chưa chọn) */
.ms-radio__item:not(.ms-radio__item--checked):not(.ms-radio__item--disabled):hover .ms-radio__circle {
  border-color: #0e9a62;
}

/* ══════════════════════════════════
   Option label text
══════════════════════════════════ */
.ms-radio__label {
  font-size: 13px;
  color: #1d2939;
  line-height: 1;
}

.ms-radio__item--checked .ms-radio__label {
  font-weight: 500;
}

/* ══════════════════════════════════
   Error tooltip
══════════════════════════════════ */
.ms-radio__tooltip {
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

.ms-radio:hover .ms-radio__tooltip {
  opacity: 1;
  visibility: visible;
}
</style>
