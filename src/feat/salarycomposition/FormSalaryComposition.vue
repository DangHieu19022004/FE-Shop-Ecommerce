<template lang="">
  <div class="content_bg">
    <div class="content">
      <div class="content_header">
        <div>
          <div class="content_header_left_icon">
             <MsIcon
                class="mi-arrow-left"
                wrapperClass="icon-back"
                @click="handleCloseForm"
            />
            <h2 class="content_header_left_title">Thêm thành phần</h2>
          </div>
        </div>
      </div>
      <div class="content_body_wrapper">
        <div class="content_body_wrapper_form">
          <MsInput
            type="text"
            id="input_name_salary"
            isRequired
            label="Tên thành phần"
            horizontal
          />
          <MsInput
            type="text"
            id="input_code_salary"
            isRequired
            label="Mã thành phần"
            horizontal
          />
          <MsTreeSelect
            label="Đơn vị áp dụng"
            isRequired
            horizontal
            placeholder="Chọn đơn vị..."
            :options="orgTreeData"
            v-model="selectedOrgs"
          />
          <MsSelect
            v-model="selectedCategory"
            :data="categoryOptions"
            label-text="Loại thành phần lương"
            :is-required="true"
            horizontal
            class="fz-14"
            :width="315"
          />
          <div class="type_salary_wrapper">
            <MsSelect
              :data="typeOptions"
              labelText="Tính chất"
              isRequired
              horizontal
              class="fz-14"
              :width="315"
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
          <div class="ms-input ms-input--horizontal">
            <label class="ms-input__label" for="input_limit_salary">Định mức</label>
            <textarea
              id="input_limit_salary"
              class="ms-input-in h-86 text-area"
              placeholder="Tự động gợi ý công thức và tham số khi gõ"
            ></textarea>
          </div>
          <div class="is-over-limit">
            <MsCheckbox
              v-model="isOverLimit"
              label="Cho phép giá trị tính vượt qua định mức"
            />
            <MsIcon
              class="mi-circle-info"
              message="Nếu không tích chọn thì khi tính giá trị thành phần lương này mà vượt quá định mức thì hệ thống sẽ tự lấy tối đa bằng định mức đã nhập"
            />
          </div>
          <MsSelect
            labelText="Kiểu giá trị"
            v-model="selectedType"
            :data="typeValues"
            horizontal
            class="fz-14"
            :width="315"
          />
          <!-- input giá trị -->
          <MsRadio
            v-model="selectedOptionsValue"
            name="options-value"
            :options="optionsValue"
            labelText="Giá trị"
            class="fz-14"
            horizontal
          />
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
          <div class="ms-input ms-input--horizontal">
            <label class="ms-input__label" for="input_value_salary"></label>
            <textarea
              id="input_value_salary"
              class="ms-input-in h-86 text-area"
              placeholder="Tự động gợi ý công thức và tham số khi gõ"
            ></textarea>
          </div>
          <!-- end input giá trị -->
           <div class="ms-input ms-input--horizontal">
            <label class="ms-input__label" for="input_desc">Mô tả</label>
            <textarea
              id="input_desc"
              class="ms-input-in h-86 text-area"
            ></textarea>
          </div>
          <MsRadio
            v-model="selectedOptionsDisplay"
            name="options-display"
            :options="optionsDisplay"
            labelText="Hiển thị trên phiếu lương"
            class="fz-14"
            horizontal
            horizontalInput
          />
          <MsInput
            type="text"
            id="input_source"
            label="Nguồn tạo"
            horizontal
            placeholder="Tự thêm"
            class="fz-14 wd-315"
          />
        </div>
        <div class="content_body_footer">
            <div class="footer-right">
              <MsButton
                message="Hủy bỏ"
                isTooltip="false"
                class="border-gray fz-14"
              />
              <MsButton
                message="Lưu và thêm"
                isTooltip="false"
                class="fz-14"
                type="border-green"
              />
              <MsButton
                message="Lưu"
                isTooltip="false"
                class="fz-14"
                type="green"
              />
            </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import MsButton from "@/components/base/MsButton.vue";
import MsIcon from "@/components/base/MsIcon.vue";
import MsInput from "@/components/base/MsInput.vue";
import MsTable from "@/components/base/MsTable.vue";
import MsTreeSelect from "@/components/base/MsTreeSelect.vue";
import MsSelect from "@/components/base/MsSelect.vue";
import MsRadio from "@/components/base/MsRadio.vue";
import MsCheckbox from "@/components/base/MsCheckbox.vue";
import { ref } from "vue";

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
</style>