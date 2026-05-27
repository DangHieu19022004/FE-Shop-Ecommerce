<template lang="">
<button
  :class="[
    'ms-button',
    `ms-button--${type}`,
    `ms-button--tooltip-${tooltipPosition}`,
    { 'ms-button--line-left': normalizedLineLeft, 'ms-button--line-right': normalizedLineRight },
    { 'ms-button--no-tooltip': !normalizedIsTooltip },
    { 'ms-button--icon-only': !message && (iconLeft || iconRight) },
    { 'ms-button--spread-icon': normalizedSpreadIcon },
  ]"
  :data-tooltip="normalizedIsTooltip ? message : ''"
  @click="emit('click')"
>
    <i v-if="iconLeft" :class="[iconLeft, 'ms-button__icon']"></i>
    <span v-if="message || $slots.default" class="ms-button__content">
         <slot>
          {{ message }}
        </slot>
    </span>
    <i v-if="iconRight" :class="[iconRight, 'ms-button__icon', 'ms-button__icon--right']"></i>
</button>
</template>
<script setup>
import { computed, defineProps, defineEmits } from "vue";

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
  isTooltip: {
    type: Boolean,
    default: true,
  },
  lineStateLeft: {
    type: Boolean,
    default: false,
  },
  lineStateRight: {
    type: Boolean,
    default: false,
  },
  /**
   * Khi true: text (flex:1) đẩy iconRight sang tận cùng bên phải.
   * Khi false (mặc định): iconRight nằm sát text.
   */
  spreadIcon: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["click"]);

const normalizeBool = (value) => {
  if (value === "false" || value === false || value === 0) return false;
  return Boolean(value);
};

const normalizedIsTooltip = computed(() => normalizeBool(props.isTooltip));
const normalizedLineLeft = computed(() => normalizeBool(props.lineStateLeft));
const normalizedLineRight = computed(() => normalizeBool(props.lineStateRight));
const normalizedSpreadIcon = computed(() => normalizeBool(props.spreadIcon));
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
  white-space: nowrap;
  width: auto;
}
.ms-button__icon {
  display: flex;
  align-items: center;
  justify-content: center;
}
.ms-button--icon-only .ms-button__icon {
  padding: 0;
}
.ms-button__icon--right {
  margin-left: 8px;
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
.ms-button--green {
  background-color: #0E9A62;
  color: #fff !important;
}
.ms-button--green:hover {
  background-color: #0A724B;
  color: #fff !important;
}
.ms-button--border-green {
  background-color: #fff;
  color: #0E9A62 !important;
  border: 1px solid #0E9A62 !important;
}
.ms-button--border-green:hover {
  background-color: #A8D9C8;
}
.ms-button__content {
  display: inline-block;
  /* margin-left: 0.5rem; */
}

/* Khi spreadIcon: button full-width flex, text chiếm hết không gian giữa */
.ms-button--spread-icon {
  width: 100%;
}
.ms-button--spread-icon .ms-button__content {
  flex: 1;
  text-align: left;
}
.ms-button--spread-icon .ms-button__icon--right {
  margin-left: auto;
}

.ms-button--line-left {
  border-left: 1px solid #ffffff !important;
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
}

.ms-button--line-right {
  border-right: 1px solid #ffffff !important;
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
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

.ms-button--no-tooltip::after,
.ms-button--no-tooltip::before,
.ms-button--no-tooltip:hover::after,
.ms-button--no-tooltip:hover::before {
  opacity: 0;
  visibility: hidden;
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