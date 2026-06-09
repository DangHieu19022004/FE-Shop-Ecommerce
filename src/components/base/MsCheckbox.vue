<template>
  <label
    class="ms-checkbox"
    :class="{
      'ms-checkbox--checked':       isChecked,
      'ms-checkbox--indeterminate': indeterminate,
      'ms-checkbox--disabled':      disabled,
    }"
  >
    <!-- Native input ẩn -->
    <input
      type="checkbox"
      class="ms-checkbox__input"
      :name="name"
      :value="value"
      :checked="isChecked"
      :disabled="disabled"
      :indeterminate.prop="indeterminate"
      @change="handleChange"
    />

    <!-- Custom box -->
    <span class="ms-checkbox__box">
      <!-- Checkmark (dấu ✓) -->
      <svg
        v-if="isChecked && !indeterminate"
        class="ms-checkbox__check"
        viewBox="0 0 12 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polyline
          points="1.5,5 4.5,8 10.5,1.5"
          stroke="white"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <!-- Dash (trạng thái indeterminate) -->
      <svg
        v-if="indeterminate"
        class="ms-checkbox__check"
        viewBox="0 0 12 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          x1="2" y1="5" x2="10" y2="5"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </span>

    <!-- Label text -->
    <span v-if="label || $slots.default" class="ms-checkbox__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  /** v-model — có thể là Boolean hoặc Array (khi dùng nhiều checkbox) */
  modelValue: { default: false },
  /** Giá trị của checkbox này (dùng khi modelValue là Array) */
  value:       { default: true },
  /** Text label hiển thị bên phải */
  label:       { type: String,  default: "" },
  name:        { type: String,  default: "" },
  disabled:    { type: Boolean, default: false },
  /** Trạng thái nửa chọn (indeterminate) — thường dùng cho "Chọn tất cả" */
  indeterminate: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(props.value);
  }
  return Boolean(props.modelValue);
});

const handleChange = (e) => {
  if (props.disabled) return;

  if (Array.isArray(props.modelValue)) {
    const newVal = [...props.modelValue];
    if (e.target.checked) {
      if (!newVal.includes(props.value)) newVal.push(props.value);
    } else {
      const idx = newVal.indexOf(props.value);
      if (idx !== -1) newVal.splice(idx, 1);
    }
    emit("update:modelValue", newVal);
  } else {
    emit("update:modelValue", e.target.checked);
  }
};
</script>

<style scoped>
/* ══════════════════════════════════
   Wrapper label
══════════════════════════════════ */
.ms-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  line-height: 1;
  vertical-align: middle;
}

.ms-checkbox--disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* Ẩn native input */
.ms-checkbox__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

/* ══════════════════════════════════
   Custom box
══════════════════════════════════ */
.ms-checkbox__box {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  box-sizing: border-box;
  border-radius: 3px;
  border: 2px solid #d1d5db;
  background: #fff;
  transition: border-color 0.18s ease, background-color 0.18s ease;
}

/* Hover (chưa chọn) */
.ms-checkbox:not(.ms-checkbox--checked):not(.ms-checkbox--indeterminate):not(.ms-checkbox--disabled):hover
  .ms-checkbox__box {
  border-color: #0e9a62;
}

/* Checked */
.ms-checkbox--checked .ms-checkbox__box,
.ms-checkbox--indeterminate .ms-checkbox__box {
  border-color: #0e9a62;
  background-color: #0e9a62;
}

/* ══════════════════════════════════
   SVG checkmark / dash
══════════════════════════════════ */
.ms-checkbox__check {
  display: block;
  width: 8px;
  height: 10px;
  flex-shrink: 0;
}

/* ══════════════════════════════════
   Label text
══════════════════════════════════ */
.ms-checkbox__label {
  font-size: 13px;
  color: #1d2939;
  line-height: 1;
}

.ms-checkbox--checked .ms-checkbox__label,
.ms-checkbox--indeterminate .ms-checkbox__label {
  color: #0e9a62;
}
</style>
