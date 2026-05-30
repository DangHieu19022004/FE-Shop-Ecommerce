<template lang="">
<button
  v-bind="$attrs"
  ref="buttonRef"
  :class="[
    'ms-button',
    `ms-button--${type}`,
    `ms-button--tooltip-${tooltipPosition}`,
    { 'ms-button--line-left': normalizedLineLeft, 'ms-button--line-right': normalizedLineRight },
    { 'ms-button--no-tooltip': !normalizedIsTooltip },
    { 'ms-button--icon-only': !message && (iconLeft || iconRight) },
    { 'ms-button--spread-icon': normalizedSpreadIcon },
    { 'ms-button--unactive': normalizedUnActive },
    { [`ms-button--shape-${shapeBtn}`]: shapeBtn },
  ]"
  :disabled="normalizedIsDisabled"
  :aria-disabled="normalizedUnActive"
  @click="handleClick"
  @mouseenter="showTooltip"
  @mouseleave="hideTooltip"
>
    <i v-if="iconLeft" :class="[iconLeft, 'ms-button__icon']"></i>
    <span v-if="message || $slots.default" class="ms-button__content">
         <slot>
          {{ message }}
        </slot>
    </span>
    <i v-if="iconRight" :class="[iconRight, 'ms-button__icon', 'ms-button__icon--right']"></i>
    <Teleport to="body">
      <span
        v-if="isShowTooltip"
        ref="tooltipRef"
        :class="['ms-button__tooltip', `ms-button__tooltip--${tooltipPosition}`]"
        :style="tooltipStyle"
      >
        {{ normalizedTooltipMessage }}
      </span>
    </Teleport>
</button>
</template>
<script setup>
import { computed, defineProps, defineEmits, nextTick, ref } from "vue";

/**
 * NOTICE: emit + props
 */
const props = defineProps({
  message: {
    type: String,
    default: "",
  },
  tooltipMessage: {
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
  unActive: {
    type: Boolean,
    default: false,
  },
  shapeBtn: {
    type: String,
    default: "",
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
const normalizedUnActive = computed(() => normalizeBool(props.unActive));
const normalizedTooltipMessage = computed(() => props.tooltipMessage || props.message);
const normalizedIsDisabled = computed(
  () => normalizedUnActive.value && !normalizedTooltipMessage.value
);
const buttonRef = ref(null);
const tooltipRef = ref(null);
const isShowTooltip = ref(false);
const tooltipStyle = ref({});

const handleClick = (event) => {
  if (normalizedUnActive.value) return;
  emit("click", event);
};

const showTooltip = () => {
  if (!normalizedIsTooltip.value || !normalizedTooltipMessage.value) return;

  isShowTooltip.value = true;
  nextTick(() => {
    if (!buttonRef.value || !tooltipRef.value) return;

    const buttonRect = buttonRef.value.getBoundingClientRect();
    const tooltipRect = tooltipRef.value.getBoundingClientRect();
    const gap = 8;
    let top = 0;
    let left = 0;

    if (props.tooltipPosition === "left") {
      top = buttonRect.top + buttonRect.height / 2 - tooltipRect.height / 2;
      left = buttonRect.left - tooltipRect.width - gap;
    } else if (props.tooltipPosition === "top") {
      top = buttonRect.top - tooltipRect.height - gap;
      left = buttonRect.left + buttonRect.width / 2 - tooltipRect.width / 2;
    } else if (props.tooltipPosition === "bottom") {
      top = buttonRect.bottom + gap;
      left = buttonRect.left + buttonRect.width / 2 - tooltipRect.width / 2;
    } else {
      top = buttonRect.top + buttonRect.height / 2 - tooltipRect.height / 2;
      left = buttonRect.right + gap;
    }

    tooltipStyle.value = {
      top: `${top}px`,
      left: `${left}px`,
    };
  });
};

const hideTooltip = () => {
  isShowTooltip.value = false;
};
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
.ms-button--icon-only {
  padding: 6px;
}
.ms-button--icon-only .ms-button__icon {
  padding: 0;
}
.ms-button--icon-only.ms-button--shape-circle {
  width: 36px;
  height: 36px;
  padding: 6px;
  border-radius: 50%;
}
.ms-button--icon-only.ms-button--shape-square {
  width: 36px;
  height: 36px;
  padding: 6px;
  border-radius: 4px;
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
.ms-button--border-none {
  background-color: #fff;
  color: #000;
  border: 1px solid transparent;
}
.ms-button--border-none:hover {
  background-color: #B6B5B5;
}
.ms-button--unactive,
.ms-button--unactive:hover {
  cursor: default;
  background-color: transparent;
  opacity: 0.6;
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
.ms-button--border-secondary {
  background-color: #fff;
  color: #6c757d;
  border: 1px solid #6c757d;
}
.ms-button--border-secondary:hover {
  background-color: #e2e6ea;
}
.ms-button--danger {
  background-color: #dc3545;
  color: #fff;
}
.ms-button--danger:hover {
  background-color: #c82333;
}
.ms-button--border-danger {
  background-color: #fff;
  color: #dc3545;
  border: 1px solid #dc3545;
}
.ms-button--border-danger:hover {
  background-color: #FEE4E2;
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

.ms-button__tooltip {
  position: fixed;
  z-index: 99999;
  background: #434343;
  color: #d0d0d0;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
}

.ms-button__tooltip::before {
  content: "";
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
}

.ms-button__tooltip--right::before {
  top: 50%;
  right: 100%;
  transform: translateY(-50%);
  border-width: 6px 6px 6px 0;
  border-color: transparent #434343 transparent transparent;
}

.ms-button__tooltip--left::before {
  top: 50%;
  left: 100%;
  transform: translateY(-50%);
  border-width: 6px 0 6px 6px;
  border-color: transparent transparent transparent #434343;
}

.ms-button__tooltip--top::before {
  left: 50%;
  top: 100%;
  transform: translateX(-50%);
  border-width: 6px 6px 0 6px;
  border-color: #434343 transparent transparent transparent;
}

.ms-button__tooltip--bottom::before {
  left: 50%;
  bottom: 100%;
  transform: translateX(-50%);
  border-width: 0 6px 6px 6px;
  border-color: transparent transparent #434343 transparent;
}


</style>
