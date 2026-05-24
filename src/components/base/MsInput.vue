<template lang="">
  <div class="ms-input">
    <label v-if="label" class="ms-input__label" :for="id">{{ label }}</label>
    <input 
      ref="inputRef"
      :class="['ms-input-in', props.class, { 'ms-input--error': props.errorMessages }]"
      :value="props.type === 'file' ? '' : modelValue"
      :type="type" 
      :placeholder="placeholder" 
      :name="name"
      :id="id"
      :accept="accept"
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
<style >
.ms-input__label {
  display: block;
  font-size: 14px;
  margin-bottom: 4px;
  color: #111;
}

.ms-input .ms-input--error {
  border: 1px solid #f44336 !important;
}
.ms-input {
  position: relative;
}

.ms-input-in{
  width: 100%;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  background-color: transparent;
}

.ms-input__tooltip {
  position: absolute;

  bottom: calc(100% + 8px);
  left: 0;

  background: #f44336;
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
