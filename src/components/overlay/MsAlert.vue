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
<style scope>
.modal_alert_wrapper{
    width: 100%;
    height: 100%;
}

</style>