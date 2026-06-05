<template>
  <!-- Hiển thị công thức inline với màu syntax highlight -->
  <span
    v-if="value"
    class="formula-cell"
    v-html="highlighted"
  />
  <span v-else class="formula-cell formula-cell--empty">--</span>
</template>

<script setup>
import { computed } from "vue";
import { highlightFormula } from "./formula-prism.js";

const props = defineProps({
  /** Chuỗi công thức cần hiển thị, vd: "=SUM(LUONG_CO_BAN, PHAT)" */
  value: {
    type: String,
    default: "",
  },
});

const highlighted = computed(() => {
  if (!props.value) return "";
  return highlightFormula(props.value);
});
</script>

<style>
/* ── FormulaCell: token colors (global, không scoped) ── */
.formula-cell .token.function {
  color: #7c3aed;
  font-weight: 600;
}
.formula-cell .token.variable {
  color: #0369a1;
  font-weight: 500;
}
.formula-cell .token.number {
  color: #b45309;
}
.formula-cell .token.operator {
  color: #dc2626;
  font-weight: 500;
}
.formula-cell .token.string {
  color: #16a34a;
}
.formula-cell .token.punctuation {
  color: #6b7280;
}
</style>

<style scoped>
.formula-cell {
  font-family: "Fira Code", "Fira Mono", Consolas, "Courier New", monospace;
  font-size: 12.5px;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  max-width: 100%;
  color: #1f2937;
}

.formula-cell--empty {
  color: #9ca3af;
  font-family: inherit;
  font-size: 13px;
}
</style>
