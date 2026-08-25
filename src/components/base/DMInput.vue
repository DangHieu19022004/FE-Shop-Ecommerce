<template lang="">
  <div :class="['ms-input', { 'ms-input--horizontal': horizontal }]">
    <label v-if="label" class="ms-input__label" :for="id">{{ label }} <span v-if="isRequired" class="color-red"> *</span></label>
    <input
      ref="inputRef"
      :class="['ms-input-in', props.class, { 'ms-input--error': props.errorMessages, 'ms-input-in--trailing-action': hasTrailingAction }]"
      :value="props.type === 'file' ? '' : modelValue"
      :type="type"
      :placeholder="placeholder"
      :name="name"
      :id="id"
      :accept="accept"
      :disabled="disabled"
      @input="handleInput"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    />
    <p
      v-if="props.errorMessages"
      class="ms-input__error ms-input__error--visible"
      role="alert"
    >{{ props.errorMessages }}</p>
    <!-- <div v-if="props.errorMessages" class="ms-input__tooltip">
      {{ props.errorMessages || "" }}
    </div> -->
  </div>
</template>
<script setup>
import { ref } from "vue";
const props = defineProps({
  class: {
    type: String,
    default: "",
  },
  errorMessages: {
    type: String,
    default: "",
  },
  modelValue: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "text",
  },
  placeholder: {
    type: String,
    default: "",
  },
  label: {
    type: String,
    default: "",
  },
  name: {
    type: String,
    default: "",
  },
  id: {
    type: String,
    default: "",
  },
  accept: {
    type: String,
    default: "",
  },
  isRequired: {
    type: Boolean,
    default: false,
  },
  horizontal: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  hasTrailingAction: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["update:modelValue", "blur", "focus", "change"]);
const inputRef = ref(null);
defineExpose({
  click: () => inputRef.value?.click(),
  focus: () => inputRef.value?.focus(),
});
const handleBlur = () => {
  emit("blur");
};
const handleChange = (event) => {
  emit("change", event);
};
const handleInput = (event) => {
  const target = event.target;
  if (props.type === "file") {
    //không chọn file thì cho null
    emit("update:modelValue", target.files ? target.files[0] : null);
    return;
  }
  emit("update:modelValue", target.value);
};
const handleFocus = () => {
  emit("focus");
};
</script>
<style>
.ms-input {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 7px;
  width: 100%;
}

/* Layout 2 cột: label trái, input phải */
.ms-input--horizontal {
  flex-direction: row;
  gap: 0;
}

.ms-input--horizontal .ms-input__label {
  flex: 0 0 200px;
  min-width: 200px;
  margin-bottom: 0;
  padding-right: 12px;
  font-size: 13px;
  color: #374151;
  line-height: 32px;
}

.ms-input--horizontal .ms-input-in {
  flex: 1;
  min-width: 0;
}

.ms-input--horizontal .ms-input__tooltip {
  left: 200px;
}


.ms-input__label {
  display: block;
  margin-bottom: 0;
  color: var(--dm-text);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
  user-select: none;
}

.ms-input-in {
  width: 100%;
  min-height: 46px;
  padding: 0 14px;
  border: 1px solid var(--dm-border);
  border-radius: 12px;
  background-color: var(--dm-surface);
  color: var(--dm-text);
  font: inherit;
  font-size: 14px;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}

.ms-input-in::placeholder {
  color: var(--dm-text-soft);
  font-size: 14px;
  opacity: 0.7;
}

.ms-input-in--trailing-action {
  padding-right: 50px;
}

.ms-input-in:hover {
  border-color: var(--dm-primary);
  background-color: var(--dm-overlay-soft);
}

.ms-input-in:focus {
  border-color: var(--dm-primary);
  background-color: var(--dm-surface);
  box-shadow: 0 0 0 3px var(--dm-focus-ring);
}

.ms-input-in:disabled {
  background-color: var(--dm-surface-soft);
  color: var(--dm-text-soft);
  cursor: not-allowed;
  border-color: var(--dm-border) !important;
}

.ms-input-in:disabled:hover {
  background-color: var(--dm-surface-soft);
  border-color: var(--dm-border) !important;
}

.ms-input .ms-input--error {
  border-color: var(--dm-danger) !important;
  background-color: var(--dm-danger-soft);
}

.ms-input .ms-input--error:hover,
.ms-input .ms-input--error:focus {
  border-color: var(--dm-danger) !important;
  box-shadow: 0 0 0 3px var(--dm-danger-soft);
}

/* Tooltip lỗi */
.ms-input__tooltip {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 0;
  background: #f44336;
  color: #fff;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.15s ease, visibility 0.15s ease;
  z-index: 999;
  pointer-events: none;
}

.ms-input__tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 12px;
  border: 5px solid transparent;
  border-top-color: #f44336;
}

.ms-input:hover .ms-input__tooltip {
  opacity: 1;
  visibility: visible;
}

.ms-input__error {
  min-height: 0;
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
}

.ms-input__error--visible {
  color: var(--dm-danger);
}

.width-100 {
  width: 100%;
}
</style>
