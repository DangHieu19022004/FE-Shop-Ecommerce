<template lang="">
<button :class="['ms-button', `ms-button--${type}`]" @click="emit('click')">
    <i v-if="icon" :class="icon"></i>
    <span class="ms-button__content">
        <slot></slot>
    </span>
</button>
</template>
<script setup>
import { defineProps, defineEmits } from "vue";

/**
 * NOTICE: emit + props
 */
const props = defineProps({
  type: {
    type: String,
    default: "primary",
  },
  icon: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(["click"]);
</script>
<style scoped>
.ms-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}
.ms-button--primary {
  background-color: #007bff;
  color: #fff;
}
.ms-button--primary:hover {
  background-color: #0056b3;
}
.ms-button--secondary {
  background-color: #6c757d;
  color: #fff;
}
.ms-button--secondary:hover {
  background-color: #545b62;
}
.ms-button--danger {
  background-color: #dc3545;
  color: #fff;
}
.ms-button--danger:hover {
  background-color: #c82333;
}
.ms-button--warning {
  background-color: #ffc107;
  color: #212529;
}
.ms-button--warning:hover {
  background-color: #e0a800;
}
.ms-button--success {
  background-color: #28a745;
  color: #fff !important;
}
.ms-button--success:hover {
  background-color: #218838;
}
.ms-button__content {
  display: inline-block;
  /* margin-left: 0.5rem; */
}
</style>