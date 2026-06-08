<template>
  <div :class="['ms-formula', { 'ms-formula--horizontal': horizontal }]">
    <!-- Label -->
    <label v-if="label" class="ms-formula__label" :for="editorId">
      {{ label }}
      <span v-if="isRequired" class="ms-formula__required">*</span>
    </label>

    <!-- Editor area -->
    <div class="ms-formula__control" ref="controlRef">
      <div
        class="ms-formula__editor-wrap"
        :class="{
          'ms-formula__editor-wrap--focused': isFocused || showPopup,
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
          @keydown="handleKeydown"
        />
      </div>

      <!-- Tooltip lỗi (giống MsInput) -->
      <div v-if="errorMessages" class="ms-formula__tooltip">
        {{ errorMessages }}
      </div>

      <!-- ══════════════════════════════════════
           POPUP CÔNG THỨC / THAM SỐ
           Dùng position: absolute, không Teleport
           để tự động follow scroll của parent
      ══════════════════════════════════════ -->
      <div
        v-if="showPopup"
        ref="popupRef"
        class="ms-formula-popup"
        @mousedown="handlePopupMousedown"
      >
        <!-- Tabs -->
        <div class="ms-formula-popup__tabs">
          <MsButton
            type="none"
            class="ms-formula-popup__tab"
            :class="{ 'ms-formula-popup__tab--active': activeTab === 'formula' }"
            @mousedown.stop.prevent="switchTab('formula')"
            :isTooltip="false"
          >
            Công thức
          </MsButton>
          <MsButton
            type="none"
            class="ms-formula-popup__tab"
            :class="{ 'ms-formula-popup__tab--active': activeTab === 'param' }"
            @mousedown.stop.prevent="switchTab('param')"
            :isTooltip="false"
          >
            Tham số
          </MsButton>
        </div>

        <!-- Search box inside popup -->
        <div class="ms-formula-popup__search">
          <span class="ms-formula-popup__search-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="#9ca3af" stroke-width="2"/>
              <path d="M16.5 16.5L21 21" stroke="#9ca3af" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </span>
          <input
            ref="searchInputRef"
            class="ms-formula-popup__search-input"
            v-model="searchText"
            placeholder="Tìm kiếm..."
            @mousedown.stop="handlePopupMousedown"
            @click.stop
          />
        </div>

        <!-- Tab: Công thức -->
        <div v-if="activeTab === 'formula'" class="ms-formula-popup__list">
          <div
            v-for="item in filteredFormulas"
            :key="item.name"
            class="ms-formula-popup__item"
            @mousedown.stop.prevent="insertFormula(item)"
          >
            <span class="ms-formula-popup__icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <text x="2" y="17" font-size="14" font-style="italic" font-weight="bold" fill="#0e9a62" font-family="serif">fx</text>
              </svg>
            </span>
            <div class="ms-formula-popup__item-content">
              <span class="ms-formula-popup__item-name">{{ item.name }}</span><span class="ms-formula-popup__item-params">{{ item.params }}</span>
            </div>
          </div>
          <div v-if="filteredFormulas.length === 0" class="ms-formula-popup__empty">
            Không tìm thấy công thức
          </div>
        </div>

        <!-- Tab: Tham số -->
        <div v-if="activeTab === 'param'" class="ms-formula-popup__list">
          <div
            v-for="item in filteredParams"
            :key="item.code"
            class="ms-formula-popup__item"
            @mousedown.stop.prevent="insertParam(item)"
          >
            <span class="ms-formula-popup__icon ms-formula-popup__icon--db">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <ellipse cx="12" cy="7" rx="9" ry="3.5" stroke="#4b8ef0" stroke-width="1.8"/>
                <path d="M3 7v5c0 1.93 4.03 3.5 9 3.5s9-1.57 9-3.5V7" stroke="#4b8ef0" stroke-width="1.8" fill="none"/>
                <path d="M3 12v5c0 1.93 4.03 3.5 9 3.5s9-1.57 9-3.5v-5" stroke="#4b8ef0" stroke-width="1.8" fill="none"/>
              </svg>
            </span>
            <div class="ms-formula-popup__item-content">
              <span class="ms-formula-popup__item-name">{{ item.name }}</span>
              <span class="ms-formula-popup__item-code">({{ item.code }})</span>
              <div v-if="item.description" class="ms-formula-popup__item-desc">{{ item.description }}</div>
            </div>
          </div>
          <div v-if="filteredParams.length === 0" class="ms-formula-popup__empty">
            Không tìm thấy tham số
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { PrismEditor } from "vue-prism-editor";
import "vue-prism-editor/dist/prismeditor.min.css";
import { highlightFormula } from "./formula-prism.js";
import { EXCEL_FORMULAS } from "@/constants/formulaTemplate.js";
import MsButton from "@/components/base/MsButton.vue";

// ── Props ─────────────────────────────────────────────────────────────────────
const props = defineProps({
  modelValue: { type: String, default: "" },
  variables: { type: Array, default: () => [] },
  /**
   * Danh sách tham số (thành phần lương).
   * Mỗi phần tử: { name, code, description }
   */
  parameters: { type: Array, default: () => [] },
  placeholder: { type: String, default: "Tự động gợi ý công thức khi gõ" },
  label: { type: String, default: "" },
  horizontal: { type: Boolean, default: false },
  isRequired: { type: Boolean, default: false },
  id: { type: String, default: "" },
  errorMessages: { type: String, default: "" },
});

// ── Emits ─────────────────────────────────────────────────────────────────────
const emit = defineEmits(["update:modelValue", "blur", "focus"]);

// ── Refs ──────────────────────────────────────────────────────────────────────
const isFocused = ref(false);
const showPopup = ref(false);
const activeTab = ref("formula");
const searchText = ref("");
const controlRef = ref(null);
const popupRef = ref(null);
const searchInputRef = ref(null);

/**
 * Flag: mousedown đang xảy ra bên trong popup.
 * Giúp handleBlur không đóng popup khi user click vào item trong popup.
 */
const isMouseInsidePopup = ref(false);

// ── ID ────────────────────────────────────────────────────────────────────────
const editorId = computed(
  () => props.id || `ms-formula-${Math.random().toString(36).slice(2, 8)}`,
);

// ── Highlight ─────────────────────────────────────────────────────────────────
function highlightCode(code) {
  return highlightFormula(code);
}

// ── Filtered lists ─────────────────────────────────────────────────────────────
const filteredFormulas = computed(() => {
  const q = searchText.value.trim().toLowerCase();
  if (!q) return EXCEL_FORMULAS;
  return EXCEL_FORMULAS.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      (f.params && f.params.toLowerCase().includes(q)) ||
      (f.description && f.description.toLowerCase().includes(q)),
  );
});

const filteredParams = computed(() => {
  const q = searchText.value.trim().toLowerCase();
  if (!q) return props.parameters;
  return props.parameters.filter(
    (p) =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.code && p.code.toLowerCase().includes(q)),
  );
});

// ── Popup open/close ──────────────────────────────────────────────────────────
function openPopup() {
  showPopup.value = true;
}

function closePopup() {
  showPopup.value = false;
  isMouseInsidePopup.value = false;
}

function switchTab(tab) {
  activeTab.value = tab;
  // Đảm bảo popup vẫn mở sau khi đổi tab
  showPopup.value = true;
}

/**
 * Khi mousedown xảy ra bên trong popup → đánh dấu flag
 * để handleBlur biết không được đóng popup.
 */
function handlePopupMousedown(e) {
  isMouseInsidePopup.value = true;
  // Reset flag sau khi blur+focus cycle hoàn tất
  setTimeout(() => {
    isMouseInsidePopup.value = false;
  }, 300);
}

// ── Event handlers ────────────────────────────────────────────────────────────
function handleInput(value) {
  emit("update:modelValue", value);
  if (value && value.startsWith("=")) {
    // Cập nhật searchText từ token đang gõ
    const afterEq = value.slice(1);
    // Lấy token cuối (sau toán tử, ngoặc, dấu phẩy, khoảng trắng)
    const lastToken = afterEq.split(/[\s+\-*/(),=<>]+/).pop() || "";
    searchText.value = lastToken;
    openPopup();
  } else {
    closePopup();
  }
}

function handleFocus(e) {
  isFocused.value = true;
  emit("focus", e);
  if (props.modelValue && props.modelValue.startsWith("=")) {
    openPopup();
  }
}

function handleBlur(e) {
  isFocused.value = false;
  emit("blur", e);
  // Nếu mousedown đang xảy ra bên trong popup → không đóng
  if (isMouseInsidePopup.value) return;
  closePopup();
}

function handleKeydown(e) {
  if (e.key === "Escape") {
    closePopup();
  }
}

// ── Insert formula ─────────────────────────────────────────────────────────────
function insertFormula(item) {
  const textarea = getTextarea();
  if (!textarea) {
    emit("update:modelValue", (props.modelValue || "=") + item.insertText);
    return;
  }

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const current = props.modelValue || "=";

  // Tìm vị trí bắt đầu của token hiện tại
  const beforeCursor = current.slice(0, start);
  const tokenMatch = beforeCursor.match(/[A-Za-z_][A-Za-z0-9_]*$/);
  const tokenStart = tokenMatch
    ? start - tokenMatch[0].length
    : start;
  // Không cho xóa trước vị trí 1 (giữ nguyên dấu "=")
  const safeStart = Math.max(tokenStart, 1);

  const next = current.slice(0, safeStart) + item.insertText + current.slice(end);
  emit("update:modelValue", next);

  const newPos = safeStart + item.insertText.length;
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(newPos, newPos);
    // Giữ popup mở
    showPopup.value = true;
  });
}

// ── Insert param ───────────────────────────────────────────────────────────────
function insertParam(item) {
  const textarea = getTextarea();
  const codeText = item.code;

  if (!textarea) {
    emit("update:modelValue", (props.modelValue || "=") + codeText);
    return;
  }

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const current = props.modelValue || "=";

  const beforeCursor = current.slice(0, start);
  const tokenMatch = beforeCursor.match(/[A-Za-z_][A-Za-z0-9_]*$/);
  const tokenStart = tokenMatch ? start - tokenMatch[0].length : start;
  const safeStart = Math.max(tokenStart, 1);

  const next = current.slice(0, safeStart) + codeText + current.slice(end);
  emit("update:modelValue", next);

  const newPos = safeStart + codeText.length;
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(newPos, newPos);
    showPopup.value = true;
  });
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function getTextarea() {
  const container = document.getElementById(editorId.value);
  return container
    ? container.closest(".ms-formula__editor-wrap")?.querySelector("textarea")
    : null;
}

function insertVariable(varName) {
  const textarea = getTextarea();
  if (textarea) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = props.modelValue || "";
    const next = current.slice(0, start) + varName + current.slice(end);
    emit("update:modelValue", next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + varName.length, start + varName.length);
    });
  } else {
    emit("update:modelValue", (props.modelValue || "") + varName);
  }
}

function focus() {
  getTextarea()?.focus();
}

// ── Click outside → close popup ────────────────────────────────────────────────
function handleDocumentMousedown(e) {
  if (!showPopup.value) return;
  const control = controlRef.value;
  if (control && control.contains(e.target)) return;
  closePopup();
}

onMounted(() => {
  document.addEventListener("mousedown", handleDocumentMousedown);
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleDocumentMousedown);
});

defineExpose({ focus, insertVariable });
</script>

<style>
/* ── Token colors (global vì PrismEditor không dùng scoped) ── */
.ms-formula__prism .token.function {
  color: #7c3aed;
  font-weight: 600;
}
.ms-formula__prism .token.variable {
  color: #0369a1;
}
.ms-formula__prism .token.number {
  color: #b45309;
}
.ms-formula__prism .token.operator {
  color: #dc2626;
  font-weight: 500;
}
.ms-formula__prism .token.string {
  color: #16a34a;
}
.ms-formula__prism .token.punctuation {
  color: #6b7280;
}
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
   Control wrapper — position: relative để popup
   dùng position: absolute từ đây
══════════════════════════════════════════════ */
.ms-formula__control {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  /* QUAN TRỌNG: overflow: visible để popup không bị clip */
  overflow: visible;
}

/* ══════════════════════════════════════════════
   Editor outer border/shadow
══════════════════════════════════════════════ */
.ms-formula__editor-wrap {
  position: relative;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  background: #ffffff;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
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
  box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1) !important;
}

.ms-formula__editor-wrap--error:hover {
  border-color: #f44336 !important;
}

/* ══════════════════════════════════════════════
   Placeholder
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
  font-family: "Fira Code", "Fira Mono", Consolas, "Courier New", monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ══════════════════════════════════════════════
   PrismEditor overrides
══════════════════════════════════════════════ */
.ms-formula__prism {
  background: transparent !important;
  font-family:
    "Fira Code", "Fira Mono", Consolas, "Courier New", monospace !important;
  font-size: 13.5px !important;
  line-height: 1.65 !important;
  padding: 8px 12px !important;
  min-height: 83px;
  color: #1f2937;
  tab-size: 2;
}

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

:deep(.prism-editor__editor) {
  font-family: inherit !important;
  font-size: inherit !important;
  line-height: inherit !important;
}

:deep(.prism-editor__container) {
  min-height: 83px;
}

/* ══════════════════════════════════════════════
   Tooltip lỗi
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
  transition:
    opacity 0.15s ease,
    visibility 0.15s ease;
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

/* ══════════════════════════════════════════════
   POPUP — absolute, luôn dính vào editor
   z-index cao để đè lên các phần tử khác
══════════════════════════════════════════════ */
.ms-formula-popup {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  min-width: 360px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 340px;
  z-index: 9999;
  animation: ms-popup-in 0.15s ease;
}

@keyframes ms-popup-in {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0);    }
}

/* ── Tabs ── */
.ms-formula-popup__tabs {
  display: flex;
  border-bottom: 1.5px solid #e5e7eb;
  background: #fafafa;
  padding: 0 8px;
  flex-shrink: 0;
}

.ms-formula-popup__tab {
  background: none;
  border: none;
  border-bottom: 2.5px solid transparent;
  padding: 10px 16px;
  font-size: 13.5px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
  margin-bottom: -1.5px;
  line-height: 1;
  font-family: inherit;
}

.ms-formula-popup__tab:hover {
  color: #0e9a62;
}

.ms-formula-popup__tab--active {
  color: #0e9a62;
  border-bottom-color: #0e9a62;
  font-weight: 600;
}

/* ── Search ── */
.ms-formula-popup__search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px 6px;
  border-bottom: 1px solid #f3f4f6;
  flex-shrink: 0;
}

.ms-formula-popup__search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 13px;
  color: #1f2937;
  background: transparent;
  font-family: inherit;
  line-height: 1.5;
}

.ms-formula-popup__search-input::placeholder {
  color: #c9cdd4;
}

/* ── List ── */
.ms-formula-popup__list {
  overflow-y: auto;
  flex: 1;
}

.ms-formula-popup__list::-webkit-scrollbar { width: 4px; }
.ms-formula-popup__list::-webkit-scrollbar-track { background: transparent; }
.ms-formula-popup__list::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

/* ── Item ── */
.ms-formula-popup__item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.1s;
}

.ms-formula-popup__item:last-child {
  border-bottom: none;
}

.ms-formula-popup__item:hover {
  background: #f0fdf9;
}

.ms-formula-popup__icon {
  flex-shrink: 0;
  width: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
}

.ms-formula-popup__item-content {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  min-width: 0;
}

.ms-formula-popup__item-name {
  font-weight: 700;
  font-size: 13.5px;
  color: #111827;
  font-family: "Fira Code", "Fira Mono", Consolas, monospace;
}

.ms-formula-popup__item-params {
  font-size: 12.5px;
  color: #6b7280;
  font-family: "Fira Code", "Fira Mono", Consolas, monospace;
}

.ms-formula-popup__item-code {
  font-size: 12.5px;
  color: #1d6bc9;
  font-family: "Fira Code", "Fira Mono", Consolas, monospace;
  margin-left: 3px;
  font-weight: 500;
}

.ms-formula-popup__item-desc {
  width: 100%;
  font-size: 11.5px;
  color: #9ca3af;
  margin-top: 2px;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ms-formula-popup__empty {
  padding: 20px 16px;
  font-size: 13px;
  color: #9ca3af;
  text-align: center;
}
</style>
