<template>
  <div class="ms-table-wrapper" ref="wrapperRef">
    <table :class="[tableClass, { 'ms-table--empty': dataRows.length === 0 }]" class="ms-table" ref="tableRef">
      <!-- COLGROUP để control width theo từng cột -->
      <colgroup>
        <col
          v-for="(field, index) in internalFields"
          :key="'col-' + index"
          :style="{ width: columnWidths[index] ? columnWidths[index] + 'px' : 'auto' }"
        />
      </colgroup>

      <thead :class="tableClassHead" :id="tableIdHead">
        <tr>
          <th
            v-for="(field, index) in internalFields"
            :key="index"
            :class="[field.classHead, { 'col-pinned-left': field.pinned === 'left', 'col-drag-over': dragOverIndex === index, 'col-actions': field.key === 'actions' }]"
            :style="getThStyle(field, index)"
            @dragover.prevent="onColDragOver($event, index)"
            @drop="onColDrop($event, index)"
            @dragend="onColDragEnd"
            @click.stop="pinnable && field.pinnable !== false ? openMenu($event, index) : null"
          >
            <!--
              col-drag-zone: chỉ vùng content này mới có thể khởi động drag-to-reorder.
              Resize handle nằm ngoài zone này nên không bị lẫn.
            -->
            <div
              class="col-drag-zone"
              :draggable="draggable && field.draggable !== false"
              @dragstart="onColDragStart($event, index)"
            >
              <!-- Icon pin hiển khi cột đang được ghim -->
              <span v-if="field.pinned === 'left'" class="col-pin-icon" title="Đang ghim cột">
                <div class="mi-pinned"></div>
              </span>

              <!-- Nội dung header -->
              <slot :name="`header-${field.slot || field.key}`" :field="field">
                {{ field.label }}
              </slot>
            </div>

            <!-- Resize handle: nằm ngoài col-drag-zone, không trigger drag cột -->
            <div
              v-if="resizable && field.resizable !== false"
              class="col-resize-handle"
              @mousedown.stop="onResizeStart($event, index)"
            ></div>
          </th>
        </tr>
      </thead>

      <tbody :class="tableClassBody" :id="tableIdBody">
        <tr v-if="dataRows.length === 0" class="ms-empty-row">
          <td :colspan="internalFields.length" class="ms-empty">
            <div class="ms-empty-content">
              <div class="mi-table-nodata"></div>
              <span>{{ emptyText }}</span>
            </div>
          </td>
        </tr>

        <tr
          v-else
          v-for="(row, rowIndex) in dataRows"
          :key="rowIndex"
          @click="emit('row-click', row)"
        >
          <td
            v-for="(field, colIndex) in internalFields"
            :key="colIndex"
            :class="[field.classBody, { 'col-pinned-left': field.pinned === 'left', 'col-actions': field.key === 'actions' }]"
            :style="getTdStyle(field, colIndex)"
          >
            <slot :name="`cell-${field.slot || field.key}`" :row="row">
              {{ row[field.key] || "--" }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- MsMenuTable dropdown -->
    <MsMenuTable
      v-if="menuOpen && pinnable"
      :is-pinned="activeFieldPinned"
      :style="menuStyle"
      class="ms-table-col-menu"
      @pin="onMenuPin"
      @unpin="onMenuUnpin"
      @close="closeMenu"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import MsMenuTable from "../overlay/MsMenuTable.vue";

// ─── Props ───────────────────────────────────────────────────────────────────
const props = defineProps({
  fields: {
    type: Array,
    default: () => [],
  },
  dataRows: {
    type: Array,
    default: () => [],
  },
  emptyText: {
    type: String,
    default: "Không có dữ liệu",
  },
  tableClass: {
    type: [String, Array, Object],
    default: "",
  },
  tableClassHead: {
    type: [String, Array, Object],
    default: "",
  },
  tableIdHead: {
    type: String,
    default: "",
  },
  tableClassBody: {
    type: [String, Array, Object],
    default: "",
  },
  tableIdBody: {
    type: String,
    default: "",
  },
  /** Cho phép resize cột */
  resizable: {
    type: Boolean,
    default: true,
  },
  /** Cho phép ghim cột trái */
  pinnable: {
    type: Boolean,
    default: true,
  },
  /** Cho phép kéo thả sắp xếp cột */
  draggable: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["row-click", "update:fields"]);

// ─── Refs ─────────────────────────────────────────────────────────────────────
const tableRef = ref(null);
const wrapperRef = ref(null);

// ─── Menu state ────────────────────────────────────────────────────────────────────
const menuOpen = ref(false);
const menuStyle = ref({});
const activeColIndex = ref(-1);

const activeFieldPinned = computed(
  () => internalFields.value[activeColIndex.value]?.pinned === 'left'
);

function openMenu(e, index) {
  // Toggle: nếu đang mở đúng cột này thì đóng lại
  if (menuOpen.value && activeColIndex.value === index) {
    closeMenu();
    return;
  }
  activeColIndex.value = index;
  // Tính vị trí dropdown: ngay dưới th, căn theo wrapper
  const th = e.currentTarget;
  const thRect = th.getBoundingClientRect();
  const wrapperRect = wrapperRef.value.getBoundingClientRect();
  menuStyle.value = {
    position: 'absolute',
    top: (thRect.bottom - wrapperRect.top) + 'px',
    left: (thRect.left - wrapperRect.left) + 'px',
    zIndex: 100,
    boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
    borderRadius: '4px',
    minWidth: '160px',
  };
  menuOpen.value = true;
}

function closeMenu() {
  menuOpen.value = false;
  activeColIndex.value = -1;
}

function onMenuPin() {
  const field = internalFields.value[activeColIndex.value];
  if (field) {
    field.pinned = 'left';
    emit('update:fields', internalFields.value.map(f => ({ ...f })));
  }
  closeMenu();
}

function onMenuUnpin() {
  const field = internalFields.value[activeColIndex.value];
  if (field) {
    field.pinned = null;
    emit('update:fields', internalFields.value.map(f => ({ ...f })));
  }
  closeMenu();
}

// Đóng menu khi click bên ngoài
function onClickOutside(e) {
  if (!menuOpen.value) return;
  const wrapper = wrapperRef.value;
  if (wrapper && !wrapper.contains(e.target)) {
    closeMenu();
  }
}

// ─── Internal fields ──────────────────────────────────────────────────────────
const internalFields = ref(props.fields.map((f) => ({ ...f, pinned: f.pinned || null })));

watch(
  () => props.fields,
  (newFields) => {
    internalFields.value = newFields.map((f) => ({ ...f, pinned: f.pinned || null }));
  },
  { deep: true }
);

// ─── Column widths (resize) ───────────────────────────────────────────────────
const columnWidths = ref({});

function initColumnWidths() {
  if (!tableRef.value) return;
  const ths = tableRef.value.querySelectorAll("thead th");
  const widths = {};
  ths.forEach((th, i) => {
    widths[i] = th.getBoundingClientRect().width;
  });
  columnWidths.value = widths;
}

onMounted(() => {
  nextTick(initColumnWidths);
  document.addEventListener('click', onClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside);
});

// ─── Resize logic ─────────────────────────────────────────────────────────────
let resizing = false;
let resizeIndex = -1;
let resizeStartX = 0;
let resizeStartWidth = 0;

function onResizeStart(e, index) {
  resizing = true;
  resizeIndex = index;
  resizeStartX = e.clientX;

  if (!columnWidths.value[index]) {
    const ths = tableRef.value?.querySelectorAll("thead th");
    resizeStartWidth = ths?.[index]?.getBoundingClientRect().width || 120;
    columnWidths.value = { ...columnWidths.value, [index]: resizeStartWidth };
  } else {
    resizeStartWidth = columnWidths.value[index];
  }

  document.addEventListener("mousemove", onResizeMove);
  document.addEventListener("mouseup", onResizeEnd);
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
}

function onResizeMove(e) {
  if (!resizing) return;
  const delta = e.clientX - resizeStartX;
  const newWidth = Math.max(40, resizeStartWidth + delta);
  columnWidths.value = { ...columnWidths.value, [resizeIndex]: newWidth };
}

function onResizeEnd() {
  resizing = false;
  resizeIndex = -1;
  document.removeEventListener("mousemove", onResizeMove);
  document.removeEventListener("mouseup", onResizeEnd);
  document.body.style.cursor = "";
  document.body.style.userSelect = "";
}

onBeforeUnmount(() => {
  document.removeEventListener("mousemove", onResizeMove);
  document.removeEventListener("mouseup", onResizeEnd);
});

// ─── Column drag-to-reorder (HTML5 native drag API) ───────────────────────────
let dragSrcIndex = -1;
const dragOverIndex = ref(-1);

function onColDragStart(e, index) {
  // Không cho drag nếu field tắt draggable
  if (internalFields.value[index]?.draggable === false) {
    e.preventDefault();
    return;
  }
  dragSrcIndex = index;
  e.dataTransfer.effectAllowed = "move";
  // Lưu width hiện tại trước khi reorder
  if (!columnWidths.value[index]) {
    const ths = tableRef.value?.querySelectorAll("thead th");
    columnWidths.value = { ...columnWidths.value, [index]: ths?.[index]?.getBoundingClientRect().width || 120 };
  }
}

function onColDragOver(e, index) {
  if (dragSrcIndex === index) return;
  dragOverIndex.value = index;
}

function onColDrop(e, index) {
  if (dragSrcIndex === -1 || dragSrcIndex === index) return;

  const newFields = [...internalFields.value];
  const [moved] = newFields.splice(dragSrcIndex, 1);
  newFields.splice(index, 0, moved);

  // Rebuild columnWidths theo thứ tự mới
  const oldWidths = { ...columnWidths.value };
  const newWidths = {};
  // Map lại widths: vị trí cũ -> vị trí mới
  const oldOrder = [...Array(internalFields.value.length).keys()];
  const newOrder = [...oldOrder];
  const [movedIdx] = newOrder.splice(dragSrcIndex, 1);
  newOrder.splice(index, 0, movedIdx);
  newOrder.forEach((oldIdx, newIdx) => {
    if (oldWidths[oldIdx] !== undefined) newWidths[newIdx] = oldWidths[oldIdx];
  });

  internalFields.value = newFields;
  columnWidths.value = newWidths;
  emit("update:fields", newFields.map((f) => ({ ...f })));
}

function onColDragEnd() {
  dragSrcIndex = -1;
  dragOverIndex.value = -1;
}

// ─── Pin logic ────────────────────────────────────────────────────────────────
function togglePin(index) {
  const field = internalFields.value[index];
  if (!field) return;
  field.pinned = field.pinned === "left" ? null : "left";
  emit("update:fields", internalFields.value.map((f) => ({ ...f })));
}

const pinnedLeftOffsets = computed(() => {
  const offsets = {};
  let accumulated = 0;
  internalFields.value.forEach((field, i) => {
    if (field.pinned === "left") {
      offsets[i] = accumulated;
      accumulated += columnWidths.value[i] || 120;
    }
  });
  return offsets;
});

function getThStyle(field, index) {
  const style = {};
  if (field.pinned === "left") {
    style.position = "sticky";
    style.left = (pinnedLeftOffsets.value[index] ?? 0) + "px";
    style.zIndex = 3;
    style.backgroundColor = "#f9fafb";
    style.boxShadow = "2px 0 6px -2px rgba(0,0,0,0.12)";
  } else if (field.key === "actions") {
    style.position = "sticky";
    style.right = "0px";
    style.zIndex = 3;
    style.backgroundColor = "transparent";
    style.boxShadow = "-2px 0 6px -2px rgba(0,0,0,0.12)";
  }
  return style;
}

function getTdStyle(field, index) {
  const style = {};
  if (field.pinned === "left") {
    style.position = "sticky";
    style.left = (pinnedLeftOffsets.value[index] ?? 0) + "px";
    style.zIndex = 1;
    style.backgroundColor = "#fff";
    style.boxShadow = "2px 0 6px -2px rgba(0,0,0,0.08)";
  } else if (field.key === "actions") {
    style.position = "sticky";
    style.right = "0px";
    style.zIndex = 1;
    style.backgroundColor = "transparent";
    style.boxShadow = "-2px 0 6px -2px rgba(0,0,0,0.08)";
  }
  return style;
}
</script>

<style scoped>
/* ── Wrapper ── */
.ms-table-wrapper {
  width: 100%;
  height: 100%;
  overflow: auto;
  position: relative;
}

/* ── Table base ── */
.ms-table {
  border-collapse: collapse;
  min-width: max-content;
  width: 100%;
  height: auto;       /* Bỏ height: 100% khi có dữ liệu để tránh giãn dòng */
  table-layout: fixed;
}

.ms-table.ms-table--empty {
  height: 100%;       /* Khi rỗng thì chiếm 100% để căn giữa icon */
}

/* tbody fill phần còn lại sau thead */
.ms-table tbody {
  height: auto;
}

.ms-table.ms-table--empty tbody {
  height: calc(100% - 40px); /* 40px = height của thead */
}

/* ── th / td chung ── */
.ms-table th,
.ms-table td {
  border-bottom: 1px solid #e4e7ec;
  padding: 0 12px;
  text-align: left;
  background-color: #fff;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
}

.ms-table th {
  position: sticky;
  top: 0;
  background-color: #f9fafb;
  height: 40px;
  z-index: 2;
  border-top: 1.5px solid #e4e7ec;
  font-weight: 500;
  color: #374151;
  user-select: none;
}

.ms-table td {
  height: 48px;
}

/* ── Drag handle ── */
.col-drag-handle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 100%;
  cursor: grab;
  opacity: 0;
  transition: opacity 0.15s;
  vertical-align: middle;
  margin-right: 4px;
  flex-shrink: 0;
}

.ms-table th:hover .col-drag-handle {
  opacity: 1;
}

.col-drag-handle:active {
  cursor: grabbing;
}

/* ── Drag over indicator ── */
.col-drag-over {
  border-left: 2px solid #1c6ef3 !important;
  background-color: #eff6ff !important;
}

/* ── Drag zone: vùng content kéo thả cột, tách biệt khỏi resize handle ── */
.col-drag-zone {
  display: inline-flex;
  align-items: center;
  height: 100%;
  width: calc(100% - 5px); /* trừ đi 5px của resize handle */
  overflow: hidden;
  cursor: grab;
  gap: 4px;
}

.col-drag-zone:active {
  cursor: grabbing;
}

/* Cột không cho drag: cursor bình thường */
[draggable="false"] .col-drag-zone,
.col-drag-zone[draggable="false"] {
  cursor: default;
}


/* ── Pin button ── */
.col-pin-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  opacity: 0;
  transition: opacity 0.15s;
  vertical-align: middle;
  margin-left: 2px;
  border-radius: 3px;
  flex-shrink: 0;
}

.col-pin-btn:hover {
  background-color: #e5eaf3;
}

.ms-table th:hover .col-pin-btn,
.col-pin-btn--active {
  opacity: 1;
}

/* ── Resize handle ── */
.col-resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  cursor: col-resize;
  z-index: 10;
  background: transparent;
  transition: background 0.15s;
}

.col-resize-handle:hover,
.col-resize-handle:active {
  background: linear-gradient(to right, transparent 1px, #1c6ef3 1px, #1c6ef3 3px, transparent 3px);
}

/* ── Drag ghost / chosen ── */
.col-ghost {
  opacity: 0.3;
  background: #dbeafe !important;
}

/* ── Hover row ── */
.ms-table tbody tr:hover td {
  background-color: #CDEADF!important;
  cursor: pointer;
}

/* ── Empty state ── */
.ms-empty {
  height: 100%;          /* tr/td chiếm hết tbody */
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
  vertical-align: middle;
}

/* Nội dung căn giữa cả ngang lẫn dọc */
.ms-empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 100%;
  min-height: 200px;
  padding: 24px 0;
}

/* ── Sticky action column ── */
.col_unhide {
  position: sticky;
  right: 0;
  z-index: 2;
}

.col_unhide .btn__action {
  display: none;
}

tbody tr:hover .btn__action {
  display: flex;
}

/* ── Hidden col ── */
.col-hidden {
  display: none !important;
}

.icon__tick_green {
  -webkit-mask-image: url(https://amisplatform.misacdn.net/apps/recruit/assets/images/ICON.svg);
  -webkit-mask-position: -208px -32px;
  -webkit-mask-repeat: no-repeat;
  width: 16px;
  height: 16px;
  background-color: green;
}

.green_text {
  color: green;
  margin-left: 4px;
}

.btn__edit_item {
  width: 20px;
  height: 20px;
  min-width: 20px;
  -webkit-mask-image: url(/src/assets/icons/ICON.svg);
  -webkit-mask-position: -180px -656px;
  -webkit-mask-repeat: no-repeat;
  background-color: #7a8188;
}

/* ── Hover to show actions ── */
.ms-table tbody tr :deep(.btn_action),
.ms-table tbody tr :deep(.btn__action) {
  opacity: 0;
  transition: opacity 0.15s ease-in-out;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.ms-table tbody tr:hover :deep(.btn_action),
.ms-table tbody tr:hover :deep(.btn__action) {
  opacity: 1;
}

/* Đảm bảo cột action không bị che khuất và có màu nền đồng bộ với dòng (tránh đè chữ khi cuộn) */
.ms-table .col-actions {
  min-width: 210px;
  width: 210px;
}

.ms-table td.col-actions {
  background-color: transparent !important;
}

.ms-table tbody tr:hover td.col-actions {
  background-color: transparent !important;
}
</style>