<template lang="">
  <FormSalaryComposition v-if="isShowForm" @close="isShowForm = false" @openAlert="$emit('openAlert', $event)"/>
  <div v-else class="content_bg">
    <div class="content">
      <div class="content_header">
        <div>
          <h2 class="content_header_left">Thành phần lương</h2>
        </div>
        <div class="content_header_right">
          <MsButton
            class="btn-system mg-r-8 fw-500"
            message="Danh mục của hệ thống"
            :isTooltip="false"
            iconLeft="mi-rule mg-r-8"
            @click="$router.push('/salarycomposition/salarycomposition-system')"
          />
          <MsButton
            class="btn-add fw-500"
            message="Thêm"
            type="green"
            :isTooltip="false"
            lineStateRight
            iconLeft="mi-plus-white mg-r-8 fw-500"
            @click="handleOpenForm"
          />
          <MsButton
            class="btn-add-menu fw-500"
            iconLeft="mi-chevron-down-white"
            type="green"
            :isTooltip="false"
            lineStateLeft
            @click="openSelectComposition"
          />
          <div v-if="toggleSelectComposition" class="select-composition">
            <MsButton
              message="Chọn từ danh mục của hệ thống"
              :isTooltip="false"
            />
          </div>
        </div>
      </div>
      <div class="content_body_wrapper">
        <div class="content_body_header">
          <div class="content_body_header_left">
            <div class="hvp content_body_search">
              <MsIcon class="mi-search icon--base" background />
              <MsInput placeholder="Tìm kiếm" class="content_body_search-input" />
            </div>
            <div class="content_body_status">
                <MsButton
                    :isTooltip="false"
                    iconRight="mi-chevron-down mg-l-8"
                    >
                    <span class="status-label">Trạng thái:</span>
                    <span class="status-value">Tất cả</span>
                </MsButton>
            </div>
            <div class="hvp content_body_search_unit">
              <MsButton
                :isTooltip="false"
                iconRight="mi-chevron-down"
                class="btn-search-unit"
                spreadIcon
              >
                <span class="status-label">Tất cả đơn vị</span>
              </MsButton>
            </div>
          </div>
          <div class="content_body_header_right">
            <MsIcon class="mi-filter icon--base" wrapperClass="border-icon" message="Bộ lọc" shape="square"/>
            <MsIcon class="mi-setting icon--base" wrapperClass="border-icon" message="Thiết lập" shape="square"/>
          </div>
        </div>
        <div class="content_body">
         <div class="content_body_table">
            <MsTable
              :fields="fields"
              :data-rows="salaryCompositions"
              table-class="candicate_table"
              table-class-head="candicate_table_head"
              table-class-body="candicate_table_body"
            >
              <template #header-checkbox>
                <input type="checkbox" name="selectedCandidates" id="select-all" />
              </template>

              <template #cell-checkbox="{ row }">
                <input
                  type="checkbox"
                  name="selectedCandidates"
                  class="checkbox_item"
                  :id="row.salary_composition_id"
                  :value="row.salary_composition_id"
                />
              </template>

              <template #cell-actions="{ row }">
                <div class="btn_action">
                  <MsIcon
                    class="mi-circle-check-green"
                    shape="square"
                    wrapperClass="border-icon"
                  />
                  <MsIcon
                    class="mi-copy"
                    shape="square"
                    wrapperClass="border-icon"
                  />
                  <MsIcon
                    class="mi-pencil"
                    shape="square"
                    wrapperClass="border-icon"
                  />
                  <MsIcon
                    class="mi-trash-red"
                    shape="square"
                    wrapperClass="border-icon"
                  />
                </div>
              </template>
            </MsTable>
         </div>
        </div>
        <div class="content_body_footer">
            <div class="footer-left">
              <span>Tổng số: <b>245</b></span>
            </div>
            <div class="footer-right">
              <span>Số dòng/trang</span>
              <div class="page-size hvp">
                <MsButton
                    :isTooltip="false"
                    iconRight="mi-chevron-down"
                    class="btn-search-unit"
                >
                    <span class="status-label">15</span>
                </MsButton>
              </div>
              <span class="page-info"><b>1 - 15</b></span>
              <div class="pagination-controls">
                <span class="page-btn disabled">
                    <div class="mi-next-double-left"></div>
                </span>
                <span class="page-btn disabled">
                    <div class="mi-next-left"></div>
                </span>
                <span class="page-btn">
                    <div class="mi-next-right"></div>
                </span>
                <span class="page-btn">
                    <div class="mi-next-double-right"></div>
                </span>
              </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import MsButton from "@/components/base/MsButton.vue";
import MsIcon from "@/components/base/MsIcon.vue";
import MsInput from "@/components/base/MsInput.vue";
import MsTable from "@/components/base/MsTable.vue";
import FormSalaryComposition from "./FormSalaryComposition.vue";
import { ref } from "vue";

var toggleSelectComposition = ref(false)
var  isShowForm = ref(false)
const handleOpenForm = () => {
  isShowForm.value = !isShowForm.value
}
const openSelectComposition = () => {
  toggleSelectComposition.value=!toggleSelectComposition.value
}

const emit = defineEmits(["openFormEdit", "deleteItem", "openAlert"]);

const salaryCompositions = [
  {
    salary_composition_id: "mock-id-001",
    salary_composition_code: "LUONG_CO_BAN",
    salary_composition_name: "Lương cơ bản",
    organization_name: "Tất cả đơn vị",
    composition_type: "Lương",
    composition_nature: "Thu nhập",
    taxable: "Chịu thuế",
    tax_deduction: "Không",
    quota: "",
    value_type: "Tiền tệ",
    formula: "15000000",
    description: "Lương cơ bản nhân viên",
    option_show_paycheck: "Có",
    source_type: "Hệ thống",
    status: "Đang theo dõi",
  },
];

const fields = [
  { key: "", label: "", slot: "checkbox", draggable: false, pinnable: false, resizable: false },
  { key: "salary_composition_code", label: "Mã thành phần" },
  { key: "salary_composition_name", label: "Tên thành phần" },
  { key: "organization_name", label: "Đơn vị áp dụng" },
  { key: "composition_type", label: "Loại thành phần" },
  { key: "composition_nature", label: "Tính chất" },
  { key: "taxable", label: "Chịu thuế" },
  { key: "tax_deduction", label: "Giảm trừ khi tính thuế" },
  { key: "quota", label: "Định mức" },
  { key: "value_type", label: "Kiểu giá trị" },
  { key: "formula", label: "Giá trị" },
  { key: "description", label: "Mô tả" },
  { key: "option_show_paycheck", label: "Hiển thị trên phiếu lương" },
  { key: "source_type", label: "Nguồn tạo" },
  { key: "status", label: "Trạng thái" },
  {
    key: "actions",
    label: "",
    slot: "actions",
    classHead: "col_unhide",
    classBody: "col_unhide",
    draggable: false,
    pinnable: false,
    resizable: false,
  },
];

</script>
<style scoped>
  .btn_action{
    transform: translateX(-20px);
    background-color: transparent;
  }
.status-label {
  color: #666;
  margin-right: 4px;
  font-size: 14px;
}
.status-value{
    color: #111;
    font-weight: 500;
    font-size: 14px;
}
.content_body{
    width: 100%;
    flex: 1; /* Chiếm toàn bộ không gian còn lại */
    background-color: #f8f9fa; /* Màu demo cho thấy vùng bảng */
    border-top: 1px solid #d9dee7;
    border-bottom: 1px solid #d9dee7;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.content_body_table {
    flex: 1;
    width: 100%;        
    height: 100%;
    overflow: hidden;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.content_body_wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: #fff;
  border-radius: 4px;
  min-width: 0;
  min-height: 0;
}

.content {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.content_bg {
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: #f1f2f1;
  padding: 24px;
  min-width: 0;
  min-height: 0;
}

.content_body_footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  font-size: 14px;
}

.footer-left b, .page-info b {
  font-weight: 600;
  color: #111;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #666;
}

.page-size .ms-button:hover {
  background-color: transparent !important;
}

.page-size {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #d9dee7;
  border-radius: 4px;
  cursor: pointer;
  color: #111;
}

.page-size:hover {
  background-color: #ffffff;
  border-color: #4ef731;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  cursor: pointer;
  color: #666;
  font-weight: 500;
}

.page-btn.disabled {
  color: #ccc;
  cursor: not-allowed;
}

.page-btn:not(.disabled):hover {
  color: #111;
}

.content_header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.content_header_right {
  display: flex;
  align-items: center;
  position: relative;
}

.content_header_right .ms-button {
  height: 32px;
  padding: 0 12px;
  font-size: 14px;
  border-radius: 6px;
  width: auto;
  white-space: nowrap;
}

.content_header_right .btn-system {
  background-color: #fff;
  border: 1px solid #d9dee7;
  color: #1f1f1f;
}

.content_header_right .btn-system:hover {
  background-color: #f1f2f1;
}

.content_header_composition_system {
  display: flex;
  align-items: center;
  margin-right: 16px;
  max-height: 32px;
}
.content_header_title_composition_system {
  margin-left: 8px;
  font-size: 14px;
  color: #333;
}

.btn-add {
  width: 88px !important;
}

.content_body_header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: #fff;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.content_body_search {
  display: flex;
  align-items: center;
  background-color: #fff3;
  border-radius: 8px;
  width: 300px;
  height: 32px;
  border: 1px solid #d9dee7;
}
.btn-search-unit {
  justify-content: space-between !important;
  color: #111;
}

.content_body_search_unit {
  margin-left: 8px;
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 4px;
  width: 350px;
  height: 32px;
  border: 1px solid #d9dee7;
}
.content_body_status{
    margin-left: 8px;
    display: flex;
    align-items: center;
    background-color: #fff3;
    border-radius: 8px;
    border: 1px solid #d9dee7;
    height: 32px;
}
:deep(.ms-input-in.content_body_search-input) {
  color: #111;
  background-color: transparent;
  border: none;
}
:deep(.ms-input-in.content_body_search-input:focus),
:deep(.ms-input-in.content_body_search-input:focus-visible) {
  border: none;
  outline: none !important;
  box-shadow: none;
}
.content_body_header_left{
    display: flex;
    align-items: center;
}
.border-icon {
  border: 1px solid #d9dee7;
  border-radius: 4px;
  padding: 6px !important;
  margin-left: 12px;
  background-color: #fff;
}

.btn__delete_item {
  width: 20px;
  height: 20px;
  min-width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7a8188;
}

/* ── Select Composition Dropdown ── */
.select-composition {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  z-index: 100;
  background-color: #fff;
  border: 1px solid #d9dee7;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 240px;
  padding: 4px;
}

.select-composition :deep(.ms-button) {
  width: 100% !important;
  justify-content: flex-start !important;
  border: none !important;
  background: transparent !important;
  padding: 8px 12px !important;
  height: auto !important;
  font-size: 14px;
  color: #1f1f1f;
  cursor: pointer;
  border-radius: 4px;
  white-space: nowrap;
}

.select-composition :deep(.ms-button:hover) {
  background-color: #f1f2f1 !important;
}
</style>
