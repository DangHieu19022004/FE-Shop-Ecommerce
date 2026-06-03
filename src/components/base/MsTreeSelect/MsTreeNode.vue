<template>
  <div class="ms-tree-node">
    <div
      :class="[
        'ms-tree-node__row',
        { 'ms-tree-node__row--selected': isSelected }
      ]"
      :style="{ paddingLeft: depth * 24 + 8 + 'px' }"
    >
      <!-- Expand/collapse arrow -->
      <span
        v-if="node.children?.length"
        class="ms-tree-node__toggle"
        @click.stop="$emit('toggle-expand', node.id)"
      >
        <i :class="isExpanded ? 'mi-chevron-down' : 'mi-chevron-right'"></i>
      </span>
      <span v-else class="ms-tree-node__toggle-placeholder"></span>

      <!-- Checkbox -->
      <label class="ms-tree-node__checkbox" @click.stop>
        <input
          type="checkbox"
          :checked="isSelected"
          :indeterminate="isIndeterminate"
          @change.stop="$emit('toggle-select', node.id)"
        />
        <span
          :class="[
            'ms-tree-node__checkmark',
            { 'ms-tree-node__checkmark--checked': isSelected },
            { 'ms-tree-node__checkmark--indeterminate': isIndeterminate }
          ]"
        >
          <svg v-if="isSelected" viewBox="0 0 12 12" fill="none" class="ms-tree-node__check-icon">
            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span v-else-if="isIndeterminate" class="ms-tree-node__indeterminate-line"></span>
        </span>
      </label>

      <!-- Label -->
      <span
        :class="['ms-tree-node__label', { 'ms-tree-node__label--selected': isSelected }]"
        @click.stop="$emit('toggle-select', node.id)"
      >
        {{ node.label }}
      </span>
    </div>

    <!-- Children -->
    <div v-if="node.children?.length && isExpanded" class="ms-tree-node__children">
      <MsTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :selectedIds="selectedIds"
        :expandedIds="expandedIds"
        :depth="depth + 1"
        @toggle-select="$emit('toggle-select', $event)"
        @toggle-expand="$emit('toggle-expand', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from "vue";

const props = defineProps({
  node: { type: Object, required: true },
  selectedIds: { type: Array, default: () => [] },
  expandedIds: { type: Object, default: () => new Set() }, // Set
  depth: { type: Number, default: 0 },
});

defineEmits(["toggle-select", "toggle-expand"]);

const isExpanded = computed(() => props.expandedIds.has(props.node.id));
const isSelected = computed(() => props.selectedIds.includes(props.node.id));

// Indeterminate: node có children, một số children được chọn, nhưng không phải tất cả
const isIndeterminate = computed(() => {
  if (!props.node.children?.length) return false;
  if (isSelected.value) return false;
  const allIds = getAllIds(props.node.children);
  const someSelected = allIds.some((id) => props.selectedIds.includes(id));
  const allSelected = allIds.every((id) => props.selectedIds.includes(id));
  return someSelected && !allSelected;
});

const getAllIds = (nodes) => {
  const ids = [];
  for (const n of nodes) {
    ids.push(n.id);
    if (n.children?.length) ids.push(...getAllIds(n.children));
  }
  return ids;
};

// Set indeterminate state trên native checkbox
const checkboxRef = ref(null);
</script>

<style scoped>
.ms-tree-node__row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  cursor: pointer;
  transition: background-color 0.12s ease;
  user-select: none;
  min-height: 36px;
}

.ms-tree-node__row:hover {
  background-color: #f3f4f6;
}

.ms-tree-node__row--selected {
  background-color: #ecfdf5;
}

.ms-tree-node__row--selected:hover {
  background-color: #d1fae5;
}

/* Toggle arrow */
.ms-tree-node__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  cursor: pointer;
  color: #6b7280;
  flex-shrink: 0;
  border-radius: 4px;
  transition: background-color 0.12s;
}

/* Ép icon kế thừa màu từ toggle — tránh bị các global icon class ghi đè */
.ms-tree-node__toggle i {
  color: inherit !important;
  font-size: 14px;
}

.ms-tree-node__toggle:hover {
  background-color: #e5e7eb;
  color: #111;
}

.ms-tree-node__toggle-placeholder {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Custom checkbox */
.ms-tree-node__checkbox {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.ms-tree-node__checkbox input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.ms-tree-node__checkmark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  background-color: #fff;
  transition: all 0.15s ease;
}

.ms-tree-node__checkmark--checked {
  background-color: #0E9A62;
  border-color: #0E9A62;
}

.ms-tree-node__checkmark--indeterminate {
  background-color: #0E9A62;
  border-color: #0E9A62;
}

.ms-tree-node__check-icon {
  width: 12px;
  height: 12px;
}

.ms-tree-node__indeterminate-line {
  display: block;
  width: 8px;
  height: 2px;
  background-color: #fff;
  border-radius: 1px;
}

/* Label */
.ms-tree-node__label {
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ms-tree-node__label--selected {
  color: #0E9A62;
  font-weight: 500;
}

/* Children */
.ms-tree-node__children {
  /* indent được xử lý bằng paddingLeft trên row */
}
</style>
