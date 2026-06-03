<template>
  <div :class="['ms-formula', { 'ms-formula--horizontal': horizontal }]">
    <!-- Label -->
    <label v-if="label" class="ms-formula__label" :for="editorId">
      {{ label }}
      <span v-if="isRequired" class="ms-formula__required">*</span>
    </label>

    <!-- Editor area -->
    <div class="ms-formula__control">
      <div
        class="ms-formula__editor-wrap"
        :class="{
          'ms-formula__editor-wrap--focused': isFocused,
          'ms-formula__editor-wrap--error': errorMessages,
        }"
      >
        <!-- Placeholder -->
        <div
          v-if="!modelValue && placeholder"
          class="ms-formula__placeholder"
          aria-hidden="true"
        >
          {{ placeholder }}
        </div>

        <!-- vue-prism-editor -->
        <PrismEditor
          :id="editorId"
          class="ms-formula__prism"
          :model-value="modelValue"
          :highlight="highlightCode"
          :tab-size="2"
          :insert-spaces="true"
          @update:model-value="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
        />
      </div>

      <!-- Tooltip lỗi (giống MsInput) -->
      <div v-if="errorMessages" class="ms-formula__tooltip">
        {{ errorMessages }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css';
import { highlightFormula } from './formula-prism.js';

// ── Props ─────────────────────────────────────────────────────────────────────
const props = defineProps({
  /** v-model: giá trị công thức */
  modelValue: {
    type: String,
    default: '',
  },
  /** Danh sách biến / thành phần lương có thể chèn */
  variables: {
    type: Array,
    default: () => [],
  },
  /** Placeholder hiển thị khi rỗng */
  placeholder: {
    type: String,
    default: 'Tự động gợi ý công thức khi gõ',
  },
  /** Label hiển thị */
  label: {
    type: String,
    default: '',
  },
  /** Xếp label và editor theo hàng ngang (giống MsInput/MsSelect) */
  horizontal: {
    type: Boolean,
    default: false,
  },
  /** Bắt buộc nhập */
  isRequired: {
    type: Boolean,
    default: false,
  },
  /** id cho label/editor */
  id: {
    type: String,
    default: '',
  },
  /** Thông báo lỗi từ bên ngoài truyền vào (validate ở FormSalary) */
  errorMessages: {
    type: String,
    default: '',
  },
});

// ── Emits ─────────────────────────────────────────────────────────────────────
const emit = defineEmits(['update:modelValue', 'blur', 'focus']);

// ── Internal state ────────────────────────────────────────────────────────────
const isFocused = ref(false);

// ID tự sinh nếu không truyền vào
const editorId = computed(() =>
  props.id || `ms-formula-${Math.random().toString(36).slice(2, 8)}`
);

// ── Highlight function truyền vào PrismEditor ─────────────────────────────────
function highlightCode(code) {
  return highlightFormula(code);
}

// ── Event handlers ────────────────────────────────────────────────────────────
function handleInput(value) {
  emit('update:modelValue', value);
}

function handleFocus(e) {
  isFocused.value = true;
  emit('focus', e);
}

function handleBlur(e) {
  isFocused.value = false;
  emit('blur', e);
}

/**
 * Chèn tên biến vào vị trí con trỏ hiện tại trong PrismEditor.
 */
function insertVariable(varName) {
  const container = document.getElementById(editorId.value);
  const textarea = container
    ? container.closest('.ms-formula__editor-wrap')?.querySelector('textarea')
    : null;

  if (textarea) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = props.modelValue || '';
    const next = current.slice(0, start) + varName + current.slice(end);
    emit('update:modelValue', next);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + varName.length, start + varName.length);
    });
  } else {
    emit('update:modelValue', (props.modelValue || '') + varName);
  }
}

function focus() {
  const container = document.getElementById(editorId.value);
  const textarea = container
    ? container.closest('.ms-formula__editor-wrap')?.querySelector('textarea')
    : null;

  textarea?.focus();
}

defineExpose({
  focus,
  insertVariable,
});
</script>

<style>
/* ── Token colors: áp dụng global vì PrismEditor render trong shadow-like DOM ── */
.ms-formula__prism .token.function   { color: #7c3aed; font-weight: 600; }
.ms-formula__prism .token.variable   { color: #0369a1; }
.ms-formula__prism .token.number     { color: #b45309; }
.ms-formula__prism .token.operator   { color: #dc2626; font-weight: 500; }
.ms-formula__prism .token.string     { color: #16a34a; }
.ms-formula__prism .token.punctuation{ color: #6b7280; }
</style>

<style scoped>
/* ══════════════════════════════════════════════
   Wrapper
══════════════════════════════════════════════ */
.ms-formula {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  position: relative;
}

/* Layout ngang: label trái — editor phải (giống MsInput/MsSelect) */
.ms-formula--horizontal {
  flex-direction: row;
  gap: 0;
  align-items: flex-start;
}

.ms-formula--horizontal .ms-formula__label {
  flex: 0 0 200px;
  min-width: 200px;
  padding-right: 12px;
  margin-bottom: 0;
  line-height: 32px;
}

.ms-formula--horizontal .ms-formula__control {
  flex: 1;
  min-width: 0;
}

/* Tooltip lỗi dịch sang phải khi horizontal */
.ms-formula--horizontal .ms-formula__tooltip {
  left: 0;
}

/* ══════════════════════════════════════════════
   Label
══════════════════════════════════════════════ */
.ms-formula__label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  user-select: none;
}

.ms-formula__required {
  color: #f44336;
  margin-left: 2px;
  font-weight: 600;
}

/* ══════════════════════════════════════════════
   Control wrapper
══════════════════════════════════════════════ */
.ms-formula__control {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* ══════════════════════════════════════════════
   Editor outer border/shadow
══════════════════════════════════════════════ */
.ms-formula__editor-wrap {
  position: relative;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  background: #ffffff;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
  overflow: hidden;
  min-height: 86px;
}

.ms-formula__editor-wrap:hover {
  border-color: #0e9a62;
}

.ms-formula__editor-wrap--focused {
  border-color: #0e9a62;
  box-shadow: 0 0 0 3px rgba(14, 154, 98, 0.12);
}

.ms-formula__editor-wrap--error {
  border-color: #f44336 !important;
  box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.10) !important;
}

.ms-formula__editor-wrap--error:hover {
  border-color: #f44336 !important;
}

/* ══════════════════════════════════════════════
   Placeholder (vì PrismEditor không có placeholder)
══════════════════════════════════════════════ */
.ms-formula__placeholder {
  position: absolute;
  top: 10px;
  left: 12px;
  right: 12px;
  font-size: 13px;
  color: #9ca3af;
  pointer-events: none;
  z-index: 2;
  font-family: 'Fira Code', 'Fira Mono', Consolas, 'Courier New', monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ══════════════════════════════════════════════
   PrismEditor overrides
══════════════════════════════════════════════ */
.ms-formula__prism {
  background: transparent !important;
  font-family: 'Fira Code', 'Fira Mono', Consolas, 'Courier New', monospace !important;
  font-size: 13.5px !important;
  line-height: 1.65 !important;
  padding: 8px 12px !important;
  min-height: 83px;
  color: #1f2937;
  tab-size: 2;
}

/* Textarea bên dưới */
:deep(.prism-editor__textarea) {
  outline: none !important;
  caret-color: #0e9a62;
  color: transparent;
  background: transparent !important;
  resize: none;
  font-family: inherit !important;
  font-size: inherit !important;
  line-height: inherit !important;
}

/* Pre highlight layer */
:deep(.prism-editor__editor) {
  font-family: inherit !important;
  font-size: inherit !important;
  line-height: inherit !important;
}

:deep(.prism-editor__container) {
  min-height: 83px;
}

/* ══════════════════════════════════════════════
   Tooltip lỗi (giống MsInput)
══════════════════════════════════════════════ */
.ms-formula__tooltip {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 0;
  background: #f44336;
  color: #fff;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.15s ease, visibility 0.15s ease;
  z-index: 999;
  pointer-events: none;
}

.ms-formula__tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 12px;
  border: 5px solid transparent;
  border-top-color: #f44336;
}

.ms-formula__control:hover .ms-formula__tooltip {
  opacity: 1;
  visibility: visible;
}
</style>
