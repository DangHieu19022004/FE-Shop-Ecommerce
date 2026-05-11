<template lang="">
    <div class="ms-toast-container">
        <TransitionGroup name="toast">
            <MsToast
                v-for="toast in props.toasts"
                :key="toast.id"
                :message="toast.message"
                :type="toast.type"
                :duration="toast.duration"
                @close="removeToast(toast.id)"
            />
        </TransitionGroup>
    </div>
</template>
<script setup>
import MsToast from './MsToast.vue';
import { defineEmits, defineProps } from 'vue';
const props = defineProps({
    toasts: {
        type: Array,
        default: () => []
    }
});
const emit = defineEmits(["close"]);
const removeToast = (id) => {
    emit("close", id);
};
</script>
<style>
    .ms-toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        z-index: 9999;
    }

    /* animation */

    .toast-enter-active,
    .toast-leave-active {
        transition: all .3s ease;
    }

    .toast-enter-from,
    .toast-leave-to {
        opacity: 0;
        transform: translateX(100%);
    }
</style>