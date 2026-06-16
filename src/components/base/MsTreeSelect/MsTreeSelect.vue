<template>
  <div
    :class="['ms-tree-select', { 'ms-tree-select--horizontal': horizontal }]"
    ref="wrapperRef"
  >
    <label v-if="label" class="ms-tree-select__label">
      {{ label }}<span v-if="isRequired" class="color-red"> *</span>
    </label>

    <!-- Input box hiển thị chip -->
    <div
      :class="['ms-tree-select__control', { 'ms-tree-select__control--open': isOpen, 'ms-tree-select__control--error': props.errorMessages }]"
      @click="toggleDropdown"
      @blur="emit('blur')"
      @focus="emit('focus')"
    >
      <div class="ms-tree-select__chips" ref="chipsContainerRef">
        <!-- Badge đếm số chip ẩn (cùng style với chip thường) -->
        <span
          v-if="hiddenCount > 0"
          class="ms-tree-select__chip ms-tree-select__chip--count"
        >
          +{{ hiddenCount }}
        </span>
        <span
          v-for="item in visibleItems"
          :key="item.id"
          class="ms-tree-select__chip"
        >
          {{ item.label }}
          <span
            class="ms-tree-select__chip-remove"
            @click.stop="removeItem(item.id)"
          >×</span>
        </span>
        <span v-if="displayItems.length === 0" class="ms-tree-select__placeholder">
          {{ placeholder }}
        </span>
      </div>
      <span :class="['ms-tree-select__arrow', { 'ms-tree-select__arrow--open': isOpen }]">
        <i class="mi-chevron-down"></i>
      </span>
    </div>

    <!-- Dropdown -->
    <div v-if="isOpen" class="ms-tree-select__dropdown">
      <div class="ms-tree-select__tree">
        <MsTreeNode
          v-for="node in options"
          :key="node.id"
          :node="node"
          :selectedIds="modelValue"
          :expandedIds="expandedIds"
          :depth="0"
          @toggle-select="handleToggleSelect"
          @toggle-expand="handleToggleExpand"
        />
      </div>
      <slot name="footer"></slot>
    </div>

    <!-- tooltip -->
    <div v-if="errorMessages" class="ms-tree-select__tooltip">
      {{ errorMessages || "" }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import MsTreeNode from "./MsTreeNode.vue";

const props = defineProps({
  label: { type: String, default: "" },
  isRequired: { type: Boolean, default: false },
  horizontal: { type: Boolean, default: false },
  placeholder: { type: String, default: "Chọn..." },
  options: { type: Array, default: () => [] },   // tree data: [{ id, label, children }]
  modelValue: { type: Array, default: () => [] }, // selected ids
  errorMessages: { type: String, default: null },
});

const emit = defineEmits(["update:modelValue", "focus", "blur"]);

// Trạng thái mở dropdown
const isOpen = ref(false);
// Tham chiếu wrapper DOM
const wrapperRef = ref(null);
// Tham chiếu container chứa các chip đã chọn
const chipsContainerRef = ref(null);
// Set lưu các id của node đang được mở rộng (expand)
const expandedIds = ref(new Set());

// ── Chip overflow logic ──────────────────────────────────────────
// Số lượng chip bị ẩn khi không đủ chỗ trống
const hiddenCount = ref(0);
// Danh sách các chip đang hiển thị trên giao diện
const visibleItems = ref([]);

// Flatten tree để lấy item theo id
/**
 * Flatten tree để lấy item theo id nhanh chóng (Dictionary { id: node }).
 * Ví dụ sau khi duyệt xong, object có thể trông như:
 * {
 *   "pb-ke-toan": { id: "pb-ke-toan", label: "Phòng kế toán", children: [...] },
 *   "pb-nhan-su": { id: "pb-nhan-su", label: "Phòng nhân sự", children: [] }
 * }
 *
 * Sử dụng khi: Cần tra cứu nhanh thông tin node từ id.
 *
 * @returns {Object} Dictionary map theo id
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const flatMap = computed(() => {
  const map = {};
  const walk = (nodes) => {
    for (const n of nodes) {
      map[n.id] = n;
      if (n.children?.length) walk(n.children);
    }
  };
  walk(props.options);
  return map;
});

/**
 * Danh sách item được hiển thị dưới dạng chip (Smart chip display).
 * Nếu cha đã được chọn thì không hiển thị chip con.
 * Chỉ hiển thị node "topmost" đại diện cho selection đó.
 *
 * Sử dụng khi: Lấy danh sách chip để render ở thanh input.
 *
 * @returns {Array} Mảng các node được hiển thị
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const displayItems = computed(() => {
  if (props.modelValue.length === 0) return [];

  // Set này giúp kiểm tra "id đã được chọn chưa" rất nhanh khi đi ngược lên cha.
  const selectedSet = new Set(props.modelValue);

  // Hàm kiểm tra xem node có ancestor nào đã được chọn không
  // (để loại bỏ node con khi cha đã chọn).
  // Ví dụ:
  // - props.modelValue = ["cha-a", "con-a1", "con-a2"]
  // - nếu "cha-a" đã có trong selectedSet thì chip của "con-a1", "con-a2" sẽ không hiển thị nữa.
  const hasSelectedAncestor = (nodeId) => {
    const node = flatMap.value[nodeId];
    if (!node) return false;
    // Tìm cha trực tiếp của node hiện tại trong toàn bộ cây options.
    const findParent = (nodes, targetId, parent = null) => {
      for (const n of nodes) {
        if (n.id === targetId) return parent;
        if (n.children?.length) {
          const found = findParent(n.children, targetId, n);
          if (found !== undefined) return found;
        }
      }
      return undefined;
    };
    const parent = findParent(props.options, nodeId);
    if (parent && selectedSet.has(parent.id)) return true;
    // Nếu cha chưa được chọn thì đi tiếp lên ông/bà để kiểm tra ancestor ở cấp cao hơn.
    if (parent) return hasSelectedAncestor(parent.id);
    return false;
  };

  // Bước 1: đổi từng id đã chọn sang object node thật trong flatMap.
  // Bước 2: bỏ các id không còn tồn tại trong tree (tránh undefined).
  // Bước 3: chỉ giữ lại node "đại diện cao nhất", tức là node không có cha nào đã được chọn.
  return props.modelValue
    .map((id) => flatMap.value[id])
    .filter(Boolean)
    .filter((item) => !hasSelectedAncestor(item.id));
});

/**
 * Danh sách item hiện đang được chọn đầy đủ (chứa toàn bộ node ứng với id trong modelValue).
 *
 * Sử dụng khi: Cần map mảng id sang mảng object node.
 *
 * @returns {Array} Mảng các object node
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const selectedItems = computed(() =>
  props.modelValue
    .map((id) => flatMap.value[id])
    .filter(Boolean)
);

/**
 * Tính toán số lượng chip hiển thị để không bị tràn thanh input.
 * Các chip bị tràn sẽ gom vào một badge kiểu "+N".
 *
 * Sử dụng khi: Container thay đổi kích thước hoặc danh sách item thay đổi.
 *
 * @returns {Promise<void>}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
async function recalculateOverflow() {
  await nextTick();
  const container = chipsContainerRef.value;
  if (!container) {
    // Chưa có DOM container để đo width thì tạm hiển thị toàn bộ item.
    visibleItems.value = displayItems.value;
    hiddenCount.value = 0;
    return;
  }

  const items = displayItems.value;
  if (items.length === 0) {
    // Không có chip nào được chọn.
    visibleItems.value = [];
    hiddenCount.value = 0;
    return;
  }

  if (items.length === 1) {
    // Chỉ có 1 chip thì không cần tính overflow, luôn hiển thị trực tiếp.
    visibleItems.value = items;
    hiddenCount.value = 0;
    return;
  }

  const containerWidth = container.offsetWidth;
  const BADGE_WIDTH = 50;   // ước tính width của badge "+N"
  const GAP = 4;            // gap giữa các chip
  const ARROW_WIDTH = 32;   // arrow icon
  const availableWidth = containerWidth - ARROW_WIDTH - GAP;

  // Đo width từng chip bằng cách tạo 1 <span> ảo ngoài màn hình.
  // Làm vậy vì width thật phụ thuộc vào font, padding và nội dung label hiện tại.
  const measureChip = (text) => {
    const span = document.createElement('span');
    span.style.cssText = `
      display: inline-flex; align-items: center; gap: 4px;
      padding: 2px 8px; font-size: 14px; white-space: nowrap;
      position: absolute; visibility: hidden; top: -9999px;
      border: 1px solid transparent;
    `;
    span.textContent = text + ' ×';
    document.body.appendChild(span);
    const w = span.offsetWidth + GAP;
    document.body.removeChild(span);
    return w;
  };

  const chipWidths = items.map((item) => measureChip(item.label));
  let totalWidth = 0;
  for (const chipWidth of chipWidths) {
    totalWidth += chipWidth;
  }

  if (totalWidth <= availableWidth) {
    // Tổng width đủ nhỏ để hiển thị hết tất cả chip.
    visibleItems.value = items;
    hiddenCount.value = 0;
    return;
  }

  // Không đủ chỗ: phải chừa sẵn 1 vùng cho badge "+N" rồi mới tính số chip còn fit.
  const widthWithBadge = availableWidth - BADGE_WIDTH - GAP;
  let used = 0;
  let fitCount = 0;
  for (let i = 0; i < chipWidths.length; i++) {
    if (used + chipWidths[i] <= widthWithBadge) {
      used += chipWidths[i];
      fitCount++;
    } else {
      break;
    }
  }

  if (fitCount === 0) {
    // Trường hợp cực hẹp: vẫn cố hiển thị 1 chip đầu tiên rồi dồn phần còn lại vào badge.
    visibleItems.value = [items[0]];
    hiddenCount.value = items.length - 1;
  } else {
    // Hiển thị các chip đầu tiên còn vừa chỗ, phần sau gom vào badge "+N".
    visibleItems.value = items.slice(0, fitCount);
    hiddenCount.value = items.length - fitCount;
  }
}

// Tính lại khi displayItems thay đổi
watch(displayItems, recalculateOverflow, { immediate: true });

// ResizeObserver để tính lại khi container thay đổi size
let resizeObserver = null;
onMounted(() => {
  if (chipsContainerRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => recalculateOverflow());
    resizeObserver.observe(chipsContainerRef.value);
  }
});
onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});

// ── Auto mở tất cả node cha khi options thay đổi ──────────────────────────
watch(
  () => props.options,
  (newOptions) => {
    const walkExpand = (nodes) => {
      for (const n of nodes) {
        if (n.children?.length) {
          expandedIds.value.add(n.id);
          walkExpand(n.children);
        }
      }
    };
    walkExpand(newOptions);
  },
  { immediate: true }
);

/**
 * Toggle đóng/mở dropdown.
 *
 * Sử dụng khi: Người dùng click vào input.
 *
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

/**
 * Xóa một item đang được chọn (click vào dấu X trên chip).
 *
 * Sử dụng khi: Người dùng bỏ chọn một node trực tiếp từ thanh input.
 *
 * @param {string|number} id ID của node cần xóa
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const removeItem = (id) => {
  const node = flatMap.value[id];
  const getAllIds = (n) => {
    const ids = [n.id];
    if (n.children?.length) {
      for (const child of n.children) ids.push(...getAllIds(child));
    }
    return ids;
  };
  const idsToRemove = new Set(node ? getAllIds(node) : [id]);
  const afterRemove = props.modelValue.filter((v) => !idsToRemove.has(v));
  // Bubble-up để cập nhật trạng thái cha bậc cao hơn
  emit("update:modelValue", bubbleUpSelection(afterRemove, props.options));
};

/**
 * Lấy tất cả ID của một subtree bao gồm cả node gốc truyền vào.
 *
 * Sử dụng khi: Cần chọn/bỏ chọn toàn bộ nhánh con.
 *
 * @param {Object} node Node gốc
 * @returns {Array} Mảng các ID trong subtree
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const getAllIds = (node) => {
  const ids = [node.id];
  if (node.children?.length) {
    for (const child of node.children) {
      ids.push(...getAllIds(child));
    }
  }
  return ids;
};

/**
 * Xử lý lan truyền sự lựa chọn từ dưới lên (Bubble-up).
 * Duyệt theo post-order (con trước cha), nếu tất cả con của cha được chọn
 * thì tự động chọn cha, ngược lại thì bỏ chọn cha.
 *
 * Sử dụng khi: Sau mỗi lần chọn/bỏ chọn để đồng bộ state các node cha-con.
 *
 * @param {Array} selected Mảng các ID đang được chọn
 * @param {Array} nodes Cây dữ liệu hiện tại
 * @returns {Array} Mảng các ID sau khi bubble-up
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function bubbleUpSelection(selected, nodes) {
  const selectedSet = new Set(selected);

  // Duyệt hậu tự (post-order): xử lý tất cả node con trước,
  // rồi mới quyết định node cha có nên được chọn hay không.
  const visit = (node) => {
    if (!node.children?.length) return;
    for (const child of node.children) visit(child);

    // Nếu mọi node con trực tiếp đều đã có trong selectedSet
    // thì cha cũng được thêm vào selectedSet.
    const allChildrenSelected = node.children.every((child) => selectedSet.has(child.id));
    if (allChildrenSelected) {
      selectedSet.add(node.id);
    } else {
      // Chỉ cần thiếu 1 con là bỏ trạng thái selected của cha.
      selectedSet.delete(node.id);
    }
  };

  for (const node of nodes) visit(node);
  return Array.from(selectedSet);
}

/**
 * Xử lý toggle chọn/bỏ chọn một node trên cây dropdown.
 * Tự động chọn/bỏ chọn toàn bộ con và lan truyền bubble-up lên cha.
 *
 * Sử dụng khi: Component MsTreeNode phát ra sự kiện toggle-select.
 *
 * @param {string|number} nodeId ID của node bị tương tác
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const handleToggleSelect = (nodeId) => {
  const node = flatMap.value[nodeId];
  if (!node) return;

  const allIds = getAllIds(node);
  const isCurrentlySelected = props.modelValue.includes(nodeId);

  let newSelected;
  if (isCurrentlySelected) {
    // Bỏ chọn node + tất cả children
    newSelected = props.modelValue.filter((id) => !allIds.includes(id));
  } else {
    // Chọn node + tất cả children
    const toAdd = allIds.filter((id) => !props.modelValue.includes(id));
    newSelected = [...props.modelValue, ...toAdd];
  }

  // Bubble-up: nếu tất cả con của một node cha được chọn thì tự chọn cha;
  // ngược lại nếu không đủ thì bỏ cha khỏi selection.
  newSelected = bubbleUpSelection(newSelected, props.options);

  emit("update:modelValue", newSelected);
};

/**
 * Xử lý mở rộng/thu gọn (expand/collapse) một nhánh trên cây.
 *
 * Sử dụng khi: Người dùng click vào icon chevron bên cạnh một folder.
 *
 * @param {string|number} nodeId ID của node cần mở rộng/thu gọn
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const handleToggleExpand = (nodeId) => {
  if (expandedIds.value.has(nodeId)) {
    expandedIds.value.delete(nodeId);
  } else {
    expandedIds.value.add(nodeId);
  }
};

/**
 * Đóng dropdown khi người dùng click ra ngoài khu vực component.
 *
 * Sử dụng khi: Sự kiện mousedown diễn ra trên document.
 *
 * @param {Event} e Sự kiện mousedown
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const onClickOutside = (e) => {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("mousedown", onClickOutside);
});
onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onClickOutside);
});
</script>

<style scoped>
.ms-tree-select__tooltip{
  position: absolute;
  bottom: calc(100% + 6px);
  left: 0;
  background: #f44336;
  color: #fff;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.15s ease, visibility 0.15s ease;
  z-index: 999;
  pointer-events: none;
}
.ms-tree-select__tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 12px;
  border: 5px solid transparent;
  border-top-color: #f44336;
}

.ms-tree-select:hover .ms-tree-select__tooltip {
  opacity: 1;
  visibility: visible;
}

.ms-tree-select__control--error{
  border-color: #f44336 !important;
}
.ms-tree-select__control--error:hover,
.ms-tree-select__control--error:focus {
  border-color: #f44336 !important;
  box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1) !important;
}

.ms-tree-select {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

/* Horizontal layout */
.ms-tree-select--horizontal {
  flex-direction: row;
  gap: 0;
}

.ms-tree-select--horizontal .ms-tree-select__label {
  flex: 0 0 200px;
  min-width: 200px;
  margin-bottom: 0;
  padding-right: 12px;
  padding-top: 8px;
}

.ms-tree-select--horizontal .ms-tree-select__control {
  flex: 1;
  height: 32px;
  min-width: 0;
}

.ms-tree-select--horizontal .ms-tree-select__dropdown {
  left: 200px;
  width: calc(100% - 200px);
}

/* Label */
.ms-tree-select__label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 2px;
  user-select: none;
}

/* Control box */
.ms-tree-select__control {
  display: flex;
  align-items: center;
  min-height: 32px;
  padding: 4px 3px;
  padding-right: 32px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: #fff;
  cursor: pointer;
  position: relative;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
  overflow: hidden;
}

.ms-tree-select__control:hover {
  border-color: #0E9A62;
}

.ms-tree-select__control--open {
  border-color: #0E9A62;
  box-shadow: 0 0 0 3px rgba(14, 154, 98, 0.12);
}

/* Chips area */
.ms-tree-select__chips {
  display: flex;
  flex-wrap: nowrap;
  gap: 4px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  align-items: center;
}

/* Chip thường */
.ms-tree-select__chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background-color: #f5f5f5;
  border: 1px solid #D5D7DA;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #101828;
  line-height: 20px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Badge "+N" - cùng style với chip thường, chỉ khác là không có nút × */
.ms-tree-select__chip--count {
  cursor: default;
  font-weight: 500;
}

.ms-tree-select__chip-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  font-size: 16px;
  color: #6b7280;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.12s, color 0.12s;
  flex-shrink: 0;
}

.ms-tree-select__chip-remove:hover {
  background-color: #e5e7eb;
  color: #111;
}

.ms-tree-select__placeholder {
  color: #9ca3af;
  font-size: 13px;
  line-height: 28px;
  user-select: none;
}

/* Arrow */
.ms-tree-select__arrow {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  color: #6b7280;
  pointer-events: none;
}

.ms-tree-select__arrow--open {
  transform: translateY(-50%) rotate(180deg);
}

/* Dropdown */
.ms-tree-select__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

/* Tree */
.ms-tree-select__tree {
  padding: 4px 0;
  max-height: 300px;
  overflow-y: auto;
}
</style>
