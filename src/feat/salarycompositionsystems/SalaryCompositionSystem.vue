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
      <!-- page-area (normal) hoặc overlay-mode -->
      <div :class="isOverlay ? 'content_body_wrapper overlay-mode modal_system_body' : 'page-area'">
        <div :class="isOverlay ? '' : 'content_body_wrapper'">
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

            <div v-if="!isOverlay && selectedIds.length > 0" class="checkbox_function">
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
                message="Đưa vào danh sách sử dụng"
                iconLeft="mi-plus-primary"
                type="border-secondary"
                class=" fz-14 h-32"
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

          <!-- Header right: chỉ hiện khi không phải overlay -->
          <div v-if="!isOverlay" class="content_body_header_right">
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
        <div :class="['content_body', isOverlay ? 'overlay-content_body' : '']">
          <div class="content_body_table">
            <!-- Trạng thái đang tải -->
            <MsLoader v-if="isLoading" text="Đang tải dữ liệu..." class="table-state table-state--loading" />

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
              <template #cell-taxDeduction="{ row }">
                {{
                  row.taxDeduction === null || row.taxDeduction === undefined
                    ? "--"
                    : (SalaryCompositionTaxDeductionLabel[row.taxDeduction] ??
                      "--")
                }}
              </template>
              <template #cell-valueType="{ row }">
                {{ SalaryCompositionValueTypeLabel[row.valueType] ?? row.valueType }}
              </template>
              <template #cell-quota="{ row }">
                <FormulaCell :value="row.quota" />
              </template>
              <template #cell-formula="{ row }">
                <FormulaCell :value="row.formula" />
              </template>
              <template #cell-optionShowPaycheck="{ row }">
                {{
                  SalaryCompositionShowPaycheckLabel[
                    row.optionShowPaycheck
                  ] ?? row.optionShowPaycheck
                }}
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
        <!-- Filter sidebar (chỉ khi không phải overlay) -->
        <FilterSalaryComposition
          v-if="!isOverlay && isOpenFilter"
          @close="isOpenFilter = false"
          @apply="handleApplyAdvancedFilter"
          @reset="handleResetAdvancedFilter"
        />
      </div>

      <!-- Overlay Footer -->
      <div v-if="isOverlay" class="modal_system_footer">
        <MsButton message="Hủy bỏ" type="border-secondary" @click="emit('close')" />
        <MsButton message="Đồng ý" type="green" :disabled="selectedIds.length === 0 || isSaving" @click="handleConfirm" />
      </div>

    </div>
  </div>



  <!-- Toast container -->
  <MsToastContainer :toasts="toasts" @close="removeToast" />
</template>
<script setup>
/**
 * Mục đích: Hiển thị danh mục Thành phần lương của Hệ thống và cho phép thêm vào danh sách sử dụng (Overlay/Page).
 * Sử dụng trong trường hợp: Truy cập vào trang Danh mục hệ thống hoặc mở Popup "Thêm từ danh mục hệ thống".
 * Hàm quan trọng: fetchData, handleConfirm, loadGridConfig, initGridConfig.
 * CREATED BY: TDHieu (08/06/2026)
 */
import MsButton from "@/components/base/MsButton.vue";
import MsInput from "@/components/base/MsInput.vue";
import MsTable from "@/components/base/MsTable/MsTable.vue";
import MsSelect from "@/components/base/MsSelect.vue";
import MsDropdownMenu from "@/components/base/MsDropdownMenu.vue";
import MsAlert from "@/components/overlay/MsAlert.vue";
import MsOverlay from "@/components/overlay/MsOverlay.vue";
import MsToastContainer from "@/components/overlay/MsToast/MsToastContainer.vue";
import PopupSettingColumn from "@/feat/salarycomposition/PopupSettingColumn.vue";
import FilterSalaryComposition from "@/feat/salarycomposition/FilterSalaryComposition.vue";
import FormulaCell from "@/components/base/MsFormula/FormulaCell.vue";
import MsLoader from "@/components/base/MsLoader.vue";
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

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
  SalaryCompositionTypeOptions,
  SalaryCompositionTaxableLabel,
  SalaryCompositionTaxDeductionLabel,
  SalaryCompositionShowPaycheckLabel,
} from "@/constants/enums";

const props = defineProps({
  isOverlay: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["openAlert", "close", "saved"]);
const router = useRouter();

// ── Toast state ──────────────────────────────────────────────
// Danh sách các thông báo toast
const toasts = ref([]);

/**
 * Hàm dùng để: Hiển thị thông báo Toast.
 * Dùng trong trường hợp: Lưu hoặc xử lý thao tác thành công/thất bại.
 * @param {string} message - Nội dung.
 * @param {string} type - Loại thông báo ("success", "error", ...).
 * @param {number} duration - Thời gian hiển thị (ms).
 * CREATED BY: TDHieu (08/06/2026)
 */
const addToast = (message, type = "success", duration = 3000) => {
  toasts.value.push({ id: Date.now() + Math.random(), message, type, duration });
};

/**
 * Hàm dùng để: Ẩn thông báo Toast.
 * Dùng trong trường hợp: Toast tự đóng hoặc user click đóng.
 * @param {number} id - ID của toast.
 * CREATED BY: TDHieu (08/06/2026)
 */
const removeToast = (id) => {
  toasts.value = toasts.value.filter((t) => t.id !== id);
};



// ── Filter / search state ────────────────────────────────────
// Trạng thái hiển thị bộ lọc nâng cao
const isOpenFilter = ref(false);
// Từ khóa tìm kiếm theo tên hoặc mã
const searchKeyword = ref("");
// Loại thành phần đang được chọn lọc trên toolbar
const selectedType = ref(null);
// Trạng thái hiển thị dropdown chọn Loại thành phần
const statusMenuOpen = ref(false);
// Tên trường đang được chọn để sắp xếp
const sortField = ref("");
// Chiều sắp xếp (asc/desc)
const sortDirection = ref("");
// Danh sách các điều kiện lọc nâng cao từ sidebar bộ lọc
const advancedFilters = ref([]);
// Timer dùng để debounce khi người dùng gõ phím tìm kiếm
let searchDebounceTimer = null;

/**
 * Hàm dùng để: Lưu trữ filter nâng cao và gọi API filter dữ liệu.
 * Dùng trong trường hợp: Nhấn "Áp dụng" trên Sidebar Filter.
 * @param {Array} filters - Danh sách điều kiện lọc.
 * CREATED BY: TDHieu (08/06/2026)
 */
const handleApplyAdvancedFilter = (filters) => {
  advancedFilters.value = filters;
  pageIndex.value = 1;
  fetchData();
};

/**
 * Hàm dùng để: Đưa các filter nâng cao về mặc định và gọi API tải lại bảng.
 * Dùng trong trường hợp: Nhấn "Bỏ lọc" trên Sidebar Filter.
 * CREATED BY: TDHieu (08/06/2026)
 */
const handleResetAdvancedFilter = () => {
  advancedFilters.value = [];
  pageIndex.value = 1;
  fetchData();
};

// Danh sách tuỳ chọn cho Loại thành phần
const typeItems = [
  { label: "Tất cả", value: null },
  ...SalaryCompositionTypeOptions,
];

const selectedTypeLabel = computed(
  () => typeItems.find((i) => i.value === selectedType.value)?.label ?? "Tất cả"
);

/**
 * Hàm dùng để: Cập nhật type được chọn từ combobox và tải lại bảng.
 * Dùng trong trường hợp: User chọn Loại thành phần trên header Toolbar.
 * @param {Object} item - Item được select.
 * CREATED BY: TDHieu (08/06/2026)
 */
const handleTypeChange = (item) => {
  // @select emit object { label, value } — cần lấy item.value
  selectedType.value = item?.value ?? null;
  statusMenuOpen.value = false;
  pageIndex.value = 1;
  fetchData();
};

/**
 * Hàm dùng để: Gọi debounce timeout chờ user gõ xong rồi mới filter text.
 * Dùng trong trường hợp: User nhập ký tự vào ô Tìm kiếm.
 * CREATED BY: TDHieu (08/06/2026)
 */
const handleSearchInput = () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    pageIndex.value = 1;
    fetchData();
  }, 300);
};

/**
 * Hàm dùng để: Chuyển đổi tên field từ CamelCase sang snake_case (phù hợp BE).
 * Dùng trong trường hợp: Build payload sort.
 * @param {string} value - Chuỗi tên field CamelCase.
 * @returns {string} Chuỗi định dạng snake_case.
 * CREATED BY: TDHieu (08/06/2026)
 */
const toSnakeCase = (value) =>
  value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

/**
 * Hàm dùng để: Cập nhật trạng thái Sort và tải lại danh sách.
 * Dùng trong trường hợp: User click vào header của 1 cột có sort.
 * @param {Object} param - Chứa field và direction.
 * CREATED BY: TDHieu (08/06/2026)
 */
const handleSortChange = ({ field, direction }) => {
  sortField.value = field;
  sortDirection.value = direction;
  pageIndex.value = 1;
  fetchData();
};

// ── Paging state ─────────────────────────────────────────────
// Trang hiện tại
const pageIndex = ref(1);
// Số bản ghi trên một trang
const pageSize = ref(15);
// Tổng số bản ghi
const totalRecords = ref(0);

// Các tùy chọn số bản ghi trên một trang
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

/**
 * Hàm dùng để: Nhảy tới trang chỉ định và gọi lại dữ liệu.
 * Dùng trong trường hợp: User nhấn nút phân trang ở Footer.
 * @param {number} page - Số trang cần nhảy tới.
 * CREATED BY: TDHieu (08/06/2026)
 */
const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  pageIndex.value = page;
  fetchData();
};

/**
 * Hàm dùng để: Đổi số lượng bản ghi hiển thị trên 1 trang.
 * Dùng trong trường hợp: Chọn Combobox Số dòng/trang.
 * CREATED BY: TDHieu (08/06/2026)
 */
const handlePageSizeChange = () => {
  pageIndex.value = 1;
  fetchData();
};

// ── Data state ───────────────────────────────────────────────
// Danh sách dữ liệu Thành phần lương hệ thống
const salaryCompositions = ref([]);
// Trạng thái đang tải dữ liệu
const isLoading = ref(false);
// Thông báo lỗi nếu gọi API thất bại
const errorMessage = ref("");

/**
 * Hàm dùng để: Tải danh sách thành phần lương hệ thống từ Backend.
 * Dùng trong trường hợp: Mở trang, phân trang, lọc, sort dữ liệu.
 * @returns {Promise<void>}
 * CREATED BY: TDHieu (08/06/2026)
 */
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

    // Filter theo loại thành phần
    if (selectedType.value !== null && selectedType.value !== undefined) {
      params.compositionType = selectedType.value;
    }

    // Bộ lọc nâng cao từ sidebar
    if (advancedFilters.value && advancedFilters.value.length > 0) {
      params.advancedFilters = JSON.stringify(advancedFilters.value);
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

// ── Đưa vào danh sách sử dụng (Req 2) ───────────────────────
/**
 * Hàm dùng để: Copy 1 thành phần lương từ hệ thống vào danh sách sử dụng của khách hàng.
 * Dùng trong trường hợp: Nhấn nút dấu '+' ở cột thao tác từng dòng.
 * @param {Object} row - Thông tin dòng (bản ghi) cần thêm.
 * @returns {Promise<void>}
 * CREATED BY: TDHieu (08/06/2026)
 */
async function handleAddToUsageList(row) {
  emit("openAlert", {
    title: "Thông báo",
    message: `Bạn có chắc chắn muốn đưa thành phần lương mặc định <strong>${row.salaryCompositionName}</strong> vào danh sách sử dụng không?`,
    confirmText: "Thêm vào",
    confirmType: "green",
    onConfirm: async () => {
      try {
        const result = await saveUsageItem(row);
        if (result?.isSuccess) {
          localStorage.setItem('pendingToast', JSON.stringify({ message: "Thêm thành công", type: "success" }));
          router.push("/salarycomposition");
        }
      } catch (err) {
        console.error("[SalaryCompositionSystem] addToUsageList:", err);
        const msg = err.data?.userMessage || err.data?.devMessage || "Thành phần lương đã tồn tại";
        addToast(msg, "error");
      }
    },
  });
}

// ── Xử lý lưu danh sách (Overlay Mode) ──────────────────────
// Trạng thái đang lưu khi đưa nhiều thành phần lương vào danh sách sử dụng
const isSaving = ref(false);

/**
 * Hàm dùng để: Lưu nhiều bản ghi đã chọn (checkbox) vào danh sách sử dụng.
 * Dùng trong trường hợp: Bấm "Đồng ý" ở footer popup overlay hoặc nút "Đưa vào danh sách sử dụng" ở header (khi select checkbox).
 * @returns {Promise<void>}
 * CREATED BY: TDHieu (08/06/2026)
 */
const handleConfirm = async () => {
  emit("openAlert", {
      title: "Thông báo",
      message: `Bạn có chắc chắn muốn đưa các thành phần lương mặc định đã chọn vào danh sách sử dụng không?`,
      confirmText: "Thêm vào",
      confirmType: "green",
      onConfirm: async () => {
        if (selectedIds.value.length === 0) return;
        isSaving.value = true;
        let successCount = 0;
        try {
          const itemsToAdd = salaryCompositions.value.filter(item => selectedIds.value.includes(item.salaryCompositionSystemId));

          // Chạy tuần tự để nếu có case cần xác nhận thay thế thì alert không bị chồng lên nhau
          for (const row of itemsToAdd) {
            try {
              const res = await saveUsageItem(row);
              if (res?.isSuccess) {
                successCount++;
              }
            } catch (err) {
              console.error("[SalaryCompositionSystem] create:", err);
              const msg = err.data?.userMessage || err.data?.devMessage || `Thành phần lương "${row.salaryCompositionName}" đã tồn tại`;
              addToast(msg, "error");
            }
          }

          if (successCount > 0) {
            if (props.isOverlay) {
              addToast(`Thêm thành công`, "success");
              emit("saved", successCount);
              emit("close");
              return;
            } else {
              localStorage.setItem('pendingToast', JSON.stringify({ message: "Thêm thành công", type: "success" }));
              router.push("/salarycomposition");
            }
          }
        } catch (error) {
          console.error(error);
        } finally {
          isSaving.value = false;
        }
      },
    });
};

/**
 * Chuẩn bị payload (dữ liệu) để tạo mới một thành phần lương sử dụng từ danh mục hệ thống.
 *
 * Sử dụng khi: Chuẩn bị dữ liệu trước khi gọi API `create` để đưa thành phần lương vào danh sách sử dụng.
 *
 * @param {string} salaryCompositionSystemId ID của thành phần lương trên hệ thống
 * @returns {Promise<Object>} Object payload
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
async function buildUsagePayload(salaryCompositionSystemId) {
  const result = await salaryCompositionSystemApi.getById(salaryCompositionSystemId);
  const data = result?.data;

  return {
    salaryCompositionSystemId: data.salaryCompositionSystemId,
    salaryCompositionCode: data.salaryCompositionCode,
    salaryCompositionName: data.salaryCompositionName,
    organizationIds: Array.isArray(data.organizationIds) ? data.organizationIds : [],
    organizationName: data.organizationName ?? null,
    compositionType: data.compositionType,
    compositionNature: data.compositionNature,
    taxable: data.taxable ?? null,
    taxDeduction: data.taxDeduction ?? null,
    quota: data.quota ?? null,
    valueType: data.valueType,
    formula: data.formula ?? null,
    description: data.description ?? null,
    optionShowPaycheck: data.optionShowPaycheck ?? null,
    sourceType: 2,
    status: 1,
  };
}

function requestReplaceConfirmation(row, payload, existingEntity) {
  return new Promise((resolve, reject) => {
    emit("openAlert", {
      title: "Thông báo",
      message: `Đã tồn tại một thành phần lương trùng mã <strong>${row.salaryCompositionCode}</strong> trên danh sách. Chương trình sẽ cập nhật thông tin của thành phần lương mặc định vào bản ghi hiện có. Bạn có muốn tiếp tục không?`,
      cancelText: "Hủy bỏ",
      confirmText: "Xác nhận",
      confirmType: "green",
      onConfirm: async () => {
        try {
          const updateResult = await salaryCompositionApi.update(
            existingEntity.salaryCompositionId,
            payload,
          );
          await salaryCompositionSystemApi.deleteById(row.salaryCompositionSystemId);
          resolve(updateResult);
        } catch (confirmError) {
          reject(confirmError);
        }
      },
      onCancel: () => resolve(null),
    });
  });
}

async function findSalaryCompositionByCode(code) {
  const result = await salaryCompositionApi.getAll();
  const normalizedCode = code.trim().toUpperCase();

  return (result.data || []).find(
    (item) => item.salaryCompositionCode?.trim()?.toUpperCase() === normalizedCode,
  ) ?? null;
}

async function saveUsageItem(row) {
  const payload = await buildUsagePayload(row.salaryCompositionSystemId);

  try {
    return await salaryCompositionApi.create(payload);
  } catch (err) {
    const userMessage = err.data?.userMessage || "";
    if (userMessage.includes("Mã thành phần đã tồn tại")) {
      const existingEntity = await findSalaryCompositionByCode(row.salaryCompositionCode);
      if (existingEntity) {
        return await requestReplaceConfirmation(row, payload, existingEntity);
      }
    }

    throw err;
  }
}

onMounted(() => {
  fetchData();
  loadGridConfig();
});

// ── Checkbox selection ───────────────────────────────────────
// Danh sách ID các bản ghi đang được chọn (checkbox)
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

/**
 * Hàm dùng để: Chọn hoặc bỏ chọn tất cả bản ghi trên bảng hiện tại.
 * Dùng trong trường hợp: Click checkbox ở header bảng.
 * @param {Event} event - Sự kiện change từ thẻ input checkbox.
 * CREATED BY: TDHieu (08/06/2026)
 */
const toggleSelectAll = (event) => {
  if (event.target.checked) {
    selectedIds.value = salaryCompositions.value.map((r) => r.salaryCompositionSystemId);
  } else {
    selectedIds.value = [];
  }
};

/**
 * Hàm dùng để: Kiểm tra dòng (bản ghi) có đang được chọn hay không.
 * Dùng trong trường hợp: Binding trạng thái checked của checkbox từng dòng.
 * @param {string} id - ID bản ghi.
 * @returns {boolean}
 * CREATED BY: TDHieu (08/06/2026)
 */
const isRowSelected = (id) => selectedIds.value.includes(id);

/**
 * Hàm dùng để: Chọn hoặc bỏ chọn 1 dòng cụ thể.
 * Dùng trong trường hợp: Click checkbox của từng dòng.
 * @param {string} id - ID bản ghi.
 * CREATED BY: TDHieu (08/06/2026)
 */
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
  { key: "taxDeduction", label: "Giảm trừ khi tính thuế", slot: "taxDeduction", width: 210, isVisible: true },
  { key: "quota", label: "Định mức", width: 140, isVisible: true },
  { key: "valueType", label: "Kiểu giá trị", slot: "valueType", width: 160, isVisible: true },
  { key: "formula", label: "Giá trị", width: 160, isVisible: true },
  { key: "description", label: "Mô tả", width: 240, isVisible: true },
  { key: "optionShowPaycheck", label: "Hiển thị trên phiếu lương", slot: "optionShowPaycheck", width: 230, isVisible: true },
  { key: "ghost", label: "", width: 60, isSystemCol: true },
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
// Các cấu hình trường dữ liệu hiển thị (Reactive, được cập nhật qua thao tác)
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
// Trạng thái hiển thị Popup thiết lập cột
const isOpenPopupSettingColumn = ref(false);
const togglePopupSettingColumn = () => {
  isOpenPopupSettingColumn.value = !isOpenPopupSettingColumn.value;
};

// ── GridConfig – Load & Save ──────────────────────────────────────────
// Tên Grid (dùng làm key lưu trữ cấu hình bảng trên database)
const GRID_NAME = "SalaryCompositionSystemGrid";

/** Cache gridConfigId: { columnName -> gridConfigId } */
const gridConfigIdMap = ref({});

/** Cache full object từ DB: { columnName -> GridConfig } */
const gridConfigDataMap = ref({});

/**
 * Hàm dùng để: Load cấu hình cột từ API (pa_grid_config) và áp dụng hiển thị lên fields.
 * Dùng trong trường hợp: Mở trang lần đầu (onMounted) hoặc sau khi lưu config.
 * @returns {Promise<void>}
 * CREATED BY: TDHieu (08/06/2026)
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
 * Hàm dùng để: Khởi tạo các cột chưa có config trên DB vào DB.
 * Dùng trong trường hợp: Cấu hình trên hệ thống chưa có bản ghi GridConfig tương ứng với frontend.
 * @param {Array} existingConfigs - Mảng cấu hình cột đã có trên DB.
 * @returns {Promise<void>}
 * CREATED BY: TDHieu (08/06/2026)
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
 * Hàm dùng để: Trích xuất 1 object payload đẩy đủ cho grid config của 1 cột.
 * Dùng trong trường hợp: Chuẩn bị data gọi API lưu grid_config.
 * @param {string} columnName - Tên cột (key).
 * @param {Object} overrides - Giá trị ghi đè.
 * @returns {Object} Payload.
 * CREATED BY: TDHieu (08/06/2026)
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
 * Hàm dùng để: Gọi API lưu cấu hình (chỉnh kích thước, ẩn hiện, vv). Hỗ trợ debounce.
 * Dùng trong trường hợp: Khi có thay đổi kích thước cột, ghim, v.v.
 * @param {string} columnName - Mã cột.
 * @param {Object} overrides - Cấu hình thay đổi.
 * CREATED BY: TDHieu (08/06/2026)
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
 * Hàm dùng để: Bắt event thay đổi kích thước cột từ bảng và lưu vào cấu hình.
 * Dùng trong trường hợp: Người dùng kéo thả resize header trên bảng.
 * @param {Object} payload - { field, width }
 * CREATED BY: TDHieu (08/06/2026)
 */
const handleColumnResize = ({ field, width }) => {
  const target = fields.value.find((f) => f.key === field.key);
  if (target) target.width = width;
  saveColumnConfig(field.key, { columnWidth: width });
};

/**
 * Hàm dùng để: Cập nhật thứ tự cột và ghim cột do event từ bảng.
 * Dùng trong trường hợp: Người dùng kéo thả vị trí cột trực tiếp.
 * @param {Array} updatedFields - Mảng cấu hình fields mới từ component con.
 * CREATED BY: TDHieu (08/06/2026)
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
 * Hàm dùng để: Cập nhật config của các cột từ Popup Tùy chỉnh cột.
 * Dùng trong trường hợp: Nhấn nút "Lưu" ở Popup Tùy chỉnh cột.
 * @param {Array} configurableSaved - Cấu hình đã được người dùng tinh chỉnh.
 * @returns {Promise<void>}
 * CREATED BY: TDHieu (08/06/2026)
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
.overlay-content_body  {
  height: 440px !important;
}
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
  margin: 24px 24px;
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
  height: 100%;
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
/* .overlay_mode{

} */
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
/* ── page-area layout: bảng + filter sidebar ── */
.page-area {
  display: flex;
  flex-direction: row;
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  gap: 16px;
}
/* Wrapper cho nút thiết lập + popup */
.setting-btn-wrapper {
  position: relative;
}

/* Checkbox function toolbar */
.checkbox_function {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 8px;
}

:deep(.mi-plus-primary){
  margin-right: 4px;
}

/* Status trigger button */
.status-trigger {
  white-space: nowrap;
}
.status-trigger--open :deep(.ms-button__icon--right) {
  transform: rotate(180deg);
  transition: transform 0.2s ease;
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
@media screen and (max-width: 1280px) {
  .content_body_search{
    width: 200px;
  }
  :deep(.ms-tree-select__control) {
  width: 250px;
}
}

@media screen and (max-width: 1081px) {
  .content_body_search{
    width: 150px;
  }
  :deep(.ms-tree-select__control) {
  width: 200px;
}
}

</style>

