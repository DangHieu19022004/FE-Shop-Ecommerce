<script setup>
import { computed } from "vue";

const Props = defineProps({
  type: {
    type: String,
    default: "neutral",
    validator: (Value) => ["neutral", "primary", "info", "success", "warning", "error"].includes(Value),
  },
  success: Boolean,
  warning: Boolean,
  error: Boolean,
  info: Boolean,
  primary: Boolean,
  iconName: {
    type: String,
    default: "",
  },
  dot: Boolean,
});

const ResolvedType = computed(() => {
  if (Props.error) return "error";
  if (Props.warning) return "warning";
  if (Props.success) return "success";
  if (Props.info) return "info";
  if (Props.primary) return "primary";
  return Props.type;
});
</script>

<template>
  <span class="dm-badge" :class="`dm-badge--${ResolvedType}`">
    <span v-if="dot" class="dm-badge__dot" aria-hidden="true"></span>
    <span v-if="iconName" class="material-symbols-outlined dm-badge__icon" aria-hidden="true">{{ iconName }}</span>
    <span class="dm-badge__label"><slot /></span>
  </span>
</template>

<style scoped lang="scss">
.dm-badge {
  display: inline-flex;
  width: fit-content;
  min-height: 26px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 4px 10px;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.3;
  white-space: nowrap;
}

.dm-badge--neutral {
  border-color: var(--dm-border);
  background: var(--dm-surface-soft);
  color: var(--dm-text-soft);
}

.dm-badge--primary {
  border-color: rgba(13, 43, 99, 0.14);
  background: var(--dm-primary-soft);
  color: var(--dm-primary);
}

.dm-badge--info {
  border-color: rgba(0, 91, 143, 0.14);
  background: #dff3ff;
  color: #005b8f;
}

.dm-badge--success {
  border-color: rgba(0, 143, 123, 0.18);
  background: var(--dm-success-soft);
  color: #007d6d;
}

.dm-badge--warning {
  border-color: rgba(138, 101, 0, 0.16);
  background: var(--dm-secondary-soft);
  color: var(--dm-secondary-text);
}

.dm-badge--error {
  border-color: rgba(186, 26, 26, 0.14);
  background: var(--dm-danger-soft);
  color: var(--dm-danger);
}

.dm-badge__dot {
  width: 7px;
  height: 7px;
  flex-shrink: 0;
  border-radius: 50%;
  background: currentColor;
}

.dm-badge__icon {
  flex-shrink: 0;
  font-size: 16px;
}

.dm-badge__label {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
