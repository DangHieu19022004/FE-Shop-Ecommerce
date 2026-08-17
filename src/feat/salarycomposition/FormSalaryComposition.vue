<template lang="">
  <div class="content_bg">
    <div class="content">
      <div class="content_header">
        <div>
          <div class="content_header_left_icon">
            <DMButton
              iconLeft="mi-arrow-left"
              shapeBtn="circle"
              @click="handleCloseForm"
              tooltipMessage="Quay lại"
              tooltipPosition="bottom"
            />
            <h2 class="content_header_left_title">
              {{
                isViewMode || isEditMode
                  ? (formData.salaryCompositionName || 'Thành phần lương')
                  : "Thêm thành phần"
              }}
            </h2>
          </div>
        </div>
        <div class="content_header_right" v-if="isEditMode || isViewMode">
          <DMButton
            v-if="isEditMode"
            message="Hủy bỏ"
            class="border-gray fz-14 bg-white w-80 h-32"
            style="margin-right: 8px;"
            @click="handleCloseForm"
            :isTooltip="false"
          />
          <template v-if="isEditMode">
            <DMButton
              message="Lưu"
              type="green"
              class="fz-14 w-80 h-32"
              style="margin-right: 8px;"
              @click="handleSubmit"
              :disabled="isSubmitting"
              :isTooltip="false"
            />
          </template>
          <template v-else-if="isViewMode && !formData.salaryCompositionSystemId">
            <DMButton
              message="Sửa"
              type="none"
              iconLeft="mi-pencil"
              class="fz-14 border-gray bg-white w-80 h-32"
              style="margin-right: 8px;"
              @click="switchToEditMode"
              :isTooltip="false"
            />
          </template>
          <div class="header_dropdown_wrapper" ref="actionDropdownRef" style="position: relative; display: inline-block;">
            <DMButton
              iconLeft="mi-threedot"
              class="border-gray bg-white pd-10"
              @click.stop="toggleActionDropdown"
              :isTooltip="false"
            />
            <DMDropdownMenu
              v-if="showActionDropdown"
              :items="dropdownItems"
              position="bottom-end"
              @select="handleDropdownSelect"
              style="margin-top: 8px;"
            />
          </div>
        </div>
      </div>
      <div class="content_body_wrapper">
        <div
          :class="['content_body_wrapper_form', { 'is-view-mode': isViewMode }]"
        >
          <!-- Tên thành phần -->
          <div class="form-field">
            <DMInput
              ref="salaryCompositionNameRef"
              type="text"
              id="input_name_salary"
              isRequired
              label="Tên thành phần"
              horizontal
              v-model="formData.salaryCompositionName"
              :errorMessages="
                isTouched('salaryCompositionName')
                  ? errorMessages.salaryCompositionName
                  : ''
              "
              @blur="markTouched('salaryCompositionName')"
              @focus="unMarkTouched('salaryCompositionName')"
              @update:modelValue="handleFieldValueChange('salaryCompositionName', $event)"
              :disabled="isViewMode"
            />
            <div class="validate-msg">
              {{
                isTouched("salaryCompositionName")
                  ? errorMessages.salaryCompositionName
                  : ""
              }}
            </div>
          </div>

          <!-- Mã thành phần -->
          <div class="form-field">
            <DMInput
              ref="salaryCompositionCodeRef"
              type="text"
              id="input_code_salary"
              isRequired
              label="Mã thành phần"
              horizontal
              v-model="formData.salaryCompositionCode"
              :errorMessages="
                isTouched('salaryCompositionCode')
                  ? errorMessages.salaryCompositionCode
                  : ''
              "
              @blur="markTouched('salaryCompositionCode')"
              @focus="unMarkTouched('salaryCompositionCode')"
              @update:modelValue="handleFieldValueChange('salaryCompositionCode', $event)"
              :disabled="isViewMode || isEditMode"
            />
            <div class="validate-msg">
              {{
                isTouched("salaryCompositionCode")
                  ? errorMessages.salaryCompositionCode
                  : ""
              }}
            </div>
          </div>

          <!-- Đơn vị áp dụng -->
          <div class="form-field">
            <DMTreeSelect
              label="Đơn vị áp dụng"
              horizontal
              placeholder="Chọn đơn vị..."
              :options="orgTreeData"
              v-model="selectedOrgs"
            />
            <div class="validate-msg"></div>
          </div>

          <!-- Loại thành phần -->
          <div class="form-field">
            <DMSelect
              ref="compositionTypeRef"
              :data="categoryOptions"
              label-text="Loại thành phần"
              :is-required="true"
              horizontal
              class="fz-14"
              :width="315"
              v-model="formData.compositionType"
              @blur="markTouched('compositionType')"
              @focus="unMarkTouched('compositionType')"
              :errorMessages="
                isTouched('compositionType')
                  ? errorMessages.compositionType
                  : ''
              "
            />
            <div class="validate-msg">
              {{
                isTouched("compositionType")
                  ? errorMessages.compositionType
                  : ""
              }}
            </div>
          </div>

          <!-- Tính chất + Thuế -->
          <div class="form-field">
            <div class="type_salary_wrapper">
              <DMSelect
                ref="compositionNatureRef"
                :data="SalaryCompositionNatureOptions"
                labelText="Tính chất"
                isRequired
                horizontal
                class="fz-14"
                :width="315"
                v-model="formData.compositionNature"
                @blur="markTouched('compositionNature')"
                @focus="unMarkTouched('compositionNature')"
                :errorMessages="
                  isTouched('compositionNature')
                    ? errorMessages.compositionNature
                    : ''
                "
              />
              <div
                v-if="
                  formData.compositionNature !== SalaryCompositionNature.Other
                "
                class="type_salary"
              >
                <DMRadio
                  v-if="
                    formData.compositionNature ===
                    SalaryCompositionNature.Income
                  "
                  v-model="selectedTax"
                  name="tax-type"
                  :options="taxOptions"
                  class="fz-14"
                  horizontalInput
                />
                <DMCheckbox
                  v-if="
                    formData.compositionNature ===
                    SalaryCompositionNature.Deduction
                  "
                  v-model="isDeductedTax"
                  label="Giảm trừ khi tính thuế"
                />
              </div>
            </div>
            <div class="validate-msg">
              {{
                isTouched("compositionNature")
                  ? errorMessages.compositionNature
                  : ""
              }}
            </div>
          </div>

          <!-- Định mức -->
          <div
            v-if="formData.compositionNature !== SalaryCompositionNature.Other"
            class="form-field"
          >
            <DMFormula
              ref="quotaRef"
              id="input_limit_salary"
              label="Định mức"
              horizontal
              placeholder="Tự động gợi ý công thức và tham số khi gõ"
              v-model="formData.quota"
              :parameters="formulaParameters"
              @validate="setCustomError('quota', $event[0] || '')"
              @blur="markTouched('quota')"
              @focus="unMarkTouched('quota')"
            />
          </div>

          <!-- Cho phép vượt định mức -->
          <div
            v-if="formData.compositionNature !== SalaryCompositionNature.Other"
            class="is-over-limit"
          >
            <DMCheckbox
              v-model="isOverLimit"
              label="Cho phép giá trị tính vượt qua định mức"
            />
            <DMButton
              iconLeft="mi-circle-info"
              tooltipPosition="bottom"
              tooltipMessage="Nếu không tích chọn thì khi tính giá trị thành phần lương này mà vượt quá định mức thì hệ thống sẽ tự lấy tối đa bằng định mức đã nhập"
              shapeBtn="circle"
            />
          </div>

          <!-- Kiểu giá trị -->
          <div class="form-field">
            <DMSelect
              labelText="Kiểu giá trị"
              v-model="formData.valueType"
              :data="SalaryCompositionValueTypeOptions"
              horizontal
              class="fz-14"
              :width="315"
              :disabled="
                formData.compositionNature !== SalaryCompositionNature.Other
              "
            />
            <div class="validate-msg"></div>
          </div>

          <!-- Giá trị -->
          <div
            v-if="
              formData.valueType === SalaryCompositionValueType.Number ||
              formData.valueType === SalaryCompositionValueType.Currency
            "
            class="form-field"
          >
            <DMRadio
              v-model="selectedOptionsValue"
              name="options-value"
              :options="optionsValue"
              labelText="Giá trị"
              class="fz-14"
              horizontal
            />
          </div>

          <!-- Combobox chọn thành phần lương -->
          <div
            v-if="
              formData.valueType === SalaryCompositionValueType.Number ||
              formData.valueType === SalaryCompositionValueType.Currency
            "
            class="form-field"
          >
            <div class="value-select-row">
              <DMSelect
                class="fz-14 is-over-limit"
                :width="315"
                v-model="selectedOptionsValueCombobox"
                :data="optionsValueCombobox"
                :disabled="selectedOptionsValue === optionsValue[1].value"
              >
                <template #option="{ option }">
                  <span class="ms-multiselect__option-content">
                    <span>{{ option.label }}</span>
                    <i
                      v-if="option.iconClass"
                      :class="['ms-multiselect__option-icon', option.iconClass]"
                    ></i>
                  </span>
                </template>
                <template #singleLabel="{ option }">
                  <span class="ms-multiselect__single-content">
                    <span>{{ option.label }}</span>
                    <i
                      v-if="option.iconClass"
                      :class="['ms-multiselect__option-icon', option.iconClass]"
                    ></i>
                  </span>
                </template>
              </DMSelect>
              <DMSelect
                v-if="selectedOptionsValueCombobox === 'option3'"
                v-model="selectedLevel"
                :data="levelOptions"
                class="fz-14 w-120"
                style="margin-right: 8px; width: 120px;"
              />
              <DMSelect
                v-if="selectedOptionsValue !== optionsValue[1].value"
                v-model="selectedSalaryCoposition"
                :data="formulaParameters"
                optionLabel="displayLabel"
                trackBy="code"
                horizontal
                class="fz-14"
                placeholder="Chọn thành phần lương để cộng giá trị"
              />
            </div>
            <div class="validate-msg"></div>
          </div>

          <!-- Công thức giá trị -->
          <div
            v-if="
              (formData.valueType !== SalaryCompositionValueType.Number &&
                formData.valueType !== SalaryCompositionValueType.Currency) ||
              selectedOptionsValue === optionsValue[1].value
            "
            :class="[
              'form-field',
              'formula-field',
              { 'formula-field--with-label': hasFormulaLabel },
            ]"
          >
            <DMFormula
              ref="formulaRef"
              id="input_value_salary"
              :class="[
                {
                  'is-over-limit':
                    formData.valueType === SalaryCompositionValueType.Number ||
                    formData.valueType === SalaryCompositionValueType.Currency,
                },
                'fz-14',
              ]"
              horizontal
              :label="
                formData.valueType !== SalaryCompositionValueType.Number &&
                formData.valueType !== SalaryCompositionValueType.Currency
                  ? 'Giá trị'
                  : ''
              "
              placeholder="Tự động gợi ý công thức và tham số khi gõ"
              v-model="formData.formula"
              :parameters="formulaParameters"
              @validate="setCustomError('formula', $event[0] || '')"
              @blur="markTouched('formula')"
              @focus="unMarkTouched('formula')"
            />
            <DMButton
              iconLeft="mi-agent-box"
              :isTooltip="false"
              :message="isHoverAgent ? 'Tạo công thức với AVA Tiền lương' : ''"
              class="formula-btn fz-13"
              shapeBtn="circle"
              @mouseenter="isHoverAgent = true"
              @mouseleave="isHoverAgent = false"
            />
          </div>

          <!-- Mô tả -->
          <div class="form-field">
            <div class="ms-input ms-input--horizontal">
              <label class="ms-input__label" for="input_desc">Mô tả</label>
              <textarea
                id="input_desc"
                class="ms-input-in h-86 text-area"
                v-model="formData.description"
              ></textarea>
            </div>
            <div class="validate-msg"></div>
          </div>

          <!-- Hiển thị trên phiếu lương -->
          <div class="form-field">
            <DMRadio
              v-model="formData.optionShowPaycheck"
              name="options-display"
              :options="SalaryCompositionShowPaycheckOptions"
              labelText="Hiển thị trên phiếu lương"
              class="fz-14"
              horizontal
              horizontalInput
            />
            <div class="validate-msg"></div>
          </div>

          <!-- Nguồn tạo -->
          <div class="form-field">
            <DMInput
              type="text"
              id="input_source"
              label="Nguồn tạo"
              horizontal
              :placeholder="
                SalaryCompositionSourceTypeLabel[formData.sourceType] ||
                'Tự thêm'
              "
              class="fz-14 wd-315"
              disabled
            />
            <div class="validate-msg"></div>
          </div>
        </div>
        <div class="content_body_footer" v-if="!isEditMode && !isViewMode">
          <div class="footer-right">
            <DMButton
              message="Hủy bỏ"
              :isTooltip="false"
              class="border-gray fz-14"
              @click="handleCloseForm"
            />
            <template v-if="!isViewMode">
              <DMButton
                message="Lưu và thêm"
                :isTooltip="false"
                class="fz-14"
                type="border-green"
                @click="handleSubmitAndAdd"
                :disabled="isSubmitting"
              />
              <DMButton
                message="Lưu"
                :isTooltip="false"
                class="fz-14"
                type="green"
                @click="handleSubmit"
                :disabled="isSubmitting"
              />
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast -->
  <DMToastContainer :toasts="toasts" @close="removeToast" />
</template>
<script setup>
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import DMTreeSelect from "@/components/base/DMTreeSelect/DMTreeSelect.vue";
import DMSelect from "@/components/base/DMSelect.vue";
import DMRadio from "@/components/base/DMRadio.vue";
import DMCheckbox from "@/components/base/DMCheckbox.vue";
import DMFormula from "@/components/base/DMFormula/DMFormula.vue";
import DMDropdownMenu from "@/components/base/DMDropdownMenu.vue";
import DMToastContainer from "@/components/overlay/DMToast/DMToastContainer.vue";
import { computed, nextTick, onMounted, ref, watch, onUnmounted } from "vue";
import salaryCompositionApi from "@/services/salaryCompositionService";
import salaryCompositionSystemApi from "@/services/salaryCompositionSystemService";
import organizationApi from "@/services/organizationService";
import { ErrorCodes } from "@/constants/errorCodes";
import {
  SalaryCompositionNature,
  SalaryCompositionNatureOptions,
  SalaryCompositionStatus,
  SalaryCompositionSourceType,
  SalaryCompositionSourceTypeLabel,
  SalaryCompositionValueType,
  SalaryCompositionValueTypeOptions,
  SalaryCompositionShowPaycheck,
  SalaryCompositionShowPaycheckOptions,
  SalaryCompositionType,
  SalaryCompositionTypeOptions,
  SalaryCompositionTaxable,
  SalaryCompositionTaxableOptions,
  SalaryCompositionTaxDeduction,
} from "@/constants/enums";

// NOTICE: Props
const props = defineProps({
  /** Nếu có editId → mode sửa; không có → mode thêm mới */
  editId: {
    type: String,
    default: null,
  },
  /** Nếu có viewId → mode xem chi tiết (readonly) */
  viewId: {
    type: String,
    default: null,
  },
  /** Nếu có duplicateId → mode nhân bản (copy data nhưng xóa mã/tên) */
  duplicateId: {
    type: String,
    default: null,
  },
});

// NOTICE: Emits
const emit = defineEmits(["openAlert", "close", "saved", "duplicate", "delete"]);


// VARIABLE:
const isHoverAgent = ref(false);
// trạng thái hiển thị dropdown menu
const showActionDropdown = ref(false);
// danh sách các mục trong dropdown menu
const dropdownItems = [
  { value: 'duplicate', label: 'Nhân bản', icon: 'mi-copy' },
  { value: 'delete', label: 'Xóa', icon: 'mi-trash-red' }
];
// ref của dropdown menu để xử lý click outside
const actionDropdownRef = ref(null);
// danh sách các thông báo toast nội bộ của form
const toasts = ref([]);
// trạng thái form có phải đang sửa không
const isEditMode = ref(!!props.editId); // !! để convert sang boolean
// trạng thái form có phải đang xem không
const isViewMode = ref(!!props.viewId);
// trạng thái form đang gọi API submit
const isSubmitting = ref(false);
// ID của bản ghi đang edit (tách riêng khỏi formData để không bị mất khi resetForm)
const currentEditId = ref(props.editId || null);
// dữ liệu cây đơn vị
const orgTreeData = ref([]);
// danh sách id đơn vị được chọn
const selectedOrgs = ref([]);


// FUNCTION:
/**
 * Toggle trạng thái hiển thị dropdown menu
 *
 * Sử dụng khi: Người dùng click vào icon 3 chấm ở chế độ View/Edit
 *
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const toggleActionDropdown = () => {
  showActionDropdown.value = !showActionDropdown.value;
};

/**
 * Xử lý sự kiện khi chọn 1 item trong dropdown menu
 *
 * Sử dụng khi: Người dùng chọn Nhân bản hoặc Xóa từ dropdown
 *
 * @param {Object} item Item được chọn
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const handleDropdownSelect = (item) => {
  // Đóng dropdown sau khi chọn
  showActionDropdown.value = false;
  // Build payload chung cho cả duplicate và delete, có thể mở rộng thêm nếu cần
  const payload = {
    salaryCompositionId: currentEditId.value || props.viewId || formData.value.salaryCompositionId,
    salaryCompositionName: formData.value.salaryCompositionName
  };
  // Phân biệt action dựa trên item.value và emit sự kiện tương ứng với payload
  if (item.value === 'duplicate') {
    emit('duplicate', payload);
  } else if (item.value === 'delete') {
    emit('delete', payload);
  }
};

/**
 * Xử lý click ra ngoài dropdown menu
 *
 * Sử dụng khi: Cần đóng dropdown khi người dùng click bên ngoài
 *
 * @param {Object} event Sự kiện click
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const handleClickOutside = (event) => {
  if (actionDropdownRef.value && !actionDropdownRef.value.contains(event.target)) {
    showActionDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

/**
 * Thêm một thông báo toast
 *
 * Sử dụng khi: Cần hiển thị thông báo thành công/lỗi
 *
 * @param {string} message Nội dung thông báo
 * @param {string} type Loại thông báo
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
 * Sử dụng khi: Toast hết hạn hoặc bị người dùng đóng
 *
 * @param {number|string} id ID của toast cần xóa
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const removeToast = (id) => {
  toasts.value = toasts.value.filter((t) => t.id !== id);
};

/**
 * Chuyển form từ chế độ xem chi tiết sang chế độ chỉnh sửa
 *
 * Sử dụng khi: Người dùng click nút Sửa
 *
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function switchToEditMode() {
  isViewMode.value = false;
  isEditMode.value = true;
  // Lưu lại ID của bản ghi đang xem để dùng khi submit update
  currentEditId.value = formData.value.salaryCompositionId || props.viewId;
}

/**
 * Gọi API lấy dữ liệu cây đơn vị
 *
 * Sử dụng khi: Component được mount
 *
 * @returns {Promise<void>}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
async function fetchOrgTree() {
  try {
    // Gọi API để lấy dữ liệu cây đơn vị
    const result = await organizationApi.getTree();
    // Nếu gọi API thành công và có dữ liệu trả về, thì map dữ liệu về format của DMTreeSelect
    if (result.isSuccess && result.data) {
      // Lưu dữ liệu cây đơn vị đã map vào ref để dùng cho DMTreeSelect
      orgTreeData.value = mapOrgTree(result.data);
      // Tự chọn tất cả org đầu tiên khi thêm mới
      if (!props.editId && !props.viewId && orgTreeData.value.length > 0) {
        // Hàm đệ quy để lấy tất cả id của node và con cháu
        const firstNode = orgTreeData.value[0];
        const getAllIds = (node) => {
          const ids = [node.id];
          if (node.children?.length) {
            for (const child of node.children) ids.push(...getAllIds(child));
          }
          return ids;
        };
        // Gán tất cả id vào selectedOrgs để tự chọn hết cây đơn vị đầu tiên
        selectedOrgs.value = getAllIds(firstNode);
      }
    }
  } catch (err) {
    console.error("[FormSalaryComposition] fetchOrgTree:", err);
  }
}

/**
 * Đổi format dữ liệu cây đơn vị để tương thích với DMTreeSelect
 *
 * Sử dụng khi: Có dữ liệu trả về từ API getTree
 *
 * @param {Array} nodes Danh sách node
 * @returns {Array} Danh sách đã map
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function mapOrgTree(nodes) {
  // Đệ quy để map từng node về format { id, label, children }
  return nodes.map((node) => ({
    id: node.organizationId,
    label: node.organizationName,
    children: node.children ? mapOrgTree(node.children) : [],
  }));
}

/**
 * Xây dựng flat map { id -> label } và { label -> id } từ orgTreeData
 *
 * Sử dụng khi: Cần restore selectedOrgs khi backend trả về organizationName
 *
 * @returns {Object} Object chứa byId và byName
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function buildOrgFlatMap() {
  // Duyệt toàn bộ cây đơn vị để xây 2 dictionary dùng lại nhiều lần:
  // - byId: tra từ id ra tên đơn vị để hiển thị nhanh
  // - byName: tra ngược từ tên chuẩn hóa ra id khi backend chỉ trả organizationName
  const byId = {};
  const byName = {};
  // Hàm đệ quy đi qua từng node và toàn bộ con cháu của node đó.
  const walk = (nodes) => {
    for (const n of nodes) {
      // Ví dụ:
      // byId["pb-ke-toan"] = "Phòng kế toán"
      byId[n.id] = n.label;
      // Chuẩn hóa tên về lowercase + trim để tăng khả năng khớp khi backend trả chuỗi text.
      // Ví dụ:
      // byName["phòng kế toán"] = "pb-ke-toan"
      byName[n.label.toLowerCase().trim()] = n.id;
      if (n.children?.length) walk(n.children);
    }
  };
  walk(orgTreeData.value);
  return { byId, byName };
}

/**
 * Restore danh sách đơn vị đã chọn từ dữ liệu API
 *
 * Sử dụng khi: Tải dữ liệu chi tiết của 1 bản ghi
 *
 * @param {Object} data Dữ liệu từ API chứa organizationIds hoặc organizationName
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function restoreSelectedOrgs(data) {
  // Trường hợp 1: backend trả về mảng organizationIds
  if (Array.isArray(data.organizationIds) && data.organizationIds.length > 0) {
    // Có sẵn danh sách id rồi thì dùng trực tiếp, không cần suy luận thêm.
    selectedOrgs.value = data.organizationIds;
    return;
  }
  // Trường hợp 2: backend trả về chuỗi organizationId (single guid)
  if (data.organizationId && typeof data.organizationId === "string") {
    // Chuẩn hóa về cùng format mảng để đồng nhất với v-model của DMTreeSelect.
    selectedOrgs.value = [data.organizationId];
    return;
  }
  // Trường hợp 3: chỉ có organizationName → tra ngược qua byName
  if (data.organizationName && typeof data.organizationName === "string") {
    const { byName } = buildOrgFlatMap();
    // Ví dụ backend trả:
    // "Phòng kế toán, Phòng nhân sự"
    // Sau split/map sẽ thành:
    // ["phòng kế toán", "phòng nhân sự"]
    const names = data.organizationName
      .split(",")
      .map((s) => s.trim().toLowerCase());
    // Map từng tên chuẩn hóa về id tương ứng trong cây đơn vị.
    // Nếu tên nào không tìm thấy thì byName[name] sẽ là undefined.
    const ids = names.map((name) => byName[name]).filter(Boolean);
    // Chỉ giữ lại các id tra được hợp lệ; nếu không khớp tên nào thì trả về mảng rỗng.
    selectedOrgs.value = ids.length > 0 ? ids : [];
    return;
  }
  // Không có dữ liệu tổ chức ở bất kỳ format nào thì reset về rỗng.
  selectedOrgs.value = [];
}

// VARIABLE:
// ─────────────────── Form data ───────────────────────
// các ref để focus vào input khi có lỗi
const salaryCompositionNameRef = ref(null);
const salaryCompositionCodeRef = ref(null);
const compositionTypeRef = ref(null);
const compositionNatureRef = ref(null);
const quotaRef = ref(null);
const formulaRef = ref(null);

// loại thuế (chịu thuế, không chịu thuế, giảm trừ thuế)
const selectedTax = ref(SalaryCompositionTaxable.Taxable);
// có giảm trừ thuế không
const isDeductedTax = ref(false);
// có cho phép vượt định mức không
const isOverLimit = ref(false);

const optionsValue = [
  {
    value: "tu_dong_cong",
    label: "Tự động cộng tổng giá trị của các nhân viên",
  },
  { value: "cong_thuc_co_san", label: "Tính theo công thức tự đặt" },
];
const selectedOptionsValue = ref(optionsValue[1].value);

const optionsValueCombobox = [
  {
    value: "option1",
    label: "Trong cùng đơn vị công tác",
    iconClass: "mi-info-blue",
  },
  { value: "option2", label: "Dưới quyền", iconClass: "mi-info-blue" },
  {
    value: "option3",
    label: "Thuộc cơ cấu tổ chức",
    iconClass: "mi-info-blue",
  },
];
const selectedOptionsValueCombobox = ref(optionsValueCombobox[0].value);

const levelOptions = [
  { value: "cap1", label: "Cấp 1" },
  { value: "cap2", label: "Cấp 2" },
  { value: "cap3", label: "Cấp 3" },
  { value: "cap4", label: "Cấp 4" },
];
const selectedLevel = ref(levelOptions[3].value);

const selectedSalaryCoposition = ref(null);

// Danh sách tham số (thành phần lương) cho popup Định mức
const formulaParameters = ref([]);

/**
 * Lấy danh sách thành phần lương dùng làm tham số cho công thức
 *
 * Sử dụng khi: Component được mount
 *
 * @returns {Promise<void>}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
async function fetchFormulaParameters() {
  try {
    // Gọi API để lấy tất cả thành phần lương
    const result = await salaryCompositionApi.getAll();
    if (result.isSuccess && Array.isArray(result.data)) {
      // Map dữ liệu thành format { name, code, description } để dùng cho DMFormula
      formulaParameters.value = result.data.map((item) => ({
        name: item.salaryCompositionName || "",
        code: item.salaryCompositionCode || "",
        description: item.description || "",
        displayLabel: `${item.salaryCompositionName || ""} (${item.salaryCompositionCode || ""})`
      }));
    }
  } catch (err) {
    console.error("[FormSalaryComposition] fetchFormulaParameters:", err);
  }
}

// Dùng SalaryCompositionTypeOptions từ enums (số nguyên khớp backend)
const categoryOptions = SalaryCompositionTypeOptions;

// Dùng SalaryCompositionTaxableOptions từ enums (số nguyên khớp backend)
const taxOptions = SalaryCompositionTaxableOptions;

// Dữ liệu form chính, bind với các input thông qua v-model
const formData = ref({
  salaryCompositionId: "",
  salaryCompositionSystemId: null,
  salaryCompositionCode: "",
  salaryCompositionName: "",
  organizationName: "",
  compositionType: null, // SalaryCompositionType enum (1-9), bắt buộc chọn
  compositionNature: SalaryCompositionNature.Income, // mặc định: Thu nhập (1)
  taxable: null, // SalaryCompositionTaxable enum (1/2/3) hoặc null
  taxDeduction: null, // SalaryCompositionTaxDeduction enum (Yes=1, No=0) hoặc null
  quota: null,
  valueType: SalaryCompositionValueType.Currency, // mặc định: Tiền tệ (2)
  formula: "",
  description: "",
  optionShowPaycheck: SalaryCompositionShowPaycheck.Show, // mặc định: Có (1)
  sourceType: SalaryCompositionSourceType.Custom, // mặc định: Tự thêm (1)
  status: SalaryCompositionStatus.Following, // mặc định: Đang theo dõi (1)
  createdDate: "",
  modifiedDate: "",
});

// Computed property để xác định có hiển thị label "Giá trị" cho trường công thức hay không
const hasFormulaLabel = computed(
  () =>
    formData.value.valueType !== SalaryCompositionValueType.Number &&
    formData.value.valueType !== SalaryCompositionValueType.Currency,
);

/**
 * Tải dữ liệu bản ghi vào form
 *
 * Sử dụng khi: Form được mở ở chế độ xem, sửa hoặc nhân bản
 *
 * @param {string} id ID bản ghi
 * @param {boolean} isDuplicate True nếu đang ở chế độ nhân bản
 * @returns {Promise<void>}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
async function loadData(id, isDuplicate = false) {
  // Nếu không có ID thì không làm gì (trường hợp thêm mới)
  if (!id) return;
  try {
    // Gọi API để lấy dữ liệu chi tiết của bản ghi theo ID
    const result = await salaryCompositionApi.getById(id);
    if (result.isSuccess && result.data) {
      // Map dữ liệu trả về từ API vào formData, nếu là nhân bản thì reset mã/tên và các trường liên quan đến định danh
      const data = result.data;
      formData.value = {
        salaryCompositionId: isDuplicate ? "" : (data.salaryCompositionId ?? ""),
        salaryCompositionSystemId: isDuplicate ? null : (data.salaryCompositionSystemId ?? null),
        salaryCompositionCode: isDuplicate ? "" : (data.salaryCompositionCode ?? ""),
        salaryCompositionName: isDuplicate ? "" : (data.salaryCompositionName ?? ""),
        organizationName: data.organizationName ?? "",
        compositionType: data.compositionType ?? "",
        compositionNature:
          data.compositionNature ?? SalaryCompositionNature.Income,
        taxable: data.taxable ?? "",
        taxDeduction: data.taxDeduction ?? "",
        quota: data.quota ?? null,
        valueType: data.valueType ?? SalaryCompositionValueType.Currency,
        formula: data.formula ?? "",
        description: data.description ?? "",
        optionShowPaycheck:
          data.optionShowPaycheck ?? SalaryCompositionShowPaycheck.Show,
        sourceType: data.sourceType ?? SalaryCompositionSourceType.Custom,
        status: isDuplicate ? SalaryCompositionStatus.Following : (data.status ?? SalaryCompositionStatus.Following),
        createdDate: isDuplicate ? "" : (data.createdDate ?? ""),
        modifiedDate: isDuplicate ? "" : (data.modifiedDate ?? ""),
      };
      // Restore selectedTax từ taxable enum
      if (data.taxable) selectedTax.value = data.taxable;
      // Restore isDeductedTax từ taxDeduction enum
      isDeductedTax.value = data.taxDeduction === SalaryCompositionTaxDeduction.Yes;
      // Restore đơn vị áp dụng vào DMTreeSelect
      restoreSelectedOrgs(data);
    }
  } catch (err) {
    console.error("[FormSalaryComposition] loadData:", err);
  }
}

// ───────────────────────────────────────────────
// VARIABLE:
// ── Validation ───────────────────────────────────────────────
// touchedFields để track xem trường nào đã được tương tác (blur) để hiển thị lỗi
const touchedFields = ref({});
// customErrorMessages để lưu lỗi tùy chỉnh từ validate của DMFormula
const customErrorMessages = ref({});

//FUNCTION:
// Hàm kiểm tra giá trị có bị coi là "empty" hay không (null, undefined, chuỗi rỗng, hoặc mảng rỗng)
const isEmptyValue = (value) => {
  // Nếu là mảng, coi là empty nếu length === 0
  if (Array.isArray(value)) return value.length === 0; //return true nếu là mảng rỗng
  // return true nếu là null, undefined, chuỗi rỗng hoặc chuỗi chỉ có khoảng trắng
  return value === null || value === undefined || String(value).trim() === "";
};

// Hàm tạo rule bắt buộc với message tùy chỉnh
const requiredRule = (message) => (value) =>
  isEmptyValue(value) ? message : "";

// Hàm tạo rule giới hạn độ dài
const maxLengthRule = (maxLength, message) => (value) =>
  (value && value.length > maxLength) ? message : "";

// Hàm tạo rule lấy lỗi tùy chỉnh từ customErrorMessages
const customErrorRule = (field) => () => customErrorMessages.value[field] || "";

// Định nghĩa các rule validation cho từng trường, có thể có nhiều rule cho 1 trường
const validationRules = {
  salaryCompositionName: [
    requiredRule("Không được để trống"),
    maxLengthRule(255, "Tên không được vượt quá 255 ký tự")
  ],
  salaryCompositionCode: [
    requiredRule("Không được để trống"),
    maxLengthRule(255, "Mã không được vượt quá 255 ký tự")
  ],
  compositionNature: [requiredRule("Không được để trống")],
  compositionType: [requiredRule("Không được để trống")],
  quota: [customErrorRule("quota")],
  formula: [customErrorRule("formula")],
};

// Map các ref của trường vào 1 object để dễ dàng truy cập khi focus lỗi
const fieldRefs = {
  salaryCompositionName: salaryCompositionNameRef,
  salaryCompositionCode: salaryCompositionCodeRef,
  compositionType: compositionTypeRef,
  compositionNature: compositionNatureRef,
  quota: quotaRef,
  formula: formulaRef,
};

// Object.keys(validationRules) trả về mảng tên field cần validate.
// Ví dụ mảng thực tế sẽ có dạng:
// ["salaryCompositionName", "salaryCompositionCode", "compositionNature", "compositionType", "quota", "formula"]
const arrValidationRuleFields = Object.keys(validationRules);

// errorMessages để lưu message lỗi hiện tại của từng trường, được cập nhật sau mỗi lần validate
const initialErrorMessages = {};
for (const field of arrValidationRuleFields) {
  initialErrorMessages[field] = "";
}
const errorMessages = ref(initialErrorMessages);// Khởi tạo errorMessages với tất cả trường có rule đều là rỗng (không lỗi)

// Hàm kiểm tra xem trường đã bị touch (blur) hay chưa để quyết định có hiển thị lỗi hay không
const isTouched = (field) => Boolean(touchedFields.value[field]);

// Hàm validate 1 trường cụ thể, trả về true nếu hợp lệ, false nếu có lỗi
const validateField = (field) => {
  // Lấy các rule của trường, kết quả sẽ lấy được mảng các rule của field
  const rules = validationRules[field] || [];
  // Chạy từng rule theo thứ tự từ trên xuống dưới.
  // Gặp rule nào trả về message lỗi đầu tiên thì dừng lại luôn để hiển thị lỗi đó.
  let firstErrorMessage = "";
  for (const rule of rules) {
    const ruleResult = rule(formData.value[field], formData.value);
    if (ruleResult) {
      firstErrorMessage = ruleResult;
      break;
    }
  }
  errorMessages.value[field] = firstErrorMessage;
  return firstErrorMessage === "";
};

/**
 * Kiểm tra tính hợp lệ của toàn bộ form
 *
 * Sử dụng khi: Người dùng click nút Lưu
 *
 * @returns {boolean} True nếu form hợp lệ
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const validateForm = () => {
  // Validate tất cả các trường có rule, đồng thời cập nhật errorMessages
  const results = arrValidationRuleFields.map(validateField);
  return results.every((result) => result === true);
};

const showFormulaValidationToast = () => {
  const message = errorMessages.value.quota || errorMessages.value.formula;
  if (message) addToast(message, "error");
};

// Hàm lấy tên trường đầu tiên có lỗi để focus vào đó
const getFirstErrorField = () => {
  return arrValidationRuleFields.find(
    (field) => errorMessages.value[field],
  );
};

// Hàm lấy element có thể focus trong trường hợp cần scroll vào view và focus khi có lỗi
const getFocusableElement = (fieldRef) => {
  const target = fieldRef?.value;
  if (!target) return null;
  if (typeof target.focus === "function") return target;
  return target.$el?.querySelector(
    "input, textarea, button, [tabindex]:not([tabindex='-1']), .multiselect",
  );
};

// Hàm focus vào trường đầu tiên có lỗi sau khi validate, đồng thời scroll vào view nếu cần
const focusFirstErrorField = async () => {
  await nextTick();
   // 1. Tìm cái tên ô bị lỗi đầu tiên
  const firstErrorField = getFirstErrorField();
  if (!firstErrorField) return;
   // 2. Tìm cái thẻ HTML của ô đó để chuẩn bị tương tác
  const focusableElement = getFocusableElement(fieldRefs[firstErrorField]);
  if (!focusableElement) return;
  // 3. Scroll vào view và focus vào ô đó
  focusableElement.$el?.scrollIntoView?.({
    behavior: "smooth",
    block: "center",
  });
  // 4. Bắt con trỏ chuột nhảy thẳng vào ô đó để người dùng sửa luôn
  focusableElement.scrollIntoView?.({ behavior: "smooth", block: "center" });
  focusableElement.focus?.();
   // 5. Hiện chữ đỏ báo lỗi cho ô đó
  await nextTick();
  touchedFields.value[firstErrorField] = true;
};

// Hàm set lỗi tùy chỉnh từ validate của DMFormula, nhận field và message lỗi
const setCustomError = (field, message) => {
  customErrorMessages.value[field] = message;
  validateField(field);
};

// Hàm đánh dấu trường đã bị touch (blur) để hiển thị lỗi, đồng thời gọi validateField để cập nhật lỗi
const markTouched = (field) => {
  touchedFields.value[field] = true;
  validateField(field);
};

// Hàm xử lý khi người dùng nhập liệu, nếu xóa rỗng thì validate ngay
const handleFieldValueChange = (field, value) => {
  if (isEmptyValue(value)) {
    markTouched(field);
  } else if (touchedFields.value[field]) {
    validateField(field);
  }
};

// Hàm bỏ đánh dấu touch của trường, thường gọi khi focus vào trường để ẩn lỗi
const unMarkTouched = (field) => {
  touchedFields.value[field] = false;
};

// Hàm đánh dấu tất cả các trường đã bị touch, thường gọi khi submit để hiển thị lỗi của tất cả trường
const touchAll = () => {
  for (const field of arrValidationRuleFields) {
    touchedFields.value[field] = true;
  }
};

// ── Build payload gửi API ────────────────────────────────────
/**
 * Tạo payload chứa dữ liệu form để gửi lên API
 *
 * Sử dụng khi: Chuẩn bị gửi dữ liệu lên BE khi nhấn Lưu
 *
 * @returns {Object} Dữ liệu payload
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function buildPayload() {
  // Map selectedOrgs (mảng ID) sang labels thông qua flatMap
  const flatOrgMap = {};
  const walkOrg = (nodes) => {
    for (const n of nodes) {
      flatOrgMap[n.id] = n.label;
      if (n.children?.length) walkOrg(n.children);
    }
  };
  walkOrg(orgTreeData.value);

  const orgNames = selectedOrgs.value
    .map((id) => flatOrgMap[id])
    .filter(Boolean);

  return {
    salaryCompositionSystemId: formData.value.salaryCompositionSystemId || null,
    salaryCompositionCode: formData.value.salaryCompositionCode.trim(),
    salaryCompositionName: formData.value.salaryCompositionName.trim(),
    organizationIds: [...selectedOrgs.value],
    organizationName:
      orgNames.length > 0
        ? orgNames.join(", ")
        : formData.value.organizationName || null,
    compositionType: formData.value.compositionType, // số nguyên từ SalaryCompositionTypeOptions
    compositionNature: formData.value.compositionNature, // số nguyên (1/2/3)
    taxable:
      formData.value.compositionNature === SalaryCompositionNature.Income
        ? selectedTax.value // số nguyên từ SalaryCompositionTaxableOptions
        : null,
    taxDeduction:
      formData.value.compositionNature === SalaryCompositionNature.Deduction
        ? isDeductedTax.value
          ? SalaryCompositionTaxDeduction.Yes  // 1
          : SalaryCompositionTaxDeduction.No   // 0
        : null,
    quota: formData.value.quota ?? null,
    valueType: formData.value.valueType, // số nguyên (1-5)
    formula: formData.value.formula || null,
    description: formData.value.description || null,
    optionShowPaycheck: formData.value.optionShowPaycheck, // số nguyên (1/2/3)
    sourceType: SalaryCompositionSourceType.Custom, // luôn là 1 (Tự thêm)
    status: formData.value.status, // số nguyên (1/2)
  };
}

async function buildSystemUsagePayloadByCode(code) {
  let data;
  try {
    const result = await salaryCompositionSystemApi.getByCode(code);
    data = result?.data;
  } catch {
    throw new Error("Không tìm thấy thành phần lương mặc định tương ứng");
  }

  if (!data) {
    throw new Error("Không tìm thấy thành phần lương mặc định tương ứng");
  }

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
    sourceType: SalaryCompositionSourceType.Default,
    status: data.status,
  };
}
async function handleSystemDuplicateSelection(selectedOption, andAdd) {
  if (!selectedOption) {
    return;
  }

  isSubmitting.value = true;
  try {
    let result;

    if (selectedOption === "use-system-default") {
      const payload = await buildSystemUsagePayloadByCode(formData.value.salaryCompositionCode);
      result = await salaryCompositionApi.create(payload);
    } else if (selectedOption === "continue-create-custom") {
      const payload = buildPayload();
      result = await salaryCompositionApi.createIgnoringSystemCode(payload);
    } else {
      return;
    }

    await handleSubmitSuccess(result, andAdd);
  } catch (err) {
    const errDMg = err.data?.userMessage || err.message || "Có lỗi xảy ra, vui lòng thử lại";
    addToast(errDMg, "error");
  } finally {
    isSubmitting.value = false;
  }
}

async function handleSubmitSuccess(result, andAdd) {
  if (!result?.isSuccess) {
    const errDMg = result?.data || "Có lỗi xảy ra, vui lòng thử lại";
    emit("openAlert", {
      title: "Lưu không thành công",
      message: errDMg,
      showConfirmButton: false,
      cancelText: "Đóng",
    });
    return;
  }

  if (andAdd) {
    emit("saved", { data: result.data, isEdit: isEditMode.value && !!currentEditId.value });
    resetForm();
    await nextTick();
    salaryCompositionNameRef.value?.focus?.();
    addToast("Lưu thành công", "success");
    return;
  }

  emit("saved", {
    data: result.data,
    isEdit: isEditMode.value && !!currentEditId.value,
    showToast: true
  });
  emit("close");
}

// ── Submit handlers ─────────────────────────────────────────
/**
 * Xử lý sự kiện lưu form
 *
 * Sử dụng khi: Người dùng click nút Lưu
 *
 * @returns {Promise<void>}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
async function handleSubmit() {
  touchAll();
  if (!validateForm()) {
    showFormulaValidationToast();
    await focusFirstErrorField();
    return;
  }
  await submitForm(false);
}

/**
 * Xử lý sự kiện lưu và tiếp tục thêm mới
 *
 * Sử dụng khi: Người dùng click nút Lưu và thêm
 *
 * @returns {Promise<void>}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
async function handleSubmitAndAdd() {
  touchAll();
  if (!validateForm()) {
    showFormulaValidationToast();
    await focusFirstErrorField();
    return;
  }
  await submitForm(true);
}

/**
 * Thực thi quá trình submit form (gọi API Create/Update)
 *
 * Sử dụng khi: Có yêu cầu lưu form sau khi đã qua bước validate
 * @param {boolean} andAdd Cờ xác định có tiếp tục thêm mới sau khi lưu thành công không
 * @returns {Promise<void>}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
async function submitForm(andAdd = false) {
  // Set trạng thái đang submit để disable nút và tránh submit trùng
  isSubmitting.value = true;
  try {
    // Build payload từ formData để gửi lên API
    const payload = buildPayload();
    let result;
    // Nếu đang ở edit mode và có currentEditId thì gọi API update, ngược lại gọi API create
    if (isEditMode.value && currentEditId.value) {
      // Cập nhật
      result = await salaryCompositionApi.update(
        currentEditId.value,
        payload,
      );
    } else {
      // Thêm mới
      result = await salaryCompositionApi.create(payload);
    }

    await handleSubmitSuccess(result, andAdd);
  } catch (err) {
    console.error("[FormSalaryComposition] submitForm:", err);
    if (
      !isEditMode.value &&
      err.data?.errorCode === ErrorCodes.DUPLICATE_WITH_SYSTEM_CODE
    ) {
      const duplicateCode = formData.value.salaryCompositionCode.trim();
      emit("openAlert", {
        title: "Thông báo",
        message: `Đã tìm thấy một thành phần lương mặc định của hệ thống có cùng mã <strong style="color: #6f2dbd;">${duplicateCode}</strong>. Chọn thao tác bạn muốn thực hiện với đối tượng này:`,
        cancelText: "Hủy bỏ",
        confirmText: "Đồng ý",
        confirmType: "green",
        options: [
          { value: "use-system-default", label: "Sử dụng thành phần lương mặc định" },
          { value: "continue-create-custom", label: "Tiếp tục thêm mới thành phần lương này" },
        ],
        onConfirm: async (selectedOption) => {
          await handleSystemDuplicateSelection(selectedOption, andAdd);
        },
      });
      return;
    }

    const errDMg = err.data?.userMessage || "Có lỗi xảy ra, vui lòng thử lại";
    addToast(errDMg, "error");
  } finally {
    isSubmitting.value = false;
  }
}

/**
 * Reset form về trạng thái ban đầu
 *
 * Sử dụng khi: Lưu và thêm thành công, cần làm mới các trường để nhập tiếp
 *
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function resetForm() {
  formData.value = {
    salaryCompositionId: "",
    salaryCompositionSystemId: null,
    salaryCompositionCode: "",
    salaryCompositionName: "",
    organizationName: "",
    compositionType: null,
    compositionNature: SalaryCompositionNature.Income,
    taxable: null,
    taxDeduction: null,
    quota: null,
    valueType: SalaryCompositionValueType.Currency,
    formula: "",
    description: "",
    optionShowPaycheck: SalaryCompositionShowPaycheck.Show,
    sourceType: SalaryCompositionSourceType.Custom,
    status: SalaryCompositionStatus.Following,
    createdDate: "",
    modifiedDate: "",
  };
  // Reset các biến phụ trợ
  selectedTax.value = SalaryCompositionTaxable.Taxable;
  isDeductedTax.value = false;
  isOverLimit.value = false;
  isCodeManuallyEdited.value = false;
  // Restore default org selection (giống khi mới mở form)
  if (orgTreeData.value.length > 0) {
    const firstNode = orgTreeData.value[0];
    const getAllIds = (node) => {
      const ids = [node.id];
      if (node.children?.length) {
        for (const child of node.children) ids.push(...getAllIds(child));
      }
      return ids;
    };
    selectedOrgs.value = getAllIds(firstNode);
  } else {
    selectedOrgs.value = [];
  }
  touchedFields.value = {};
  customErrorMessages.value = {};
  // Không reset isEditMode ở đây để tránh submit lần sau thành create thay vì update
  // isEditMode sẽ được reset khi form đóng (handleCloseForm)
}

// ── Đóng form với confirm nếu đã nhập dữ liệu ───────────────
/**
 * Xử lý sự kiện đóng form
 *
 * Sử dụng khi: Người dùng nhấn nút Hủy hoặc nút Quay lại
 *
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const handleCloseForm = () => {
  // Chế độ xem: không có dữ liệu chưa lưu → thoát thẳng, không cần confirm
  if (isViewMode.value) {
    emit("close");
    return;
  }

  emit("openAlert", {
    title: "Thoát và không lưu?",
    message: "Nếu bạn thoát, các dữ liệu đang nhập liệu sẽ không được lưu lại.",
    showConfirmButton: true,
    cancelText: "Ở lại",
    confirmText: "Thoát, không lưu",
    cancelType: "none",
    confirmType: "green",
    onConfirm: () => emit("close"),
  });
};

// Auto-fill mã thành phần khi nhập tên (chỉ khi chưa edit mode và chưa sửa mã thủ công)
// trạng thái kiểm tra xem người dùng có tự sửa mã thành phần lương không
const isCodeManuallyEdited = ref(false);

// Theo dõi nếu người dùng tự sửa mã
watch(
  () => formData.value.salaryCompositionCode,
  (newCode) => {
    const autoCode = toCompositionCode(formData.value.salaryCompositionName);
    if (newCode !== autoCode) {
      isCodeManuallyEdited.value = true;
    }
  },
  { flush: "sync" },
);

// Watch tên thành phần → auto-fill mã
watch(
  () => formData.value.salaryCompositionName,
  (newName) => {
    if (!isEditMode.value && !isViewMode.value && !isCodeManuallyEdited.value) {
      const autoCode = toCompositionCode(newName);
      formData.value.salaryCompositionCode = autoCode;

      // Mã được sinh từ tên nên khi tên bị xóa, mã cũng phải validate required ngay.
      if (isEmptyValue(autoCode)) {
        markTouched("salaryCompositionCode");
      } else if (touchedFields.value.salaryCompositionCode) {
        validateField("salaryCompositionCode");
      }
    }
  },
);

/**
 * Tạo mã thành phần tự động từ tên thành phần
 * convert dấu cách thành _, bỏ dấu tiếng Việt, chuyển thành chữ hoa
 *
 * Sử dụng khi: Auto-fill mã dựa vào tên khi người dùng chưa sửa mã thủ công
 *
 * @param {string} name Tên thành phần lương
 * @returns {string} Mã được tạo tự động
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
function toCompositionCode(name) {
  return (name || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]/g, "");
}

onMounted(async () => {
  // Load dữ liệu cây đơn vị để hiển thị trong DMTreeSelect
  await fetchOrgTree();
  // Load danh sách tham số cho popup công thức
  fetchFormulaParameters();

  if (props.editId) {
    await loadData(props.editId, false);
  } else if (props.duplicateId) {
    // Mode nhân bản: load data nhưng cờ isDuplicate = true
    await loadData(props.duplicateId, true);
  } else if (props.viewId) {
    // Task 2: load dữ liệu để xem chi tiết
    await loadData(props.viewId, false);
  }

  // Sau khi đã load data, focus vào tên thành phần
  await nextTick();
  if (!isViewMode.value) {
    salaryCompositionNameRef.value?.focus?.();
  }
});
</script>
<style scoped>
.content_body_wrapper {
  width: 100%;
  flex: 1;
  background-color: #f8f9fa;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.content_body_wrapper_form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  overflow: auto;
  padding: 40px 120px 40px 40px;
  border-bottom: 1px solid #d9dee7;
}

.content_body_wrapper_form.is-view-mode {
  opacity: 0.92;
}

.content_header_left_icon {
  display: flex;
  align-items: center;
  gap: 8px;
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
  padding: 12px 16px 16px;
  min-width: 0;
  min-height: 0;
}

.content_body_footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 12px;
  background-color: #f1f2f1;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  font-size: 14px;
}

.footer-right :deep(.ms-button--none) {
  background: #fff;
}

.footer-right :deep(.ms-button ) {
  height: 32px;
}

.footer-right :deep(.ms-button--green ) {
  width: 80px;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

.content_header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.type_salary_wrapper {
  display: flex;
  gap: 16px;
}

.type_salary {
  display: flex;
  align-items: center;
  justify-items: center;
}

:deep(.text-area) {
  line-height: 20px !important;
  padding-top: 8px !important;
  padding-bottom: 8px !important;
}

.is-over-limit {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-left: 200px;
}

.value-select-row {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

:deep(.mi-pencil){
  margin-right: 4px;
}
.value-select-row > .ms-select:last-child {
  flex: 1 1 0;
  min-width: 0;
}

.value-select-row > .ms-select:first-child {
  flex: 0 0 315px;
}

.formula-field {
  position: relative;
}

.formula-btn {
  position: absolute;
  bottom: 5px;
  right: 3px;
  z-index: 2;
background: linear-gradient(270deg, #efe9ff 7.74%, #f0f8ff 40.17%, #dff8ff 64.73%, #f3f3ff 84.04%);
border: 1px solid #DAE5FF;
border-radius: 14px;
height:32px;
}

:deep(.ms-button--icon-only.ms-button--shape-circle){
  width:39px !important;
}

.formula-field--with-label .formula-btn {
  left: 208px;
}

:deep(.ms-input--horizontal .ms-input-in.wd-315) {
  flex: 0 0 315px;
  width: 315px;
}

.content_header_right{
  display: flex;
  align-items: center;
}

/* ── Form field wrapper + validate message ── */
.form-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.validate-msg {
  min-height: 18px;
  font-size: 12px;
  color: #f44336;
  line-height: 18px;
  padding-left: 200px;
}

.ms-multiselect__single-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
</style>
