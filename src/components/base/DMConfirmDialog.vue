<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import {
  acceptConfirmation,
  cancelConfirmation,
  Confirmation,
} from "@/stores/confirmStore";

const ConfirmButton = ref(null);

watch(() => Confirmation.value.IsOpen, async (IsOpen) => {
  if (!IsOpen) return;
  await nextTick();
  ConfirmButton.value?.focus();
});

const handleKeydown = (Event) => {
  if (Event.key === "Escape" && Confirmation.value.IsOpen) {
    cancelConfirmation();
  }
};

onMounted(() => document.addEventListener("keydown", handleKeydown));
onUnmounted(() => document.removeEventListener("keydown", handleKeydown));
</script>

<template>
  <Teleport to="body">
    <Transition name="dm-confirm-fade">
      <div v-if="Confirmation.IsOpen" class="dm-confirm" @mousedown.self="cancelConfirmation">
        <section
          class="dm-confirm__dialog"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="dm-confirm-title"
          aria-describedby="dm-confirm-message"
        >
          <span class="dm-confirm__icon" aria-hidden="true">!</span>
          <div class="dm-confirm__content">
            <h2 id="dm-confirm-title">{{ Confirmation.Title }}</h2>
            <p id="dm-confirm-message">{{ Confirmation.Message }}</p>
          </div>
          <div class="dm-confirm__actions">
            <button type="button" class="dm-confirm__button dm-confirm__button--cancel" @click="cancelConfirmation">
              {{ Confirmation.CancelText }}
            </button>
            <button ref="ConfirmButton" type="button" class="dm-confirm__button dm-confirm__button--danger" @click="acceptConfirmation">
              {{ Confirmation.ConfirmText }}
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.dm-confirm {
  position: fixed;
  z-index: 10020;
  inset: 0;
  display: grid;
  padding: 20px;
  place-items: center;
  background: rgba(6, 20, 48, 0.58);
  backdrop-filter: blur(3px);
}

.dm-confirm__dialog {
  display: grid;
  width: min(440px, 100%);
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 14px;
  padding: 22px;
  border: 1px solid rgba(186, 26, 26, 0.16);
  border-radius: 20px;
  background: var(--dm-surface, #fff);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.24);
}

.dm-confirm__icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 15px;
  background: var(--dm-danger-soft, #ffdad6);
  color: var(--dm-danger, #ba1a1a);
  font-size: 24px;
  font-weight: 900;
}

.dm-confirm__content h2,
.dm-confirm__content p {
  margin: 0;
}

.dm-confirm__content h2 {
  color: var(--dm-text, #1b1b1f);
  font-size: 20px;
}

.dm-confirm__content p {
  margin-top: 7px;
  color: var(--dm-text-soft, #5f6368);
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.dm-confirm__actions {
  display: flex;
  grid-column: 1 / -1;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
}

.dm-confirm__button {
  min-width: 104px;
  min-height: var(--dm-control-height, 46px);
  padding: 0 18px;
  border: 1px solid var(--dm-border, #ddd);
  border-radius: 12px;
  background: var(--dm-surface, #fff);
  color: var(--dm-text, #1b1b1f);
  cursor: pointer;
  font-weight: 800;
}

.dm-confirm__button--danger {
  border-color: var(--dm-danger, #ba1a1a);
  background: var(--dm-danger, #ba1a1a);
  color: #fff;
}

.dm-confirm__button:focus-visible {
  outline: 3px solid var(--dm-focus-ring, rgba(13, 43, 99, 0.24));
  outline-offset: 2px;
}

.dm-confirm-fade-enter-active,
.dm-confirm-fade-leave-active {
  transition: opacity 160ms ease;
}

.dm-confirm-fade-enter-from,
.dm-confirm-fade-leave-to {
  opacity: 0;
}

@media (max-width: 520px) {
  .dm-confirm { padding: 14px; }
  .dm-confirm__dialog { grid-template-columns: 42px minmax(0, 1fr); padding: 18px; }
  .dm-confirm__icon { width: 42px; height: 42px; }
  .dm-confirm__actions { display: grid; grid-template-columns: 1fr 1fr; }
  .dm-confirm__button { min-width: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .dm-confirm-fade-enter-active,
  .dm-confirm-fade-leave-active { transition: none; }
}
</style>

