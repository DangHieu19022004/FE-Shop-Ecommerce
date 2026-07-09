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
        top: 24px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        z-index: 9999;
    }

    .toast-enter-active {
        animation: show-toast 0.3s ease forwards;
    }

    .toast-leave-active {
        animation: hide-toast 0.3s ease forwards;
    }

    @keyframes show-toast {
        0% {
            transform: translateY(-50px);
            opacity: 0;
        }
        100% {
            transform: translateY(0);
            opacity: 1;
        }
    }

    @keyframes hide-toast {
        0% {
            transform: translateY(0);
            opacity: 1;
        }
        100% {
            transform: translateY(-50px);
            opacity: 0;
        }
    }

    @media screen and (max-width: 530px) {
        .ms-toast-container {
            width: 95%;
        }

        .ms-toast-container :deep(.ms-toast) {
            width: 100%;
            font-size: 1rem;
        }
    }
</style>