<template>
  <FormSalaryComposition
    v-if="isShowForm"
    :editId="editId"
    :viewId="viewId"
    :duplicateId="duplicateId"
    @close="handleCloseFormAndRefresh"
    @saved="handleSavedRefresh"
    @duplicate="handleDuplicate"
    @delete="handleDeleteFromForm"
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
              @click="openPopupSystem"
            />
          </div>
        </div>
      </div>
      <!-- Page area: content_body_wrapper + filter sidebar -->
      <div class="page-area">
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

              <div v-if="selectedIds.length > 0" class="checkbox_function">
                <p class="fz-14 m-r-8">Đã chọn</p>
                <b class="fz-14">{{ selectedIds.length }}</b>
                <MsButton
                  message="Bỏ chọn"
                  class="m-r-8 color-green fz-14 no-background"
                  :isTooltip="false"
                  @click="selectedIds = []"
                />
                <!-- Nút Ngừng theo dõi: Hiển thị khi có ít nhất 1 dòng Đang theo dõi -->
                <MsButton
                  v-if="hasActiveSelected"
                  iconLeft="mi-circle-minus-yellow"
                  type="none"
                  class="btn-status-badge status-badge status-badge--inactive-border m-r-8"
                  :isTooltip="false"
                  @click="
                    handleBulkUpdateStatus(
                      SalaryCompositionStatus.StoppedFollowing,
                    )
                  "
                >
                  <span class="status-badge__dot"></span>
                  Ngừng theo dõi
                </MsButton>

                <!-- Nút Đang theo dõi: Hiển thị khi có ít nhất 1 dòng Ngừng theo dõi -->
                <MsButton
                  v-if="hasInactiveSelected"
                  iconLeft="mi-circle-check-green"
                  type="none"
                  class="btn-status-badge status-badge status-badge--active-border m-r-8"
                  :isTooltip="false"
                  @click="
                    handleBulkUpdateStatus(SalaryCompositionStatus.Following)
                  "
                >
                  <span class="status-badge__dot"></span>
                  Đang theo dõi
                </MsButton>
                <MsButton
                  :isTooltip="false"
                  message="Xóa"
                  iconLeft="mi-trash-red"
                  class="m-r-8 fz-14 h-32"
                  type="border-danger"
                  @click="handleDeleteSelected"
                />
              </div>

              <div v-else class="content_body_filters">
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
              <MsLoader v-if="isLoading" class="table-state table-state--loading" />

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
                :fields="visibleFields"
                :data-rows="salaryCompositions"
                :sort-field="sortField"
                :sort-direction="sortDirection"
                table-class="candicate_table"
                table-class-head="candicate_table_head"
                table-class-body="candicate_table_body"
                @row-click="handleRowClick"
                @sort-change="handleSortChange"
                @update:fields="handleTableFieldsUpdate"
                @column-resize="handleColumnResize"
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
                  {{
                    SalaryCompositionTypeLabel[row.compositionType] ??
                    row.compositionType
                  }}
                </template>
                <template #cell-compositionNature="{ row }">
                  {{
                    SalaryCompositionNatureLabel[row.compositionNature] ??
                    row.compositionNature
                  }}
                </template>
                <template #cell-taxable="{ row }">
                  {{
                    SalaryCompositionTaxableLabel[row.taxable] ??
                    row.taxable ??
                    "--"
                  }}
                </template>
                <template #cell-taxDeduction="{ row }">
                  {{
                    row.taxDeduction === null || row.taxDeduction === undefined
                      ? "--"
                      : (SalaryCompositionTaxDeductionLabel[row.taxDeduction] ??
                        "--")
                  }}
                </template>
                <template #cell-valueType="{ row }">
                  {{
                    SalaryCompositionValueTypeLabel[row.valueType] ??
                    row.valueType
                  }}
                </template>
                <template #cell-quota="{ row }">
                  <FormulaCell :value="row.quota" />
                </template>
                <template #cell-formula="{ row }">
                  <FormulaCell :value="row.formula" />
                </template>
                <template #cell-sourceType="{ row }">
                  {{
                    SalaryCompositionSourceTypeLabel[row.sourceType] ??
                    row.sourceType
                  }}
                </template>
                <template #cell-optionShowPaycheck="{ row }">
                  {{
                    SalaryCompositionShowPaycheckLabel[
                      row.optionShowPaycheck
                    ] ?? row.optionShowPaycheck
                  }}
                </template>
                <template #cell-actions="{ row }">
                  <div class="btn_action">
                    <!-- Nút Toggle status: ẩn nếu là data hệ thống -->
                    <MsButton
                      v-if="!row.salaryCompositionSystemId"
                      :iconLeft="
                        row.status === SalaryCompositionStatus.Following
                          ? 'mi-circle-minus-yellow'
                          : 'mi-circle-check-green'
                      "
                      type="border-none"
                      shapeBtn="square"
                      class="sz-28 pd-0"
                      :tooltipMessage="
                        row.status === SalaryCompositionStatus.Following
                          ? 'Ngưng theo dõi'
                          : 'Theo dõi'
                      "
                      tooltipPosition="bottom"
                      @click.stop="handleToggleStatus(row)"
                    />
                    <!-- Spacer để giữ layout các nút không bị lệch khi nút Toggle ẩn -->
                    <div
                      v-else
                      class="sz-28"
                      style="display: inline-block"
                    ></div>
                    <!-- Nút Nhân bản: không lock -->
                    <MsButton
                      iconLeft="mi-copy"
                      type="border-none"
                      shapeBtn="square"
                      class="sz-28 pd-0"
                      tooltipMessage="Nhân bản"
                      tooltipPosition="bottom"
                      @click.stop="handleDuplicate(row)"
                    />
                    <!-- Nút Sửa: hiện toast nếu có salaryCompositionSystemId -->
                    <MsButton
                      iconLeft="mi-pencil"
                      type="border-none"
                      shapeBtn="square"
                      class="sz-28 pd-0"
                      tooltipMessage="Sửa"
                      tooltipPosition="bottom"
                      @click.stop="
                        row.salaryCompositionSystemId
                          ? addToast(
                              'Bạn không có quyền thực hiện chức năng này',
                              'warning',
                            )
                          : handleOpenForm(row.salaryCompositionId)
                      "
                    />
                    <!-- Nút Xóa: hiện toast nếu có salaryCompositionSystemId -->
                    <MsButton
                      iconLeft="mi-trash-red"
                      type="border-none"
                      shapeBtn="square"
                      class="sz-28 pd-0"
                      tooltipMessage="Xóa"
                      tooltipPosition="bottom"
                      @click.stop="
                        row.salaryCompositionSystemId
                          ? addToast(
                              'Bạn không có quyền thực hiện chức năng này',
                              'warning',
                            )
                          : handleDeleteOne(row)
                      "
                    />
                  </div>
                </template>
              </MsTable>
            </div>
          </div>
          <div class="content_body_footer">
            <div class="footer-left">
              <span
                >Tổng số: <b>{{ totalRecords }}</b></span
              >
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
          @apply="handleApplyAdvancedFilter"
          @reset="handleResetAdvancedFilter"
        />
      </div>
    </div>
  </div>

  <SalaryCompositionSystem
    v-if="isShowPopupSystem"
    :isOverlay="true"
    @close="isShowPopupSystem = false"
    @saved="handlePopupSystemSaved"
  />

  <!-- Toast container (nội bộ, khi Req4 toast không qua MainLayout) -->
  <MsToastContainer :toasts="toasts" @close="removeToast" />

  <!-- Alert Confirm Status -->
  <Teleport to="body">
    <MsOverlay v-if="alertStatusConfig.isOpen" class="overlay--alert" @click="closeAlertStatus" />
    <MsAlert
      v-if="alertStatusConfig.isOpen"
      :title="alertStatusConfig.title"
      :message="alertStatusConfig.message"
      :confirmText="alertStatusConfig.confirmText"
      :cancelText="alertStatusConfig.cancelText"
      @close="closeAlertStatus"
      @confirm="confirmUpdateStatus"
    />
  </Teleport>
</template>
<script setup>
import MsButton from "@/components/base/MsButton.vue";
import MsInput from "@/components/base/MsInput.vue";
import MsTable from "@/components/base/MsTable/MsTable.vue";
import FormSalaryComposition from "./FormSalaryComposition.vue";
import MsDropdownMenu from "@/components/base/MsDropdownMenu.vue";
import MsSelect from "@/components/base/MsSelect.vue";
import PopupSettingColumn from "./PopupSettingColumn.vue";
import SalaryCompositionSystem from "../salarycompositionsystems/SalaryCompositionSystem.vue";
import FilterSalaryComposition from "./FilterSalaryComposition.vue";
import MsTreeSelect from "@/components/base/MsTreeSelect/MsTreeSelect.vue";
import MsToastContainer from "@/components/overlay/MsToast/MsToastContainer.vue";
// import MsTooltip from "@/components/base/MsTooltip.vue";
import MsLoader from "@/components/base/MsLoader.vue";
import MsOverlay from "@/components/overlay/MsOverlay.vue";
import MsAlert from "@/components/overlay/MsAlert.vue";
import FormulaCell from "@/components/base/MsFormula/FormulaCell.vue";
import { onMounted, onUnmounted, ref, computed, watch } from "vue";

// ======================== Import services ========================
import salaryCompositionApi from "@/services/salaryCompositionService";
import organizationApi from "@/services/organizationService";
import gridConfigApi from "@/services/gridConfigService";

// ======================== Import enum constants ========================
import {
  SalaryCompositionStatus,
  SalaryCompositionStatusLabel,
  SalaryCompositionNatureLabel,
  SalaryCompositionTypeLabel,
  SalaryCompositionTaxableLabel,
  SalaryCompositionTaxDeductionLabel,
  SalaryCompositionValueTypeLabel,
  SalaryCompositionSourceTypeLabel,
  SalaryCompositionShowPaycheckLabel,
} from "@/constants/enums";

// ======================== UI state ========================
const isOpenFilter = ref(false);
const isOpenPopupSettingColumn = ref(false);
const toggleSelectComposition = ref(false);
const isShowForm = ref(false);
const isShowPopupSystem = ref(false);
const editId = ref(null); // null = thêm mới, string = sửa
const viewId = ref(null); // string = xem chi tiết (readonly)
const duplicateId = ref(null); // string = nhân bản

const togglePopupSettingColumn = () => {
  isOpenPopupSettingColumn.value = !isOpenPopupSettingColumn.value;
};

const openSelectComposition = () => {
  toggleSelectComposition.value = !toggleSelectComposition.value;
};

const openPopupSystem = () => {
  toggleSelectComposition.value = false;
  isShowPopupSystem.value = true;
};

const handleOpenForm = (id) => {
  editId.value = id;
  viewId.value = null;
  duplicateId.value = null;
  isShowForm.value = true;
};

// Task 2: click vào row để mở form xem chi tiết (readonly)
const handleRowClick = (row) => {
  viewId.value = row.salaryCompositionId;
  editId.value = null;
  duplicateId.value = null;
  isShowForm.value = true;
};

const handleDuplicate = (row) => {
  duplicateId.value = row.salaryCompositionId;
  editId.value = null;
  viewId.value = null;
  isShowForm.value = true;
};

const handleCloseFormAndRefresh = () => {
  isShowForm.value = false;
  editId.value = null;
  viewId.value = null;
  duplicateId.value = null;
  fetchSalaryCompositions();
};

/**
 * Khi Lưu (andAdd=false) hoặc Lưu và thêm (andAdd=true):
 * - Nếu thêm mới: unshift data lên đầu mảng ngay (optimistic UX)
 * - Nếu sửa: cập nhật tại chỗ + move lên đầu
 * - Sau đó vẫn gọi fetch để đồng bộ với BE
 */
const handleSavedRefresh = ({ data, isEdit } = {}) => {
  if (data) {
    if (isEdit) {
      // Sửa: cập nhật tại chỗ, rồi move lên đầu
      const idx = salaryCompositions.value.findIndex(
        (r) => r.salaryCompositionId === data.salaryCompositionId,
      );
      if (idx !== -1) {
        salaryCompositions.value.splice(idx, 1);
        salaryCompositions.value.unshift(data);
      } else {
        salaryCompositions.value.unshift(data);
      }
    } else {
      // Thêm mới: unshift lên đầu
      salaryCompositions.value.unshift(data);
      totalRecords.value += 1;
    }
  }
  // Sau đó sync lại với BE để đảm bảo chính xác
  fetchSalaryCompositions();
};

const handlePopupSystemSaved = (count) => {
  if (count > 0) {
    addToast(`Đã thêm ${count} thành phần lương từ hệ thống`, "success");
    fetchSalaryCompositions();
  }
};

const selectedOrgs = ref([]);
const selectedStatus = ref(null); // null = Tất cả
const statusMenuOpen = ref(false);
const searchKeyword = ref("");
const sortField = ref("");
const sortDirection = ref("");
const advancedFilters = ref([]); // Bộ lọc nâng cao từ sidebar
let searchDebounceTimer = null;

const handleApplyAdvancedFilter = (filters) => {
  advancedFilters.value = filters;
  pageIndex.value = 1;
  fetchSalaryCompositions();
};

const handleResetAdvancedFilter = () => {
  advancedFilters.value = [];
  pageIndex.value = 1;
  fetchSalaryCompositions();
};

const statusItems = [
  { label: "Tất cả", value: null },
  { label: "Đang theo dõi", value: SalaryCompositionStatus.Following },
  { label: "Ngừng theo dõi", value: SalaryCompositionStatus.StoppedFollowing },
];

const selectedStatusLabel = computed(
  () =>
    statusItems.find((i) => i.value === selectedStatus.value)?.label ??
    "Tất cả",
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
  Math.max(1, Math.ceil(totalRecords.value / pageSize.value)),
);

const pageStart = computed(() => {
  if (totalRecords.value === 0) return 0;
  return (pageIndex.value - 1) * pageSize.value + 1;
});

const pageEnd = computed(() =>
  Math.min(pageIndex.value * pageSize.value, totalRecords.value),
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

    if (advancedFilters.value && advancedFilters.value.length > 0) {
      params.advancedFilters = JSON.stringify(advancedFilters.value);
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
  loadGridConfig();
});

// ======================== pa_grid_config – Load & Save ========================
const GRID_NAME = "SalaryCompositionGrid";

/**
 * Cache gridConfigId: { columnName -> gridConfigId }
 * Dùng để biết PUT hay POST
 */
const gridConfigIdMap = ref({});

/**
 * Cache full object từ DB: { columnName -> GridConfig }
 * Dùng để giữ lại các field BE quản lý (allowFilter, filterType, columnCaption...)
 * khi build payload PUT, tránh vô tình null hóa các field đó
 */
const gridConfigDataMap = ref({});

/**
 * Load cấu hình cột từ pa_grid_config và áp dụng lên fields.
 * Nếu chưa có records nào trong DB → tự động INSERT tất cả cột (initGridConfig)
 * để đảm bảo các lần save sau chỉ dùng PUT (không bị lỗi POST)
 */
async function loadGridConfig() {
  try {
    const result = await gridConfigApi.getByGridName(GRID_NAME);
    if (!result.isSuccess) return;

    const configs = result.data || [];

    // Tách system cols và non-system cols
    const firstSystemFields = fields.value.filter(
      (f) => f.isSystemCol && f.key === "",
    );
    const lastSystemFields = fields.value.filter(
      (f) => f.isSystemCol && f.key !== "",
    );
    const nonSystemFields = fields.value.filter((f) => !f.isSystemCol);

    // Nếu số lượng cấu hình trả về từ DB ít hơn số lượng cột thực tế (ví dụ: DB chỉ có 1 cột Mã thành phần)
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
    console.warn("[SalaryComposition] loadGridConfig:", err);
  }
}

/**
 * Khi DB thiếu records (ví dụ: mới thêm cột mới vào UI hoặc DB mới có 1 record)
 * → INSERT những cột chưa có trong DB.
 * Sau khi init xong gọi lại loadGridConfig để lấy data chuẩn nhất.
 */
async function initGridConfig(existingConfigs = []) {
  const existingNames = new Set(existingConfigs.map((c) => c.columnName));
  const nonSystemCols = fields.value.filter(
    (f) =>
      !f.isSystemCol &&
      f.key &&
      f.key !== "ghost" &&
      f.key !== "actions" &&
      f.key !== "",
  );

  // Chỉ lấy những cột chưa có trong DB
  const missingCols = nonSystemCols.filter((f) => !existingNames.has(f.key));

  if (missingCols.length > 0) {
    await Promise.all(
      missingCols.map(async (field) => {
        const idx = fields.value.findIndex((f) => f.key === field.key);
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
          console.error(
            `[GridConfig] initGridConfig error for "${field.key}":`,
            err,
          );
        }
      }),
    );

    // Gọi đệ quy load lại data sau khi insert xong
    await loadGridConfig();
  }
}

/** Debounce timer map per columnName */
const _saveTimers = {};

/**
 * Build payload đầy đủ cho một cột (lấy từ fields.value hiện tại + cache DB).
 * Luôn gửi full entity để tránh BE overwrite các field thành null.
 * @param {string} columnName
 * @param {Object} overrides - các field muốn override (VD: { isVisible: false })
 */
function buildPayload(columnName, overrides = {}) {
  const field = fields.value.find((f) => f.key === columnName);
  const idx = fields.value.findIndex((f) => f.key === columnName);
  const cached = gridConfigDataMap.value[columnName] || {};

  const payload = {
    // Fields Grid
    gridName: GRID_NAME,
    columnName,
    columnCaption: field?.label ?? cached.columnCaption ?? "",
    // Trạng thái hiện tại từ fields.value (source of truth)
    columnWidth: field?.width ?? cached.columnWidth ?? 150,
    isVisible: field
      ? field.isSystemCol
        ? true
        : field.isVisible !== false
      : (cached.isVisible ?? true),
    pinnedPosition: field?.pinned ?? cached.pinnedPosition ?? null,
    displayOrder: idx !== -1 ? idx : (cached.displayOrder ?? 0),
    // Fields không quản lý qua UI, giữ nguyên từ cache DB
    allowFilter: cached.allowFilter ?? null,
    filterType: cached.filterType ?? null,
    // Override cuối cùng (đảm bảo giá trị mới nhất được áp dụng)
    ...overrides,
  };

  if (gridConfigIdMap.value[columnName]) {
    payload.gridConfigId = gridConfigIdMap.value[columnName];
  }

  return payload;
}

/**
 * Lưu cấu hình một cột lên BE (debounced 600ms)
 * Luôn gửi full payload để tránh PUT overwrite field thành null
 */
function saveColumnConfig(columnName, overrides = {}) {
  if (
    !columnName ||
    columnName === "ghost" ||
    columnName === "actions" ||
    columnName === ""
  )
    return;

  clearTimeout(_saveTimers[columnName]);
  _saveTimers[columnName] = setTimeout(async () => {
    try {
      const payload = buildPayload(columnName, overrides);
      const result = await gridConfigApi.upsertColumn(payload);

      if (result.isSuccess && result.data) {
        // Cập nhật cả 2 cache sau khi lưu thành công
        gridConfigIdMap.value[columnName] = result.data.gridConfigId;
        gridConfigDataMap.value[columnName] = result.data;
      }
    } catch (err) {
      console.warn("[SalaryComposition] saveColumnConfig:", err);
    }
  }, 600);
}

/**
 * Xử lý khi resize cột:
 * 1. Cập nhật width trong fields.value ngay (source of truth)
 * 2. Sau đó save lên BE với payload đầy đủ (bao gồm width mới)
 */
const handleColumnResize = ({ field, width }) => {
  const target = fields.value.find((f) => f.key === field.key);
  if (target) target.width = width;
  // Pass columnWidth override rõ ràng để đảm bảo payload dùng đúng width mới
  saveColumnConfig(field.key, { columnWidth: width });
};

// ======================== Xóa một bản ghi ========================
function handleDeleteOne(row) {
  const { salaryCompositionId: id, salaryCompositionName } = row;
  emit("openAlert", {
    title: "Thông báo",
    confirmText: "Xóa",
    confirmType: "danger",
    message: `Bạn có chắc chắn muốn xóa thành phần lương <strong>${salaryCompositionName}</strong> không?`,
    onConfirm: async () => {
      try {
        const result = await salaryCompositionApi.deleteById(id);
        if (result.isSuccess) {
          selectedIds.value = selectedIds.value.filter((sid) => sid !== id);
          await fetchSalaryCompositions();
          addToast("Xóa thành công", "success");
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

function handleDeleteFromForm(row) {
  const { salaryCompositionId: id, salaryCompositionName } = row;
  emit("openAlert", {
    title: "Thông báo",
    message: `Bạn có chắc chắn muốn xóa thành phần lương <strong>${salaryCompositionName}</strong> không?`,
    confirmText: "Xóa",
    confirmType: "danger",
    onConfirm: async () => {
      try {
        const result = await salaryCompositionApi.deleteById(id);
        if (result.isSuccess) {
          selectedIds.value = selectedIds.value.filter((sid) => sid !== id);
          addToast("Xóa thành công", "success");
          handleCloseFormAndRefresh();
        } else {
          addToast(result.data || "Xóa thất bại", "error");
        }
      } catch (err) {
        console.error("[SalaryComposition] deleteFromForm:", err);
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
    const row = salaryCompositions.value.find(
      (r) => r.salaryCompositionId === id,
    );
    return !row?.salaryCompositionSystemId;
  });
  const blockedCount = selectedIds.value.length - deletableIds.length;

  if (deletableIds.length === 0) {
    emit("openAlert", {
      title: "Không thể xóa",
      message:
        "Tất cả các thành phần lương đã chọn đều từ danh mục hệ thống và không thể xóa.",
      showConfirmButton: false,
      cancelText: "Đóng",
    });
    return;
  }

  const blockedNote =
    blockedCount > 0 ? ` (${blockedCount} mục từ hệ thống sẽ được bỏ qua)` : "";

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
          addToast(
            `Đã xóa ${deletableIds.length} thành phần lương thành công`,
            "success",
          );
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

// ======================== Toggle trạng thái theo dõi ========================
async function handleToggleStatus(row) {
  if (row.salaryCompositionSystemId) {
    addToast("Không thể thay đổi trạng thái của dữ liệu hệ thống", "warning");
    return;
  }
  const newStatus =
    row.status === SalaryCompositionStatus.Following
      ? SalaryCompositionStatus.StoppedFollowing
      : SalaryCompositionStatus.Following;
  const statusLabel = newStatus === SalaryCompositionStatus.Following ? "đang theo dõi" : "ngừng theo dõi";

  alertStatusConfig.value = {
    isOpen: true,
    title: "Chuyển trạng thái",
    message: `Bạn có chắc chắn muốn chuyển trạng thái thành phần lương <strong>${row.salaryCompositionName}</strong> sang ${statusLabel} không?`,
    confirmText: "Đồng ý",
    cancelText: "Không",
    pendingIds: [row.salaryCompositionId],
    pendingStatus: newStatus,
  };
}

// Task 4: Cập nhật trạng thái nhiều bản ghi
async function handleBulkUpdateStatus(status) {
  if (selectedIds.value.length === 0) return;

  // Req: Không cho phép cập nhật trạng thái của data hệ thống
  const updatableIds = selectedIds.value.filter((id) => {
    const row = salaryCompositions.value.find(
      (r) => r.salaryCompositionId === id,
    );
    return !row?.salaryCompositionSystemId;
  });

  if (updatableIds.length === 0) {
    addToast("Không thể thay đổi trạng thái của dữ liệu hệ thống", "warning");
    return;
  }

  const statusLabel = status === SalaryCompositionStatus.Following ? "đang theo dõi" : "ngừng theo dõi";
  alertStatusConfig.value = {
    isOpen: true,
    title: "Chuyển trạng thái",
    message: `Bạn có chắc chắn muốn chuyển trạng thái các thành phần lương đã chọn sang ${statusLabel} không?`,
    confirmText: "Đồng ý",
    cancelText: "Không",
    pendingIds: updatableIds,
    pendingStatus: status,
  };
}

const alertStatusConfig = ref({
  isOpen: false,
  title: "Thông báo",
  message: "",
  confirmText: "Đồng ý",
  cancelText: "Không",
  pendingIds: [],
  pendingStatus: null,
});

const closeAlertStatus = () => {
  alertStatusConfig.value.isOpen = false;
};

const confirmUpdateStatus = () => {
  executeUpdateStatus(alertStatusConfig.value.pendingIds, alertStatusConfig.value.pendingStatus);
  closeAlertStatus();
};

const executeUpdateStatus = async (updatableIds, status) => {
  try {
    const result = await salaryCompositionApi.updateStatusBulk(
      updatableIds,
      status,
    );
    if (result.isSuccess) {
      selectedIds.value = [];
      await fetchSalaryCompositions();
      const label =
        status === SalaryCompositionStatus.Following
          ? "đang theo dõi"
          : "ngừng theo dõi";
      addToast(`Cập nhật trạng thái thành công (${label})`, "success");
    } else {
      addToast(result.data || "Cập nhật trạng thái thất bại", "error");
    }
  } catch (err) {
    console.error("[SalaryComposition] executeUpdateStatus:", err);
    addToast("Có lỗi xảy ra khi cập nhật trạng thái", "error");
  }
}

// ======================== Checkbox selection ========================
const selectedIds = ref([]);

const isAllSelected = computed(
  () =>
    salaryCompositions.value.length > 0 &&
    selectedIds.value.length === salaryCompositions.value.length,
);

const isIndeterminate = computed(() => {
  return (
    selectedIds.value.length > 0 &&
    selectedIds.value.length < salaryCompositions.value.length
  );
});

const hasActiveSelected = computed(() => {
  return selectedIds.value.some((id) => {
    const item = salaryCompositions.value.find(
      (s) => s.salaryCompositionId === id,
    );
    return (
      item &&
      !item.salaryCompositionSystemId &&
      item.status === SalaryCompositionStatus.Following
    );
  });
});

const hasInactiveSelected = computed(() => {
  return selectedIds.value.some((id) => {
    const item = salaryCompositions.value.find(
      (s) => s.salaryCompositionId === id,
    );
    return (
      item &&
      !item.salaryCompositionSystemId &&
      item.status === SalaryCompositionStatus.StoppedFollowing
    );
  });
});

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    selectedIds.value = salaryCompositions.value.map(
      (row) => row.salaryCompositionId,
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
  toasts.value.push({
    id: Date.now() + Math.random(),
    message,
    type,
    duration,
  });
};
const removeToast = (id) => {
  toasts.value = toasts.value.filter((t) => t.id !== id);
};

// ======================== Table fields ========================
// Danh sách cột mặc định (nguồn gốc, dùng để reset)
const DEFAULT_FIELDS = [
  {
    key: "",
    label: "",
    slot: "checkbox",
    width: 48,
    draggable: false,
    pinnable: false,
    resizable: false,
    isSystemCol: true, // cột hệ thống, không được ẩn/hiện
  },
  {
    key: "salaryCompositionCode",
    label: "Mã thành phần",
    width: 180,
    isVisible: true,
  },
  {
    key: "salaryCompositionName",
    label: "Tên thành phần",
    width: 220,
    isVisible: true,
  },
  {
    key: "organizationName",
    label: "Đơn vị áp dụng",
    width: 200,
    isVisible: true,
  },
  {
    key: "compositionType",
    label: "Loại thành phần",
    slot: "compositionType",
    width: 180,
    isVisible: true,
  },
  {
    key: "compositionNature",
    label: "Tính chất",
    slot: "compositionNature",
    width: 160,
    isVisible: true,
  },
  {
    key: "taxable",
    label: "Chịu thuế",
    slot: "taxable",
    width: 160,
    isVisible: true,
  },
  {
    key: "taxDeduction",
    label: "Giảm trừ khi tính thuế",
    slot: "taxDeduction",
    width: 210,
    isVisible: true,
  },
  { key: "quota", label: "Định mức", width: 140, isVisible: true },
  {
    key: "valueType",
    label: "Kiểu giá trị",
    slot: "valueType",
    width: 160,
    isVisible: true,
  },
  { key: "formula", label: "Giá trị", width: 160, isVisible: true },
  { key: "description", label: "Mô tả", width: 240, isVisible: true },
  {
    key: "optionShowPaycheck",
    label: "Hiển thị trên phiếu lương",
    slot: "optionShowPaycheck",
    width: 230,
    isVisible: true,
  },
  {
    key: "sourceType",
    label: "Nguồn tạo",
    slot: "sourceType",
    width: 150,
    isVisible: true,
  },
  {
    key: "status",
    label: "Trạng thái",
    slot: "status",
    width: 160,
    isVisible: true,
  },
  { key: "ghost", label: "", width: 180, isSystemCol: true },
  {
    key: "actions",
    label: "",
    slot: "actions",
    width: 1,
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
  DEFAULT_FIELDS.filter((f) => !f.isSystemCol),
);
const configurableFields = computed(() =>
  fields.value.filter((f) => !f.isSystemCol),
);

// Tất cả cột visible (bao gồm cột hệ thống) – truyền vào MsTable
const visibleFields = computed(() =>
  fields.value.filter((f) => f.isSystemCol || f.isVisible !== false),
);

// Cập nhật fields khi MsTable emit update:fields (kéo thả, ghim)
const handleTableFieldsUpdate = (updatedFields) => {
  // MsTable chỉ biết visibleFields, cần merge lại với các cột ẩn
  const hiddenFields = fields.value.filter(
    (f) => !f.isSystemCol && f.isVisible === false,
  );
  // Rebuild fields: giữ thứ tự từ MsTable + append các cột ẩn
  fields.value = [...updatedFields, ...hiddenFields];

  // Lưu displayOrder và pinnedPosition lên BE với explicit overrides
  // để đảm bảo giá trị mới nhất (pinned, order) được ghi đúng lên DB
  fields.value.forEach((field, idx) => {
    if (!field.isSystemCol) {
      saveColumnConfig(field.key, {
        pinnedPosition: field.pinned ?? null,
        displayOrder: idx,
      });
    }
  });
};

// Lưu cấu hình cột từ PopupSettingColumn
// Dùng async/await trực tiếp (không qua debounce) để đảm bảo toàn bộ cấu hình được lưu
const handleSaveColumnSettings = async (configurableSaved) => {
  // Tách các cột system để giữ vị trí
  const firstSystemFields = fields.value.filter(
    (f) => f.isSystemCol && f.key === "",
  );
  const lastSystemFields = fields.value.filter(
    (f) => f.isSystemCol && f.key !== "",
  );

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
  // (debounce có thể bị clearTimeout bởi các sự kiện khác như handleTableFieldsUpdate)
  const savableCols = configurableSaved.filter(
    (f) => f.key && f.key !== "ghost" && f.key !== "actions" && f.key !== "",
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
          console.error(
            `[GridConfig] Save non-success for "${f.key}":`,
            result,
          );
        }
      } catch (err) {
        console.error(`[GridConfig] Save error for "${f.key}":`, err);
      }
    }),
  );
};
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
  transition:
    opacity 0.15s ease,
    background-color 0.15s ease;
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

.btn-add-menu {
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
  height: 32px;
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

:deep(.ms-multiselect.multiselect) {
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

.status-badge--inactive-border{
  color: #f90 !important;
  border: 1px solid #FF9900 !important;
  border-radius: 8px;
}

.status-badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.btn-status-badge {
  cursor: pointer;
  outline: none;
  font-family: inherit;
  transition:
    opacity 0.2s,
    background-color 0.2s;
  height: 32px;
  padding: 0 12px;
}
.btn-status-badge:hover {
  opacity: 0.8;
}

/* Đang theo dõi - xanh lá */
.status-badge--active {
  color: #16a34a;
  background-color: #f0fdf4;
  border-color: #86efac;
}

.status-badge--active-border{
  color: #34b057 !important;
  border: 1px solid #34b057;
  border-radius: 8px;
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

.content_body_filters {
  display: flex;
}

@media screen and (max-width: 1280px) {
  .content_body_search {
    width: 200px;
  }
  :deep(.ms-tree-select__control) {
    width: 250px;
  }
}

@media screen and (max-width: 1081px) {
  .content_body_search {
    width: 150px;
  }
  :deep(.ms-tree-select__control) {
    width: 200px;
  }
}
</style>
