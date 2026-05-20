<template >
    <div :class="['ms-toast', `ms-toast--${props.type}`]" :style="toastStyle">
        <div class="ms-toast__message">
            <i class="fa-solid" :class="iconClass"></i>
            <span class="ms-toast__text">{{ props.message }}</span>
        </div>
        <MsButton class="ms-toast__close" @click="onClose" :type="props.type" icon="icon__exit"/>
    </div>
</template>
<script setup>
import { onMounted, onUnmounted, computed } from 'vue';
import { defineProps } from 'vue';
import MsButton from '../base/MsButton.vue';
/**
 * VARIABLE:
 */
let timer = null;
/**
 * NOTICE: prop + EMIT
 */
const props = defineProps({
    duration: {
        type: Number,
        default: 3000
    },
    message: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        required: true
    }
});
const emit = defineEmits(['close']);
const iconClass = computed(() => {
    const map = {
        success: 'fa-circle-check',
        error: 'fa-circle-xmark',
        warning: 'fa-triangle-exclamation',
        info: 'fa-circle-info'
    };
    return map[props.type] || 'fa-circle-info';
});
const toastStyle = computed(() => ({
    '--toast-duration': `${props.duration}ms`
}));

/**
 * FUNCTION: onMounted + onUnmounted + function
 */
onMounted(() => {
timer = setTimeout(onClose, props.duration);
});

onUnmounted(() => {
    clearTimeout(timer);
});

const onClose = () => {
    // Emit an event to notify the parent component to close the toast
    emit('close');
};

</script>
<style>
:root {
    --toast-dark: #34495e;
    --toast-light: #ffffff;
    --toast-success: #0abf30;
    --toast-error: #e24d4c;
    --toast-warning: #e9bd0c;
    --toast-info: #3498db;
}

.ms-toast {
    width: 400px;
    position: relative;
    overflow: hidden;
    border-radius: 4px;
    padding: 16px 17px;
    background: var(--toast-light);
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    border-left: 6px solid;
}

.ms-toast::before {
    position: absolute;
    content: "";
    height: 3px;
    width: 100%;
    bottom: 0;
    left: 0;
    animation: toast-progress var(--toast-duration) linear forwards;
}

.ms-toast__close {
    margin-left: auto;
    background: transparent !important;
    border: none;
    border-radius: 4px;
    color: #111827 !important;
    padding: 4px;
    min-width: 24px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.ms-toast__close:hover {
    background: transparent !important;
}

.ms-toast__close .icon__exit {
    background-color: #111827 !important;
}

.ms-toast__message {
    display: flex;
    align-items: center;
    font-size: 1.07rem;
    color: var(--toast-dark);
}

.ms-toast__text {
    margin-left: 12px;
}

.ms-toast--success {
    border-color: var(--toast-success);
}

.ms-toast--warning {
    border-color: var(--toast-warning);
}

.ms-toast--error {
    border-color: var(--toast-error);
}

.ms-toast--info {
    border-color: var(--toast-info);
}

.ms-toast--success::before {
    background: var(--toast-success);
}

.ms-toast--error::before {
    background: var(--toast-error);
}

.ms-toast--warning::before {
    background: var(--toast-warning);
}

.ms-toast--info::before {
    background: var(--toast-info);
}

.ms-toast--success .ms-toast__message i {
    color: var(--toast-success);
}

.ms-toast--error .ms-toast__message i {
    color: var(--toast-error);
}

.ms-toast--warning .ms-toast__message i {
    color: var(--toast-warning);
}

.ms-toast--info .ms-toast__message i {
    color: var(--toast-info);
}

@keyframes toast-progress {
    100% {
        width: 0%;
    }
}
</style>