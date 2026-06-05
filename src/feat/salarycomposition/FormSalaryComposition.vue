<template lang="">
  <div class="content_bg">
    <div class="content">
      <div class="content_header">
        <div>
          <div class="content_header_left_icon">
            <MsButton
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
      </div>
      <div class="content_body_wrapper">
        <div
          :class="['content_body_wrapper_form', { 'is-view-mode': isViewMode }]"
        >
          <!-- Tên thành phần -->
          <div class="form-field">
            <MsInput
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
            <MsInput
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
            <MsTreeSelect
              label="Đơn vị áp dụng"
              horizontal
              placeholder="Chọn đơn vị..."
              :options="orgTreeData"
              v-model="selectedOrgs"
            />
            <div class="validate-msg"></div>
          </div>

          <!-- Loại thành phần lương -->
          <div class="form-field">
            <MsSelect
              ref="compositionTypeRef"
              :data="categoryOptions"
              label-text="Loại thành phần lương"
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
              <MsSelect
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
                <MsRadio
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
                <MsCheckbox
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
            <MsFormula
              ref="quotaRef"
              id="input_limit_salary"
              label="Định mức"
              horizontal
              placeholder="Tự động gợi ý công thức và tham số khi gõ"
              v-model="formData.quota"
              :variables="formulaVariables"
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
            <MsCheckbox
              v-model="isOverLimit"
              label="Cho phép giá trị tính vượt qua định mức"
            />
            <MsButton
              iconLeft="mi-circle-info"
              tooltipPosition="bottom"
              tooltipMessage="Nếu không tích chọn thì khi tính giá trị thành phần lương này mà vượt quá định mức thì hệ thống sẽ tự lấy tối đa bằng định mức đã nhập"
              shapeBtn="circle"
            />
          </div>

          <!-- Kiểu giá trị -->
          <div class="form-field">
            <MsSelect
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
            <MsRadio
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
              <MsSelect
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
              </MsSelect>
              <MsSelect
                v-if="selectedOptionsValue !== optionsValue[1].value"
                v-model="selectedSalaryCoposition"
                :data="salaryCompositionOptions"
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
            <MsFormula
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
              :variables="formulaVariables"
              :parameters="formulaParameters"
              @validate="setCustomError('formula', $event[0] || '')"
              @blur="markTouched('formula')"
              @focus="unMarkTouched('formula')"
            />
            <div class="validate-msg">
              {{ isTouched("formula") ? errorMessages.formula : "" }}
            </div>
            <MsButton
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
            <MsRadio
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
            <MsInput
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
        <div class="content_body_footer">
          <div class="footer-right">
            <MsButton
              message="Hủy bỏ"
              :isTooltip="false"
              class="border-gray fz-14"
              @click="handleCloseForm"
            />
            <template v-if="!isViewMode">
              <MsButton
                message="Lưu và thêm"
                :isTooltip="false"
                class="fz-14"
                type="border-green"
                @click="handleSubmitAndAdd"
                :disabled="isSubmitting"
              />
              <MsButton
                message="Lưu"
                :isTooltip="false"
                class="fz-14"
                type="green"
                @click="handleSubmit"
                :disabled="isSubmitting"
              />
            </template>
            <MsButton
              v-else-if="!formData.salaryCompositionSystemId"
              message="Chỉnh sửa"
              :isTooltip="false"
              class="fz-14"
              type="green"
              @click="switchToEditMode"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast n\u1ed9i b\u1ed9 form (Req 4) -->
  <MsToastContainer :toasts="toasts" @close="removeToast" />
</template>
<script setup>
import MsButton from "@/components/base/MsButton.vue";
import MsInput from "@/components/base/MsInput.vue";
import MsTreeSelect from "@/components/base/MsTreeSelect/MsTreeSelect.vue";
import MsSelect from "@/components/base/MsSelect.vue";
import MsRadio from "@/components/base/MsRadio.vue";
import MsCheckbox from "@/components/base/MsCheckbox.vue";
import MsFormula from "@/components/base/MsFormula/MsFormula.vue";
import MsToastContainer from "@/components/overlay/MsToast/MsToastContainer.vue";
import { computed, nextTick, onMounted, ref, watch } from "vue";

// ── Import services ──────────────────────────────────────────
import salaryCompositionApi from "@/services/salaryCompositionService";
import organizationApi from "@/services/organizationService";

// ── Import enum constants ────────────────────────────────────
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

const isHoverAgent = ref(false);

// ── Props & Emits ─────────────────────────────────────────────
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

const emit = defineEmits(["openAlert", "close", "saved"]);

// ── Toast nội bộ form ────────────────────────────────────────────
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

const isEditMode = ref(!!props.editId);
const isViewMode = ref(!!props.viewId);
const isSubmitting = ref(false);

// ID của bản ghi đang edit (tách riêng khỏi formData để không bị mất khi resetForm)
const currentEditId = ref(props.editId || null);

// Chuyển từ view mode sang edit mode
function switchToEditMode() {
  isViewMode.value = false;
  isEditMode.value = true;
  // Lưu lại ID của bản ghi đang xem để dùng khi submit update
  currentEditId.value = formData.value.salaryCompositionId || props.viewId;
}

// ── Org Tree ─────────────────────────────────────────────────
const orgTreeData = ref([]);
const selectedOrgs = ref([]);

async function fetchOrgTree() {
  try {
    const result = await organizationApi.getTree();
    if (result.isSuccess && result.data) {
      orgTreeData.value = mapOrgTree(result.data);
      // Task 7: Tự chọn tất cả org đầu tiên khi thêm mới
      if (!props.editId && !props.viewId && orgTreeData.value.length > 0) {
        const firstNode = orgTreeData.value[0];
        const getAllIds = (node) => {
          const ids = [node.id];
          if (node.children?.length) {
            for (const child of node.children) ids.push(...getAllIds(child));
          }
          return ids;
        };
        selectedOrgs.value = getAllIds(firstNode);
      }
    }
  } catch (err) {
    console.error("[FormSalaryComposition] fetchOrgTree:", err);
  }
}

function mapOrgTree(nodes) {
  return nodes.map((node) => ({
    id: node.organizationId,
    label: node.organizationName,
    children: node.children ? mapOrgTree(node.children) : [],
  }));
}

/**
 * Xây dựng flat map { id -> label } và { label -> id } từ orgTreeData
 * Dùng để restore selectedOrgs khi backend trả về organizationName (string)
 */
function buildOrgFlatMap() {
  const byId = {};
  const byName = {};
  const walk = (nodes) => {
    for (const n of nodes) {
      byId[n.id] = n.label;
      byName[n.label.toLowerCase().trim()] = n.id;
      if (n.children?.length) walk(n.children);
    }
  };
  walk(orgTreeData.value);
  return { byId, byName };
}

/**
 * Restore selectedOrgs từ dữ liệu API:
 * Ưu tiên dùng organizationIds (mảng GUID) nếu có;
 * Nếu không có, parse organizationName (chuỗi, phân cách bởi ", ") và tìm ID tương ứng
 */
function restoreSelectedOrgs(data) {
  // Trường hợp 1: backend trả về mảng organizationIds
  if (Array.isArray(data.organizationIds) && data.organizationIds.length > 0) {
    selectedOrgs.value = data.organizationIds;
    return;
  }
  // Trường hợp 2: backend trả về chuỗi organizationId (single guid)
  if (data.organizationId && typeof data.organizationId === "string") {
    selectedOrgs.value = [data.organizationId];
    return;
  }
  // Trường hợp 3: chỉ có organizationName → tra ngược qua byName
  if (data.organizationName && typeof data.organizationName === "string") {
    const { byName } = buildOrgFlatMap();
    const names = data.organizationName
      .split(",")
      .map((s) => s.trim().toLowerCase());
    const ids = names.map((name) => byName[name]).filter(Boolean);
    selectedOrgs.value = ids.length > 0 ? ids : [];
    return;
  }
  selectedOrgs.value = [];
}

// ── Form data ────────────────────────────────────────────────
const salaryCompositionNameRef = ref(null);
const salaryCompositionCodeRef = ref(null);
const compositionTypeRef = ref(null);
const compositionNatureRef = ref(null);
const quotaRef = ref(null);
const formulaRef = ref(null);

const selectedTax = ref(SalaryCompositionTaxable.Taxable);
const isDeductedTax = ref(false);
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
const selectedSalaryCoposition = ref(null);

// Danh sách biến thành phần lương dùng trong công thức
const formulaVariables = [
  "LUONG_CO_BAN",
  "DOANH_SO",
  "THUONG_KPI",
  "SO_NGAY_CONG",
  "SO_GIO_LAM",
  "PHAN_TRAM_HOAN_THANH",
  "BAO_HIEM_XH",
  "THUE_TNCN",
];

// Danh sách tham số (thành phần lương) cho popup Định mức
const formulaParameters = ref([]);

async function fetchFormulaParameters() {
  try {
    const result = await salaryCompositionApi.getAll();
    if (result.isSuccess && Array.isArray(result.data)) {
      formulaParameters.value = result.data.map((item) => ({
        name: item.salaryCompositionName || "",
        code: item.salaryCompositionCode || "",
        description: item.description || "",
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

const salaryCompositionOptions = [
  { value: "thanh_phan_a", label: "Thành phần A" },
  { value: "thanh_phan_b", label: "Thành phần B" },
  { value: "thanh_phan_c", label: "Thành phần C" },
];

// ── Form model ────────────────────────────────────────────────
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

const hasFormulaLabel = computed(
  () =>
    formData.value.valueType !== SalaryCompositionValueType.Number &&
    formData.value.valueType !== SalaryCompositionValueType.Currency,
);

// ── Populate form data (edit, view, or duplicate) ─────────────────
async function loadData(id, isDuplicate = false) {
  if (!id) return;
  try {
    const result = await salaryCompositionApi.getById(id);
    if (result.isSuccess && result.data) {
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
      // Restore selectedTax từ taxable (integer enum)
      if (data.taxable) selectedTax.value = data.taxable;
      // Restore isDeductedTax từ taxDeduction enum
      isDeductedTax.value = data.taxDeduction === SalaryCompositionTaxDeduction.Yes;
      // Restore đơn vị áp dụng vào MsTreeSelect
      restoreSelectedOrgs(data);
    }
  } catch (err) {
    console.error("[FormSalaryComposition] loadData:", err);
  }
}


// ── Validation ───────────────────────────────────────────────
const touchedFields = ref({});
const customErrorMessages = ref({});

const isEmptyValue = (value) => {
  if (Array.isArray(value)) return value.length === 0;
  return value === null || value === undefined || String(value).trim() === "";
};

const requiredRule = (message) => (value) =>
  isEmptyValue(value) ? message : "";
const customErrorRule = (field) => () => customErrorMessages.value[field] || "";

const validationRules = {
  salaryCompositionName: [requiredRule("Không được để trống")],
  salaryCompositionCode: [requiredRule("Không được để trống")],
  compositionNature: [requiredRule("Không được để trống")],
  compositionType: [requiredRule("Không được để trống")],
  quota: [customErrorRule("quota")],
  formula: [customErrorRule("formula")],
};

const fieldRefs = {
  salaryCompositionName: salaryCompositionNameRef,
  salaryCompositionCode: salaryCompositionCodeRef,
  compositionType: compositionTypeRef,
  compositionNature: compositionNatureRef,
  quota: quotaRef,
  formula: formulaRef,
};

const errorMessages = ref(
  Object.keys(validationRules).reduce((messages, field) => {
    messages[field] = "";
    return messages;
  }, {}),
);

const isTouched = (field) => Boolean(touchedFields.value[field]);

const validateField = (field) => {
  const rules = validationRules[field] || [];
  const message =
    rules
      .map((rule) => rule(formData.value[field], formData.value))
      .find(Boolean) || "";
  errorMessages.value[field] = message;
  return !message;
};

const validateForm = () => {
  const results = Object.keys(validationRules).map(validateField);
  return results.every(Boolean);
};

const getFirstErrorField = () => {
  return Object.keys(validationRules).find(
    (field) => errorMessages.value[field],
  );
};

const getFocusableElement = (fieldRef) => {
  const target = fieldRef?.value;
  if (!target) return null;
  if (typeof target.focus === "function") return target;
  return target.$el?.querySelector(
    "input, textarea, button, [tabindex]:not([tabindex='-1']), .multiselect",
  );
};

const focusFirstErrorField = async () => {
  await nextTick();
  const firstErrorField = getFirstErrorField();
  if (!firstErrorField) return;
  const focusableElement = getFocusableElement(fieldRefs[firstErrorField]);
  if (!focusableElement) return;
  focusableElement.$el?.scrollIntoView?.({
    behavior: "smooth",
    block: "center",
  });
  focusableElement.scrollIntoView?.({ behavior: "smooth", block: "center" });
  focusableElement.focus?.();
  await nextTick();
  touchedFields.value[firstErrorField] = true;
};

const setCustomError = (field, message) => {
  customErrorMessages.value[field] = message;
  validateField(field);
};

const markTouched = (field) => {
  touchedFields.value[field] = true;
  validateField(field);
};

const unMarkTouched = (field) => {
  touchedFields.value[field] = false;
};

const touchAll = () => {
  Object.keys(validationRules).forEach((field) => {
    touchedFields.value[field] = true;
  });
};

// ── Build payload gửi API ────────────────────────────────────
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

// ── Submit handlers ─────────────────────────────────────────
async function handleSubmit() {
  touchAll();
  if (!validateForm()) {
    await focusFirstErrorField();
    return;
  }
  await submitForm(false);
}

async function handleSubmitAndAdd() {
  touchAll();
  if (!validateForm()) {
    await focusFirstErrorField();
    return;
  }
  await submitForm(true);
}

async function submitForm(andAdd = false) {
  isSubmitting.value = true;
  try {
    const payload = buildPayload();
    let result;

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

    if (result.isSuccess) {
      if (andAdd) {
        // Lưu và thêm: reset form để nhập tiếp, không đóng form
        // Emit 'saved' kèm data API + flag để list unshift/update ngay
        emit("saved", { data: result.data, isEdit: isEditMode.value && !!currentEditId.value });
        resetForm();
        await nextTick();
        salaryCompositionNameRef.value?.focus?.();
        addToast("Đã lưu thành phần lương thành công", "success");
      } else {
        // Lưu: emit saved trước khi đóng để list cập nhật ngay (optimistic)
        emit("saved", { data: result.data, isEdit: isEditMode.value && !!currentEditId.value });
        addToast(
          isEditMode.value
            ? "Cập nhật thành phần lương thành công"
            : "Thêm thành phần lương thành công",
          "success",
        );
        // Dạng delay nhỏ để toast hiển thị trước khi unmount
        setTimeout(() => emit("close"), 600);
      }
    } else {
      const errMsg = result.data || "Có lỗi xảy ra, vui lòng thử lại";
      emit("openAlert", {
        title: "Lưu không thành công",
        message: errMsg,
        showConfirmButton: false,
        cancelText: "Đóng",
      });
    }
  } catch (err) {
    console.error("[FormSalaryComposition] submitForm:", err);
    addToast("Có lỗi xảy ra, vui lòng thử lại", "error");
  } finally {
    isSubmitting.value = false;
  }
}

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
const handleCloseForm = () => {
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

// Task 6: Auto-fill mã thành phần khi nhập tên (chỉ khi chưa edit mode và chưa sửa mã thủ công)
const isCodeManuallyEdited = ref(false);

// Theo dõi nếu người dùng tự sửa mã
watch(
  () => formData.value.salaryCompositionCode,
  (newCode, oldCode) => {
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
      formData.value.salaryCompositionCode = toCompositionCode(newName);
    }
  },
);

function toCompositionCode(name) {
  return (name || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]/g, "");
}

onMounted(async () => {
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
  padding: 24px;
  min-width: 0;
  min-height: 0;
}

.content_body_footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  font-size: 14px;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #666;
}

.content_header {
  display: flex;
  justify-content: flex-start;
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
  bottom: 26px;
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
