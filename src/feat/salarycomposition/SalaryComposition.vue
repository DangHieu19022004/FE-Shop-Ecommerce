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
                              'error',
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
                              'error',
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
    @openAlert="$emit('openAlert', $event)"
  />

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
import SalaryCompositionSystem from "../salarycompositionsystems/SalaryCompositionSystem.vue";
import FilterSalaryComposition from "./FilterSalaryComposition.vue";
import MsTreeSelect from "@/components/base/MsTreeSelect/MsTreeSelect.vue";
import MsToastContainer from "@/components/overlay/MsToast/MsToastContainer.vue";
import MsLoader from "@/components/base/MsLoader.vue";
import MsOverlay from "@/components/overlay/MsOverlay.vue";
import MsAlert from "@/components/overlay/MsAlert.vue";
import FormulaCell from "@/components/base/MsFormula/FormulaCell.vue";
import { onMounted, onUnmounted, ref, computed, watch } from "vue";
import salaryCompositionApi from "@/services/salaryCompositionService";
import organizationApi from "@/services/organizationService";
import gridConfigApi from "@/services/gridConfigService";
import { LocalStorageStore } from "@/stores/localStorageStore";
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


// VARIABLE:
// trạng thái đóng/mở filter sidebar
const isOpenFilter = ref(false);
// trạng thái đóng/mở popup thiết lập cột
const isOpenPopupSettingColumn = ref(false);
// trạng thái đóng/mở dropdown chọn thêm thành phần lương từ hệ thống
const toggleSelectComposition = ref(false);
// trạng thái đóng/mở form thêm/sửa thành phần lương
const isShowForm = ref(false);
// trạng thái đóng/mở popup chọn thành phần lương từ hệ thống
const isShowPopupSystem = ref(false);
// id của thành phần lương đang sửa hoặc xem (null = thêm mới)
const editId = ref(null); // null = thêm mới, string = sửa
const viewId = ref(null); // string = xem chi tiết (readonly)
// id của thành phần lương đang nhân bản (null = không nhân bản)
const duplicateId = ref(null); // string = nhân bản


//FUNCTION:
/**
 * Toggle trạng thái popup thiết lập cột
 *
 * Sử dụng khi: Người dùng click vào icon thiết lập cột
 *
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const togglePopupSettingColumn = () => {
  isOpenPopupSettingColumn.value = !isOpenPopupSettingColumn.value;
};

/**
 * Mở dropdown chọn thêm thành phần lương từ hệ thống
 *
 * Sử dụng khi: Người dùng click vào icon dropdown cạnh nút Thêm
 *
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const openSelectComposition = () => {
  toggleSelectComposition.value = !toggleSelectComposition.value;
};

/**
 * Mở popup chọn thành phần lương từ hệ thống
 *
 * Sử dụng khi: Người dùng click vào nút Chọn từ danh mục của hệ thống
 *
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const openPopupSystem = () => {
  toggleSelectComposition.value = false;
  isShowPopupSystem.value = true;
};

/**
 * Mở form thêm/sửa thành phần lương
 *
 * Sử dụng khi: Người dùng click nút Thêm hoặc icon Sửa trên từng dòng
 *
 * @param {string|null} id ID của thành phần lương cần sửa (null nếu thêm mới)
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const handleOpenForm = (id) => {
  editId.value = id;
  viewId.value = null;
  duplicateId.value = null;
  isShowForm.value = true;
};

/**
 * Mở form xem chi tiết thành phần lương (readonly)
 *
 * Sử dụng khi: Người dùng click vào một dòng trong bảng (Task 2)
 *
 * @param {Object} row Dữ liệu của dòng được click
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const handleRowClick = (row) => {
  viewId.value = row.salaryCompositionId;
  editId.value = null;
  duplicateId.value = null;
  isShowForm.value = true;
};

/**
 * Mở form nhân bản thành phần lương
 *
 * Sử dụng khi: Người dùng click icon Nhân bản trên một dòng
 *
 * @param {Object} row Dữ liệu của dòng cần nhân bản
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const handleDuplicate = (row) => {
  duplicateId.value = row.salaryCompositionId;
  editId.value = null;
  viewId.value = null;
  isShowForm.value = true;
};

/**
 * Đóng form và làm mới danh sách dữ liệu
 *
 * Sử dụng khi: Người dùng click Hủy hoặc đóng form
 *
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const handleCloseFormAndRefresh = () => {
  isShowForm.value = false;
  editId.value = null;
  viewId.value = null;
  duplicateId.value = null;
  // Sau khi đóng form, gọi API để làm mới dữ liệu, đảm bảo chính xác nhất
  fetchSalaryCompositions();
};

/**
 * Cập nhật danh sách sau khi lưu từ form
 *
 * Sử dụng khi: Form emit sự kiện saved
 *
 * @param {Object} payload Dữ liệu trả về từ form chứa data và isEdit
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const handleSavedRefresh = ({ data, isEdit, showToast } = {}) => {
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

      if (showToast) {
        addToast("Cập nhật thành công", "success");
      }
    } else {
      // Thêm mới: unshift lên đầu
      salaryCompositions.value.unshift(data);
      totalRecords.value += 1;

      if (showToast) {
        addToast("Thêm thành công", "success");
      }
    }
  }
  // Sau đó sync lại với BE để đảm bảo chính xác
  fetchSalaryCompositions();
};

/**
 * Làm mới danh sách sau khi thêm từ hệ thống
 *
 * Sử dụng khi: Popup hệ thống emit sự kiện saved
 *
 * @param {number} count Số lượng bản ghi đã thêm
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const handlePopupSystemSaved = (count) => {
  if (count > 0) {
    addToast(`Thêm thành công`, "success");
    fetchSalaryCompositions();
  }
};

// VARIABLE:
// danh sách id đơn vị được chọn trong filter
const selectedOrgs = ref([]);
// trạng thái lọc (null = Tất cả, 1 = Đang theo dõi, 2 = Ngừng theo dõi)
const selectedStatus = ref(null); // null = Tất cả
// trạng thái đóng/mở dropdown chọn trạng thái
const statusMenuOpen = ref(false);
// từ khóa tìm kiếm
const searchKeyword = ref("");
// trường đang được sắp xếp
const sortField = ref("");
// chiều sắp xếp (asc/desc)
const sortDirection = ref("");
// danh sách bộ lọc nâng cao từ filter sidebar
const advancedFilters = ref([]); // Bộ lọc nâng cao từ sidebar
// timer cho debounce khi gõ tìm kiếm
let searchDebounceTimer = null;
// options cho dropdown trạng thái
const statusItems = [
  { label: "Tất cả", value: null },
  { label: "Đang theo dõi", value: SalaryCompositionStatus.Following },
  { label: "Ngừng theo dõi", value: SalaryCompositionStatus.StoppedFollowing },
];
// Các trường có thể cấu hình hiển thị trên bảng
const pageIndex = ref(1);
const pageSize = ref(15);
const totalRecords = ref(0);
const pageSizeOptions = [
  { label: "15", value: 15 },
  { label: "25", value: 25 },
  { label: "50", value: 50 },
  { label: "100", value: 100 },
];
// danh sách thành phần lương hiển thị trên bảng
const salaryCompositions = ref([]);
// trạng thái đang tải dữ liệu bảng
const isLoading = ref(false);
// thông báo lỗi khi lấy dữ liệu bảng
const errorMessage = ref("");
// dữ liệu cây đơn vị cho TreeSelect
const orgTreeData = ref([]);
// Biến localstorage để lưu cấu hình cột của grid vào trình duyệt mỗi người dùng
const GRID_NAME = LocalStorageStore.GRID_SALARY_COMPOSITION;
/** Debounce timer map per columnName */
const _saveTimers = {};


// NOTICE: Computed này dùng để hiển thị label của trạng thái đã chọn trên dropdown, tránh việc hiển thị raw value (vd: 1, 2
const selectedStatusLabel = computed(
  () =>
    statusItems.find((i) => i.value === selectedStatus.value)?.label ??
    "Tất cả",
);

// FUNCTION:
/**
 * Áp dụng bộ lọc nâng cao và tải lại dữ liệu
 *
 * Sử dụng khi: Người dùng nhấn Áp dụng trong filter sidebar
 *
 * @param {Array} filters Mảng các điều kiện lọc
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const handleApplyAdvancedFilter = (filters) => {
  advancedFilters.value = filters;
  pageIndex.value = 1;
  fetchSalaryCompositions();
};

/**
 * Bỏ lọc nâng cao và tải lại dữ liệu
 *
 * Sử dụng khi: Người dùng nhấn Đặt lại trong filter sidebar
 *
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const handleResetAdvancedFilter = () => {
  advancedFilters.value = [];
  pageIndex.value = 1;
  fetchSalaryCompositions();
};

/**
 * Thay đổi lọc trạng thái
 *
 * Sử dụng khi: Người dùng chọn một trạng thái trong dropdown
 *
 * @param {Object} item Mục trạng thái được chọn
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const handleStatusChange = (item) => {
  // item.value có thể là null (Tất cả), 1 (Đang theo dõi) hoặc 2 (Ngừng theo dõi)
  selectedStatus.value = item?.value ?? null;
  statusMenuOpen.value = false;
  pageIndex.value = 1;
  // Khi thay đổi trạng thái, gọi API để lấy lại dữ liệu đã được filter theo trạng thái mới
  fetchSalaryCompositions();
};

/**
 * Thay đổi lọc đơn vị
 *
 * Sử dụng khi: Người dùng chọn/bỏ chọn đơn vị trong TreeSelect
 *
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const handleOrgChange = () => {
  // Khi thay đổi đơn vị, gọi API để lấy lại dữ liệu đã được filter theo đơn vị mới
  pageIndex.value = 1;
  fetchSalaryCompositions();
};

/**
 * Tìm kiếm theo từ khóa có debounce
 *
 * Sử dụng khi: Người dùng gõ vào ô tìm kiếm
 *
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const handleSearchInput = () => {
  // Xóa timer cũ nếu người dùng gõ tiếp trước khi debounce kết thúc
  clearTimeout(searchDebounceTimer);
  // Đặt lại timer mới
  searchDebounceTimer = setTimeout(() => {
    pageIndex.value = 1;
    fetchSalaryCompositions();
  }, 500);
};

/**
 * Chuyển đổi chuỗi sang định dạng snake_case
 *
 * Sử dụng khi: Cần chuyển đổi tên trường (vd: columnName) để gửi lên API sắp xếp
 *
 * @param {string} value Chuỗi cần chuyển đổi
 * @returns {string} Chuỗi sau khi chuyển sang snake_case
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const toSnakeCase = (value) =>
  value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

/**
 * Xử lý khi thay đổi sắp xếp trên bảng
 *
 * Sử dụng khi: Người dùng click vào tiêu đề cột để sắp xếp
 * Là sự kiện để sort giảm dần tăng dần ở MsMenuTable
 *
 * @param {Object} payload Chứa field và direction (asc/desc)
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const handleSortChange = ({ field, direction }) => {
  sortField.value = field;
  sortDirection.value = direction;
  pageIndex.value = 1;
  fetchSalaryCompositions();
};

// NOTICE: Các computed này dùng để hiển thị thông tin phân trang ở footer, giúp người dùng biết đang xem bản ghi nào trên tổng số bao nhiêu bản ghi, và tổng số trang là bao nhiêu
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

//FUNCTION:
/**
 * Chuyển đến trang cụ thể
 *
 * Sử dụng khi: Người dùng click các nút phân trang (Next, Prev, First, Last)
 *
 * @param {number} page Số trang cần chuyển đến
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  pageIndex.value = page;
  fetchSalaryCompositions();
};

/**
 * Thay đổi số bản ghi trên một trang
 *
 * Sử dụng khi: Người dùng chọn lại pageSize trong dropdown
 *
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const handlePageSizeChange = () => {
  pageIndex.value = 1;
  fetchSalaryCompositions();
};

/**
 * Gọi API lấy danh sách thành phần lương có phân trang
 *
 * Sử dụng khi: Component mounted, hoặc khi thay đổi trang, lọc, sắp xếp, tìm kiếm
 *
 * @returns {Promise<void>}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
async function fetchSalaryCompositions() {
  // Khi bắt đầu gọi API, đặt trạng thái loading và xóa lỗi cũ
  isLoading.value = true;
  errorMessage.value = "";

  try {
    // Xây dựng params cho API dựa trên các trạng thái hiện tại: phân trang, tìm kiếm, lọc, sắp xếp
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

    // Sắp xếp: gửi theo format "column_name ASC/DESC"
    if (sortField.value && sortDirection.value) {
      params.sort = `${toSnakeCase(sortField.value)} ${sortDirection.value.toUpperCase()}`;
    }

    // Bộ lọc nâng cao: gửi dưới dạng JSON nếu có
    if (advancedFilters.value && advancedFilters.value.length > 0) {
      params.advancedFilters = JSON.stringify(advancedFilters.value);
    }

    // Gọi API với params đã xây dựng
    const result = await salaryCompositionApi.getPaging(params);

    // Xử lý kết quả trả về: nếu thành công thì cập nhật danh sách và tổng số bản ghi, nếu lỗi thì hiển thị thông báo lỗi
    if (result.isSuccess && result.data) {
      // Cập nhật danh sách thành phần lương và tổng số bản ghi từ kết quả trả về
      salaryCompositions.value = result.data.data ?? [];
      totalRecords.value = result.data.total ?? 0;
    } else {
      // Nếu API trả về lỗi (isSuccess = false), hiển thị thông báo lỗi từ server hoặc mặc định
      errorMessage.value = result.data || "Có lỗi xảy ra, vui lòng liên hệ với MISA!";
    }
  } catch (err) {
    errorMessage.value = err.message || "Có lỗi xảy ra, vui lòng liên hệ với MISA!";
    console.error("[SalaryComposition] fetchSalaryCompositions:", err);
  } finally {
    isLoading.value = false;
  }
}

/**
 * Gọi API lấy cây đơn vị cho TreeSelect
 *
 * Sử dụng khi: Component mounted để khởi tạo dữ liệu cho bộ lọc
 *
 * @returns {Promise<void>}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
async function fetchOrgTree() {
  try {
    // Gọi API để lấy dữ liệu cây tổ chức
    const result = await organizationApi.getTree();
    // Nếu thành công và có dữ liệu, map lại format cho TreeSelect
    if (result.isSuccess && result.data) {
      orgTreeData.value = mapOrgTree(result.data);
    }
  } catch (err) {
    errorMessage.value = err.message || "Có lỗi xảy ra, vui lòng liên hệ với MISA!";
    console.error("[SalaryComposition] fetchOrgTree:", err);
  }
}

/**
 * Map cây tổ chức từ API sang format cho MsTreeSelect
 *
 * Sử dụng khi: Nhận được dữ liệu cây đơn vị từ API
 *
 * @param {Array} nodes Danh sách node từ API
 * @returns {Array} Danh sách node đã được format
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function mapOrgTree(nodes) {
  // Đệ quy để map từng node và con của nó sang format { id, label, children }
  return nodes.map((node) => ({
    id: node.organizationId,
    label: node.organizationName,
    children: node.children ? mapOrgTree(node.children) : [],
  }));
}

// NOTICE: OnMounted - Gọi API ngay khi component được mount
onMounted(() => {
  fetchSalaryCompositions();
  fetchOrgTree();
  loadGridConfig();

  // Kiểm tra xem có toast nào đang chờ hiển thị từ trang khác chuyển sang không
  const pendingToast = localStorage.getItem('pendingToast');
  if (pendingToast) {
    try {
      const toastData = JSON.parse(pendingToast);
      addToast(toastData.message, toastData.type);
    } catch (e) {
      console.error("Parse pending toast error:", e);
    }
    localStorage.removeItem('pendingToast');
  }
});


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
 * Load cấu hình cột từ API và áp dụng lên bảng
 *
 * Sử dụng khi: Component mounted
 *
 * @returns {Promise<void>}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
async function loadGridConfig() {
  try {
    // Gọi API lấy cấu hình cột theo gridName: salary_composition_id
    const result = await gridConfigApi.getByGridName(GRID_NAME);
    if (!result.isSuccess) return;

    // Lấy data trả về, nếu không có thì mặc định là mảng rỗng
    const configs = result.data || [];

    // Tách system cols và non-system cols
    // System cols: key = "" (checkbox), key = "ghost", key = "actions"S
    const firstSystemFields = fields.value.filter(
      (f) => f.isSystemCol && f.key === "",
    );
    const lastSystemFields = fields.value.filter(
      (f) => f.isSystemCol && f.key !== "",
    );
    // Non-system cols là những cột thực tế có key và không phải là cột hệ thống
    const nonSystemFields = fields.value.filter((f) => !f.isSystemCol);

    // Nếu số lượng cấu hình trả về từ DB ít hơn số lượng cột thực tế (ví dụ: DB chỉ có 1 cột Mã thành phần)
    // thì gọi initGridConfig để tự động bổ sung các cột còn thiếu.
    if (configs.length < nonSystemFields.length) {
      await initGridConfig(configs);
      return;
    }

    // Build 2 map để dễ lookup khi áp dụng config và khi build payload
    const idMap = {};
    const dataMap = {};
    // Duyệt qua configs từ DB, map columnName → gridConfigId và columnName → full config object
    configs.forEach((cfg) => {
      idMap[cfg.columnName] = cfg.gridConfigId;
      dataMap[cfg.columnName] = cfg;
    });
    // Lưu vào ref để các function khác có thể sử dụng khi cần (vd: buildPayload)
    gridConfigIdMap.value = idMap;
    gridConfigDataMap.value = dataMap;

    // Sắp xếp non-system cols theo displayOrder từ DB và áp dụng config
    const orderedNonSystem = nonSystemFields
      .map((field) => {
        // Duyệt qua từng cột, nếu có config trong DB thì áp dụng các thuộc tính width, isVisible, pinned
        const cfg = dataMap[field.key];
        // Nếu không có config, giữ nguyên như mặc định trong fields
        if (!cfg) return field;
        // Nếu có config, áp dụng các thuộc tính: width, isVisible, pinned
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
 * Khởi tạo cấu hình cột mặc định nếu chưa có
 *
 * Sử dụng khi: loadGridConfig phát hiện thiếu cấu hình trong DB
 *
 * @param {Array} existingConfigs Danh sách cấu hình hiện có
 * @returns {Promise<void>}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
async function initGridConfig(existingConfigs = []) {
  // Tạo một Set chứa tên cột đã có trong DB để dễ dàng kiểm tra
  const existingNames = new Set(existingConfigs.map((c) => c.columnName));
  // Lọc ra các cột thực tế (non-system) cần kiểm tra, bỏ qua các cột đặc biệt như ghost, actions, và cột không có key
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

  // Nếu có cột nào thiếu, gọi API để insert cấu hình mặc định cho những cột đó
  if (missingCols.length > 0) {
    await Promise.all(
      missingCols.map(async (field) => {
        // Build payload mặc định cho cột này, có thể tùy chỉnh lại nếu muốn
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
          // Gọi API để insert cấu hình cột mới vào DB
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


/**
 * Tạo payload đầy đủ để gửi lên API khi lưu cấu hình cột
 *
 * Sử dụng khi: Cần lưu lại cấu hình của một cột
 *
 * @param {string} columnName Tên cột
 * @param {Object} overrides Các giá trị muốn ghi đè
 * @returns {Object} Payload để gửi API
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function buildPayload(columnName, overrides = {}) {
  // Tìm cột tương ứng trong fields hiện tại
  const field = fields.value.find((f) => f.key === columnName);
  // Tìm index của cột trong fields để xác định displayOrder
  const idx = fields.value.findIndex((f) => f.key === columnName);
  // Lấy cấu hình đã lưu trong DB nếu có, để giữ lại các giá trị mà BE quản lý (vd: allowFilter, filterType)
  const cached = gridConfigDataMap.value[columnName] || {};

  // Build payload với các giá trị được ưu tiên: overrides > fields hiện tại > cache DB > mặc định
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

  // Nếu đã có gridConfigId trong cache, nghĩa là đã từng lưu trước đó, thì gửi kèm để API biết là update (PUT),
  // nếu không có thì API sẽ hiểu là insert (POST)
  if (gridConfigIdMap.value[columnName]) {
    payload.gridConfigId = gridConfigIdMap.value[columnName];
  }

  return payload;
}

/**
 * Lưu cấu hình một cột (có debounce)
 *
 * Sử dụng khi: Resize cột, kéo thả cột, ẩn hiện cột
 *
 * @param {string} columnName Tên cột
 * @param {Object} overrides Các giá trị ghi đè
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function saveColumnConfig(columnName, overrides = {}) {
  // Bỏ qua các cột đặc biệt không cần lưu cấu hình
  if (
    !columnName ||
    columnName === "ghost" ||
    columnName === "actions" ||
    columnName === ""
  )
    return;
  // Clear debounce timer cũ nếu có
  clearTimeout(_saveTimers[columnName]);
  // Đặt timer mới để thực hiện lưu sau 600ms, nếu trong thời gian đó có thay đổi tiếp thì sẽ reset timer, tránh gọi API quá nhiều lần
  _saveTimers[columnName] = setTimeout(async () => {
    try {
      // Build payload đầy đủ dựa trên state hiện tại của fields và cache DB, cộng với các giá trị override cụ thể cho lần lưu này
      const payload = buildPayload(columnName, overrides);
      // Gọi API để lưu cấu hình cột, nếu có gridConfigId sẽ là update, nếu không sẽ là insert
      const result = await gridConfigApi.upsertColumn(payload);
      // Nếu lưu thành công, cập nhật lại cache với gridConfigId mới (nếu là insert) và data mới
      if (result.isSuccess && result.data) {
        // Cập nhật cả 2 cache sau khi lưu thành công
        gridConfigIdMap.value[columnName] = result.data.gridConfigId;
        gridConfigDataMap.value[columnName] = result.data;
      }
    } catch (err) {
      console.warn("[SalaryComposition] saveColumnConfig:", err);
    }
  }, 500);
}

/**
 * Xử lý khi người dùng resize kích thước cột
 *
 * Sử dụng khi: Resize xong một cột trên bảng
 *
 * @param {Object} payload Chứa field và width mới
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const handleColumnResize = ({ field, width }) => {
  // tìm ra cột tương ứng trong fields để cập nhật width mới ngay lập tức trên UI
  const target = fields.value.find((f) => f.key === field.key);
  if (target) target.width = width;
  // Gọi hàm lưu cấu hình cột với giá trị width mới, các giá trị khác sẽ được lấy từ state hiện tại và cache DB trong hàm buildPayload
  saveColumnConfig(field.key, { columnWidth: width });
};

/**
 * Xử lý xóa một bản ghi
 *
 * Sử dụng khi: Người dùng click icon Xóa trên một dòng
 *
 * @param {Object} row Dữ liệu của dòng cần xóa
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function handleDeleteOne(row) {
  const { salaryCompositionId: id, salaryCompositionName } = row;
  // Hiển thị popup xác nhận trước khi xóa
  // emit lên component cha để mở Alert
  emit("openAlert", {
    title: "Thông báo",
    confirmText: "Xóa",
    confirmType: "danger",
    message: `Bạn có chắc chắn muốn xóa thành phần lương <strong>${salaryCompositionName}</strong> không?`,
    onConfirm: async () => {
      try {
        // Gọi API để xóa bản ghi theo id
        const result = await salaryCompositionApi.deleteById(id);
        if (result.isSuccess) {
          // Loại bỏ id khỏi selectedIds để đảm bảo UI cập nhật đúng trạng thái checkbox
          selectedIds.value = selectedIds.value.filter((sid) => sid !== id);
          // Gọi API để làm mới lại danh sách sau khi xóa thành công
          await fetchSalaryCompositions();
          addToast("Xóa thành công", "success");
        } else {
          addToast("Xóa thất bại", "error");
        }
      } catch (err) {
        console.error("[SalaryComposition] deleteOne:", err);
        addToast("Có lỗi xảy ra khi xóa", "error");
      }
    },
  });
}

/**
 * Xóa bản ghi từ form chi tiết
 *
 * Sử dụng khi: Người dùng click nút Xóa trong form chi tiết
 *
 * @param {Object} row Dữ liệu đang được mở trong form
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function handleDeleteFromForm(row) {
  const { salaryCompositionId: id, salaryCompositionName } = row;
  emit("openAlert", {
    title: "Thông báo",
    message: `Bạn có chắc chắn muốn xóa thành phần lương <strong>${salaryCompositionName}</strong> không?`,
    confirmText: "Xóa",
    confirmType: "danger",
    onConfirm: async () => {
      try {
        // Gọi API để xóa bản ghi theo id
        const result = await salaryCompositionApi.deleteById(id);
        if (result.isSuccess) {
          // Nếu xóa thành công, đóng form và làm mới lại danh sách
          selectedIds.value = selectedIds.value.filter((sid) => sid !== id);
          addToast("Xóa thành công", "success");
          handleCloseFormAndRefresh();
        } else {
          addToast("Xóa thất bại", "error");
        }
      } catch (err) {
        console.error("[SalaryComposition] deleteFromForm:", err);
        addToast("Có lỗi xảy ra khi xóa", "error");
      }
    },
  });
}

/**
 * Xử lý xóa nhiều bản ghi đã chọn
 *
 * Sử dụng khi: Người dùng click nút Xóa trên thanh công cụ
 *
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function handleDeleteSelected() {
  if (selectedIds.value.length === 0) return;

  // Lọc các row có salaryCompositionSystemId ra khỏi danh sách xóa
  const deletableIds = selectedIds.value.filter((id) => {
    const row = salaryCompositions.value.find(
      (r) => r.salaryCompositionId === id,
    );
    return !row?.salaryCompositionSystemId;
  });
  // Đếm số lượng bản ghi bị chặn do là data hệ thống
  const blockedCount = selectedIds.value.length - deletableIds.length;

  // Nếu không còn id nào có thể xóa, hiển thị thông báo và không làm gì thêm
  if (deletableIds.length === 0) {
    emit("openAlert", {
      title: "Không thể xóa",
      message:
        "Dữ liệu của hệ thống bạn không thể xóa.",
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
            `Xóa thành công`,
            "success",
          );
        } else {
          addToast("Xóa thất bại", "error");
        }
      } catch (err) {
        console.error("[SalaryComposition] deleteSelected:", err);
        addToast("Có lỗi xảy ra khi xóa một số bản ghi", "error");
      }
    },
  });
}

/**
 * Đổi trạng thái theo dõi của một bản ghi
 *
 * Sử dụng khi: Người dùng click icon Đổi trạng thái trên một dòng
 *
 * @param {Object} row Dữ liệu của dòng cần đổi trạng thái
 * @returns {Promise<void>}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
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

  emit("openAlert", {
    title: "Chuyển trạng thái",
    message: `Bạn có chắc chắn muốn chuyển trạng thái thành phần lương <strong>${row.salaryCompositionName}</strong> sang ${statusLabel} không?`,
    confirmText: "Đồng ý",
    cancelText: "Không",
    onConfirm: async () => {
      await executeUpdateStatus([row.salaryCompositionId], newStatus);
    },
  });
}

/**
 * Cập nhật trạng thái nhiều bản ghi
 *
 * Sử dụng khi: Người dùng click Đang theo dõi / Ngừng theo dõi trên thanh công cụ
 *
 * @param {number} status Trạng thái mới cần cập nhật
 * @returns {Promise<void>}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
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
  emit("openAlert", {
    title: "Chuyển trạng thái",
    message: `Bạn có chắc chắn muốn chuyển trạng thái các thành phần lương đã chọn sang ${statusLabel} không?`,
    confirmText: "Đồng ý",
    cancelText: "Không",
    onConfirm: async () => {
      await executeUpdateStatus(updatableIds, status);
    },
  });
}



/**
 * Thực thi gọi API đổi trạng thái
 *
 * Sử dụng khi: Xác nhận đổi trạng thái thành công
 *
 * @param {Array} updatableIds Danh sách ID bản ghi cần đổi
 * @param {number} status Trạng thái mới
 * @returns {Promise<void>}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
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
      addToast(`Cập nhật trạng thái thành công`, "success");
    } else {
      addToast(result.data || "Cập nhật trạng thái thất bại", "error");
    }
  } catch (err) {
    console.error("[SalaryComposition] executeUpdateStatus:", err);
    addToast("Có lỗi xảy ra khi cập nhật trạng thái", "error");
  }
}

// ======================== Checkbox selection ========================
// danh sách id của các bản ghi được chọn trong bảng
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

/**
 * Toggle chọn tất cả bản ghi trên trang hiện tại
 *
 * Sử dụng khi: Người dùng click checkbox trên tiêu đề bảng
 *
 * @param {Object} event Sự kiện DOM
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const toggleSelectAll = (event) => {
  if (event.target.checked) {
    selectedIds.value = salaryCompositions.value.map(
      (row) => row.salaryCompositionId,
    );
  } else {
    selectedIds.value = [];
  }
};

/**
 * Kiểm tra xem một dòng có đang được chọn không
 *
 * Sử dụng khi: Render trạng thái checked của checkbox từng dòng
 *
 * @param {string} id ID của bản ghi
 * @returns {boolean} True nếu đang được chọn
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const isRowSelected = (id) => selectedIds.value.includes(id);

/**
 * Toggle trạng thái chọn của một dòng
 *
 * Sử dụng khi: Người dùng click vào checkbox của một dòng
 *
 * @param {string} id ID của bản ghi
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const toggleRow = (id) => {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((item) => item !== id);
  } else {
    selectedIds.value = [...selectedIds.value, id];
  }
};

// ======================== Emit + Toast ========================
const emit = defineEmits(["openAlert"]);

// danh sách các thông báo toast
const toasts = ref([]);

/**
 * Thêm một thông báo toast
 *
 * Sử dụng khi: Cần hiển thị thông báo thành công/lỗi cho người dùng
 *
 * @param {string} message Nội dung thông báo
 * @param {string} type Loại thông báo (success, error, warning)
 * @param {number} duration Thời gian hiển thị (ms)
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const addToast = (message, type = "success", duration = 3000) => {
  toasts.value.push({
    id: Date.now() + Math.random(),
    message,
    type,
    duration,
  });
};
/**
 * Xóa một thông báo toast
 *
 * Sử dụng khi: Toast hết thời gian hiển thị hoặc người dùng chủ động đóng
 *
 * @param {number|string} id ID của toast cần xóa
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
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
