<template lang="">
<button
  :class="['ms-button', `ms-button--${type}`, `ms-button--tooltip-${tooltipPosition}`]"
  :data-tooltip="message"
  @click="emit('click')"
>
    <i v-if="iconLeft" :class="[iconLeft, 'ms-button__icon']"></i>
    <span class="ms-button__content">
        {{ message }}
    </span>
    <i v-if="iconRight" :class="[iconRight, 'ms-button__icon', 'ms-button__icon--right']"></i>
</button>
</template>
<script setup>
import { defineProps, defineEmits } from "vue";

/**
 * NOTICE: emit + props
 */
const props = defineProps({
  message: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "none",
  },
  iconLeft: {
    type: String,
    default: "",
  },
  iconRight: {
    type: String,
    default: "",
  },
  tooltipPosition: {
    type: String,
    default: "right",
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
  position: relative;
  width: 100%;
}
.ms-button__icon{
  padding: 8px;
}
.ms-button__icon--right {
  margin-left: auto;
}
.ms-button--none {
  background-color: transparent;
  color: #000;
}
.ms-button--none:hover {
  background-color: rgba(0, 0, 0, 0.1);
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

.ms-button::after,
.ms-button::before {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.15s ease, visibility 0.15s ease;
  z-index: 10;
}

.ms-button::after {
  content: attr(data-tooltip);
  position: absolute;
  background: #222;
  color: #fff;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
}

.ms-button::before {
  content: "";
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
}

.ms-button:hover::after,
.ms-button:hover::before {
  opacity: 1;
  visibility: visible;
}

.ms-button--tooltip-right::after {
  top: 50%;
  left: calc(100% + 8px);
  transform: translateY(-50%);
}

.ms-button--tooltip-right::before {
  top: 50%;
  left: calc(100% + 2px);
  transform: translateY(-50%);
  border-width: 6px 6px 6px 0;
  border-color: transparent #222 transparent transparent;
}

.ms-button--tooltip-left::after {
  top: 50%;
  right: calc(100% + 8px);
  transform: translateY(-50%);
}

.ms-button--tooltip-left::before {
  top: 50%;
  right: calc(100% + 2px);
  transform: translateY(-50%);
  border-width: 6px 0 6px 6px;
  border-color: transparent transparent transparent #222;
}

.ms-button--tooltip-top::after {
  left: 50%;
  bottom: calc(100% + 8px);
  transform: translateX(-50%);
}

.ms-button--tooltip-top::before {
  left: 50%;
  bottom: calc(100% + 2px);
  transform: translateX(-50%);
  border-width: 6px 6px 0 6px;
  border-color: #222 transparent transparent transparent;
}

.ms-button--tooltip-bottom::after {
  left: 50%;
  top: calc(100% + 8px);
  transform: translateX(-50%);
}

.ms-button--tooltip-bottom::before {
  left: 50%;
  top: calc(100% + 2px);
  transform: translateX(-50%);
  border-width: 0 6px 6px 6px;
  border-color: transparent transparent #222 transparent;
}


</style>