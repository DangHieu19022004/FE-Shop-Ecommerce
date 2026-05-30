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
        <div v-if="selectedIds.length > 0" class="checkbox_function">
          <p class="fz-14 m-r-8">Đã chọn </p>
          <b class="fz-14">{{selectedIds.length}}</b>
          <MsButton
              message="Bỏ chọn"
              class="m-r-8 color-green fz-14 no-background"
              :isTooltip="false"
            />
            <MsButton
              :isTooltip="false"
              message="Xóa"
              iconLeft="mi-trash-red"
              class="m-r-8 fz-14"
              type="border-danger"
            />
          </div>
        <div v-else class="content_body_header">
          <div class="content_body_header_left">
            <div class="content_body_search">
              <MsButton
                iconLeft="mi-search"
                tooltipMessage="Tìm kiếm"
                unActive
                tooltipPosition="bottom"
              />
              <MsInput placeholder="Tìm kiếm" class="content_body_search-input" />
            </div>
            <div class="content_body_status overflow-hidden">
                <MsButton
                    :isTooltip="false"
                    iconRight="mi-chevron-down mg-l-8"
                    class="status-trigger"
                    :class="{ 'status-trigger--open': statusMenuOpen }"
                    @click.stop="statusMenuOpen = !statusMenuOpen"
                >
                    <span class="status-label">Trạng thái:</span>
                    <span class="status-value">{{ selectedStatusLabel }}</span>
                </MsButton>

                <!-- Dropdown menu -->
                <Transition name="status-dropdown">
                    <MsDropdownMenu
                        v-if="statusMenuOpen"
                        :items="statusItems"
                        v-model="selectedStatus"
                        position="bottom-start"
                        :offset="4"
                        class="status-dropdown"
                        @select="statusMenuOpen = false"
                    />
                </Transition>
            </div>
            <div class="hvp content_body_search_unit overflow-hidden">
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
            <MsButton
              iconLeft="mi-filter"
              tooltipMessage="Bộ lọc"
              shapeBtn="square"
              tooltipPosition="bottom"
              type="border-secondary"
              class="mg-r-8"
            />
            <MsButton
              iconLeft="mi-setting"
              tooltipMessage="Thiết lập"
              shapeBtn="square"
              tooltipPosition="bottom"
              type="border-secondary"
            />
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
                <input
                  type="checkbox"
                  name="selectedCandidates"
                  id="select-all"
                  :checked="isAllSelected"
                  :indeterminate.prop="isIndeterminate"
                  @change="toggleSelectAll"
                  @click.stop
                />
              </template>

              <template #cell-checkbox="{ row }">
                <input
                  type="checkbox"
                  name="selectedCandidates"
                  class="checkbox_item"
                  :id="row.salary_composition_id"
                  :value="row.salary_composition_id"
                  :checked="isRowSelected(row.salary_composition_id)"
                  @change="toggleRow(row.salary_composition_id)"
                  @click.stop
                />
              </template>

              <template #cell-actions="{ row }">
                <div class="btn_action">
                  <MsButton
                    iconLeft="mi-circle-check-green"
                    type="border-none"
                    shapeBtn="square"
                    class="sz-32"
                  />
                  <MsButton
                    iconLeft="mi-copy"
                    type="border-none"
                    shapeBtn="square"
                    class="sz-32"
                  />
                  <MsButton
                    iconLeft="mi-pencil"
                    type="border-none"
                    shapeBtn="square"
                    class="sz-32"
                  />
                  <MsButton
                    iconLeft="mi-trash-red"
                    type="border-none"
                    shapeBtn="square"
                    class="sz-32"
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
import MsInput from "@/components/base/MsInput.vue";
import MsTable from "@/components/base/MsTable/MsTable.vue";
import FormSalaryComposition from "./FormSalaryComposition.vue";
import MsDropdownMenu from "@/components/base/MsDropdownMenu.vue";
import { ref, computed } from "vue";

const selectedStatus = ref("all");
const statusMenuOpen = ref(false);
const statusItems = [
  { label: "Tất cả",         value: "all"      },
  { label: "Đang theo dõi",  value: "active"   },
  { label: "Ngừng theo dõi", value: "inactive" },
];
/** Label hiển thị trên button trigger */
const selectedStatusLabel = computed(
  () => statusItems.find((i) => i.value === selectedStatus.value)?.label ?? "Tất cả"
);

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

const selectedIds = ref([]);

const isAllSelected = computed(() =>
  salaryCompositions.length > 0 && selectedIds.value.length === salaryCompositions.length
);

const isIndeterminate = computed(() =>
  selectedIds.value.length > 0 && selectedIds.value.length < salaryCompositions.length
);

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    selectedIds.value = salaryCompositions.map((row) => row.salary_composition_id);
  } else {
    selectedIds.value = [];
  }
};

const isRowSelected = (id) => selectedIds.value.includes(id);

const toggleRow = (id) => {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((item) => item !== id);
  } else {
    selectedIds.value = [...selectedIds.value, id];
  }
};

const fields = [
  { key: "", label: "", slot: "checkbox", width: 48, draggable: false, pinnable: false, resizable: false },
  { key: "salary_composition_code", label: "Mã thành phần", width: 180 },
  { key: "salary_composition_name", label: "Tên thành phần", width: 220 },
  { key: "organization_name", label: "Đơn vị áp dụng", width: 200 },
  { key: "composition_type", label: "Loại thành phần", width: 180 },
  { key: "composition_nature", label: "Tính chất", width: 160 },
  { key: "taxable", label: "Chịu thuế", width: 130 },
  { key: "tax_deduction", label: "Giảm trừ khi tính thuế", width: 210 },
  { key: "quota", label: "Định mức", width: 140 },
  { key: "value_type", label: "Kiểu giá trị", width: 160 },
  { key: "formula", label: "Giá trị", width: 160 },
  { key: "description", label: "Mô tả", width: 240 },
  { key: "option_show_paycheck", label: "Hiển thị trên phiếu lương", width: 230 },
  { key: "source_type", label: "Nguồn tạo", width: 150 },
  { key: "status", label: "Trạng thái", width: 160 },
  {
    key: "actions",
    label: "",
    slot: "actions",
    classHead: "col_unhide",
    classBody: "col_unhide",
    width: 210,
    draggable: false,
    pinnable: false,
    resizable: false,
  },
];

</script>
<style scoped>
  .btn_action{
    display: flex;
    align-items: center;
    gap: 16px !important;
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
  /* width: auto;
  white-space: nowrap; */
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
.content_body_search:hover,
.content_body_search:focus-within {
  border-color: #34B057;
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
  border-radius: 8px;
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
.content_body_header_right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.content_body_header_right .mg-r-8 {
  margin-right: 0;
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

.checkbox_function{
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 14px;
  background-color: #fff;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

/* ── Status dropdown trigger wrapper ── */
.content_body_status {
  position: relative;
}

.status-trigger {
  white-space: nowrap;
}

.status-label {
  font-size: 13px;
  color: #6b7280;
  margin-right: 4px;
  flex-shrink: 0;
}

.status-value {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
}

/* Chevron xoay khi mở */
.status-trigger--open :deep(.ms-button__icon--right) {
  transform: rotate(180deg);
  transition: transform 0.2s ease;
}

/* Transition animation */
.status-dropdown-enter-active,
.status-dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.status-dropdown-enter-from,
.status-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

</style>
