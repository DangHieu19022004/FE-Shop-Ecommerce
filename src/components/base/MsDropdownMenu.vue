<template>
  <div
    class="ms-dropdown-menu"
    :class="[`ms-dropdown-menu--${position}`, { 'ms-dropdown-menu--floating': isFloating }]"
    :style="isFloating ? positionStyle : {}"
    @click.stop
  >
    <template v-for="item in items" :key="item.divider ? Math.random() : item[trackBy]">
      <!-- Divider -->
      <div v-if="item.divider" class="ms-dropdown-menu__divider" />

      <!-- Menu item -->
      <div
        v-else
        class="ms-dropdown-menu__item"
        :class="{
          'ms-dropdown-menu__item--selected': isSelected(item),
          'ms-dropdown-menu__item--disabled': item.disabled,
        }"
        @click="!item.disabled && handleSelect(item)"
      >
        <!-- Icon trái -->
        <i v-if="item.icon" class="ms-dropdown-menu__item-icon" :class="item.icon" />

        <!-- Label -->
        <span class="ms-dropdown-menu__item-label">{{ item[optionLabel] }}</span>

        <!-- Checkmark khi đang được chọn -->
        <i v-if="isSelected(item)" class="ms-dropdown-menu__item-check mi-check" />
      </div>
    </template>

    <!-- Empty state -->
    <div v-if="!items || items.length === 0" class="ms-dropdown-menu__empty">
      Không có dữ liệu
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

/**
 * MsDropdownMenu — Danh sách menu dropdown dùng chung.
 *
 * Props:
 *  - items       : Array  — danh sách item. Mỗi item có thể chứa:
 *                    { [optionLabel], [trackBy], icon?, disabled?, divider? }
 *                    Nếu item.divider = true thì hiển thị đường phân cách.
 *  - modelValue  : any    — giá trị đang được chọn (theo trackBy)
 *  - optionLabel : String — key để lấy text hiển thị (default: 'label')
 *  - trackBy     : String — key để so sánh giá trị   (default: 'value')
 *  - position    : String — vị trí dropdown khi dùng như floating panel.
 *                    Các giá trị: 'right-start' | 'right-end' |
 *                                 'left-start'  | 'left-end'  |
 *                                 'bottom-start'| 'bottom-end'|
 *                                 'top-start'   | 'top-end'
 *                    Mặc định: 'bottom-start'
 *                    Khi được set, component tự position: absolute và dịch chuyển đúng vị trí.
 *                    Parent cần có position: relative.
 *  - offset      : Number — khoảng cách (px) giữa trigger và dropdown (default: 6)
 *
 * Emits:
 *  - update:modelValue(value) — khi chọn một item
 *  - select(item)             — khi chọn một item (trả về object đầy đủ)
 */
const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    default: null,
  },
  optionLabel: {
    type: String,
    default: 'label',
  },
  trackBy: {
    type: String,
    default: 'value',
  },
  /**
   * Vị trí của dropdown so với phần tử cha (parent cần position: relative).
   * Cú pháp: '{side}-{align}' — side: top|bottom|left|right, align: start|end
   * Ví dụ: 'right-start' → hiện bên phải, căn trên
   *        'bottom-end'  → hiện bên dưới, căn phải
   * Nếu không truyền (null), component render inline (không absolute).
   */
  position: {
    type: String,
    default: null,
    validator: (v) =>
      v === null ||
      ['right-start', 'right-end', 'left-start', 'left-end',
       'bottom-start', 'bottom-end', 'top-start', 'top-end'].includes(v),
  },
  /** Khoảng cách (px) giữa trigger và dropdown khi dùng floating mode */
  offset: {
    type: Number,
    default: 6,
  },
});

const emit = defineEmits(['update:modelValue', 'select']);

/** Chỉ floating khi có position */
const isFloating = computed(() => props.position !== null);

/**
 * Map position string → CSS inline style cho absolute positioning.
 * Parent cần `position: relative` để đây hoạt động đúng.
 */
const positionStyle = computed(() => {
  const gap = `${props.offset}px`;
  const map = {
    'right-start':  { top: '0',    left: '100%',  marginLeft:   gap },
    'right-end':    { bottom: '0', left: '100%',  marginLeft:   gap },
    'left-start':   { top: '0',    right: '100%', marginRight:  gap },
    'left-end':     { bottom: '0', right: '100%', marginRight:  gap },
    'bottom-start': { top: '100%', left: '0',     marginTop:    gap },
    'bottom-end':   { top: '100%', right: '0',    marginTop:    gap },
    'top-start':    { bottom: '100%', left: '0',  marginBottom: gap },
    'top-end':      { bottom: '100%', right: '0', marginBottom: gap },
  };
  return map[props.position] ?? map['bottom-start'];
});

const isSelected = (item) => {
  if (props.modelValue === null || props.modelValue === undefined) return false;
  return item[props.trackBy] === props.modelValue;
};

const handleSelect = (item) => {
  emit('update:modelValue', item[props.trackBy]);
  emit('select', item);
};
</script>

<style scoped>
/* ══════════════════════════
   Wrapper
══════════════════════════ */
.ms-dropdown-menu {
  display: flex;
  flex-direction: column;
  padding: 4px 0;
  background: #fff;
  border-radius: 8px;
  min-width: 180px;
  box-shadow: 0 4px 20px rgba(17, 24, 39, 0.14);
  border: 1px solid #e5e7eb;
  user-select: none;
}

/* Floating mode: absolutely positioned, tách khỏi luồng DOM */
.ms-dropdown-menu--floating {
  position: absolute;
  z-index: 500;
}

/* ══════════════════════════
   Divider
══════════════════════════ */
.ms-dropdown-menu__divider {
  height: 1px;
  background-color: #f0f1f3;
  margin: 4px 0;
}

/* ══════════════════════════
   Item
══════════════════════════ */
.ms-dropdown-menu__item {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 12px;
  font-size: 14px;
  color: #1f2937;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;
}

/* Hover → nền xám nhạt */
.ms-dropdown-menu__item:hover:not(.ms-dropdown-menu__item--selected):not(.ms-dropdown-menu__item--disabled) {
  background-color: #f3f4f6;
  color: #111827;
}

/* Đang được chọn → nền xanh lá nhạt, chữ xanh lá đậm */
.ms-dropdown-menu__item--selected {
  background-color: #dcfce7;
  color: #15803d;
  font-weight: 500;
}

/* Hover khi đang được chọn */
.ms-dropdown-menu__item--selected:hover {
  background-color: #bbf7d0;
}

/* Disabled */
.ms-dropdown-menu__item--disabled {
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

/* ══════════════════════════
   Icon trái
══════════════════════════ */
.ms-dropdown-menu__item-icon {
  font-size: 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

/* ══════════════════════════
   Label
══════════════════════════ */
.ms-dropdown-menu__item-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ══════════════════════════
   Checkmark (item được chọn)
══════════════════════════ */
.ms-dropdown-menu__item-check {
  font-size: 16px;
  flex-shrink: 0;
  margin-left: auto;
  color: #16a34a;
}

/* ══════════════════════════
   Empty state
══════════════════════════ */
.ms-dropdown-menu__empty {
  font-size: 13px;
  color: #9ca3af;
  padding: 10px 16px;
  text-align: center;
}
</style>
