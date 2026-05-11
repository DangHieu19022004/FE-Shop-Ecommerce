<template >
    <div :class="['ms-toast', `ms-toast--${props.type}`]">
        <div class="ms-toast__message">
            {{ props.message }}
        </div>
        <MsButton @click="onClose" :type="props.type" icon="icon__exit bgcl"/>
    </div>
</template>
<script setup>
import { onMounted, onUnmounted, computed } from 'vue';
import { defineProps } from 'vue';
import MsButton from '../ms-button/MsButton.vue';
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
<style >
.bgcl{
    background-color: #fff !important;
}
.ms-toast {
    min-width: 320px;

    display: flex;
    align-items: flex-start;
    gap: 12px;

    padding: 16px;

    border-radius: 8px;

    box-shadow:
        0 4px 12px rgba(0,0,0,.12);

    border-left: 6px solid;
}
    .ms-toast--success {
        background: #dcfce7;
        border-color: #16a34a;
        color: #166534;
    } 
    .ms-toast--success:hover {
        background: #bbf7d0;
    }
    .ms-toast--warning {
        background: #fef3c7;
        border-color: #d97706;
        color: #92400e;
    }
    .ms-toast--warning:hover {
        background: #fde68a;
    }
    .ms-toast--error {
        background: #fee2e2;
        border-color: #dc2626;
        color: #991b1b;
    }   
    .ms-toast--error:hover {
        background: #fecaca;
    }
    .ms-toast__message {
        padding: 10px 20px;
        border-radius: 4px;
        font-size: 14px;
    }
</style>