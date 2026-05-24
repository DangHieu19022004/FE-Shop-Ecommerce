<template>
    <div
        ref="iconRef"
        :class='["ms-icon", `ms-icon--${props.shape}`, { "ms-icon--no-hover": props.background, "ms-icon--no-cursor": props.background }]'
        @mouseenter="handleMouseEnter"
    >
        <div :class="props.class"></div>
        <span
            v-if="props.message && !props.background"
            ref="tooltipRef"
            :class='["ms-icon__tooltip", `ms-icon__tooltip--${tooltipPosition}`]'
            :style="{ '--tooltip-offset-x': `${tooltipOffsetX}px` }"
        >
            {{ props.message }}
        </span>
    </div>
</template>
<script setup>
import {defineProps, nextTick, ref} from "vue";

const props = defineProps({
    message: {
        type: String,
        default: "",
    },
    class: {
        type: String,
        default: "",
    },
    shape: {
        type: String,
        default: "circle",
    },
    background: {
        type: Boolean,
        default: false,
    },
});

const iconRef = ref(null);
const tooltipRef = ref(null);
const tooltipPosition = ref("bottom");
const tooltipOffsetX = ref(0);

const handleMouseEnter = () => {
    nextTick(() => {
        if (!iconRef.value || !tooltipRef.value) return;

        const iconRect = iconRef.value.getBoundingClientRect();
        const tooltipRect = tooltipRef.value.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const gap = 6;
        const safePadding = 8;

        const spaceTop = iconRect.top;
        const spaceBottom = viewportHeight - iconRect.bottom;

        if (spaceBottom < tooltipRect.height + gap && spaceTop >= tooltipRect.height + gap) {
            tooltipPosition.value = "top";
        } else {
            tooltipPosition.value = "bottom";
        }

        const idealLeft = iconRect.left + iconRect.width / 2 - tooltipRect.width / 2;
        const overflowLeft = safePadding - idealLeft;
        const overflowRight = idealLeft + tooltipRect.width - (viewportWidth - safePadding);

        let offsetX = 0;
        if (overflowLeft > 0) offsetX += overflowLeft;
        if (overflowRight > 0) offsetX -= overflowRight;

        tooltipOffsetX.value = offsetX;
    });
};
</script>
<style>
.ms-icon {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    cursor: pointer;
}

.ms-icon--square {
    border-radius: 4px;
}

.ms-icon--circle {
    border-radius: 50%;
}

.ms-icon--no-cursor {
    cursor: default;
}

.ms-icon:not(.ms-icon--no-hover):hover {
    background-color: #B6B5B5;
}

.ms-icon__tooltip {
    position: absolute;
    left: 50%;
    transform: translateX(calc(-50% + var(--tooltip-offset-x, 0px)));
    padding: 10px 18px;
    border-radius: 4px;
    background-color: #222;
    color: #fff;
    font-size: 14px;
    white-space: nowrap;
    visibility: hidden;
    pointer-events: none;
    transition: opacity 0.15s ease, visibility 0.15s ease;
    z-index: 1;
}

.ms-icon__tooltip--bottom {
    top: calc(100% + 6px);
}

.ms-icon__tooltip--top {
    bottom: calc(100% + 6px);
}

.ms-icon__tooltip::after {
    content: "";
    position: absolute;
    left: 50%;
    transform: translateX(calc(-50% - var(--tooltip-offset-x, 0px)));
    border-width: 5px;
    border-style: solid;
}

.ms-icon__tooltip--bottom::after {
    top: -10px;
    border-color: transparent transparent #222 transparent;
}

.ms-icon__tooltip--top::after {
    bottom: -10px;
    border-color: #222 transparent transparent transparent;
}

.ms-icon:hover .ms-icon__tooltip {
    opacity: 1;
    visibility: visible;
}
</style>