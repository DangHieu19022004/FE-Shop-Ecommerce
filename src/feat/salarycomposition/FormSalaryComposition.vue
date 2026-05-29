<template lang="">
  <div class="content_bg">
    <div class="content">
      <div class="content_header">
        <div>
          <div class="content_header_left_icon">
            <MsButton
              iconLeft="mi-arrow-left"
              :isTooltip="false"
              shapeBtn="circle"
              @click="handleCloseForm"
            />
            <h2 class="content_header_left_title">Thêm thành phần</h2>
          </div>
        </div>
      </div>
      <div class="content_body_wrapper">
        <div class="content_body_wrapper_form">
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
              :errorMessages="isTouched('salaryCompositionName') ? errorMessages.salaryCompositionName : ''"
              @blur="markTouched('salaryCompositionName')"
              @focus="unMarkTouched('salaryCompositionName')"
            />
            <div class="validate-msg">
              {{ isTouched('salaryCompositionName') ? errorMessages.salaryCompositionName : '' }}
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
              :errorMessages="isTouched('salaryCompositionCode') ? errorMessages.salaryCompositionCode : ''"
              @blur="markTouched('salaryCompositionCode')"
              @focus="unMarkTouched('salaryCompositionCode')"
            />
            <div class="validate-msg">
              {{ isTouched('salaryCompositionCode') ? errorMessages.salaryCompositionCode : '' }}
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
              :errorMessages="isTouched('compositionType') ? errorMessages.compositionType : ''"
            />
            <div class="validate-msg">
              {{ isTouched('compositionType') ? errorMessages.compositionType : '' }}
            </div>
          </div>

          <!-- Tính chất + Thuế -->
          <div class="form-field">
            <div class="type_salary_wrapper">
              <MsSelect
                ref="compositionNatureRef"
                :data="typeOptions"
                labelText="Tính chất"
                isRequired
                horizontal
                class="fz-14"
                :width="315"
                v-model="formData.compositionNature"
                @blur="markTouched('compositionNature')"
                @focus="unMarkTouched('compositionNature')"
                :errorMessages="isTouched('compositionNature') ? errorMessages.compositionNature : ''"
              />
              <div class="type_salary">
                <MsRadio
                  v-model="selectedTax"
                  name="tax-type"
                  :options="taxOptions"
                  class="fz-14"
                  horizontalInput
                />
                <!-- <MsCheckbox
                  v-model="isDeductedTax"
                  label="Giảm trừ khi tính thuế"
                /> -->
              </div>
            </div>
            <div class="validate-msg">
              {{ isTouched('compositionNature') ? errorMessages.compositionNature : '' }}
            </div>
          </div>

          <!-- Định mức -->
          <div class="form-field">
            <MsFormula
              ref="quotaRef"
              id="input_limit_salary"
              label="Định mức"
              horizontal
              placeholder="Tự động gợi ý công thức và tham số khi gõ"
              v-model="formData.quota"
              :variables="formulaVariables"
              @validate="setCustomError('quota', $event[0] || '')"
              @blur="markTouched('quota')"
              @focus="unMarkTouched('quota')"
            />
            <div class="validate-msg">
              {{ isTouched('quota') ? errorMessages.quota : '' }}
            </div>
          </div>

          <!-- Cho phép vượt định mức -->
          <div class="is-over-limit">
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
              v-model="selectedType"
              :data="typeValues"
              horizontal
              class="fz-14"
              :width="315"
            />
            <div class="validate-msg"></div>
          </div>

          <!-- Giá trị -->
          <div class="form-field">
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
          <div class="form-field">
            <div class="value-select-row">
              <MsSelect
                class="fz-14 is-over-limit"
                :width="315"
                v-model="selectedOptionsValueCombobox"
                :data="optionsValueCombobox"
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
              </MsSelect>
              <MsSelect
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
          <div class="form-field">
            <MsFormula
              ref="formulaRef"
              id="input_value_salary"
              class="is-over-limit fz-14"
              horizontal
              placeholder="Tự động gợi ý công thức và tham số khi gõ"
              v-model="formData.formula"
              :variables="formulaVariables"
              @validate="setCustomError('formula', $event[0] || '')"
              @blur="markTouched('formula')"
              @focus="unMarkTouched('formula')"
            />
            <div class="validate-msg">
              {{ isTouched('formula') ? errorMessages.formula : '' }}
            </div>
          </div>

          <!-- Mô tả -->
          <div class="form-field">
            <div class="ms-input ms-input--horizontal">
              <label class="ms-input__label" for="input_desc">Mô tả</label>
              <textarea
                id="input_desc"
                class="ms-input-in h-86 text-area"
              ></textarea>
            </div>
            <div class="validate-msg"></div>
          </div>

          <!-- Hiển thị trên phiếu lương -->
          <div class="form-field">
            <MsRadio
              v-model="selectedOptionsDisplay"
              name="options-display"
              :options="optionsDisplay"
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
              placeholder="Tự thêm"
              class="fz-14 wd-315"
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
              />
              <MsButton
                message="Lưu và thêm"
                :isTooltip="false"
                class="fz-14"
                type="border-green"
              />
              <MsButton
                message="Lưu"
                :isTooltip="false"
                class="fz-14"
                type="green"
                @click="handleSubmit"
              />
            </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import MsButton from "@/components/base/MsButton.vue";
import MsInput from "@/components/base/MsInput.vue";
import MsTable from "@/components/base/MsTable.vue";
import MsTreeSelect from "@/components/base/MsTreeSelect/MsTreeSelect.vue";
import MsSelect from "@/components/base/MsSelect.vue";
import MsRadio from "@/components/base/MsRadio.vue";
import MsCheckbox from "@/components/base/MsCheckbox.vue";
import MsFormula from "@/components/base/MsFormula/MsFormula.vue";
import { nextTick, onMounted, ref } from "vue";

// VARIABLE:
const salaryCompositionNameRef = ref(null);
const salaryCompositionCodeRef = ref(null);
const compositionTypeRef = ref(null);
const compositionNatureRef = ref(null);
const quotaRef = ref(null);
const formulaRef = ref(null);
const selectedOrgs = ref([]);
const selectedCategory = ref(null);
const selectedTax = ref("chiu_thue");
const isDeductedTax = ref(false);
const isOverLimit = ref(false);
const selectedType = ref(null);
const selectedOptionsValue = ref(null);
const selectedOptionsValueCombobox = ref(null);
const selectedSalaryCoposition = ref(null);
const selectedOptionsDisplay = ref(null);

// Danh sách biến thành phần lương dùng trong công thức
const formulaVariables = [
  'LUONG_CO_BAN',
  'DOANH_SO',
  'THUONG_KPI',
  'SO_NGAY_CONG',
  'SO_GIO_LAM',
  'PHAN_TRAM_HOAN_THANH',
  'BAO_HIEM_XH',
  'THUE_TNCN',
];

// Lưu trạng thái đã tương tác với từng field để quyết định khi nào hiển thị message lỗi
const touchedFields = ref({});

const formData = ref({
  salaryCompositionId: "",

  // FK hệ thống
  salaryCompositionSystemId: "",

  // Mã / tên
  salaryCompositionCode: "",
  salaryCompositionName: "",

  // Đơn vị áp dụng
  organizationName: "",

  // Loại thành phần
  // employee_info / salary / product / attendance
  compositionType: "",

  // Tính chất
  // income / deduction / other
  compositionNature: "",

  // Thuế
  taxable: "",
  taxDeduction: "",

  // Định mức
  quota: null,

  // Kiểu giá trị
  // text / number / money / percent
  valueType: "",

  // Công thức / giá trị
  formula: "",

  // Mô tả
  description: "",

  // Hiển thị trên phiếu lương
  // always_show / hidden / conditional
  optionShowPaycheck: "",

  // Nguồn tạo
  // default / custom
  sourceType: "",

  // Trạng thái
  // following / stop_following
  status: "",

  // Thời gian
  createdDate: "",
  modifiedDate: "",
});

const customErrorMessages = ref({});

const isEmptyValue = (value) => {
  if (Array.isArray(value)) return value.length === 0;
  return value === null || value === undefined || String(value).trim() === "";
};

const requiredRule = (message) => (value) => isEmptyValue(value) ? message : "";
const customErrorRule = (field) => () => customErrorMessages.value[field] || "";

const validationRules = {
  salaryCompositionName: [
    requiredRule("Vui lòng nhập tên thành phần lương"),
  ],
  salaryCompositionCode: [
    requiredRule("Vui lòng nhập mã thành phần lương"),
  ],
  compositionNature: [
    requiredRule("Vui lòng chọn tính chất"),
  ],
  compositionType: [
    requiredRule("Vui lòng chọn loại thành phần lương"),
  ],
  quota: [
    customErrorRule("quota"),
  ],
  formula: [
    customErrorRule("formula"),
  ],
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
  }, {})
);

const optionsDisplay = [
  { value: "co", label: "Có" },
  { value: "khong", label: "Không" },
  { value: "hien_thi_khac_0", label: "Chỉ hiển thị nếu giá trị khác 0" },
];
const salaryCompositionOptions = [
  { value: "thanh_phan_a", label: "Thành phần A" },
  { value: "thanh_phan_b", label: "Thành phần B" },
  { value: "thanh_phan_c", label: "Thành phần C" },
];
const optionsValueCombobox = [
  { value: "option1", label: "Trong cùng đơn vị công tác ", iconClass: "mi-info-blue" },
  { value: "option2", label: "Dưới quyền", iconClass: "mi-info-blue" },
  { value: "option3", label: "Thuộc cơ cấu tổ chức", iconClass: "mi-info-blue" },
];

const typeValues = [
  { value: "so", label: "Số" },
  { value: "tien_te", label: "Tiền tệ" },
  { value: "phan_tram", label: "Phần trăm" },
  { value: "chu", label: "Chữ" },
  { value: "ngay", label: "Ngày" },
];

const optionsValue = [
  { value: "tu_dong_cong", label: "Tự động cộng tổng giá trị của các nhân viên" },
  { value: "cong_thuc_co_san", label: "Tính theo công thức tự đặt" },
];

const categoryOptions = [
  { value: "nhan_vien",   label: "Thông tin nhân viên" },
  { value: "cham_cong",  label: "Chấm công" },
  { value: "doanh_so",   label: "Doanh số" },
  { value: "kpi",        label: "KPI" },
  { value: "san_pham",   label: "Sản phẩm" },
  { value: "luong",      label: "Lương" },
  { value: "thue_tncn",  label: "Thuế TNCN" },
  { value: "bao_hiem",   label: "Bảo hiểm - Công đoàn" },
  { value: "khac",       label: "Khác" },
];

const typeOptions = [
  { value: "thu_nhap",   label: "Thu nhập" },
  { value: "khau_tru", label: "Khấu trừ" },
  {value:"khac", label: "Khác"}
];

const taxOptions = [
  { value: "chiu_thue",          label: "Chịu thuế" },
  { value: "mien_thue_toan",     label: "Miễn thuế toàn phần" },
  { value: "mien_thue_mot_phan", label: "Miễn thuế một phần" },
];

const orgTreeData = [
  {
    id: "root",
    label: "Misa Test pdthien 2024",
    children: [
      {
        id: "mb",
        label: "Chi nhánh miền Bắc",
        children: [
          {
            id: "ksx",
            label: "Khối sản xuất",
            children: [],
          },
          {
            id: "ttkd_bac",
            label: "Trung tâm kinh doanh",
            children: [],
          },
          {
            id: "tthtkh",
            label: "Trung tâm hỗ trợ khách hàng",
            children: [],
          },
        ],
      },
      {
        id: "mn",
        label: "Chi nhánh miền Nam",
        children: [
          {
            id: "ttkd_nam",
            label: "Trung tâm kinh doanh",
            children: [],
          },
        ],
      },
    ],
  },
];

//NOTICE: EMIT + PROPS
const emit = defineEmits(["openAlert", "close"]);
const handleCloseForm = () => {
    emit("openAlert", {
      title: "Thoát và không lưu?",
      message: "Nếu bạn thoát, các dữ liệu đang nhập liệu sẽ không được lưu lại.",
      showConfirmButton: true,
      cancelText: "Ở lại",
      confirmText: "Thoát, không lưu",
      cancelType: "none",
      confirmType: "red",
      onConfirm: () => emit("close")  // ← gọi close để SalaryComposition ẩn form
    })
}


// FUNCTION:
const isTouched = (field) => Boolean(touchedFields.value[field]);

const validateField = (field) => {
  const rules = validationRules[field] || [];
  const message = rules
    .map((rule) => rule(formData.value[field], formData.value))
    .find(Boolean) || "";

  errorMessages.value[field] = message;
  return !message;
};

// validate full field in form
const validateForm = () => {
  const results = Object.keys(validationRules).map(validateField);
  return results.every(Boolean);
};

const getFirstErrorField = () => {
  return Object.keys(validationRules).find((field) => errorMessages.value[field]);
};

const getFocusableElement = (fieldRef) => {
  const target = fieldRef?.value;
  if (!target) return null;
  if (typeof target.focus === "function") return target;

  return target.$el?.querySelector(
    "input, textarea, button, [tabindex]:not([tabindex='-1']), .multiselect"
  );
};

const focusFirstErrorField = async () => {
  await nextTick();

  const firstErrorField = getFirstErrorField();
  if (!firstErrorField) return;

  const focusableElement = getFocusableElement(fieldRefs[firstErrorField]);
  if (!focusableElement) return;

  focusableElement.$el?.scrollIntoView?.({ behavior: "smooth", block: "center" });
  focusableElement.scrollIntoView?.({ behavior: "smooth", block: "center" });
  focusableElement.focus?.();

  if (!focusableElement.focus && typeof focusableElement.click === "function") {
    focusableElement.click();
  }

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
  const fields = Object.keys(validationRules);
  fields.forEach((field) => {
    touchedFields.value[field] = true;
  });
};

const handleSubmit = () => {
  touchAll();
  const isValid = validateForm();
  if (!isValid) {
    focusFirstErrorField();
    return;
  }

  // Xử lý submit form (call API, show toast, ...)
  console.log("Form data:", formData.value);
};

onMounted(async () => {
  await nextTick();
  salaryCompositionNameRef.value?.focus?.();
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
.content_body_wrapper_form{
  display: flex;
  flex-direction: column;
  gap:16px;
  flex: 1;
  overflow: auto;
  padding: 40px 120px 40px 40px;
  border-bottom: 1px solid #d9dee7;
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

.type_salary_wrapper{
  display: flex;
  gap:16px;
}

.type_salary{
  display: flex;
  align-items: center;
  justify-items: center;
}
:deep(.text-area) {
  line-height: 20px !important;
  padding-top: 8px !important;
  padding-bottom: 8px !important;
}
.is-over-limit{
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
.value-select-row > .ms-select:last-child{ flex: 1 1 0; min-width: 0; }
.value-select-row > .ms-select:first-child  { flex: 0 0 315px; }

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
  padding-left: 200px; /* căn thẳng với input trong layout horizontal */
}
</style>
