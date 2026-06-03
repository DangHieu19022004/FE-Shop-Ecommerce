<template>
  <FormSalaryComposition
    v-if="isShowForm"
    :editId="editId"
    :viewId="viewId"
    @close="handleCloseFormAndRefresh"
    @saved="handleSavedRefresh"
    @openAlert="$emit('openAlert', $event)"
  />
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
            iconLeft="mi-plus-white mg-r-8 fw-500"
            @click="handleOpenForm(null)"
          />
          <MsButton
            class="btn-add-menu fw-500"
            iconLeft="mi-chevron-down-white"
            type="green"
            :isTooltip="false"
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
      <!-- Page area: content_body_wrapper + filter sidebar -->
      <div class="page-area">
        <div class="content_body_wrapper">
          <div v-if="selectedIds.length > 0" class="checkbox_function">
            <p class="fz-14 m-r-8">Đã chọn</p>
            <b class="fz-14">{{ selectedIds.length }}</b>
            <MsButton
              message="Bỏ chọn"
              class="m-r-8 color-green fz-14 no-background"
              :isTooltip="false"
              @click="selectedIds = []"
            />
            <MsButton
              :isTooltip="false"
              message="Xóa"
              iconLeft="mi-trash-red"
              class="m-r-8 fz-14"
              type="border-danger"
              @click="handleDeleteSelected"
            />
            <MsButton
              :isTooltip="false"
              message="Ngừng theo dõi"
              class="m-r-8 fz-14"
              type="border-secondary"
              @click="handleBulkUpdateStatus(SalaryCompositionStatus.StoppedFollowing)"
            />
            <MsButton
              :isTooltip="false"
              message="Theo dõi"
              class="fz-14"
              type="border-secondary"
              @click="handleBulkUpdateStatus(SalaryCompositionStatus.Following)"
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
                  <span class="status-label">Trạng thái:</span>
                  <span class="status-value">{{ selectedStatusLabel }}</span>
                </MsButton>
                <Transition name="status-dropdown">
                  <MsDropdownMenu
                    v-if="statusMenuOpen"
                    :items="statusItems"
                    v-model="selectedStatus"
                    position="bottom-start"
                    :offset="4"
                    class="status-dropdown"
                    @select="handleStatusChange"
                  />
                </Transition>
              </div>
              <MsTreeSelect
                placeholder="Tất cả đơn vị"
                :options="orgTreeData"
                v-model="selectedOrgs"
                class="m-l-8 h-32"
                @update:modelValue="handleOrgChange"
              />
            </div>
            <div class="content_body_header_right">
              <MsButton
                iconLeft="mi-filter"
                tooltipMessage="Bộ lọc"
                shapeBtn="square"
                tooltipPosition="bottom"
                type="border-secondary"
                class="pd-0 sz-32"
                @click="isOpenFilter = !isOpenFilter"
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
              <div
                v-else-if="errorMessage"
                class="table-state table-state--error"
              >
                <span>{{ errorMessage }}</span>
                <MsButton
                  message="Thử lại"
                  :isTooltip="false"
                  type="border-secondary"
                  class="mg-t-8"
                  @click="fetchSalaryCompositions"
                />
              </div>

              <!-- Bảng dữ liệu (chỉ render khi có data và không loading) -->
              <MsTable
                v-else
                :fields="fields"
                :data-rows="salaryCompositions"
                :sort-field="sortField"
                :sort-direction="sortDirection"
                table-class="candicate_table"
                table-class-head="candicate_table_head"
                table-class-body="candicate_table_body"
                @row-click="handleRowClick"
                @sort-change="handleSortChange"
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
                    :id="row.salaryCompositionId"
                    :value="row.salaryCompositionId"
                    :checked="isRowSelected(row.salaryCompositionId)"
                    @change="toggleRow(row.salaryCompositionId)"
                    @click.stop
                  />
                </template>
                <template #cell-status="{ row }">
                  <span
                    class="status-badge"
                    :class="
                      row.status === SalaryCompositionStatus.Following
                        ? 'status-badge--active'
                        : 'status-badge--inactive'
                    "
                  >
                    <span class="status-badge__dot"></span>
                    {{ SalaryCompositionStatusLabel[row.status] ?? row.status }}
                  </span>
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
                <template #cell-sourceType="{ row }">
                  {{ SalaryCompositionSourceTypeLabel[row.sourceType] ?? row.sourceType }}
                </template>
                <template #cell-optionShowPaycheck="{ row }">
                  {{ SalaryCompositionShowPaycheckLabel[row.optionShowPaycheck] ?? row.optionShowPaycheck }}
                </template>
                <template #cell-actions="{ row }">
                  <div class="btn_action">
                    <!-- Nút Toggle status: luôn cho phép -->
                    <MsButton
                      :iconLeft="row.status === SalaryCompositionStatus.Following ? 'mi-circle-minus-yellow' : 'mi-circle-check-green'"
                      type="border-none"
                      shapeBtn="square"
                      class="sz-28 pd-0"
                      :tooltipMessage="row.status === SalaryCompositionStatus.Following ? 'Ngưng theo dõi' : 'Theo dõi'"
                      tooltipPosition="bottom"
                      @click.stop="handleToggleStatus(row)"
                    />
                    <!-- Nút Nhân bản: không lock -->
                    <MsButton
                      iconLeft="mi-copy"
                      type="border-none"
                      shapeBtn="square"
                      class="sz-28 pd-0"
                      tooltipMessage="Nhân bản"
                      tooltipPosition="bottom"
                    />
                    <!-- Nút Sửa: lock nếu có salaryCompositionSystemId (Req 1) -->
                    <MsButton
                      iconLeft="mi-pencil"
                      type="border-none"
                      shapeBtn="square"
                      class="sz-28 pd-0"
                      :tooltipMessage="row.salaryCompositionSystemId ? 'Không thể sửa dữ liệu từ danh mục hệ thống' : 'Sửa'"
                      tooltipPosition="bottom"
                      :disabled="!!row.salaryCompositionSystemId"
                      :class="{ 'btn-disabled-sys': !!row.salaryCompositionSystemId }"
                      @click.stop="!row.salaryCompositionSystemId && handleOpenForm(row.salaryCompositionId)"
                    />
                    <!-- Nút Xóa: lock nếu có salaryCompositionSystemId (Req 1) -->
                    <MsButton
                      iconLeft="mi-trash-red"
                      type="border-none"
                      shapeBtn="square"
                      class="sz-28 pd-0"
                      :tooltipMessage="row.salaryCompositionSystemId ? 'Không thể xóa dữ liệu từ danh mục hệ thống' : 'Xóa'"
                      tooltipPosition="bottom"
                      :disabled="!!row.salaryCompositionSystemId"
                      :class="{ 'btn-disabled-sys': !!row.salaryCompositionSystemId }"
                      @click.stop="!row.salaryCompositionSystemId && handleDeleteOne(row.salaryCompositionId)"
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
              <span class="page-info">
                <b>{{ pageStart }} - {{ pageEnd }}</b>
              </span>
              <div class="pagination-controls">
                <span
                  class="page-btn"
                  :class="{ disabled: pageIndex <= 1 }"
                  @click="goToPage(1)"
                >
                  <div class="mi-next-double-left"></div>
                </span>
                <span
                  class="page-btn"
                  :class="{ disabled: pageIndex <= 1 }"
                  @click="goToPage(pageIndex - 1)"
                >
                  <div class="mi-next-left"></div>
                </span>
                <span
                  class="page-btn"
                  :class="{ disabled: pageIndex >= totalPages }"
                  @click="goToPage(pageIndex + 1)"
                >
                  <div class="mi-next-right"></div>
                </span>
                <span
                  class="page-btn"
                  :class="{ disabled: pageIndex >= totalPages }"
                  @click="goToPage(totalPages)"
                >
                  <div class="mi-next-double-right"></div>
                </span>
              </div>
            </div>
          </div>
        </div>
        <!-- Filter sidebar: bên cạnh content_body_wrapper -->
        <FilterSalaryComposition
          v-if="isOpenFilter"
          @close="isOpenFilter = false"
        />
      </div>
    </div>
  </div>

  <!-- Toast container (nội bộ, khi Req4 toast không qua MainLayout) -->
  <MsToastContainer :toasts="toasts" @close="removeToast" />
</template>
<script setup>
import MsButton from "@/components/base/MsButton.vue";
import MsInput from "@/components/base/MsInput.vue";
import MsTable from "@/components/base/MsTable/MsTable.vue";
import FormSalaryComposition from "./FormSalaryComposition.vue";
import MsDropdownMenu from "@/components/base/MsDropdownMenu.vue";
import MsSelect from "@/components/base/MsSelect.vue";
import PopupSettingColumn from "./PopupSettingColumn.vue";
import FilterSalaryComposition from "./FilterSalaryComposition.vue";
import MsTreeSelect from "@/components/base/MsTreeSelect/MsTreeSelect.vue";
import MsToastContainer from "@/components/overlay/MsToast/MsToastContainer.vue";
import { ref, computed, onMounted, watch } from "vue";

// ======================== Import services ========================
import salaryCompositionApi from "@/services/salaryCompositionService";
import organizationApi from "@/services/organizationService";

// ======================== Import enum constants ========================
import {
  SalaryCompositionStatus,
  SalaryCompositionStatusLabel,
  SalaryCompositionNatureLabel,
  SalaryCompositionTypeLabel,
  SalaryCompositionTaxableLabel,
  SalaryCompositionValueTypeLabel,
  SalaryCompositionSourceTypeLabel,
  SalaryCompositionShowPaycheckLabel,
} from "@/constants/enums";

// ======================== UI state ========================
const isOpenFilter = ref(false);
const isOpenPopupSettingColumn = ref(false);
const toggleSelectComposition = ref(false);
const isShowForm = ref(false);
const editId = ref(null); // null = thêm mới, string = sửa
const viewId = ref(null); // string = xem chi tiết (readonly)

const togglePopupSettingColumn = () => {
  isOpenPopupSettingColumn.value = !isOpenPopupSettingColumn.value;
};

const openSelectComposition = () => {
  toggleSelectComposition.value = !toggleSelectComposition.value;
};

const handleOpenForm = (id) => {
  editId.value = id;
  viewId.value = null;
  isShowForm.value = true;
};

// Task 2: click vào row để mở form xem chi tiết (readonly)
const handleRowClick = (row) => {
  viewId.value = row.salaryCompositionId;
  editId.value = null;
  isShowForm.value = true;
};

const handleCloseFormAndRefresh = () => {
  isShowForm.value = false;
  editId.value = null;
  viewId.value = null;
  fetchSalaryCompositions();
};

// Task 3: Khi Lưu và thêm - refresh list nhưng KHÔNG đóng form
const handleSavedRefresh = () => {
  fetchSalaryCompositions();
};

// ======================== Filter / search state ========================
const selectedOrgs = ref([]);
const selectedStatus = ref(null); // null = Tất cả
const statusMenuOpen = ref(false);
const searchKeyword = ref("");
const sortField = ref("");
const sortDirection = ref("");
let searchDebounceTimer = null;

const statusItems = [
  { label: "Tất cả", value: null },
  { label: "Đang theo dõi", value: SalaryCompositionStatus.Following },
  { label: "Ngừng theo dõi", value: SalaryCompositionStatus.StoppedFollowing },
];

const selectedStatusLabel = computed(
  () =>
    statusItems.find((i) => i.value === selectedStatus.value)?.label ?? "Tất cả"
);

const handleStatusChange = (item) => {
  // @select emit cả object { label, value }, cần lấy item.value
  selectedStatus.value = item?.value ?? null;
  statusMenuOpen.value = false;
  pageIndex.value = 1;
  fetchSalaryCompositions();
};

const handleOrgChange = () => {
  pageIndex.value = 1;
  fetchSalaryCompositions();
};

const handleSearchInput = () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    pageIndex.value = 1;
    fetchSalaryCompositions();
  }, 300);
};

// ======================== Paging state ========================
const toSnakeCase = (value) =>
  value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const handleSortChange = ({ field, direction }) => {
  sortField.value = field;
  sortDirection.value = direction;
  pageIndex.value = 1;
  fetchSalaryCompositions();
};

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
  fetchSalaryCompositions();
};

const handlePageSizeChange = () => {
  pageIndex.value = 1;
  fetchSalaryCompositions();
};

// ======================== Data state ========================
const salaryCompositions = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");
const orgTreeData = ref([]);

/**
 * Gọi API lấy danh sách thành phần lương có phân trang
 * Endpoint: GET /api/SalaryComposition/Paging
 */
async function fetchSalaryCompositions() {
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

    // Filter theo trạng thái (null = Tất cả, 1 = Đang theo dõi, 2 = Ngừng theo dõi)
    if (selectedStatus.value !== null && selectedStatus.value !== undefined) {
      params.status = selectedStatus.value;
    }

    // Filter theo đơn vị: gửi mảng organizationId lên server
    if (selectedOrgs.value && selectedOrgs.value.length > 0) {
      params.organizationIds = selectedOrgs.value.join(",");
    }

    if (sortField.value && sortDirection.value) {
      params.sort = `${toSnakeCase(sortField.value)} ${sortDirection.value.toUpperCase()}`;
    }

    const result = await salaryCompositionApi.getPaging(params);

    if (result.isSuccess && result.data) {
      salaryCompositions.value = result.data.data ?? [];
      totalRecords.value = result.data.total ?? 0;
    } else {
      errorMessage.value = result.data || "Không thể tải dữ liệu";
    }
  } catch (err) {
    errorMessage.value = err.message || "Có lỗi xảy ra khi tải dữ liệu";
    console.error("[SalaryComposition] fetchSalaryCompositions:", err);
  } finally {
    isLoading.value = false;
  }
}

/**
 * Gọi API lấy cây đơn vị cho TreeSelect
 * Endpoint: GET /api/Organization/Tree
 */
async function fetchOrgTree() {
  try {
    const result = await organizationApi.getTree();
    if (result.isSuccess && result.data) {
      orgTreeData.value = mapOrgTree(result.data);
    }
  } catch (err) {
    console.error("[SalaryComposition] fetchOrgTree:", err);
  }
}

/**
 * Map cây tổ chức từ API sang format { id, label, children } cho MsTreeSelect
 */
function mapOrgTree(nodes) {
  return nodes.map((node) => ({
    id: node.organizationId,
    label: node.organizationName,
    children: node.children ? mapOrgTree(node.children) : [],
  }));
}

// Gọi API ngay khi component được mount
onMounted(() => {
  fetchSalaryCompositions();
  fetchOrgTree();
});

// ======================== Xóa một bản ghi ========================
function handleDeleteOne(id) {
  emit("openAlert", {
    title: "Xác nhận xóa",
    message: "Bạn có chắc chắn muốn xóa thành phần lương này không?",
    confirmText: "Xóa",
    confirmType: "red",
    onConfirm: async () => {
      try {
        const result = await salaryCompositionApi.deleteById(id);
        if (result.isSuccess) {
          selectedIds.value = selectedIds.value.filter((sid) => sid !== id);
          await fetchSalaryCompositions();
          addToast("Xóa thành phần lương thành công", "success");
        } else {
          addToast(result.data || "Xóa thất bại", "error");
        }
      } catch (err) {
        console.error("[SalaryComposition] deleteOne:", err);
        addToast("Có lỗi xảy ra khi xóa", "error");
      }
    },
  });
}

// ======================== Xóa nhiều bản ghi ========================
function handleDeleteSelected() {
  if (selectedIds.value.length === 0) return;

  // Req 1: Lọc các row có salaryCompositionSystemId ra khỏi danh sách xóa
  const deletableIds = selectedIds.value.filter((id) => {
    const row = salaryCompositions.value.find((r) => r.salaryCompositionId === id);
    return !row?.salaryCompositionSystemId;
  });
  const blockedCount = selectedIds.value.length - deletableIds.length;

  if (deletableIds.length === 0) {
    emit("openAlert", {
      title: "Không thể xóa",
      message: "Tất cả các thành phần lương đã chọn đều từ danh mục hệ thống và không thể xóa.",
      showConfirmButton: false,
      cancelText: "Đóng",
    });
    return;
  }

  const blockedNote = blockedCount > 0
    ? ` (${blockedCount} mục từ hệ thống sẽ được bỏ qua)`
    : "";

  emit("openAlert", {
    title: "Xác nhận xóa",
    message: `Bạn có chắc chắn muốn xóa ${deletableIds.length} thành phần lương đã chọn không?${blockedNote}`,
    confirmText: "Xóa",
    confirmType: "red",
    onConfirm: async () => {
      try {
        const result = await salaryCompositionApi.deleteBulk(deletableIds);
        if (result.isSuccess) {
          selectedIds.value = [];
          await fetchSalaryCompositions();
          addToast(`Đã xóa ${deletableIds.length} thành phần lương thành công`, "success");
        } else {
          addToast(result.data || "Xóa thất bại", "error");
        }
      } catch (err) {
        console.error("[SalaryComposition] deleteSelected:", err);
        addToast("Có lỗi xảy ra khi xóa một số bản ghi", "error");
      }
    },
  });
}

// Task 4: Cập nhật trạng thái nhiều bản ghi
async function handleBulkUpdateStatus(status) {
  if (selectedIds.value.length === 0) return;
  try {
    const result = await salaryCompositionApi.updateStatusBulk(selectedIds.value, status);
    if (result.isSuccess) {
      selectedIds.value = [];
      await fetchSalaryCompositions();
      const label = status === SalaryCompositionStatus.Following ? "đang theo dõi" : "ngưng theo dõi";
      addToast(`Cập nhật trạng thái thành công (${label})`, "success");
    } else {
      addToast(result.data || "Cập nhật trạng thái thất bại", "error");
    }
  } catch (err) {
    console.error("[SalaryComposition] bulkUpdateStatus:", err);
    addToast("Có lỗi xảy ra khi cập nhật trạng thái", "error");
  }
}

// ======================== Toggle trạng thái theo dõi ========================
async function handleToggleStatus(row) {
  const newStatus =
    row.status === SalaryCompositionStatus.Following
      ? SalaryCompositionStatus.StoppedFollowing
      : SalaryCompositionStatus.Following;

  try {
    const result = await salaryCompositionApi.update(row.salaryCompositionId, {
      ...row,
      status: newStatus,
    });
    if (result.isSuccess) {
      await fetchSalaryCompositions();
      const label = newStatus === SalaryCompositionStatus.Following ? "Đang theo dõi" : "Ngưng theo dõi";
      addToast(`Đã chuyển sang "${label}"`, "success");
    } else {
      addToast(result.data || "Cập nhật trạng thái thất bại", "error");
    }
  } catch (err) {
    console.error("[SalaryComposition] toggleStatus:", err);
    addToast("Có lỗi xảy ra khi cập nhật trạng thái", "error");
  }
}

// ======================== Checkbox selection ========================
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
    selectedIds.value = salaryCompositions.value.map(
      (row) => row.salaryCompositionId
    );
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

// ======================== Emit + Toast ========================
const emit = defineEmits(["openAlert"]);

const toasts = ref([]);
const addToast = (message, type = "success", duration = 3000) => {
  toasts.value.push({ id: Date.now() + Math.random(), message, type, duration });
};
const removeToast = (id) => {
  toasts.value = toasts.value.filter((t) => t.id !== id);
};

// ======================== Table fields ========================
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
  { key: "organizationName", label: "Đơn vị áp dụng", width: 200 },
  { key: "compositionType", label: "Loại thành phần", slot: "compositionType", width: 180 },
  { key: "compositionNature", label: "Tính chất", slot: "compositionNature", width: 160 },
  { key: "taxable", label: "Chịu thuế", slot: "taxable", width: 160 },
  { key: "taxDeduction", label: "Giảm trừ khi tính thuế", width: 210 },
  { key: "quota", label: "Định mức", width: 140 },
  { key: "valueType", label: "Kiểu giá trị", slot: "valueType", width: 160 },
  { key: "formula", label: "Giá trị", width: 160 },
  { key: "description", label: "Mô tả", width: 240 },
  { key: "optionShowPaycheck", label: "Hiển thị trên phiếu lương", slot: "optionShowPaycheck", width: 230 },
  { key: "sourceType", label: "Nguồn tạo", slot: "sourceType", width: 150 },
  { key: "status", label: "Trạng thái", slot: "status", width: 160 },
  {key: "ghost", label: "", width: 180},
  {
    key: "actions",
    label: "",
    slot: "actions",
    width: 1,
    draggable: false,
    pinnable: false,
    resizable: false,
  },
];
</script>
<style scoped>
.btn_action {
  display: flex;
  align-items: center;
  gap: 16px !important;
}

/* Nút bị khóa vì data từ hệ thống (Req 1) */
.btn-disabled-sys {
  opacity: 0.35 !important;
  cursor: not-allowed !important;
  pointer-events: none !important;
}

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

.page-size .ms-button:hover {
  background-color: transparent !important;
}

.page-size {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #111;
}

.page-size :deep(.ms-select) {
  width: 84px;
}

.page-size :deep(.ms-multiselect .multiselect__tags) {
  /* min-height: 32px; */
  height: 32px;
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
}

.content_header_right .btn-system {
  background-color: #fff;
  border: 1px solid #d9dee7;
  color: #1f1f1f;
}

.content_header_right .btn-system:hover {
  background-color: #f1f2f1;
}

.btn-add {
  position: relative;
  width: 88px !important;
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

.btn-add::after {
  content: "";
  position: absolute;
  top: 6px;
  bottom: 6px;
  right: 0;
  width: 1px;
  background: #d9dee7;
}

.btn-add-menu{
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
}

.content_body_header {
  display: flex;
  height: 56px;
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
  flex-shrink: 0;
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

.content_body_header_right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.content_body_header_right .mg-r-8 {
  margin-right: 0;
}

.checkbox_function {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 14px;
  background-color: #fff;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

/* 🔽 Status dropdown trigger wrapper 🔽 */
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
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.status-dropdown-enter-from,
.status-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* 🔧 Setting popup wrapper 🔧 */
.setting-btn-wrapper {
  position: relative;
}

:deep(.ms-tree-select__control) {
  width: 350px;
}

/* 📐 Filter layout: table + filter panel side by side 📐 */
.page-area {
  display: flex;
  flex-direction: row;
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  gap: 16px;
}

/* 📋 Dropdown Select Composition 📋 */
.select-composition {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  z-index: 500;
  background: #fff;
  border-radius: 6px;
  min-width: 220px;
  box-shadow: 0 4px 20px rgba(17, 24, 39, 0.14);
  border: 1px solid #e5e7eb;
  padding: 4px 0;
  display: flex;
  flex-direction: column;
}

.select-composition :deep(.ms-button) {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 36px;
  padding: 0 12px;
  font-size: 14px;
  color: #1f2937;
  background-color: transparent;
  border: none;
  border-radius: 0;
  cursor: pointer;
  transition:
    background-color 0.12s ease,
    color 0.12s ease;
}

:deep(.ms-multiselect.multiselect){
  min-height: 32px;
}
.select-composition :deep(.ms-button:hover) {
  background-color: #f3f4f6;
  color: #111827;
}

:deep(.multiselect__tags) {
  border-radius: 8px !important;
}

/* 📊 Trạng thái loading / error trong bảng 📊 */
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

/* 🏷️ Status badge trong cột Trạng thái 🏷️ */
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

/* Đang theo dõi - xanh lá */
.status-badge--active {
  color: #16a34a;
  background-color: #f0fdf4;
  border-color: #86efac;
}

.status-badge--active .status-badge__dot {
  background-color: #16a34a;
}

/* Ngừng theo dõi - cam */
.status-badge--inactive {
  color: #d97706;
  background-color: #fffbeb;
  border-color: #fcd34d;
}

.status-badge--inactive .status-badge__dot {
  background-color: #d97706;
}
</style>
