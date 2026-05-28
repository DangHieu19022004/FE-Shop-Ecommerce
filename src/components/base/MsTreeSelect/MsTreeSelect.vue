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
      <div class="ms-tree-select__chips">
        <span
          v-for="item in selectedItems"
          :key="item.id"
          class="ms-tree-select__chip"
        >
          {{ item.label }}
          <span
            class="ms-tree-select__chip-remove"
            @click.stop="removeItem(item.id)"
          >×</span>
        </span>
        <span v-if="selectedItems.length === 0" class="ms-tree-select__placeholder">
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
    </div>

    <!-- tooltip -->
    <div v-if="errorMessages" class="ms-tree-select__tooltip">
      {{ errorMessages || "" }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
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

const isOpen = ref(false);
const wrapperRef = ref(null);
const expandedIds = ref(new Set());

// Flatten tree để lấy item theo id
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

const selectedItems = computed(() =>
  props.modelValue
    .map((id) => flatMap.value[id])
    .filter(Boolean)
);

// Auto mở tất cả node cha khi mount
onMounted(() => {
  const walkExpand = (nodes) => {
    for (const n of nodes) {
      if (n.children?.length) {
        expandedIds.value.add(n.id);
        walkExpand(n.children);
      }
    }
  };
  walkExpand(props.options);
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const removeItem = (id) => {
  emit(
    "update:modelValue",
    props.modelValue.filter((v) => v !== id)
  );
};

// Lấy tất cả leaf id trong subtree
const getAllLeafIds = (node) => {
  if (!node.children?.length) return [node.id];
  const ids = [];
  for (const child of node.children) {
    ids.push(...getAllLeafIds(child));
  }
  return ids;
};

// Lấy tất cả id trong subtree (bao gồm cả node hiện tại)
const getAllIds = (node) => {
  const ids = [node.id];
  if (node.children?.length) {
    for (const child of node.children) {
      ids.push(...getAllIds(child));
    }
  }
  return ids;
};

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

  emit("update:modelValue", newSelected);
};

const handleToggleExpand = (nodeId) => {
  if (expandedIds.value.has(nodeId)) {
    expandedIds.value.delete(nodeId);
  } else {
    expandedIds.value.add(nodeId);
  }
};

// Click outside
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
  border-radius: 4px;
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
  min-height: 36px;
  padding: 4px 8px;
  padding-right: 32px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: #fff;
  cursor: pointer;
  position: relative;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
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
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.ms-tree-select__chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 14px;
  color: #111827;
  line-height: 20px;
  white-space: nowrap;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ms-tree-select__chip-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  font-size: 14px;
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
  font-size: 14px;
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
  max-height: 300px;
  overflow-y: auto;
  padding: 4px 0;
}

/* Tree */
.ms-tree-select__tree {
  padding: 0;
}
</style>
