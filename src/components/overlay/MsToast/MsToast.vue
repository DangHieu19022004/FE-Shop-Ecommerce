<template>
    <div :class="['ms-toast', `ms-toast--${props.type}`]">
        <!-- Icon wrapper: 40×40 colored square, căn giữa icon -->
        <div class="ms-toast__icon-wrapper">
            <MsButton
                :iconLeft="`mi-toast--${props.type}`"
                :isTooltip="false"
                unActive
            />
        </div>
        <!-- Nội dung: message + nút đóng -->
        <div class="ms-toast__body">
            <MsButton
                :message="props.message"
                iconRight="mi-close"
                :isTooltip="false"
                @click="onClose"
            />
        </div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import MsButton from '@/components/base/MsButton.vue';

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
    align-items: stretch;
    height: 40px;
    min-width: 180px;
    max-width: 480px;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.10), 0 1px 4px rgba(0, 0, 0, 0.06);
    border: 1px solid;
    background: #ffffff;
    animation: ms-toast-in 0.28s cubic-bezier(0.21, 1.02, 0.73, 1) both;
}

/* ── Per-type border color ──────────────────────────────────── */
.ms-toast--success { border-color: var(--toast-color-success); }
.ms-toast--error   { border-color: var(--toast-color-error);   }
.ms-toast--warning { border-color: var(--toast-color-warning); }
.ms-toast--info    { border-color: var(--toast-color-info);    }

/* ── Icon wrapper: 40×40 colored square ────────────────────── */
.ms-toast__icon-wrapper {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.ms-toast--success .ms-toast__icon-wrapper { background-color: var(--toast-color-success); }
.ms-toast--error   .ms-toast__icon-wrapper { background-color: var(--toast-color-error);   }
.ms-toast--warning .ms-toast__icon-wrapper { background-color: var(--toast-color-warning); }
.ms-toast--info    .ms-toast__icon-wrapper { background-color: var(--toast-color-info);    }

/* ── Body: message + close ──────────────────────────────────── */
/* icon → content: 12px  |  content → close: 12px  |  close → right: 8px */
.ms-toast__body {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    padding-left: 12px;
    padding-right: 8px;
}

/* ── Text ───────────────────────────────────────────────────── */
.ms-toast__text {
    flex: 1;
    min-width: 0;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}


/* ── Toast-type icons (mask-image SVG, white fill) ──────────── */
[class^="mi-toast--"],
[class*=" mi-toast--"] {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    background-color: #ffffff;
    -webkit-mask-size: contain;
            mask-size: contain;
    -webkit-mask-repeat: no-repeat;
            mask-repeat: no-repeat;
    -webkit-mask-position: center;
            mask-position: center;
}

/* info – circle with "i" */
.mi-toast--info {
    -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23fff' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z'/%3E%3C/svg%3E");
            mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23fff' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z'/%3E%3C/svg%3E");
}

/* success – circle with checkmark */
.mi-toast--success {
    -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23fff' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E");
            mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23fff' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E");
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

/* ── Enter animation: fade + slide up nhẹ ──────────────────── */
@keyframes ms-toast-in {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>