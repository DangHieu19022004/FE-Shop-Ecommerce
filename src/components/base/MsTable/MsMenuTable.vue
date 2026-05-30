<template>
  <div class="menu-table" @click.stop>
    <MsButton
        iconLeft="mi-circle-off"
        :isTooltip="false"
        message="Không sắp xếp"
        iconRight="mi-check"
        class="btn-menu"
    />
    <!-- Ghim cột: chỉ hiện khi chưa ghim -->
    <MsButton
      v-if="!isPinned"
      iconLeft="mi-pinned"
      :iconRight="isPinned ? 'mi-check' : ''"
      message="Ghim cột"
      :isTooltip="false"
      class="btn-menu"
      @click="emit('pin')"
    />
    <!-- Bỏ ghim cột: chỉ hiện khi đang ghim -->
    <MsButton
      v-if="isPinned"
      iconLeft="mi-unpin"
      iconRight="mi-check"
      message="Bỏ ghim cột"
      :isTooltip="false"
      class="btn-menu"
      @click="emit('unpin')"
    />
    <MsButton
      iconLeft="mi-arrow-up"
      message="Tăng dần"
      :isTooltip="false"
      class="btn-menu"
    />
    <MsButton
      iconLeft="mi-arrow-down"
      message="Giảm dần"
      :isTooltip="false"
      class="btn-menu"
    />
  </div>
</template>

<script setup>
import MsButton from "../MsButton.vue";

defineProps({
  /** true nếu cột đang được ghim, false nếu chưa ghim */
  isPinned: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['pin', 'unpin', 'close']);
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
/* Đẩy icon right sang sát cạnh phải */
:deep(.btn-menu .ms-button__icon--right) {
  margin-left: auto;
}
</style>