<template lang="">
        <div class="modal_alert">
            <div class="modal_alert_wrapper">
                <div class="modal_alert_text">
                    <div class="modal_alert_title">{{ props.title }}</div>
                    <div class="modal_alert_content">{{ props.message }}</div>
                </div>
                <div v-if="props.showConfirmButton" class="modal_alert_action">
                    <div class="modal_alert_cancel hvp" @click="emit('close')">Hủy</div>
                    <div class="modal_alert_confirm hvp" @click="emit('confirm')">Xác nhận</div>
                </div>
            </div>
        </div>
</template>
<script setup>
/**
 * NOTICE: PROP + EMIT
 */
const props = defineProps({
  title: String,
  message: String,
  showConfirmButton: Boolean,
});

const emit = defineEmits(["close", "confirm"]);
</script>
<style scoped>
.modal_alert {
    background-color: #fff;
    position: fixed;
    width: 420px;
    max-width: 90vw;
    min-height: 180px;
    height: auto;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 5;
    border-radius: 16px;
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
    gap: 24px;
}

.modal_alert_text {
    display: flex;
    flex-direction: column;
    gap: 8px;
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
    color: #6b7280;
}

.modal_alert_action {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
}

.modal_alert_cancel {
    min-width: 100px;
    height: 40px;
    padding: 10px 20px;
    background-color: #f3f4f6;
    color: #374151;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
}

.modal_alert_confirm {
    min-width: 100px;
    height: 40px;
    padding: 10px 20px;
    background-color: #ef4444;
    color: #fff;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
}

.modal_alert_cancel:hover {
    background-color: #e5e7eb;
}

.modal_alert_confirm:hover {
    background-color: #dc2626;
}
</style>