<template lang="">
  <div :class="['ms-input', { 'ms-input--horizontal': horizontal }]">
    <label v-if="label" class="ms-input__label" :for="id">{{ label }} <span v-if="isRequired" class="color-red"> *</span></label>
    <input 
      ref="inputRef"
      :class="['ms-input-in', props.class, { 'ms-input--error': props.errorMessages }]"
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
    <!-- <p 
    v-if="props.errorMessages"
    :class="['ms-input__error', { 'ms-input__error--visible': props.errorMessages }]" >{{ props.errorMessages || '\u00A0' }}</p> -->
    <div v-if="props.errorMessages" class="ms-input__tooltip">
      {{ props.errorMessages || "" }}
    </div>
  </div>
</template>
<script setup>
import { defineEmits, ref } from "vue";
import { errorMessages } from "vue/compiler-sfc";
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
  gap: 4px;
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
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 2px;
  user-select: none;
}

.ms-input-in {
  width: 100%;
  /* height: 36px; */
  padding: 0 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #111827;
  background-color: #ffffff;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}

.ms-input-in::placeholder {
  color: #9ca3af;
  font-size: 13px;
}

.ms-input-in:hover {
  border-color: #0E9A62;
  background-color: #f9fffe;
}

.ms-input-in:focus {
  border-color: #0E9A62;
  box-shadow: 0 0 0 3px rgba(14, 154, 98, 0.12);
  background-color: #ffffff;
}

.ms-input-in:disabled {
  background-color: #eff1f4;
  color: #8c929f;
  cursor: not-allowed;
  border-color: #d1d5db !important;
}

.ms-input-in:disabled:hover {
  background-color: #eff1f4;
  border-color: #d1d5db !important;
}

.ms-input .ms-input--error {
  border-color: #f44336 !important;
  box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1) !important;
}

.ms-input .ms-input--error:hover,
.ms-input .ms-input--error:focus {
  border-color: #f44336 !important;
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
  min-height: 16px;
  font-size: 12px;
  color: transparent;
}

.ms-input__error--visible {
  color: #f44336;
}

.width-100 {
  width: 100%;
}
</style>
