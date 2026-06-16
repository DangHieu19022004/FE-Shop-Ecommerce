<template lang="">
  <aside :class="[{ sidebar_hide: props.isCollapse }, 'sidebar']">
    <div :class="[{ sbbg_hide: props.isCollapse }, 'sbbg']">
      <div class="sb__top">
        <div :class="[{ sidebar_hide: props.isCollapse }, 'sb__list']">
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
      <div :class="[{ 'sb-bottom_hide': props.isCollapse }, 'sb-bottom']">
        <MsButton
          iconLeft="mi-sidebar-collapse"
          :tooltipMessage="props.isCollapse ? 'Hiện sidebar' : 'Ẩn sidebar'"
          :class="['sb__btn_left hvp', { sb__btn_left_hide: props.isCollapse }]"
          spreadIcon
          @click="toggleCollapse"
        />
      </div>
    </div>
  </aside>
</template>
<script setup>
import { ref } from "vue";
import MsButton from "@/components/base/MsButton.vue";
import MsDropdownMenu from "@/components/base/MsDropdownMenu.vue";

//NOTICE: props + emit
const props = defineProps(["isCollapse"]);
//emit sự kiện toggleCollapse để component cha (MainLayout) cập nhật trạng thái isCollapse
const emit = defineEmits(["update:isCollapse"]);

// VARIABLE:
// ID của menu đang mở (hover), null = đóng hết
const openMenuId = ref(null);

// Dữ liệu menu con cho từng mục có submenu: Dữ liệu tính lương
const salaryDataItems = [
  { label: "Chấm công", value: "attendance" },
  { label: "Doanh số", value: "sales" },
  { label: "KPI", value: "kpi" },
  { label: "Sản phẩm", value: "product" },
  { label: "Thu nhập khác", value: "other-income" },
  { label: "Khấu trừ khác", value: "other-deduction" },
];

// Dữ liệu menu con cho mục Tính lương
const salaryCalcItems = [
  { label: "Bảng lương", value: "payroll" },
  { label: "Tạm ứng", value: "advance-payment" },
  { label: "Tổng hợp lương", value: "payroll-summary" },
  { label: "Phân bổ lương", value: "salary-allocation" },
  { label: "Ngân sách lương", value: "salary-budget" },
  { label: "Bảng thuế", value: "tax-sheet" },
  { label: "Quyết toán thuế", value: "tax-finalization" },
];

// Dữ liệu menu con cho mục Chi trả
const paymentItems = [
  { label: "Bảng chi trả", value: "payment-sheet" },
  { label: "Tổng hợp chi trả", value: "payment-summary" },
];

// FUNCTION:
/**
 * Đóng mở sidebar.
 *
 * Sử dụng khi: Người dùng click vào nút collapse ở bottom sidebar.
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const toggleCollapse = () => {
  emit("update:isCollapse", !props.isCollapse);
};
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
  padding-top: 24px;
  padding-left: 12px;
  display: flex;
  flex-direction: column;
}

.sbbg_hide {
  padding-left: 0;
  align-items: center;
}

.sb__top {
  flex: 1;
}

.sb__list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-content: center;
  height: 100px;
  margin-left: 12px;
}

.sb__list.sidebar_hide {
  margin-left: 0;
  align-items: center;
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

.menu__item.router-link-active,
.menu__item:active {
  background-color: #E6F5EF;
  color: #0E9A62;
}

.menu__item.router-link-active :deep(.ms-button__icon),
.menu__item:active :deep(.ms-button__icon) {
  background-color: #0E9A62 !important;
}

.menu__item:hover {
  color: #ffffff;
}

/* ──────────────────────────
   Menu item có submenu
   (wrapper chứa trigger + dropdown)
────────────────────────── */
.menu__item-wrapper {
  position: relative; /* positioning context cho MsDropdownMenu */
  width: 206px;
  border-radius: 6px;
}

.menu__item-wrapper .menu__item {
  width: 100%;
}

.menu__item-wrapper:hover .menu__item {
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
.sb-bottom {
  height: 40px;
  display: flex;
  justify-content: flex-end;
}

.sb-bottom_hide {
  border-top: 1px solid #e9eaeb !important;
}

.sb__btn_left {
  background-color: #fafafa;
  border-radius: 8px 0 0;
  border-top: 1px solid #e9eaeb;
  border-left: 1px solid #e9eaeb;
  border-right: none;
  border-bottom: none;
  padding: 8px;
  width: 40px;
  height: 40px;
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
  width: 60px;
}

.sidebar.sidebar_hide .menu__item {
  width: 30px;
  height: 40px;
  justify-content: center;
  margin: 0 auto;
}

.sidebar.sidebar_hide .menu__item-wrapper {
  width: 60px;
  display: flex;
  justify-content: center;
}

.sb__btn_left_hide {
  width: 60px;
  border-radius: 0px;
  transform: rotate(180deg);
}

/* ──────────────────────────
   MsButton overrides (deep)
────────────────────────── */
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

/* Cập nhật lại class này */
:deep(.ms-button.is-collapse) {
  width: 40px !important; /* Thêm !important để ghi đè hoàn toàn width: 100% của spread-icon */
  max-width: 40px;
  justify-content: center !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

/* BỔ SUNG THÊM: Khử hoàn toàn margin-right của iconLeft khi collapse */
:deep(.ms-button.is-collapse .ms-button__icon) {
  margin-right: 0 !important;
  margin-left: 0 !important;
}
/* ──────────────────────────
   Dropdown transition
────────────────────────── */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateX(-6px);
}
</style>
