<template>
  <div class="popup-setting-column" @click.stop>
    <!-- Header -->
    <div class="psc-header">
      <span class="psc-title">Tùy chỉnh cột</span>
      <DMButton
        type="none"
        shapeBtn="square"
        iconLeft="mi-update"
        tooltipMessage="Lấy lại mặc định"
        tooltipPosition="bottom"
        class="psc-reset-btn"
        @click="handleReset"
      />
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
            <DMCheckbox
              :modelValue="field.isVisible !== false"
              @update:modelValue="handleToggleField(field.key, $event)"
              class="psc-checkbox-custom"
            >
              <span class="psc-check-text" :title="field.label || field.key">{{ field.label || field.key }}</span>
            </DMCheckbox>

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
      <DMButton message="Lưu" type="green" @click="handleSave" :isTooltip="false" class="psc-btn psc-btn--save" />
    </div>
  </div>
</template>

<script setup>
/**
 * Mục đích: Component popup dùng để tùy chỉnh hiển thị và thứ tự các cột trên bảng.
 * Sử dụng trong trường hợp: Người dùng click vào icon cài đặt (răng cưa) trên bảng danh sách.
 * Hàm quan trọng: handleSave, handleReset, onDrop.
 * CREATED BY: TDHieu (08/06/2026)
 */
import DMButton from "@/components/base/DMButton.vue";
import DMCheckbox from "@/components/base/DMCheckbox.vue";
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
// Từ khóa tìm kiếm cột
const searchText    = ref('');
// Trạng thái focus của ô tìm kiếm
const searchFocused = ref(false);
// Tham chiếu đến DOM element chứa danh sách cột
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
// Vị trí index của cột đang được kéo
const dragIndex     = ref(null);
// Vị trí index của cột đang bị kéo đè lên
const dragOverIndex = ref(null);

/**
 * Bắt đầu quá trình kéo 1 dòng cột.
 *
 * Sử dụng khi: Xảy ra sự kiện dragstart trên phần tử cột.
 *
 * @param {Event} e Sự kiện kéo
 * @param {number} index Vị trí của phần tử đang được kéo
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function onDragStart(e, index) {
  dragIndex.value = index;
  e.dataTransfer.effectAllowed = 'move';
}

/**
 * Xử lý khi phần tử kéo đi qua các phần tử khác.
 *
 * Sử dụng khi: Xảy ra sự kiện dragover trên phần tử cột.
 *
 * @param {Event} e Sự kiện drag
 * @param {number} index Vị trí của phần tử bên dưới đang bị kéo qua
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function onDragOver(e, index) {
  if (dragIndex.value === null || dragIndex.value === index) return;
  dragOverIndex.value = index;
}

/**
 * Xử lý khi thả phần tử xuống vị trí mới.
 *
 * Sử dụng khi: Xảy ra sự kiện drop để hoán đổi vị trí của cột.
 *
 * @param {Event} e Sự kiện drop
 * @param {number} toIndex Vị trí mới cần chèn phần tử vào
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function onDrop(e, toIndex) {
  if (dragIndex.value === null || dragIndex.value === toIndex) return;
  const arr = [...localFields.value];
  const [moved] = arr.splice(dragIndex.value, 1);
  arr.splice(toIndex, 0, moved);
  localFields.value = arr;
  dragIndex.value     = null;
  dragOverIndex.value = null;
}

/**
 * Kết thúc quá trình kéo thả, dọn dẹp state.
 *
 * Sử dụng khi: Xảy ra sự kiện dragend.
 *
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function onDragEnd() {
  dragIndex.value     = null;
  dragOverIndex.value = null;
}

/**
 * Lấy index trong localFields theo key.
 *
 * Sử dụng khi: Cần lấy index thật trong danh sách gốc thay vì danh sách đã filter do tìm kiếm.
 *
 * @param {string} key Mã cột
 * @returns {number} Vị trí index
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function getLocalIndex(key) {
  return localFields.value.findIndex((f) => f.key === key);
}

// ─── Computed ─────────────────────────────────────────────────────────────────
// Danh sách cột hiển thị sau khi đã lọc theo từ khóa tìm kiếm
const filteredFields = computed(() => {
  const kw = searchText.value.trim().toLowerCase();
  if (!kw) return localFields.value;
  return localFields.value.filter((f) =>
    (f.label || f.key || '').toLowerCase().includes(kw),
  );
});

// Số lượng cột đang được thiết lập là hiển thị
const visibleCount = computed(
  () => localFields.value.filter((f) => f.isVisible !== false).length,
);

// ─── Handlers ─────────────────────────────────────────────────────────────────
/**
 * Đổi trạng thái ẩn/hiện của 1 cột.
 *
 * Sử dụng khi: Người dùng tick/untick checkbox của 1 cột trong popup.
 *
 * @param {string} key Key của cột
 * @param {boolean} val Giá trị ẩn hay hiện
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function handleToggleField(key, val) {
  const field = localFields.value.find((f) => f.key === key);
  if (field) field.isVisible = val;
}

/**
 * Reset cấu hình hiển thị cột về trạng thái mặc định của hệ thống.
 *
 * Sử dụng khi: Người dùng click vào icon Reset (tải lại mặc định) trên Header popup.
 *
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function handleReset() {
  // Reset lại toàn bộ thứ tự và state dựa trên defaultFields
  localFields.value = props.defaultFields.map((f) => ({ ...f, isVisible: true }));
}

/**
 * Lưu lại các thiết lập tùy chỉnh cột.
 *
 * Sử dụng khi: Người dùng nhấn nút "Lưu".
 *
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function handleSave() {
  emit('save', localFields.value.map((f) => ({ ...f })));
}

// ─── Click outside để đóng ────────────────────────────────────────────────────
/**
 * Đóng popup khi click ra ngoài vùng popup.
 *
 * Sử dụng khi: Xử lý event listener click trên toàn document.
 *
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
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
  height: 490px;
  width: 400px;
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
}

.psc-title {
  font-size: 16px;
  font-weight: 600;
  color: #212121;
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
  border-color: #0E9A62;
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
  /* flex: 1; */
  overflow: hidden;
}

/* ── List body ── */
.psc-list-body {
  max-height: 320px;
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
  border-top: 2px solid #0E9A62;
}

.psc-checkbox-custom {
  flex: 1;
  min-width: 0;
}

:deep(.psc-checkbox-custom .ms-checkbox__label) {
  flex: 1;
  min-width: 0;
  color: #2b3240;
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
  width: 80px !important;
  height: 32px !important;
  background: #0E9A62;
  border-color: #0E9A62;
  color: #fff;
}
.psc-btn--save:hover {
  background: #2d9e4e;
  border-color: #2d9e4e;
}
</style>
