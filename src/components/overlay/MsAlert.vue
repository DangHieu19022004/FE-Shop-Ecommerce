<template>
  <div class="modal_alert">
    <div class="modal_alert_wrapper">
      <div class="modal_alert_text">
        <div class="dpl sp-between">
          <div class="modal_alert_title">{{ props.title }}</div>
          <MsButton
            iconLeft="mi-close"
            :isTooltip="false"
            @click="emit('close')"
            class="alert-close-btn"
            shapeBtn="circle"
          />
        </div>
        <div class="modal_alert_content"><slot>{{ props.message }}</slot></div>
      </div>
    </div>
    <div v-if="props.showConfirmButton" class="modal_alert_action">
        <MsButton
          :message="props.cancelText"
          :type="props.cancelType"
          :isTooltip="false"
          class="btn-alert-cancel"
          @click="emit('close')"
        />
        <MsButton
          :message="props.confirmText"
          :type="props.confirmType"
          :isTooltip="false"
          class="btn-alert-confirm"
          @click="emit('confirm')"
        />
      </div>
  </div>
</template>

<script setup>
import MsButton from "@/components/base/MsButton.vue";

/**
 * NOTICE: PROP + EMIT
 */
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  message: {
    type: String,
    default: "",
  },
  showConfirmButton: {
    type: Boolean,
    default: true,
  },
  cancelText: {
    type: String,
    default: "Hủy",
  },
  confirmText: {
    type: String,
    default: "Xác nhận",
  },
  cancelType: {
    type: String,
    default: "none",
  },
  confirmType: {
    type: String,
    default: "green",
  },
});

const emit = defineEmits(["close", "confirm"]);
</script>

<style scoped>
.modal_alert {
  background-color: #fff;
  position: fixed;
  width: 440px;
  max-width: 90vw;
  min-height: 180px;
  height: auto;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  box-shadow: 0 16px 40px rgba(17, 24, 39, 0.18);
  justify-content: center;
  align-items: center;
}

.modal_alert_wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
  overflow: hidden;
  padding: 24px;
  gap: 20px;
}

.alert-close-btn {
  position: absolute !important;
  top: 16px;
  right: 16px;
  cursor: pointer;
  padding: 4px !important;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert-close-btn:hover {
  background-color: #f1f2f5 !important;
}

.modal_alert_text {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal_alert_title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.modal_alert_content {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
}

.modal_alert_action {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  height: 60px;
  width: 100%;
  padding: 0 16px;
  background-color: #f3f3f3;
}

/* Custom styles for MsButton within MsAlert */
.modal_alert_action :deep(.ms-button) {
  width: auto !important;
  height: 36px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
}

.modal_alert_action :deep(.btn-alert-cancel) {
  background-color: #fff !important;
  border: 1px solid #d9dee7 !important;
  color: #1f1f1f !important;
}

.modal_alert_action :deep(.btn-alert-cancel:hover) {
  background-color: #f8f9fa !important;
}

.modal_alert_action :deep(.btn-alert-confirm) {
  background-color: #0E9A62 !important;
  color: #fff !important;
  border: none !important;
}

.modal_alert_action :deep(.btn-alert-confirm:hover) {
  background-color: #0A724B !important;
}
</style>