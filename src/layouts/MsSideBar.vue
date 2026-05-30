<template lang="">
    <aside :class="[{ sidebar_hide: props.isCollapse },'sidebar']">
            <div class="sbbg">
                <div class="sb__top">
                    <div class="sb__list">

                        <!-- Tổng quan (không có submenu) -->
                        <router-link to="/demo" class="hvp dpl menu__item">
                            <MsButton
                                iconLeft="mi-sidebar-dashboard mg-r-8"
                                message="Tổng quan"
                                :class="['align-left', { 'is-collapse': props.isCollapse }]"
                                spreadIcon
                                >
                            </MsButton>
                        </router-link>

                        <!-- Thành phần lương (không có submenu) -->
                        <router-link to="/salarycomposition" class="hvp dpl menu__item">
                            <MsButton
                                iconLeft="mi-sidebar-salary-composition mg-r-8"
                                message="Thành phần lương"
                                :class="['align-left', { 'is-collapse': props.isCollapse }]"
                                spreadIcon
                                >
                            </MsButton>
                        </router-link>

                        <!-- Mẫu bảng lương (không có submenu) -->
                        <router-link to="/demo" class="hvp dpl menu__item">
                            <MsButton
                                iconLeft="mi-sidebar-salary-template mg-r-8"
                                message="Mẫu bảng lương"
                                :class="['align-left', { 'is-collapse': props.isCollapse }]"
                                spreadIcon
                                >
                            </MsButton>
                        </router-link>

                        <!-- Dữ liệu tính lương -->
                        <div
                            class="menu__item-wrapper"
                            @mouseenter="openMenuId = 'salary-data'"
                            @mouseleave="openMenuId = null"
                        >
                            <div class="hvp dpl menu__item">
                                <MsButton
                                    iconLeft="mi-sidebar-salary-data mg-r-8"
                                    message="Dữ liệu tính lương"
                                    iconRight="ms-icon-chevron-right mg-l-16 "
                                    :isTooltip="false"
                                    :class="['align-left', { 'is-collapse': props.isCollapse }]"
                                    spreadIcon
                                />
                            </div>
                            <Transition name="dropdown-fade">
                                <MsDropdownMenu
                                    v-if="openMenuId === 'salary-data' && !props.isCollapse"
                                    :items="salaryDataItems"
                                    position="right-start"
                                    :offset="2"
                                />
                            </Transition>
                        </div>

                        <!-- Tính lương (có submenu) -->
                        <div
                            class="menu__item-wrapper"
                            @mouseenter="openMenuId = 'salary-calc'"
                            @mouseleave="openMenuId = null"
                        >
                            <div class="hvp dpl menu__item">
                                <MsButton
                                    iconLeft="mi-sidebar-salary-table mg-r-8"
                                    message="Tính lương"
                                    iconRight="ms-icon-chevron-right mg-l-16 "
                                    :isTooltip="false"
                                    :class="['align-left', { 'is-collapse': props.isCollapse }]"
                                    spreadIcon
                                />
                            </div>
                            <Transition name="dropdown-fade">
                                <MsDropdownMenu
                                    v-if="openMenuId === 'salary-calc' && !props.isCollapse"
                                    :items="salaryCalcItems"
                                    position="right-start"
                                    :offset="2"
                                />
                            </Transition>
                        </div>

                        <!-- Chi trả -->
                        <div
                            class="menu__item-wrapper"
                            @mouseenter="openMenuId = 'payment'"
                            @mouseleave="openMenuId = null"
                        >
                            <div class="hvp dpl menu__item">
                                <MsButton
                                    iconLeft="mi-sidebar-payment mg-r-8"
                                    message="Chi trả"
                                    iconRight="ms-icon-chevron-right mg-l-16 "
                                    :isTooltip="false"
                                    :class="['align-left', { 'is-collapse': props.isCollapse }]"
                                    spreadIcon
                                />
                            </div>
                            <Transition name="dropdown-fade">
                                <MsDropdownMenu
                                    v-if="openMenuId === 'payment' && !props.isCollapse"
                                    :items="paymentItems"
                                    position="right-start"
                                    :offset="2"
                                />
                            </Transition>
                        </div>

                        <!-- Báo cáo-->
                        <router-link to="/demo" class="hvp dpl menu__item">
                            <MsButton
                                iconLeft="mi-sidebar-report mg-r-8"
                                message="Báo cáo"
                                :isTooltip="false"
                                :class="['align-left', { 'is-collapse': props.isCollapse }]"
                                spreadIcon
                                >
                            </MsButton>
                        </router-link>

                    </div>
                </div>
                <div class="sb__bottom">
                    <div :class="['sb__btn_left hvp', { sb__btn_left_hide: props.isCollapse }]" @click="toggleCollapse">
                        <div :class="['ms-icon-sidebar-collapse', { hide_sidebar_btn: props.isCollapse }]"></div>
                        <div :class="['sb__left_title m-l-8', { sb__left_title_hide: props.isCollapse }]">Thu gọn</div>
                    </div>
                </div>

            </div>
        </aside>
</template>
<script setup>
import { ref } from "vue";
import MsButton from "@/components/base/MsButton.vue";
import MsDropdownMenu from "@/components/base/MsDropdownMenu.vue";

const props = defineProps(['isCollapse']);
const emit = defineEmits(['update:isCollapse']);

/** ID của menu đang mở (hover), null = đóng hết */
const openMenuId = ref(null);

const toggleCollapse = () => {
    emit('update:isCollapse', !props.isCollapse);
};

/* ══════════════════════════
   Dropdown data
══════════════════════════ */
const salaryDataItems = [
  { label: 'Chấm công',      value: 'attendance' },
  { label: 'Doanh số',       value: 'sales' },
  { label: 'KPI',            value: 'kpi' },
  { label: 'Sản phẩm',       value: 'product' },
  { label: 'Thu nhập khác',  value: 'other-income' },
  { label: 'Khấu trừ khác',  value: 'other-deduction' },
];

const salaryCalcItems = [
  { label: 'Bảng lương',      value: 'payroll' },
  { label: 'Tạm ứng',         value: 'advance-payment' },
  { label: 'Tổng hợp lương',  value: 'payroll-summary' },
  { label: 'Phân bổ lương',   value: 'salary-allocation' },
  { label: 'Ngân sách lương', value: 'salary-budget' },
  { label: 'Bảng thuế',       value: 'tax-sheet' },
  { label: 'Quyết toán thuế', value: 'tax-finalization' },
];

const paymentItems = [
  { label: 'Bảng chi trả',     value: 'payment-sheet' },
  { label: 'Tổng hợp chi trả', value: 'payment-summary' },
];

</script>
<style scoped>
.sidebar {
    width: 235px;
    background-color: #ffffff;
    height: 100%;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
}

.sbbg {
    height: 100%;
    padding-top: 32px;
    padding-bottom: 16px;
    display: flex;
    flex-direction: column;
}

.sb__top {
    flex: 1;
}

.sb__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-content: center;
    height: calc(100% - 56px);
    margin-left: 12px;
}

/* ──────────────────────────
   Menu item đơn (router-link)
────────────────────────── */
.menu__item {
    display: flex;
    align-items: center;
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.72);
    text-decoration: none;
    transition: all 0.2s ease;
    gap: 12px;
    width: 206px;
}

.menu__item:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
}

/* ──────────────────────────
   Menu item có submenu
   (wrapper chứa trigger + dropdown)
────────────────────────── */
.menu__item-wrapper {
    position: relative;   /* positioning context cho MsDropdownMenu */
    width: 206px;
    border-radius: 6px;
}

.menu__item-wrapper .menu__item {
    width: 100%;
}

.menu__item-wrapper:hover .menu__item {
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
}

/* ──────────────────────────
   Icons & text
────────────────────────── */
.menu__icon {
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    font-size: 22px;
}

.menu__text {
    font-size: 14px;
    font-weight: 600;
    line-height: 1;
}

/* ──────────────────────────
   Bottom collapse button
────────────────────────── */
.sb__bottom {
    height: 40px;
    display: flex;
    justify-content: center;
}

.sb__btn_left {
    background-color: #fafafa;
    border: 0.5px #D7D7D7 solid;
    border-radius: 4px;
    padding: 8px;
    width: 200px;
    color: #000000;
    display: flex;
}

.hide_sidebar_btn {
    transform: rotate(180deg);
}

.sb__left_title_hide,
.menu__text_hide {
    display: none;
}

/* ──────────────────────────
   Collapsed state
────────────────────────── */
.sidebar.sidebar_hide {
    width: 80px;
}

.sidebar.sidebar_hide .menu__item {
    width: 56px;
    justify-content: center;
}

.sidebar.sidebar_hide .menu__item-wrapper {
    width: 56px;
}

.sb__btn_left_hide {
    width: 40px;
}

/* ──────────────────────────
   MsButton overrides (deep)
────────────────────────── */
:deep(.ms-button.align-left) {
    justify-content: flex-start !important;
    font-size: 13px;
}

:deep(.ms-button.is-collapse .ms-button__content) {
    display: none;
}

:deep(.ms-button.is-collapse .ms-button__icon--right) {
    display: none;
}

:deep(.ms-button.is-collapse) {
    width: 40px;
    justify-content: center !important;
    padding-left: 0;
    padding-right: 0;
}

/* ──────────────────────────
   Dropdown transition
────────────────────────── */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
    transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
    opacity: 0;
    transform: translateX(-6px);
}
</style>