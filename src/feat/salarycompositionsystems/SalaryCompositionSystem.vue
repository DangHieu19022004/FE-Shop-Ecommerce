<template>
  <!-- Nếu là Overlay -->
  <MsOverlay v-if="isOverlay" class="overlay--system" @click="emit('close')" />

  <div :class="isOverlay ? 'modal_system' : 'content_bg'">
    <div :class="!isOverlay ? 'content' : 'modal_system_wrapper'">

      <!-- Normal Header -->
      <div v-if="!isOverlay" class="content_header">
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

      <!-- Overlay Header -->
      <div v-if="isOverlay" class="modal_system_header">
        <div class="modal_system_title">Thêm từ danh mục của hệ thống</div>
        <MsButton iconLeft="mi-close" :isTooltip="false" @click="emit('close')" shapeBtn="circle" class="btn-close" />
      </div>
      <div class="content_body_wrapper" :class="{ 'overlay-mode': isOverlay, 'modal_system_body': isOverlay }">
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

            <div v-if="!isOverlay && selectedIds.length > 0" class="checkbox_function" style="display: flex; align-items: center; margin-left: 16px;">
              <p class="fz-14" style="margin-right: 8px;">Đã chọn</p>
              <b class="fz-14">{{ selectedIds.length }}</b>
              <MsButton
                message="Bỏ chọn"
                class="color-green fz-14 no-background"
                :isTooltip="false"
                style="border: none; background: transparent; color: #16a34a; padding: 0; margin-left: 12px; margin-right: 12px;"
                @click="selectedIds = []"
              />
              <MsButton
                :isTooltip="false"
                message="Đưa vào danh sách sử dụng"
                iconLeft="mi-plus-primary"
                type="border-secondary"
                @click="handleConfirm"
              />
            </div>

            <div v-else class="content_body_status">
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
          <div class="content_body_header_right" v-if="!isOverlay">
            <MsButton
              iconLeft="mi-filter"
              tooltipMessage="Bộ lọc"
              shapeBtn="square"
              tooltipPosition="bottom"
              class="pd-0 sz-32"
              type="border-secondary"
            />
            <div class="setting-btn-wrapper" @click.stop>
              <MsButton
                iconLeft="mi-setting"
                tooltipMessage="Thiết lập"
                shapeBtn="square"
                tooltipPosition="bottom"
                type="border-secondary"
                class="pd-0 sz-32"
                @click="togglePopupSettingColumn"
              />
              <PopupSettingColumn
                v-if="isOpenPopupSettingColumn"
                :fields="configurableFields"
                :defaultFields="defaultConfigurableFields"
                @save="handleSaveColumnSettings"
                @close="isOpenPopupSettingColumn = false"
              />
            </div>
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
              :fields="visibleFields"
              :data-rows="salaryCompositions"
              :sort-field="sortField"
              :sort-direction="sortDirection"
              table-class="candicate_table"
              table-class-head="candicate_table_head"
              table-class-body="candicate_table_body"
              @sort-change="handleSortChange"
              @update:fields="handleTableFieldsUpdate"
              @column-resize="handleColumnResize"
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

      <!-- Overlay Footer -->
      <div v-if="isOverlay" class="modal_system_footer">
        <MsButton message="Hủy bỏ" type="border-secondary" @click="emit('close')" />
        <MsButton message="Đồng ý" type="green" :disabled="selectedIds.length === 0 || isSaving" @click="handleConfirm" />
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
import PopupSettingColumn from "@/feat/salarycomposition/PopupSettingColumn.vue";
import { ref, computed, onMounted } from "vue";

// ── Import services ──────────────────────────────────────────
import salaryCompositionSystemApi from "@/services/salaryCompositionSystemService";
import salaryCompositionApi from "@/services/salaryCompositionService";
import gridConfigApi from "@/services/gridConfigService";

// ── Import enum constants ────────────────────────────────────
import {
  SalaryCompositionStatus,
  SalaryCompositionStatusLabel,
  SalaryCompositionNatureLabel,
  SalaryCompositionValueTypeLabel,
  SalaryCompositionTypeLabel,
  SalaryCompositionTaxableLabel,
} from "@/constants/enums";

const props = defineProps({
  isOverlay: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["openAlert", "close", "saved"]);

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
    title: "Thông báo",
    message: `Bạn có chắc chắn muốn đưa thành phần lương mặc định <strong>${row.salaryCompositionName}</strong> vào danh sách sử dụng không?`,
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
          addToast(`Thêm thành công`, "success");
        } else {
          addToast("Thành phần lương đã tồn tại", "error");
        }
      } catch (err) {
        console.error("[SalaryCompositionSystem] addToUsageList:", err);
        const msg = err.data?.data || err.response?.data?.data || err.data?.devMessage || "Thành phần lương đã tồn tại";
        addToast(msg, "error");
      }
    },
  });
}

// ── Xử lý lưu danh sách (Overlay Mode) ──────────────────────
const isSaving = ref(false);
const handleConfirm = async () => {
  if (selectedIds.value.length === 0) return;
  isSaving.value = true;
  let successCount = 0;
  try {
    const itemsToAdd = salaryCompositions.value.filter(item => selectedIds.value.includes(item.salaryCompositionSystemId));

    // Call API create cho từng item đã chọn
    await Promise.all(itemsToAdd.map(async (row) => {
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
        sourceType: 2, // Default - từ hệ thống
        status: 1, // Đang theo dõi
      };
      try {
        const res = await salaryCompositionApi.create(payload);
        if (res.isSuccess) {
          successCount++;
        } else {
          addToast(`Thành phần lương "${row.salaryCompositionName}" đã tồn tại`, "error");
        }
      } catch (err) {
        console.error("[SalaryCompositionSystem] create:", err);
        const msg = err.data?.data || err.response?.data?.data || err.data?.devMessage || `Thành phần lương "${row.salaryCompositionName}" đã tồn tại`;
        addToast(msg, "error");
      }
    }));

    if (successCount > 0) {
      addToast(`Thêm thành công ${successCount} bản ghi`, "success");
      emit("saved", successCount);
      if (props.isOverlay) {
        emit("close");
      }
      selectedIds.value = []; // Bỏ chọn sau khi thêm thành công
    }
  } catch (error) {
    console.error(error);
  } finally {
    isSaving.value = false;
  }
};

onMounted(() => {
  fetchData();
  loadGridConfig();
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
const DEFAULT_FIELDS = [
  {
    key: "",
    label: "",
    slot: "checkbox",
    width: 48,
    draggable: false,
    pinnable: false,
    resizable: false,
    isSystemCol: true,
  },
  { key: "salaryCompositionCode", label: "Mã thành phần", width: 180, isVisible: true },
  { key: "salaryCompositionName", label: "Tên thành phần", width: 220, isVisible: true },
  { key: "compositionType", label: "Loại thành phần", slot: "compositionType", width: 180, isVisible: true },
  { key: "compositionNature", label: "Tính chất", slot: "compositionNature", width: 160, isVisible: true },
  { key: "taxable", label: "Chịu thuế", slot: "taxable", width: 130, isVisible: true },
  { key: "quota", label: "Định mức", width: 140, isVisible: true },
  { key: "valueType", label: "Kiểu giá trị", slot: "valueType", width: 160, isVisible: true },
  { key: "formula", label: "Giá trị", width: 160, isVisible: true },
  { key: "description", label: "Mô tả", width: 240, isVisible: true },
  { key: "ghost", label: "", width: 180, isSystemCol: true },
  {
    key: "actions",
    label: "",
    slot: "actions",
    width: 60,
    draggable: false,
    pinnable: false,
    resizable: false,
    isSystemCol: true,
  },
];

// Reactive fields – được cập nhật khi user kéo thả / resize / pin / ẩn hiện
const fields = ref(DEFAULT_FIELDS.map((f) => ({ ...f })));

// Chỉ các cột có thể tùy chỉnh (không phải cột hệ thống)
const defaultConfigurableFields = computed(() =>
  DEFAULT_FIELDS.filter((f) => !f.isSystemCol)
);
const configurableFields = computed(() =>
  fields.value.filter((f) => !f.isSystemCol)
);

// Tất cả cột visible (bao gồm cột hệ thống) – truyền vào MsTable
const visibleFields = computed(() => {
  let filtered = fields.value.filter((f) => f.isSystemCol || f.isVisible !== false);
  // Nếu là overlay, ẩn đi cột actions (thao tác từng dòng)
  if (props.isOverlay) {
    filtered = filtered.filter(f => f.key !== "actions");
  }
  return filtered;
});

// ── UI state cho Popup thiết lập cột ──────────────────────────────────
const isOpenPopupSettingColumn = ref(false);
const togglePopupSettingColumn = () => {
  isOpenPopupSettingColumn.value = !isOpenPopupSettingColumn.value;
};

// ── GridConfig – Load & Save ──────────────────────────────────────────
const GRID_NAME = "SalaryCompositionSystemGrid";

/** Cache gridConfigId: { columnName -> gridConfigId } */
const gridConfigIdMap = ref({});

/** Cache full object từ DB: { columnName -> GridConfig } */
const gridConfigDataMap = ref({});

/**
 * Load cấu hình cột từ pa_grid_config và áp dụng lên fields
 */
async function loadGridConfig() {
  try {
    const result = await gridConfigApi.getByGridName(GRID_NAME);
    if (!result.isSuccess) return;

    const configs = result.data || [];

    // Tách system cols và non-system cols để giữ vị trí cột hệ thống
    const firstSystemFields = fields.value.filter((f) => f.isSystemCol && f.key === "");
    const lastSystemFields  = fields.value.filter((f) => f.isSystemCol && f.key !== "");
    const nonSystemFields   = fields.value.filter((f) => !f.isSystemCol);

    // Nếu số lượng cấu hình trả về từ DB ít hơn số lượng cột thực tế
    // thì gọi initGridConfig để tự động bổ sung các cột còn thiếu.
    if (configs.length < nonSystemFields.length) {
      await initGridConfig(configs);
      return;
    }

    // Build cả 2 cache
    const idMap = {};
    const dataMap = {};
    configs.forEach((cfg) => {
      idMap[cfg.columnName] = cfg.gridConfigId;
      dataMap[cfg.columnName] = cfg;
    });
    gridConfigIdMap.value = idMap;
    gridConfigDataMap.value = dataMap;

    // Sắp xếp non-system cols theo displayOrder từ DB và áp dụng config
    const orderedNonSystem = nonSystemFields
      .map((field) => {
        const cfg = dataMap[field.key];
        if (!cfg) return field;
        return {
          ...field,
          width: cfg.columnWidth ?? field.width,
          isVisible: cfg.isVisible ?? field.isVisible,
          pinned: cfg.pinnedPosition || null,
        };
      })
      .sort((a, b) => {
        const orderA = dataMap[a.key]?.displayOrder ?? 9999;
        const orderB = dataMap[b.key]?.displayOrder ?? 9999;
        return orderA - orderB;
      });

    // Ghép lại: checkbox → non-system (sorted) → ghost + actions
    fields.value = [
      ...firstSystemFields,
      ...orderedNonSystem,
      ...lastSystemFields,
    ];
  } catch (err) {
    console.warn("[SalaryCompositionSystem] loadGridConfig:", err);
  }
}

/**
 * Khi DB thiếu records → INSERT những cột chưa có trong DB.
 * Sau khi init xong gọi lại loadGridConfig để lấy data chuẩn nhất.
 */
async function initGridConfig(existingConfigs = []) {
  const existingNames = new Set(existingConfigs.map((c) => c.columnName));
  const nonSystemCols = fields.value.filter(
    (f) => !f.isSystemCol && f.key && f.key !== "ghost" && f.key !== "actions" && f.key !== ""
  );

  // Chỉ lấy những cột chưa có trong DB
  const missingCols = nonSystemCols.filter((f) => !existingNames.has(f.key));

  if (missingCols.length > 0) {
    await Promise.all(
      missingCols.map(async (field) => {
        const idx = fields.value.findIndex(f => f.key === field.key);
        const payload = {
          gridName: GRID_NAME,
          columnName: field.key,
          columnCaption: field.label ?? "",
          columnWidth: field.width ?? 150,
          isVisible: field.isVisible !== false,
          pinnedPosition: field.pinned ?? null,
          displayOrder: idx,
          allowFilter: null,
          filterType: null,
        };
        try {
          await gridConfigApi.upsertColumn(payload);
        } catch (err) {
          console.error(`[GridConfig] initGridConfig error for "${field.key}":`, err);
        }
      })
    );

    // Gọi đệ quy load lại data sau khi insert xong
    await loadGridConfig();
  }
}

/** Debounce timer map per columnName */
const _saveTimers = {};

/**
 * Build payload đầy đủ cho một cột
 */
function buildPayload(columnName, overrides = {}) {
  const field = fields.value.find((f) => f.key === columnName);
  const idx = fields.value.findIndex((f) => f.key === columnName);
  const cached = gridConfigDataMap.value[columnName] || {};

  const payload = {
    gridName: GRID_NAME,
    columnName,
    columnCaption: field?.label ?? cached.columnCaption ?? "",
    columnWidth: field?.width ?? cached.columnWidth ?? 150,
    isVisible: field ? (field.isSystemCol ? true : field.isVisible !== false) : (cached.isVisible ?? true),
    pinnedPosition: field?.pinned ?? cached.pinnedPosition ?? null,
    displayOrder: idx !== -1 ? idx : (cached.displayOrder ?? 0),
    allowFilter: cached.allowFilter ?? null,
    filterType: cached.filterType ?? null,
    ...overrides,
  };

  if (gridConfigIdMap.value[columnName]) {
    payload.gridConfigId = gridConfigIdMap.value[columnName];
  }

  return payload;
}

/**
 * Lưu cấu hình một cột lên BE (debounced 600ms)
 */
function saveColumnConfig(columnName, overrides = {}) {
  if (!columnName || columnName === "ghost" || columnName === "actions" || columnName === "") return;

  clearTimeout(_saveTimers[columnName]);
  _saveTimers[columnName] = setTimeout(async () => {
    try {
      const payload = buildPayload(columnName, overrides);
      const result = await gridConfigApi.upsertColumn(payload);

      if (result.isSuccess && result.data) {
        gridConfigIdMap.value[columnName] = result.data.gridConfigId;
        gridConfigDataMap.value[columnName] = result.data;
      }
    } catch (err) {
      console.warn("[SalaryCompositionSystem] saveColumnConfig:", err);
    }
  }, 600);
}

/**
 * Xử lý khi resize cột
 */
const handleColumnResize = ({ field, width }) => {
  const target = fields.value.find((f) => f.key === field.key);
  if (target) target.width = width;
  saveColumnConfig(field.key, { columnWidth: width });
};

/**
 * Cập nhật fields khi MsTable emit update:fields (kéo thả, ghim)
 */
const handleTableFieldsUpdate = (updatedFields) => {
  const hiddenFields = fields.value.filter(
    (f) => !f.isSystemCol && f.isVisible === false
  );
  fields.value = [
    ...updatedFields,
    ...hiddenFields,
  ];

  // Lưu displayOrder và pinnedPosition lên BE với explicit overrides
  fields.value.forEach((field, idx) => {
    if (!field.isSystemCol) {
      saveColumnConfig(field.key, {
        pinnedPosition: field.pinned ?? null,
        displayOrder: idx,
      });
    }
  });
};

/**
 * Lưu cấu hình cột từ PopupSettingColumn
 */
/**
 * Lưu cấu hình cột từ PopupSettingColumn
 * Dùng async/await trực tiếp (không qua debounce) để đảm bảo toàn bộ cấu hình được lưu
 */
const handleSaveColumnSettings = async (configurableSaved) => {
  // Tách các cột system để giữ vị trí
  const firstSystemFields = fields.value.filter((f) => f.isSystemCol && f.key === "");
  const lastSystemFields  = fields.value.filter((f) => f.isSystemCol && f.key !== "");

  // Update non-system cols theo ĐÚNG thứ tự từ configurableSaved (do user kéo thả)
  const updatedNonSystem = configurableSaved.map((saved) => {
    const originalField = fields.value.find((f) => f.key === saved.key);
    const isVisible = saved.isVisible !== false;
    return {
      ...originalField,
      ...saved,
      pinned: isVisible ? originalField?.pinned : null,
    };
  });

  // Ghép lại thành mảng fields mới với thứ tự đã được cập nhật
  fields.value = [
    ...firstSystemFields,
    ...updatedNonSystem,
    ...lastSystemFields,
  ];

  // Đóng popup ngay lập tức cho UX tốt
  isOpenPopupSettingColumn.value = false;

  // Lưu từng cột lên BE – dùng Promise.all để song song nhưng không qua debounce
  const savableCols = configurableSaved.filter(
    (f) => f.key && f.key !== "ghost" && f.key !== "actions" && f.key !== ""
  );

  await Promise.all(
    savableCols.map(async (f) => {
      const isVisible = f.isVisible !== false;
      const overrides = { isVisible };
      if (!isVisible) overrides.pinnedPosition = null;

      try {
        const payload = buildPayload(f.key, overrides);
        const result = await gridConfigApi.upsertColumn(payload);
        if (result.isSuccess && result.data) {
          gridConfigIdMap.value[f.key] = result.data.gridConfigId;
          gridConfigDataMap.value[f.key] = result.data;
        } else {
          console.error(`[GridConfig] Save non-success for "${f.key}":`, result);
        }
      } catch (err) {
        console.error(`[GridConfig] Save error for "${f.key}":`, err);
      }
    })
  );
};
</script>

<style scoped>
/* Modal Overlay CSS */
.overlay--system {
  z-index: 1000;
}
.modal_system {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 900px;
  max-width: 95vw;
  height: 700px;
  background-color: #fff;
  z-index: 1001;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}
.modal_system_wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.modal_system_header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px 0 24px;
}
.modal_system_title {
  font-size: 16px;
  font-weight: 600;
  color: #212121;
}
.modal_system_body {
  flex: 1;
  overflow: hidden;
  /* border-top: 1px solid #e0e0e0; */
  /* border-bottom: 1px solid #e0e0e0; */
  margin: 16px 24px;
}
.modal_system_body .content_body_header {
  padding: 0 0 12px 0;
}
.modal_system_footer {
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
}
/* Reusing normal styles below */
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
/* Wrapper cho nút thiết lập + popup */
.setting-btn-wrapper {
  position: relative;
}
</style>
