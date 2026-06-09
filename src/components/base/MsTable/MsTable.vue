<template>
  <div class="ms-table-wrapper" ref="wrapperRef">
    <table :class="[tableClass, { 'ms-table--empty': dataRows.length === 0 }]" class="ms-table" ref="tableRef">
      <!-- COLGROUP để control width theo từng cột -->
      <colgroup>
        <col
          v-for="(field, index) in internalFields"
          :key="'col-' + index"
          :style="{ width: getColumnWidth(index) + 'px' }"
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
          <td :colspan="internalFields.length" class="ms-empty"></td>
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
            :title="(!field.slot && field.key !== 'actions' && field.key !== 'ghost') ? (String(row[field.key] ?? '').trim() || undefined) : undefined"
          >
            <slot :name="`cell-${field.slot || field.key}`" :row="row">
              <template v-if="field.key !== 'actions' && field.key !== 'ghost'">{{ row[field.key] || "--" }}</template>
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Empty state overlay: positioned relative to wrapper visual width, not table scroll width -->
    <!-- Điều này đảm bảo icon luôn hiển thị ở giữa vùng nhìn thấy mà không cần scroll ngang -->
    <div v-if="dataRows.length === 0" class="ms-empty-overlay">
      <div class="mi-table-nodata"></div>
      <span>{{ emptyText }}</span>
    </div>

    <!-- MsMenuTable dropdown -->
    <MsMenuTable
      v-if="menuOpen && pinnable"
      :is-pinned="activeFieldPinned"
      :active-sort="activeFieldSort"
      :style="menuStyle"
      class="ms-table-col-menu"
      @pin="onMenuPin"
      @unpin="onMenuUnpin"
      @sort="onMenuSort"
      @close="closeMenu"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import MsMenuTable from "./MsMenuTable.vue";

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
  /** Width mặc định cho các cột không khai báo field.width */
  defaultColumnWidth: {
    type: Number,
    default: 150,
  },
  /** Width tối thiểu khi resize cột */
  minColumnWidth: {
    type: Number,
    default: 40,
  },
  sortField: {
    type: String,
    default: "",
  },
  sortDirection: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["row-click", "update:fields", "sort-change", "column-resize"]);

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

const activeFieldSort = computed(() => {
  const activeField = internalFields.value[activeColIndex.value];
  if (!activeField || activeField.key !== props.sortField) return "none";
  return props.sortDirection || "none";
});

/**
 * Mở menu context tại cột tương ứng.
 *
 * Sử dụng khi: Người dùng click vào biểu tượng menu trên header của cột.
 *
 * @param {Event} e Sự kiện click
 * @param {number} index Vị trí cột trong mảng internalFields
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
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

/**
 * Đóng menu context.
 *
 * Sử dụng khi: Chọn xong action trên menu hoặc click ra ngoài.
 *
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function closeMenu() {
  menuOpen.value = false;
  activeColIndex.value = -1;
}

/**
 * Xử lý sự kiện ghim cột từ menu.
 *
 * Sử dụng khi: Người dùng chọn action ghim cột.
 *
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function onMenuPin() {
  const field = internalFields.value[activeColIndex.value];
  if (field) {
    field.pinned = 'left';
    emit('update:fields', internalFields.value.map(f => ({ ...f })));
  }
  closeMenu();
}

/**
 * Xử lý sự kiện bỏ ghim cột từ menu.
 *
 * Sử dụng khi: Người dùng chọn action bỏ ghim cột.
 *
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function onMenuUnpin() {
  const field = internalFields.value[activeColIndex.value];
  if (field) {
    field.pinned = null;
    emit('update:fields', internalFields.value.map(f => ({ ...f })));
  }
  closeMenu();
}

/**
 * Xử lý sự kiện sắp xếp cột từ menu.
 *
 * Sử dụng khi: Người dùng chọn action sắp xếp tăng/giảm dần trên menu.
 *
 * @param {string} direction Chiều sắp xếp ('asc', 'desc', 'none')
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function onMenuSort(direction) {
  const field = internalFields.value[activeColIndex.value];
  if (!field || !field.key) {
    closeMenu();
    return;
  }

  emit("sort-change", {
    field: direction === "none" ? "" : field.key,
    direction: direction === "none" ? "" : direction,
  });
  closeMenu();
}

/**
 * Đóng menu khi click bên ngoài vùng menu.
 *
 * Sử dụng khi: Lắng nghe sự kiện click trên toàn document để ẩn dropdown.
 *
 * @param {Event} e Sự kiện click
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
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
    columnWidths.value = buildInitialColumnWidths(internalFields.value);
  },
  { deep: true }
);

// ─── Column widths (resize) ───────────────────────────────────────────────────
// Lưu trữ độ rộng thực tế của các cột (key là index cột)
const columnWidths = ref({});

/**
 * Chuẩn hóa giá trị độ rộng cột thành số.
 *
 * Sử dụng khi: Cần đảm bảo độ rộng lấy từ cấu hình hoặc style là một số hợp lệ.
 *
 * @param {string|number} width Giá trị độ rộng đầu vào
 * @returns {number|null} Giá trị độ rộng dạng số hoặc null nếu không hợp lệ
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function normalizeColumnWidth(width) {
  const parsedWidth = typeof width === "number" ? width : parseFloat(width);
  return Number.isFinite(parsedWidth) && parsedWidth > 0 ? parsedWidth : null;
}

/**
 * Lấy độ rộng khởi tạo cho một cột dựa vào cấu hình.
 *
 * Sử dụng khi: Thiết lập độ rộng mặc định lúc mới render cột.
 *
 * @param {Object} field Cấu hình của cột
 * @returns {number} Độ rộng khởi tạo của cột
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function getInitialColumnWidth(field) {
  return normalizeColumnWidth(field?.width) || props.defaultColumnWidth;
}

/**
 * Tạo object chứa độ rộng khởi tạo cho tất cả các cột.
 *
 * Sử dụng khi: Khởi tạo dữ liệu độ rộng lúc component mounted hoặc fields thay đổi.
 *
 * @param {Array} fields Mảng cấu hình các cột
 * @returns {Object} Đối tượng chứa độ rộng các cột { index: width }
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function buildInitialColumnWidths(fields) {
  const widths = {};
  fields.forEach((field, index) => {
    widths[index] = getInitialColumnWidth(field);
  });
  return widths;
}

/**
 * Lấy độ rộng hiện tại của một cột.
 *
 * Sử dụng khi: Bind style width cho các thẻ <col> trong bảng.
 *
 * @param {number} index Vị trí cột
 * @returns {number} Độ rộng cột bằng px
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function getColumnWidth(index) {
  return columnWidths.value[index] || getInitialColumnWidth(internalFields.value[index]);
}

/**
 * Khởi tạo state columnWidths từ internalFields.
 *
 * Sử dụng khi: Component được mount hoặc fields thay đổi.
 *
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function initColumnWidths() {
  columnWidths.value = buildInitialColumnWidths(internalFields.value);
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

/**
 * Bắt đầu quá trình thay đổi độ rộng cột.
 *
 * Sử dụng khi: Người dùng mousedown vào thanh resize của cột.
 *
 * @param {Event} e Sự kiện chuột
 * @param {number} index Vị trí cột
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function onResizeStart(e, index) {
  resizing = true;
  resizeIndex = index;
  resizeStartX = e.clientX;

  if (!columnWidths.value[index]) {
    const ths = tableRef.value?.querySelectorAll("thead th");
    resizeStartWidth = ths?.[index]?.getBoundingClientRect().width || getColumnWidth(index);
    columnWidths.value = { ...columnWidths.value, [index]: resizeStartWidth };
  } else {
    resizeStartWidth = columnWidths.value[index];
  }

  document.addEventListener("mousemove", onResizeMove);
  document.addEventListener("mouseup", onResizeEnd);
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
}

/**
 * Thay đổi độ rộng cột khi đang kéo chuột.
 *
 * Sử dụng khi: Cập nhật lại độ rộng khi người dùng rê chuột (mousemove).
 *
 * @param {Event} e Sự kiện chuột
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function onResizeMove(e) {
  if (!resizing) return;
  const delta = e.clientX - resizeStartX;
  const newWidth = Math.max(props.minColumnWidth, resizeStartWidth + delta);
  columnWidths.value = { ...columnWidths.value, [resizeIndex]: newWidth };
}

/**
 * Kết thúc quá trình thay đổi độ rộng cột.
 *
 * Sử dụng khi: Người dùng thả chuột (mouseup) sau khi resize. Emit sự kiện cho cha.
 *
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function onResizeEnd() {
  if (resizing && resizeIndex !== -1) {
    // Emit column-resize khi thả chuột để parent có thể save vào DB
    const field = internalFields.value[resizeIndex];
    const finalWidth = columnWidths.value[resizeIndex];
    if (field && finalWidth) {
      emit("column-resize", { field, width: Math.round(finalWidth) });
    }
  }
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
// Vị trí cột đang được kéo
let dragSrcIndex = -1;
// Vị trí cột đang được hover (kéo ngang qua)
const dragOverIndex = ref(-1);

/**
 * Kiểm tra xem một cột có được phép kéo thả hay không.
 *
 * Sử dụng khi: Cần kiểm tra quyền drag trước khi bắt đầu kéo.
 *
 * @param {number} index Vị trí cột
 * @returns {boolean} True nếu được phép kéo
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function isColumnDraggable(index) {
  return internalFields.value[index]?.draggable !== false;
}

/**
 * Bắt đầu quá trình kéo thả cột.
 *
 * Sử dụng khi: Sự kiện dragstart xảy ra trên thẻ chứa cột.
 *
 * @param {Event} e Sự kiện drag
 * @param {number} index Vị trí cột bắt đầu kéo
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function onColDragStart(e, index) {
  // Không cho drag nếu field tắt draggable
  if (!isColumnDraggable(index)) {
    e.preventDefault();
    return;
  }
  dragSrcIndex = index;
  e.dataTransfer.effectAllowed = "move";
  // Lưu width hiện tại trước khi reorder
  if (!columnWidths.value[index]) {
    const ths = tableRef.value?.querySelectorAll("thead th");
    columnWidths.value = { ...columnWidths.value, [index]: ths?.[index]?.getBoundingClientRect().width || getColumnWidth(index) };
  }
}

/**
 * Xử lý khi cột đang kéo di chuyển qua một cột khác.
 *
 * Sử dụng khi: Sự kiện dragover xảy ra để cập nhật UI báo hiệu vị trí thả.
 *
 * @param {Event} e Sự kiện drag
 * @param {number} index Vị trí cột đang được hover
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function onColDragOver(e, index) {
  if (dragSrcIndex === -1 || dragSrcIndex === index || !isColumnDraggable(index)) {
    dragOverIndex.value = -1;
    if (e.dataTransfer) e.dataTransfer.dropEffect = "none";
    return;
  }

  if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
  dragOverIndex.value = index;
}

/**
 * Xử lý khi người dùng thả cột vào vị trí mới.
 *
 * Sử dụng khi: Sự kiện drop xảy ra, cập nhật lại thứ tự cột và width.
 *
 * @param {Event} e Sự kiện drag
 * @param {number} index Vị trí mới của cột
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function onColDrop(e, index) {
  if (dragSrcIndex === -1 || dragSrcIndex === index || !isColumnDraggable(index)) {
    dragOverIndex.value = -1;
    return;
  }

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

/**
 * Kết thúc quá trình kéo thả.
 *
 * Sử dụng khi: Sự kiện dragend xảy ra, dọn dẹp state drag.
 *
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function onColDragEnd() {
  dragSrcIndex = -1;
  dragOverIndex.value = -1;
}

// ─── Pin logic ────────────────────────────────────────────────────────────────
/**
 * Thay đổi trạng thái ghim/bỏ ghim cột.
 *
 * Sử dụng khi: Cần thao tác ghim cột vào bên trái màn hình.
 *
 * @param {number} index Vị trí cột
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function togglePin(index) {
  const field = internalFields.value[index];
  if (!field) return;
  field.pinned = field.pinned === "left" ? null : "left";
  emit("update:fields", internalFields.value.map((f) => ({ ...f })));
}

// Tính toán khoảng cách (offset) từ lề trái cho các cột đang được ghim
const pinnedLeftOffsets = computed(() => {
  const offsets = {};
  let accumulated = 0;
  internalFields.value.forEach((field, i) => {
    if (field.pinned === "left") {
      offsets[i] = accumulated;
      accumulated += getColumnWidth(i);
    }
  });
  return offsets;
});

/**
 * Tính toán style cho header (th) của cột.
 *
 * Sử dụng khi: Render thead để thiết lập position, độ rộng cho cột ghim.
 *
 * @param {Object} field Dữ liệu cột
 * @param {number} index Vị trí cột
 * @returns {Object} Style object
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function getThStyle(field, index) {
  const style = {};
  if (field.pinned === "left") {
    style.position = "sticky";
    style.left = (pinnedLeftOffsets.value[index] ?? 0) + "px";
    // z-index phải cao hơn th thường (z-index: 10 từ CSS) để không bị đè khi scroll ngang
    style.zIndex = 20;
    style.backgroundColor = "#f9fafb";
    style.boxShadow = "2px 0 6px -2px rgba(0,0,0,0.12)";
  } else if (field.key === "actions") {
    style.position = "sticky";
    style.right = "0px";
    style.zIndex = 4;
    style.backgroundColor = "#f9fafb";
    style.boxShadow = "-2px 0 6px -2px rgba(0,0,0,0.12)";
    style.width = "50px";
    style.minWidth = "50px";
    style.maxWidth = "50px";
    style.overflow = "visible";
  }
  return style;
}

/**
 * Tính toán style cho ô dữ liệu (td) của cột.
 *
 * Sử dụng khi: Render tbody để thiết lập position, độ rộng cho cột ghim.
 *
 * @param {Object} field Dữ liệu cột
 * @param {number} index Vị trí cột
 * @returns {Object} Style object
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
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
    style.zIndex = 3;
    style.backgroundColor = "#fff";
    style.boxShadow = "-2px 0 6px -2px rgba(0,0,0,0.08)";
    style.width = "50px";
    style.minWidth = "50px";
    style.maxWidth = "50px";
    style.overflow = "visible";
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
  scrollbar-width: thin;
  scrollbar-color: #CBCBCB transparent;
}

.ms-table-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.ms-table-wrapper::-webkit-scrollbar-thumb {
  background-color: #CBCBCB;
  border-radius: 6px;
}

.ms-table-wrapper::-webkit-scrollbar-track {
  background: transparent;
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
  height: 36px;
  z-index: 10;
  border-top: 1.5px solid #e4e7ec;
  border-bottom: 1px solid #e4e7ec;
  font-weight: 600;
  color: #374151;
  user-select: none;
}

.ms-table thead {
  background-color: #f9fafb;
  position: sticky;
  top: 0;
  z-index: 9;
  box-shadow: 0 1px 0 #e4e7ec;
}

/* Short right divider for header cells */
.ms-table th::after {
  content: "";
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1.5px;
  height: 18px;
  background-color: #e4e7ec;
}

.ms-table th:last-child::after {
  display: none;
}

.ms-table td {
  height: 36px;
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
  height: 100%;          /* tr/td chiếm hết tbody, không có nội dung */
  border: none !important;
}

/* Overlay căn giữa theo vùng nhìn thấy (wrapper), không theo chiều rộng table */
.ms-empty-overlay {
  position: absolute;
  /* Đặt top bằng chiều cao thead (36px border-top + 36px height ≈ 40px) */
  top: 40px;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 160px;
  color: #9ca3af;
  font-size: 14px;
  pointer-events: none; /* không chặn click vào thead */
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

/* ── Actions column overrides & Hover to show actions ── */
.ms-table td.col-actions {
  /* Ensure overflow is visible so buttons can float leftwards */
  /* overflow: visible !important; */
}

.col-actions{
  background-color: transparent !important;
}

.ms-table td.col-actions :deep(.btn_action),
.ms-table td.col-actions :deep(.btn__action) {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.15s ease-in-out;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  z-index: 10;
}

.ms-table tbody tr:hover td.col-actions :deep(.btn_action),
.ms-table tbody tr:hover td.col-actions :deep(.btn__action) {
  opacity: 1;
}

/* Style for action buttons to match the floating white blocks */
.ms-table td.col-actions :deep(.btn_action .ms-button),
.ms-table td.col-actions :deep(.btn__action .ms-button) {
  background-color: #fff !important;
  border: 1px solid #d9dee7 !important;
  border-radius: 8px !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ms-table td.col-actions :deep(.btn_action .ms-button:hover),
.ms-table td.col-actions :deep(.btn__action .ms-button:hover) {
  background-color: #f3f4f6 !important;
}

/* ── Hover effect for actions column ── */
.ms-table tbody tr:hover td.col-actions {
  background-color: transparent !important;
}

/* ── Checkbox (match MsCheckbox theme) ── */
.ms-table :deep(input[type="checkbox"]) {
  appearance: none;
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 2px solid #d1d5db;
  background-color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.18s ease, background-color 0.18s ease;
}

.ms-table :deep(input[type="checkbox"]:hover) {
  border-color: #0e9a62;
}

.ms-table :deep(input[type="checkbox"]:checked),
.ms-table :deep(input[type="checkbox"]:indeterminate) {
  border-color: #0e9a62;
  background-color: #0e9a62;
}

.ms-table :deep(input[type="checkbox"]:checked)::after {
  content: "";
  display: block;
  width: 3px;
  height: 6px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: translateY(-2px) rotate(45deg);
}

.ms-table :deep(input[type="checkbox"]:indeterminate)::after {
  content: "";
  width: 8px;
  height: 2px;
  background: #fff;
}

.ms-table :deep(input[type="checkbox"]:disabled) {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
