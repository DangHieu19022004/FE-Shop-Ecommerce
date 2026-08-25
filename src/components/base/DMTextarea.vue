<script setup>
const Props = defineProps({
  modelValue: { type: String, default: "" },
  label: { type: String, default: "" },
  placeholder: { type: String, default: "" },
  maxLength: { type: Number, default: 250 },
  rows: { type: Number, default: 4 },
});
const Emit = defineEmits(["update:modelValue"]);
const handleInput = (Event) => Emit("update:modelValue", Event.target.value);
</script>

<template>
  <label class="dm-textarea">
    <span v-if="Props.label" class="dm-textarea__label">{{ Props.label }}</span>
    <span class="dm-textarea__control">
      <span class="material-symbols-outlined dm-textarea__icon" aria-hidden="true">edit_note</span>
      <textarea :value="Props.modelValue" :placeholder="Props.placeholder" :maxlength="Props.maxLength" :rows="Props.rows" @input="handleInput"></textarea>
      <small>{{ Props.modelValue.length }}/{{ Props.maxLength }}</small>
    </span>
  </label>
</template>

<style scoped>
.dm-textarea { display: flex; flex-direction: column; gap: 8px; }
.dm-textarea__label { color: var(--dm-text); font-size: 14px; font-weight: 700; }
.dm-textarea__control { position: relative; display: block; }
.dm-textarea__control textarea { width: 100%; min-height: 112px; resize: vertical; padding: 13px 44px 28px 42px; border: 1px solid var(--dm-border); border-radius: 14px; background: var(--dm-surface); color: var(--dm-text); font: inherit; line-height: 1.55; outline: none; transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease; }
.dm-textarea__control textarea:hover { border-color: var(--dm-primary); background: var(--dm-overlay-soft); }
.dm-textarea__control textarea:focus { border-color: var(--dm-primary); background: var(--dm-surface); box-shadow: 0 0 0 3px var(--dm-primary-soft); }
.dm-textarea__control textarea::placeholder { color: var(--dm-text-soft); opacity: 0.72; }
.dm-textarea__icon { position: absolute; top: 13px; left: 13px; z-index: 1; color: var(--dm-primary); }
.dm-textarea__control small { position: absolute; right: 12px; bottom: 9px; color: var(--dm-text-soft); }
</style>
