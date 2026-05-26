<template>
    <div
        ref="iconRef"
        :class='["ms-icon", `ms-icon--${props.shape}`, { "ms-icon--no-hover": props.background, "ms-icon--no-cursor": props.background }, props.wrapperClass]'
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
    >
        <div :class="props.class"></div>

        <!-- Teleport ra body để thoát hoàn toàn khỏi mọi stacking context của cha -->
        <Teleport to="body">
            <span
                v-if="props.message && !props.background && isHovered"
                ref="tooltipRef"
                :class='["ms-icon__tooltip", `ms-icon__tooltip--${tooltipPosition}`]'
                :style="tooltipStyle"
            >
                {{ props.message }}
            </span>
        </Teleport>
    </div>
</template>

<script setup>
import { defineProps, nextTick, ref } from "vue";

const props = defineProps({
    message: {
        type: String,
        default: "",
    },
    class: {
        type: String,
        default: "",
    },
    wrapperClass: {
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
const tooltipStyle = ref({});
const isHovered = ref(false);

const handleMouseEnter = () => {
    isHovered.value = true;
    // Chờ Teleport render xong tooltip trước khi đo kích thước
    nextTick(() => {
        if (!iconRef.value || !tooltipRef.value) return;

        const iconRect = iconRef.value.getBoundingClientRect();
        const tooltipRect = tooltipRef.value.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const gap = 6;
        const safePadding = 8;

        const spaceBottom = viewportHeight - iconRect.bottom;
        const spaceTop = iconRect.top;

        let top;
        if (spaceBottom < tooltipRect.height + gap && spaceTop >= tooltipRect.height + gap) {
            tooltipPosition.value = "top";
            top = iconRect.top - tooltipRect.height - gap;
        } else {
            tooltipPosition.value = "bottom";
            top = iconRect.bottom + gap;
        }

        // Căn giữa theo icon, điều chỉnh nếu tràn viewport
        let left = iconRect.left + iconRect.width / 2 - tooltipRect.width / 2;
        left = Math.max(safePadding, Math.min(left, viewportWidth - tooltipRect.width - safePadding));

        tooltipStyle.value = {
            top: top + "px",
            left: left + "px",
        };
    });
};

const handleMouseLeave = () => {
    isHovered.value = false;
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

/* Tooltip render ở body qua Teleport — thoát mọi stacking context */
.ms-icon__tooltip {
    position: fixed;
    padding: 10px 18px;
    border-radius: 4px;
    background-color: #222;
    color: #fff;
    font-size: 14px;
    white-space: nowrap;
    pointer-events: none;
    z-index: 99999;
    animation: ms-tooltip-in 0.12s ease forwards;
}

@keyframes ms-tooltip-in {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
}

.ms-icon__tooltip--top {
    animation: ms-tooltip-in-up 0.12s ease forwards;
}

@keyframes ms-tooltip-in-up {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
}

.ms-icon__tooltip::after {
    content: "";
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
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
</style>