<script setup>
import { computed } from "vue";

const Props = defineProps({
  Total: {
    type: Number,
    default: 0,
  },
  PageIndex: {
    type: Number,
    default: 1,
  },
  PageSize: {
    type: Number,
    default: 12,
  },
  ItemLabel: {
    type: String,
    default: "sản phẩm",
  },
  Disabled: {
    type: Boolean,
    default: false,
  },
});

const Emit = defineEmits(["update:page-index"]);
const NormalizedTotal = computed(() => Math.max(0, Number(Props.Total) || 0));
const NormalizedPageSize = computed(() => Math.max(1, Number(Props.PageSize) || 12));
const TotalPages = computed(() => NormalizedTotal.value ? Math.ceil(NormalizedTotal.value / NormalizedPageSize.value) : 0);
const CurrentPage = computed(() => TotalPages.value ? Math.min(Math.max(1, Number(Props.PageIndex) || 1), TotalPages.value) : 0);
const CanGoPrevious = computed(() => !Props.Disabled && CurrentPage.value > 1);
const CanGoNext = computed(() => !Props.Disabled && CurrentPage.value < TotalPages.value);

const requestPage = (PageIndex) => {
  if (Props.Disabled || PageIndex < 1 || PageIndex > TotalPages.value || PageIndex === CurrentPage.value) return;
  Emit("update:page-index", PageIndex);
};
</script>

<template>
  <footer class="dm-paging-footer">
    <p class="dm-paging-footer__total">Tổng số <strong>{{ NormalizedTotal }}</strong> {{ ItemLabel }}</p>
    <nav class="dm-paging-footer__controls" aria-label="Phân trang">
      <button
        type="button"
        class="dm-paging-footer__button"
        :disabled="!CanGoPrevious"
        aria-label="Trang trước"
        @click="requestPage(CurrentPage - 1)"
      >
        <span class="material-symbols-outlined" aria-hidden="true">chevron_left</span>
      </button>
      <span class="dm-paging-footer__page" aria-live="polite">
        <strong>{{ CurrentPage }}</strong>
        <span>/</span>
        {{ TotalPages }}
      </span>
      <button
        type="button"
        class="dm-paging-footer__button"
        :disabled="!CanGoNext"
        aria-label="Trang sau"
        @click="requestPage(CurrentPage + 1)"
      >
        <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
      </button>
    </nav>
  </footer>
</template>

<style scoped lang="scss">
.dm-paging-footer {
  display: flex;
  min-height: 64px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  border: 1px solid var(--dm-border);
  border-radius: 14px;
  background: var(--dm-surface);
  box-shadow: 0 6px 18px var(--dm-shadow-color);
}

.dm-paging-footer__total {
  margin: 0;
  color: var(--dm-text-soft);
}

.dm-paging-footer__total strong {
  color: var(--dm-text);
}

.dm-paging-footer__controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dm-paging-footer__button {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  padding: 0;
  border: 1px solid var(--dm-border);
  border-radius: 10px;
  background: var(--dm-surface);
  color: var(--dm-primary);
  cursor: pointer;
  transition: border-color 160ms ease, background-color 160ms ease, transform 160ms ease;
}

.dm-paging-footer__button:not(:disabled):hover {
  border-color: var(--dm-primary);
  background: var(--dm-primary-soft);
  transform: translateY(-1px);
}

.dm-paging-footer__button:disabled {
  color: var(--dm-text-soft);
  cursor: not-allowed;
  opacity: 0.4;
}

.dm-paging-footer__page {
  min-width: 62px;
  color: var(--dm-text-soft);
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.dm-paging-footer__page strong {
  color: var(--dm-primary);
}

@media (max-width: 520px) {
  .dm-paging-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .dm-paging-footer__controls {
    justify-content: space-between;
  }
}
</style>
