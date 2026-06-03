<template>
  <div class="menu-table" @click.stop>
    <MsButton
      iconLeft="mi-circle-off"
      :isTooltip="false"
      message="Không sắp xếp"
      :iconRight="activeSort === 'none' ? 'ms-icon-check' : ''"
      class="btn-menu"
      @click="emit('sort', 'none')"
    />
    <MsButton
      v-if="!isPinned"
      iconLeft="mi-pinned"
      :iconRight="isPinned ? 'ms-icon-check' : ''"
      message="Ghim cột"
      :isTooltip="false"
      class="btn-menu"
      @click="emit('pin')"
    />
    <MsButton
      v-if="isPinned"
      iconLeft="mi-unpin"
      iconRight="ms-icon-check"
      message="Bỏ ghim cột"
      :isTooltip="false"
      class="btn-menu"
      @click="emit('unpin')"
    />
    <MsButton
      iconLeft="mi-arrow-up"
      message="Tăng dần"
      :isTooltip="false"
      :iconRight="activeSort === 'asc' ? 'ms-icon-check' : ''"
      class="btn-menu"
      @click="emit('sort', 'asc')"
    />
    <MsButton
      iconLeft="mi-arrow-down"
      message="Giảm dần"
      :isTooltip="false"
      :iconRight="activeSort === 'desc' ? 'ms-icon-check' : ''"
      class="btn-menu"
      @click="emit('sort', 'desc')"
    />
  </div>
</template>

<script setup>
import MsButton from "../MsButton.vue";

defineProps({
  isPinned: {
    type: Boolean,
    default: false,
  },
  activeSort: {
    type: String,
    default: "none",
  },
});

const emit = defineEmits(["pin", "unpin", "sort", "close"]);
</script>

<style scoped>
.menu-table {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  background: #fff;
  border-radius: 4px;
  min-width: 160px;
  width: 200px;
}

:deep(.btn-menu) {
  display: flex;
  align-items: center;
  text-align: left;
  justify-content: flex-start;
  height: 32px;
  gap: 8px;
  font-size: 14px;
  padding: 0 12px;
}

:deep(.btn-menu .ms-button__icon--right) {
  margin-left: auto;
}
</style>
