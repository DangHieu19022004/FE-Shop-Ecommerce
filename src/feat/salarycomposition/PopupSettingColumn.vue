<template>
  <div class="popup-setting-column" @click.stop>
    <!-- Header -->
    <div class="psc-header">
      <span class="psc-title">Tùy chỉnh cột</span>
      <button class="psc-reset-btn" title="Lấy lại mặc định" @click="handleReset">
        <i class="mi-update" />
      </button>
    </div>

    <!-- Search box -->
    <div class="psc-search" :class="{ 'psc-search--focused': searchFocused }">
      <i class="mi-search psc-search__icon" />
      <input
        v-model="searchText"
        class="psc-search__input"
        placeholder="Tìm kiếm"
        @focus="searchFocused = true"
        @blur="searchFocused = false"
      />
    </div>

    <!-- Danh sách cột -->
    <div class="psc-list-wrapper">
      <!-- Body: draggable list -->
      <div class="psc-list-body" ref="listBodyRef">
        <template v-if="filteredFields.length > 0">
          <div
            v-for="(field, index) in filteredFields"
            :key="field.key"
            class="psc-item"
            :class="{
              'psc-item--checked': field.isVisible !== false,
              'psc-item--dragging': dragIndex === getLocalIndex(field.key),
              'psc-item--drag-over': dragOverIndex === getLocalIndex(field.key),
            }"
            draggable="true"
            @dragstart="onDragStart($event, getLocalIndex(field.key))"
            @dragover.prevent="onDragOver($event, getLocalIndex(field.key))"
            @drop="onDrop($event, getLocalIndex(field.key))"
            @dragend="onDragEnd"
          >
            <!-- Checkbox -->
            <label class="psc-check-label">
              <input
                type="checkbox"
                class="psc-checkbox"
                :checked="field.isVisible !== false"
                @change="handleToggleField(field.key, $event.target.checked)"
              />
              <span class="psc-check-text">{{ field.label || field.key }}</span>
            </label>

            <!-- Drag handle -->
            <span
              class="psc-drag-handle"
              title="Kéo để sắp xếp"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="5.5" cy="4" r="1.3" fill="currentColor"/>
                <circle cx="10.5" cy="4" r="1.3" fill="currentColor"/>
                <circle cx="5.5" cy="8" r="1.3" fill="currentColor"/>
                <circle cx="10.5" cy="8" r="1.3" fill="currentColor"/>
                <circle cx="5.5" cy="12" r="1.3" fill="currentColor"/>
                <circle cx="10.5" cy="12" r="1.3" fill="currentColor"/>
              </svg>
            </span>
          </div>
        </template>
        <div v-else class="psc-empty">Không tìm thấy cột nào</div>
      </div>
    </div>

    <!-- Actions -->
    <div class="psc-actions">
      <button class="psc-btn psc-btn--cancel" @click="$emit('close')">Hủy</button>
      <button class="psc-btn psc-btn--save" @click="handleSave">Lưu</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';

// ─── Props & Emits ────────────────────────────────────────────────────────────
const props = defineProps({
  /** Danh sách cột có thể tùy chỉnh (không bao gồm cột hệ thống) */
  fields: { type: Array, default: () => [] },
  /** Danh sách cột mặc định để reset */
  defaultFields: { type: Array, default: () => [] },
});

const emit = defineEmits(['close', 'save']);

// ─── State ────────────────────────────────────────────────────────────────────
const searchText    = ref('');
const searchFocused = ref(false);
const listBodyRef   = ref(null);

/** Bản copy local của fields để chỉnh sửa trước khi Lưu */
const localFields = ref(props.fields.map((f) => ({ ...f })));

// Sync khi prop thay đổi
watch(
  () => props.fields,
  (newFields) => { localFields.value = newFields.map((f) => ({ ...f })); },
  { deep: true },
);

// ─── Drag & Drop ──────────────────────────────────────────────────────────────
const dragIndex     = ref(null);
const dragOverIndex = ref(null);

function onDragStart(e, index) {
  dragIndex.value = index;
  e.dataTransfer.effectAllowed = 'move';
}

function onDragOver(e, index) {
  if (dragIndex.value === null || dragIndex.value === index) return;
  dragOverIndex.value = index;
}

function onDrop(e, toIndex) {
  if (dragIndex.value === null || dragIndex.value === toIndex) return;
  const arr = [...localFields.value];
  const [moved] = arr.splice(dragIndex.value, 1);
  arr.splice(toIndex, 0, moved);
  localFields.value = arr;
  dragIndex.value     = null;
  dragOverIndex.value = null;
}

function onDragEnd() {
  dragIndex.value     = null;
  dragOverIndex.value = null;
}

/** Lấy index trong localFields theo key (dùng khi filteredFields có search) */
function getLocalIndex(key) {
  return localFields.value.findIndex((f) => f.key === key);
}

// ─── Computed ─────────────────────────────────────────────────────────────────
const filteredFields = computed(() => {
  const kw = searchText.value.trim().toLowerCase();
  if (!kw) return localFields.value;
  return localFields.value.filter((f) =>
    (f.label || f.key || '').toLowerCase().includes(kw),
  );
});

const visibleCount = computed(
  () => localFields.value.filter((f) => f.isVisible !== false).length,
);

// ─── Handlers ─────────────────────────────────────────────────────────────────
function handleToggleField(key, val) {
  const field = localFields.value.find((f) => f.key === key);
  if (field) field.isVisible = val;
}

function handleReset() {
  // Reset lại toàn bộ thứ tự và state dựa trên defaultFields
  localFields.value = props.defaultFields.map((f) => ({ ...f, isVisible: true }));
}

function handleSave() {
  emit('save', localFields.value.map((f) => ({ ...f })));
}

// ─── Click outside để đóng ────────────────────────────────────────────────────
const handleClickOutside = () => emit('close');

onMounted(() => {
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside);
  }, 0);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* ── Container ── */
.popup-setting-column {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 600;
  width: 320px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(17, 24, 39, 0.16), 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: inherit;
}

/* ── Header ── */
.psc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
  border-bottom: 1px solid #f0f1f3;
}

.psc-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.psc-reset-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: background 0.15s, color 0.15s;
}
.psc-reset-btn:hover {
  background: #f3f4f6;
  color: #111827;
}
.psc-reset-btn i {
  font-size: 16px;
}

/* ── Search ── */
.psc-search {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 10px 12px 6px;
  padding: 0 10px;
  height: 34px;
  border: 1.5px solid #e0e2e7;
  border-radius: 8px;
  background: #f9fafb;
  transition: border-color 0.15s, background 0.15s;
}
.psc-search--focused {
  border-color: #34b057;
  background: #fff;
}

.psc-search__icon {
  font-size: 14px;
  color: #9ca3af;
  flex-shrink: 0;
}

.psc-search__input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 13px;
  color: #111827;
  outline: none;
}
.psc-search__input::placeholder {
  color: #b0b5c0;
}

/* ── List wrapper ── */
.psc-list-wrapper {
  margin: 0 8px 4px;
  overflow: hidden;
}

/* ── List body ── */
.psc-list-body {
  max-height: 260px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
}
.psc-list-body::-webkit-scrollbar { width: 5px; }
.psc-list-body::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

/* ── Item row ── */
.psc-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 12px;
  cursor: default;
  background: #fff;
  border-bottom: 1px solid transparent;
  transition: background 0.1s;
  user-select: none;
}
.psc-item:last-child { border-bottom: none; }

.psc-item:hover {
  background: #f0faf3;
}

.psc-item--dragging {
  opacity: 0.4;
}

.psc-item--drag-over {
  border-top: 2px solid #34b057;
}

/* ── Checkbox label ── */
.psc-check-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex: 1;
  min-width: 0;
}

.psc-check-text {
  font-size: 13.5px;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Custom checkbox ── */
.psc-checkbox {
  appearance: none;
  -webkit-appearance: none;
  width: 17px;
  height: 17px;
  min-width: 17px;
  border: 1.8px solid #c9cdd4;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.psc-checkbox:checked {
  background: #34b057;
  border-color: #34b057;
}
.psc-checkbox:checked::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1.5px;
  width: 5px;
  height: 9px;
  border: 2px solid #fff;
  border-top: none;
  border-left: none;
  transform: rotate(45deg);
}
.psc-checkbox:indeterminate {
  background: #34b057;
  border-color: #34b057;
}
.psc-checkbox:indeterminate::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 6px;
  width: 8px;
  height: 2px;
  background: #fff;
  border-radius: 1px;
}

/* ── Drag handle ── */
.psc-drag-handle {
  display: flex;
  align-items: center;
  padding: 4px 2px;
  color: transparent;
  cursor: grab;
  border-radius: 4px;
  flex-shrink: 0;
  transition: color 0.15s;
}
.psc-drag-handle:active { cursor: grabbing; }
.psc-item:hover .psc-drag-handle { color: #9ca3af; }

/* ── Empty ── */
.psc-empty {
  padding: 20px 12px;
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
}

/* ── Actions ── */
.psc-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 14px 12px;
  border-top: 1px solid #f0f1f3;
}

.psc-btn {
  height: 32px;
  padding: 0 16px;
  border-radius: 6px;
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  border: 1.5px solid transparent;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.psc-btn--cancel {
  background: #fff;
  border-color: #d1d5db;
  color: #374151;
}
.psc-btn--cancel:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.psc-btn--save {
  background: #34b057;
  border-color: #34b057;
  color: #fff;
}
.psc-btn--save:hover {
  background: #2d9e4e;
  border-color: #2d9e4e;
}
</style>