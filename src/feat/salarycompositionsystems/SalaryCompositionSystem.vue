<template>
  <div class="content_bg">
    <div class="content">
      <div class="content_header">
        <div>
          <div class="content_header_left_icon">
            <MsButton
              iconLeft="mi-arrow-left"
              shapeBtn="circle"
              :isTooltip="false"
              @click="$router.push('/salarycomposition')"
            />
            <h2 class="content_header_left_title">Danh mục thành phần lương của hệ thống</h2>
          </div>
        </div>
      </div>
      <div class="content_body_wrapper">
        <div class="content_body_header">
          <div class="content_body_header_left">
            <div class="content_body_search">
              <MsButton
                iconLeft="mi-search"
                tooltipMessage="Tìm kiếm"
                unActive
                tooltipPosition="bottom"
              />
              <MsInput
                placeholder="Tìm kiếm"
                class="content_body_search-input"
                v-model="searchKeyword"
                @input="handleSearchInput"
              />
            </div>

            <div class="content_body_status">
              <MsButton
                :isTooltip="false"
                iconRight="mi-chevron-down mg-l-8"
                class="status-trigger"
                :class="{ 'status-trigger--open': statusMenuOpen }"
                @click.stop="statusMenuOpen = !statusMenuOpen"
              >
                <span class="status-label">Loại thành phần:</span>
                <span class="status-value">{{ selectedTypeLabel }}</span>
              </MsButton>
              <Transition name="status-dropdown">
                <MsDropdownMenu
                  v-if="statusMenuOpen"
                  :items="typeItems"
                  v-model="selectedType"
                  position="bottom-start"
                  :offset="4"
                  class="status-dropdown"
                  @select="handleTypeChange"
                />
              </Transition>
            </div>
          </div>
          <div class="content_body_header_right">
            <MsButton
              iconLeft="mi-filter"
              tooltipMessage="Bộ lọc"
              shapeBtn="square"
              tooltipPosition="bottom"
              type="border-secondary"
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
            <!-- Trạng thái đang tải -->
            <div v-if="isLoading" class="table-state table-state--loading">
              <span>Đang tải dữ liệu...</span>
            </div>

            <!-- Trạng thái lỗi -->
            <div v-else-if="errorMessage" class="table-state table-state--error">
              <span>{{ errorMessage }}</span>
              <MsButton
                message="Thử lại"
                :isTooltip="false"
                type="border-secondary"
                class="mg-t-8"
                @click="fetchData"
              />
            </div>

            <!-- Bảng dữ liệu -->
            <MsTable
              v-else
              :fields="fields"
              :data-rows="salaryCompositions"
              :sort-field="sortField"
              :sort-direction="sortDirection"
              table-class="candicate_table"
              table-class-head="candicate_table_head"
              table-class-body="candicate_table_body"
              @sort-change="handleSortChange"
            >
              <template #header-checkbox>
                <input
                  type="checkbox"
                  name="selectedCandidates"
                  id="select-all-sys"
                  :checked="isAllSelected"
                  :indeterminate.prop="isIndeterminate"
                  @change="toggleSelectAll"
                />
              </template>
              <template #cell-checkbox="{ row }">
                <input
                  type="checkbox"
                  name="selectedCandidates"
                  class="checkbox_item"
                  :id="row.salaryCompositionSystemId"
                  :value="row.salaryCompositionSystemId"
                  :checked="isRowSelected(row.salaryCompositionSystemId)"
                  @change="toggleRow(row.salaryCompositionSystemId)"
                />
              </template>
              <template #cell-compositionType="{ row }">
                {{ SalaryCompositionTypeLabel[row.compositionType] ?? row.compositionType }}
              </template>
              <template #cell-compositionNature="{ row }">
                {{ SalaryCompositionNatureLabel[row.compositionNature] ?? row.compositionNature }}
              </template>
              <template #cell-taxable="{ row }">
                {{ SalaryCompositionTaxableLabel[row.taxable] ?? row.taxable }}
              </template>
              <template #cell-valueType="{ row }">
                {{ SalaryCompositionValueTypeLabel[row.valueType] ?? row.valueType }}
              </template>
              <!-- Cột status đã ẩn theo yêu cầu (Req 3) -->
              <template #cell-actions="{ row }">
                <div class="btn__action">
                  <MsButton
                    iconLeft="mi-plus-primary"
                    type="border-none"
                    shapeBtn="square"
                    class="sz-28 pd-0"
                    tooltipMessage="Đưa vào danh sách sử dụng"
                    tooltipPosition="left"
                    @click.stop="handleAddToUsageList(row)"
                  />
                </div>
              </template>
            </MsTable>
          </div>
        </div>
        <div class="content_body_footer">
          <div class="footer-left">
            <span>Tổng số: <b>{{ totalRecords }}</b></span>
          </div>
          <div class="footer-right">
            <span>Số dòng/trang</span>
            <div class="page-size hvp">
              <MsSelect
                v-model="pageSize"
                :data="pageSizeOptions"
                :allow-empty="false"
                :searchable="false"
                class="page-size-select"
                @update:modelValue="handlePageSizeChange"
              />
            </div>
            <span class="page-info"><b>{{ pageStart }} - {{ pageEnd }}</b></span>
            <div class="pagination-controls">
              <span class="page-btn" :class="{ disabled: pageIndex <= 1 }" @click="goToPage(1)">
                <div class="mi-next-double-left"></div>
              </span>
              <span class="page-btn" :class="{ disabled: pageIndex <= 1 }" @click="goToPage(pageIndex - 1)">
                <div class="mi-next-left"></div>
              </span>
              <span class="page-btn" :class="{ disabled: pageIndex >= totalPages }" @click="goToPage(pageIndex + 1)">
                <div class="mi-next-right"></div>
              </span>
              <span class="page-btn" :class="{ disabled: pageIndex >= totalPages }" @click="goToPage(totalPages)">
                <div class="mi-next-double-right"></div>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Alert overlay + dialog (dùng nội bộ, không qua MainLayout) -->
  <MsOverlay
    v-if="alertState.isShow"
    class="overlay--alert"
    @click="alertState.isShow = false"
  />
  <MsAlert
    v-if="alertState.isShow"
    :title="alertState.title"
    :message="alertState.message"
    :showConfirmButton="alertState.showConfirmButton"
    :cancelText="alertState.cancelText"
    :confirmText="alertState.confirmText"
    :cancelType="alertState.cancelType"
    :confirmType="alertState.confirmType"
    @close="alertState.isShow = false"
    @confirm="handleConfirmAlert"
  />

  <!-- Toast container -->
  <MsToastContainer :toasts="toasts" @close="removeToast" />
</template>
<script setup>
import MsButton from "@/components/base/MsButton.vue";
import MsInput from "@/components/base/MsInput.vue";
import MsTable from "@/components/base/MsTable/MsTable.vue";
import MsSelect from "@/components/base/MsSelect.vue";
import MsDropdownMenu from "@/components/base/MsDropdownMenu.vue";
import MsAlert from "@/components/overlay/MsAlert.vue";
import MsOverlay from "@/components/overlay/MsOverlay.vue";
import MsToastContainer from "@/components/overlay/MsToast/MsToastContainer.vue";
import { ref, computed, onMounted } from "vue";

// ── Import services ──────────────────────────────────────────
import salaryCompositionSystemApi from "@/services/salaryCompositionSystemService";
import salaryCompositionApi from "@/services/salaryCompositionService";

// ── Import enum constants ────────────────────────────────────
import {
  SalaryCompositionStatus,
  SalaryCompositionStatusLabel,
  SalaryCompositionNatureLabel,
  SalaryCompositionValueTypeLabel,
  SalaryCompositionTypeLabel,
  SalaryCompositionTaxableLabel,
} from "@/constants/enums";

const emit = defineEmits(["openAlert"]);

// ── Toast state ──────────────────────────────────────────────
const toasts = ref([]);
const addToast = (message, type = "success", duration = 3000) => {
  toasts.value.push({ id: Date.now() + Math.random(), message, type, duration });
};
const removeToast = (id) => {
  toasts.value = toasts.value.filter((t) => t.id !== id);
};

// ── Alert state ───────────────────────────────────────────────
const alertState = ref({ isShow: false, title: "", message: "", showConfirmButton: true, cancelText: "Hủy", confirmText: "Xác nhận", cancelType: "none", confirmType: "green" });
const pendingAlertAction = ref(null);

const openAlert = (payload) => {
  pendingAlertAction.value = payload.onConfirm ?? null;
  alertState.value = {
    isShow: true,
    title: payload.title ?? "Xác nhận",
    message: payload.message ?? "",
    showConfirmButton: payload.showConfirmButton ?? true,
    cancelText: payload.cancelText ?? "Hủy",
    confirmText: payload.confirmText ?? "Xác nhận",
    cancelType: payload.cancelType ?? "none",
    confirmType: payload.confirmType ?? "green",
  };
};

const handleConfirmAlert = () => {
  alertState.value.isShow = false;
  if (pendingAlertAction.value) {
    pendingAlertAction.value();
    pendingAlertAction.value = null;
  }
};

// ── Filter / search state ────────────────────────────────────
const searchKeyword = ref("");
const selectedType = ref(null);
const statusMenuOpen = ref(false);
const sortField = ref("");
const sortDirection = ref("");
let searchDebounceTimer = null;

const typeItems = [
  { label: "Tất cả", value: null },
  { label: "Thu nhập", value: "thu_nhap" },
  { label: "Khấu trừ", value: "khau_tru" },
  { label: "Khác", value: "khac" },
];

const selectedTypeLabel = computed(
  () => typeItems.find((i) => i.value === selectedType.value)?.label ?? "Tất cả"
);

const handleTypeChange = (value) => {
  selectedType.value = value;
  statusMenuOpen.value = false;
  pageIndex.value = 1;
  fetchData();
};

const handleSearchInput = () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    pageIndex.value = 1;
    fetchData();
  }, 300);
};

const toSnakeCase = (value) =>
  value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const handleSortChange = ({ field, direction }) => {
  sortField.value = field;
  sortDirection.value = direction;
  pageIndex.value = 1;
  fetchData();
};

// ── Paging state ─────────────────────────────────────────────
const pageIndex = ref(1);
const pageSize = ref(15);
const totalRecords = ref(0);

const pageSizeOptions = [
  { label: "15", value: 15 },
  { label: "25", value: 25 },
  { label: "50", value: 50 },
  { label: "100", value: 100 },
];

const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalRecords.value / pageSize.value))
);
const pageStart = computed(() => {
  if (totalRecords.value === 0) return 0;
  return (pageIndex.value - 1) * pageSize.value + 1;
});
const pageEnd = computed(() =>
  Math.min(pageIndex.value * pageSize.value, totalRecords.value)
);

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  pageIndex.value = page;
  fetchData();
};

const handlePageSizeChange = () => {
  pageIndex.value = 1;
  fetchData();
};

// ── Data state ───────────────────────────────────────────────
const salaryCompositions = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");

async function fetchData() {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const params = {
      pageIndex: pageIndex.value,
      pageSize: pageSize.value,
      search: searchKeyword.value || undefined,
      searchFields: searchKeyword.value
        ? "salary_composition_code;salary_composition_name"
        : undefined,
    };

    if (sortField.value && sortDirection.value) {
      params.sort = `${toSnakeCase(sortField.value)} ${sortDirection.value.toUpperCase()}`;
    }

    const result = await salaryCompositionSystemApi.getPaging(params);
    if (result.isSuccess && result.data) {
      salaryCompositions.value = result.data.data ?? [];
      totalRecords.value = result.data.total ?? 0;
    } else {
      errorMessage.value = result.data || "Không thể tải dữ liệu";
    }
  } catch (err) {
    errorMessage.value = err.message || "Có lỗi xảy ra khi tải dữ liệu";
    console.error("[SalaryCompositionSystem] fetchData:", err);
  } finally {
    isLoading.value = false;
  }
}

async function handleDeleteOne(id) {
  openAlert({
    title: "Xác nhận xóa",
    message: "Bạn có chắc chắn muốn xóa thành phần lương hệ thống này?",
    confirmText: "Xóa",
    confirmType: "red",
    onConfirm: async () => {
      try {
        const result = await salaryCompositionSystemApi.deleteById(id);
        if (result.isSuccess) {
          selectedIds.value = selectedIds.value.filter((sid) => sid !== id);
          await fetchData();
          addToast("Xóa thành phần lương hệ thống thành công", "success");
        } else {
          addToast(result.data || "Xóa thất bại", "error");
        }
      } catch (err) {
        console.error("[SalaryCompositionSystem] deleteOne:", err);
        addToast("Có lỗi xảy ra khi xóa", "error");
      }
    },
  });
}

// ── Đưa vào danh sách sử dụng (Req 2) ───────────────────────
async function handleAddToUsageList(row) {
  openAlert({
    title: "Đưa vào danh sách sử dụng",
    message: `Bạn có muốn thêm "${row.salaryCompositionName}" vào danh sách thành phần lương sử dụng không?`,
    confirmText: "Thêm vào",
    confirmType: "green",
    onConfirm: async () => {
      try {
        const payload = {
          salaryCompositionSystemId: row.salaryCompositionSystemId,
          salaryCompositionCode: row.salaryCompositionCode,
          salaryCompositionName: row.salaryCompositionName,
          compositionType: row.compositionType,
          compositionNature: row.compositionNature,
          taxable: row.taxable ?? null,
          taxDeduction: row.taxDeduction ?? null,
          quota: row.quota ?? null,
          valueType: row.valueType,
          formula: row.formula ?? null,
          description: row.description ?? null,
          optionShowPaycheck: row.optionShowPaycheck ?? null,
          sourceType: 2, // Default – từ hệ thống
          status: 1,     // Đang theo dõi
        };
        const result = await salaryCompositionApi.create(payload);
        if (result.isSuccess) {
          addToast(`Đã thêm "${row.salaryCompositionName}" vào danh sách sử dụng`, "success");
        } else {
          addToast(result.data || "Thêm vào danh sách thất bại", "error");
        }
      } catch (err) {
        console.error("[SalaryCompositionSystem] addToUsageList:", err);
        addToast("Có lỗi xảy ra khi thêm vào danh sách", "error");
      }
    },
  });
}

onMounted(() => {
  fetchData();
});

// ── Checkbox selection ───────────────────────────────────────
const selectedIds = ref([]);

const isAllSelected = computed(
  () =>
    salaryCompositions.value.length > 0 &&
    selectedIds.value.length === salaryCompositions.value.length
);
const isIndeterminate = computed(
  () =>
    selectedIds.value.length > 0 &&
    selectedIds.value.length < salaryCompositions.value.length
);

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    selectedIds.value = salaryCompositions.value.map((r) => r.salaryCompositionSystemId);
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

// ── Table fields ─────────────────────────────────────────────
// Req 3: Không có cột status
const fields = [
  {
    key: "",
    label: "",
    slot: "checkbox",
    width: 48,
    draggable: false,
    pinnable: false,
    resizable: false,
  },
  { key: "salaryCompositionCode", label: "Mã thành phần", width: 180 },
  { key: "salaryCompositionName", label: "Tên thành phần", width: 220 },
  { key: "compositionType", label: "Loại thành phần", slot: "compositionType", width: 180 },
  { key: "compositionNature", label: "Tính chất", slot: "compositionNature", width: 160 },
  { key: "taxable", label: "Chịu thuế", slot: "taxable", width: 130 },
  { key: "quota", label: "Định mức", width: 140 },
  { key: "valueType", label: "Kiểu giá trị", slot: "valueType", width: 160 },
  { key: "formula", label: "Giá trị", width: 160 },
  { key: "description", label: "Mô tả", width: 240 },
  {
    key: "actions",
    label: "",
    slot: "actions",
    width: 60,
    draggable: false,
    pinnable: false,
    resizable: false,
  },
];
</script>
<style scoped>
.status-label {
  color: #666;
  margin-right: 4px;
  font-size: 14px;
}
.status-value {
  color: #111;
  font-weight: 500;
  font-size: 14px;
}
.content_body {
  width: 100%;
  flex: 1;
  background-color: #f8f9fa;
  border-top: 1px solid #d9dee7;
  border-bottom: 1px solid #d9dee7;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.content_header_left_icon {
  display: flex;
  align-items: center;
  gap: 8px;
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
.content_body_header_right {
  display: flex;
  align-items: center;
  gap: 8px;
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
.footer-left b,
.page-info b {
  font-weight: 600;
  color: #111;
}
.footer-right {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #666;
}
.page-size :deep(.ms-select) {
  width: 84px;
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
  width: 28px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  font-weight: 500;
  opacity: 1;
  transition: opacity 0.15s ease, background-color 0.15s ease;
}
.page-btn.disabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
}
.page-btn:not(.disabled):hover {
  background-color: #e8f5f0;
  color: #111;
}
.content_header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 16px;
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
  border-color: #34b057;
}
.content_body_status {
  margin-left: 8px;
  display: flex;
  align-items: center;
  background-color: #fff3;
  border-radius: 8px;
  border: 1px solid #d9dee7;
  height: 32px;
  position: relative;
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
.content_body_header_left {
  display: flex;
  align-items: center;
}
/* Status badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  border: 1.5px solid;
}
.status-badge__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.status-badge--active {
  color: #16a34a;
  background-color: #f0fdf4;
  border-color: #86efac;
}
.status-badge--active .status-badge__dot {
  background-color: #16a34a;
}
.status-badge--inactive {
  color: #d97706;
  background-color: #fffbeb;
  border-color: #fcd34d;
}
.status-badge--inactive .status-badge__dot {
  background-color: #d97706;
}
/* Status dropdown */
.status-trigger--open :deep(.ms-button__icon--right) {
  transform: rotate(180deg);
  transition: transform 0.2s ease;
}
.status-dropdown-enter-active,
.status-dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.status-dropdown-enter-from,
.status-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
/* Loading / Error state */
.table-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 200px;
  font-size: 14px;
  color: #6b7280;
  gap: 8px;
}
.table-state--error {
  color: #dc2626;
}
</style>
