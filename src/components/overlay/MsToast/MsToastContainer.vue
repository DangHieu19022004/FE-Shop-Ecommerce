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
        top: 30px;
        right: 20px;
        display: flex;
        flex-direction: column;
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
            transform: translateX(100%);
        }
        40% {
            transform: translateX(-5%);
        }
        80% {
            transform: translateX(0%);
        }
        100% {
            transform: translateX(-10px);
        }
    }

    @keyframes hide-toast {
        0% {
            transform: translateX(-10px);
        }
        40% {
            transform: translateX(0%);
        }
        80% {
            transform: translateX(-5%);
        }
        100% {
            transform: translateX(calc(100% + 20px));
        }
    }

    @media screen and (max-width: 530px) {
        .ms-toast-container {
            width: 95%;
        }

        .ms-toast-container :deep(.ms-toast) {
            width: 100%;
            font-size: 1rem;
            margin-left: 20px;
        }
    }
</style>