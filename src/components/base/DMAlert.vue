<script setup>
import { computed } from "vue";

const Props = defineProps({
  Alert: {
    type: Object,
    required: true,
  },
});

defineEmits(["dismiss"]);

const TypeMeta = {
  success: { Symbol: "✓", Role: "status", Live: "polite" },
  danger: { Symbol: "!", Role: "alert", Live: "assertive" },
  warning: { Symbol: "!", Role: "alert", Live: "assertive" },
};

const Meta = computed(() => TypeMeta[Props.Alert.Type] || TypeMeta.warning);
const ProgressStyle = computed(() => ({ animationDuration: `${Props.Alert.Duration}ms` }));
</script>

<template>
  <article
    class="dm-alert"
    :class="`dm-alert--${Alert.Type}`"
    :role="Meta.Role"
    :aria-live="Meta.Live"
    :aria-label="Alert.Title"
  >
    <span class="dm-alert__icon" aria-hidden="true">{{ Meta.Symbol }}</span>
    <div class="dm-alert__content">
      <strong>{{ Alert.Title }}</strong>
      <p v-if="Alert.Message">{{ Alert.Message }}</p>
    </div>
    <button type="button" class="dm-alert__close" aria-label="Đóng thông báo" @click="$emit('dismiss', Alert.Id)">
      <span aria-hidden="true">×</span>
    </button>
    <span v-if="Alert.Duration > 0" class="dm-alert__progress" :style="ProgressStyle" aria-hidden="true"></span>
  </article>
</template>

<style scoped lang="scss">
.dm-alert {
  --alert-accent: #8a6500;
  --alert-soft: #fff5cf;
  position: relative;
  display: grid;
  width: 100%;
  min-width: 0;
  grid-template-columns: 42px minmax(0, 1fr) 32px;
  align-items: start;
  gap: 12px;
  overflow: hidden;
  padding: 14px 12px 14px 14px;
  border: 1px solid color-mix(in srgb, var(--alert-accent) 24%, transparent);
  border-radius: 16px;
  background: var(--dm-surface, #fff);
  color: var(--dm-text, #1b1b1f);
  box-shadow: 0 16px 40px rgba(15, 31, 61, 0.18);
  pointer-events: auto;
}

.dm-alert--success {
  --alert-accent: #007d6d;
  --alert-soft: #dff7f1;
}

.dm-alert--danger {
  --alert-accent: #ba1a1a;
  --alert-soft: #ffdad6;
}

.dm-alert__icon {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 13px;
  background: var(--alert-soft);
  color: var(--alert-accent);
  font-size: 22px;
  font-weight: 900;
}

.dm-alert__content {
  min-width: 0;
  padding-top: 2px;
}

.dm-alert__content strong,
.dm-alert__content p {
  overflow-wrap: anywhere;
}

.dm-alert__content strong {
  display: block;
  color: var(--alert-accent);
  font-size: 14px;
  line-height: 1.35;
}

.dm-alert__content p {
  margin: 4px 0 0;
  color: var(--dm-text-soft, #5f6368);
  font-size: 13px;
  line-height: 1.45;
}

.dm-alert__close {
  display: grid;
  width: 32px;
  height: 32px;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--dm-text-soft, #5f6368);
  cursor: pointer;
}

.dm-alert__close:hover {
  background: var(--alert-soft);
  color: var(--alert-accent);
}

.dm-alert__close:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--alert-accent) 28%, transparent);
  outline-offset: 1px;
}

.dm-alert__close span {
  font-size: 22px;
  line-height: 1;
}

.dm-alert__progress {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 3px;
  background: var(--alert-accent);
  transform-origin: left;
  animation: dm-alert-progress linear forwards;
}

@keyframes dm-alert-progress {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

@media (prefers-reduced-motion: reduce) {
  .dm-alert__progress { animation: none; }
}
</style>
