<template>
    <div :class="['ms-toast', `ms-toast--${props.type}`]">
        <div class="ms-toast__icon-wrapper">
            <div :class="[`mi-toast--${props.type}`]"></div>
        </div>
        <div class="ms-toast__body">
            <span class="ms-toast__text">{{ props.message }}</span>
        </div>
        <div class="ms-toast__close" @click="onClose">
            <div class="mi-close-white"></div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';

/**
 * PROPS + EMITS
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

/**
 * VARIABLE
 */
let timer = null;

/**
 * FUNCTION
 */
const onClose = () => {
    emit('close');
};

onMounted(() => {
    timer = setTimeout(onClose, props.duration);
});

onUnmounted(() => {
    clearTimeout(timer);
});
</script>

<style>
/* ── Color tokens ───────────────────────────────────────────── */
:root {
    --toast-color-success : #2EAD6E;
    --toast-color-error   : #E24D4C;
    --toast-color-warning : #F4A100;
    --toast-color-info    : #2196F3;
}

/* ── Base toast ─────────────────────────────────────────────── */
.ms-toast {
    display: inline-flex;
    align-items: center;
    min-height: 48px;
    min-width: 180px;
    max-width: 480px;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.10);
    padding: 0 16px;
    color: #ffffff;
    gap: 12px;
}

/* ── Per-type background color ──────────────────────────────────── */
.ms-toast--success { background-color: var(--toast-color-success); }
.ms-toast--error   { background-color: var(--toast-color-error);   }
.ms-toast--warning { background-color: var(--toast-color-warning); }
.ms-toast--info    { background-color: var(--toast-color-info);    }

/* ── Icon wrapper ───────────────────────────────────────────── */
.ms-toast__icon-wrapper {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
}

/* ── Body: message ──────────────────────────────────────────── */
.ms-toast__body {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
}

/* ── Text ───────────────────────────────────────────────────── */
.ms-toast__text {
    flex: 1;
    min-width: 0;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    white-space: normal; /* Allow text to wrap if it's too long */
    word-break: break-word;
}

/* ── Close ──────────────────────────────────────────────────── */
.ms-toast__close {
    flex-shrink: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 50%;
    transition: background-color 0.2s;
}

.ms-toast__close:hover {
    background-color: rgba(255, 255, 255, 0.2);
}

/* ── Toast-type icons (mask-image SVG, white fill) ──────────── */
[class^="mi-toast--"],
[class*=" mi-toast--"],
.mi-close-white {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    background-color: #ffffff;
    -webkit-mask-size: contain;
            mask-size: contain;
    -webkit-mask-repeat: no-repeat;
            mask-repeat: no-repeat;
    -webkit-mask-position: center;
            mask-position: center;
}

/* close */
.mi-close-white {
    -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23fff' d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z'/%3E%3C/svg%3E");
            mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23fff' d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z'/%3E%3C/svg%3E");
}

/* info – circle with "i" */
.mi-toast--info {
    -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23fff' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z'/%3E%3C/svg%3E");
            mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23fff' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z'/%3E%3C/svg%3E");
}

/* success – circle with checkmark */
.mi-toast--success {
    -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='8.5' fill='none' stroke='%23fff' stroke-width='2'/%3E%3Cpath d='M8.7 12.4l2.1 2.2 4.8-5.2' fill='none' stroke='%23fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
            mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='8.5' fill='none' stroke='%23fff' stroke-width='2'/%3E%3Cpath d='M8.7 12.4l2.1 2.2 4.8-5.2' fill='none' stroke='%23fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
}

/* warning – circle with "!" */
.mi-toast--warning {
    -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23fff' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'/%3E%3C/svg%3E");
            mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23fff' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'/%3E%3C/svg%3E");
}

/* error – circle with "×" */
.mi-toast--error {
    -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23fff' d='M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z'/%3E%3C/svg%3E");
            mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23fff' d='M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z'/%3E%3C/svg%3E");
}

</style>
