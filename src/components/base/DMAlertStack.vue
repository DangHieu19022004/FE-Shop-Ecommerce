<script setup>
import DMAlert from "@/components/base/DMAlert.vue";
import { Alerts, dismissAlert } from "@/stores/alertStore";
</script>

<template>
  <Teleport to="body">
    <TransitionGroup
      tag="section"
      name="dm-alert-list"
      class="dm-alert-stack"
      aria-label="Danh sách thông báo"
    >
      <DMAlert
        v-for="AlertItem in Alerts"
        :key="AlertItem.Id"
        :Alert="AlertItem"
        @dismiss="dismissAlert"
      />
    </TransitionGroup>
  </Teleport>
</template>

<style scoped lang="scss">
.dm-alert-stack {
  position: fixed;
  z-index: 10000;
  top: 20px;
  right: 20px;
  display: flex;
  width: min(400px, calc(100vw - 40px));
  max-height: calc(100vh - 40px);
  flex-direction: column;
  gap: 12px;
  overflow: auto;
  pointer-events: none;
  scrollbar-width: none;
}

.dm-alert-stack::-webkit-scrollbar {
  display: none;
}

.dm-alert-stack :deep(.dm-alert-list-enter-active),
.dm-alert-stack :deep(.dm-alert-list-leave-active),
.dm-alert-stack :deep(.dm-alert-list-move) {
  transition: opacity 180ms ease, transform 180ms ease;
}

.dm-alert-stack :deep(.dm-alert-list-enter-from),
.dm-alert-stack :deep(.dm-alert-list-leave-to) {
  opacity: 0;
  transform: translateX(28px);
}

@media (max-width: 520px) {
  .dm-alert-stack {
    top: 12px;
    right: 12px;
    width: calc(100vw - 24px);
    max-height: calc(100vh - 24px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .dm-alert-stack :deep(.dm-alert-list-enter-active),
  .dm-alert-stack :deep(.dm-alert-list-leave-active),
  .dm-alert-stack :deep(.dm-alert-list-move) {
    transition: none;
  }
}
</style>

