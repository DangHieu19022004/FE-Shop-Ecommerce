<template lang="">
  <div class="ms-filter">
    <div class="ms-filter__header">Bộ lọc</div>
    <div class="ms-filter__field">
      <label for="filter_start_date" class="ms-filter__label"
        >Ngày bắt đầu</label
      >
      <MsInput
        v-model="filters.startDate"
        id="filter_start_date"
        name="filter_start_date"
        type="date"
        class="pd-8 width-100"
      />
    </div>
    <div class="ms-filter__field">
      <label for="filter_end_date" class="ms-filter__label"
        >Ngày kết thúc</label
      >
      <MsInput
        v-model="filters.endDate"
        id="filter_end_date"
        name="filter_end_date"
        type="date"
        class="pd-8 width-100"
      />
    </div>
    <div class="ms-filter__field">
      <label for="filter_source" class="ms-filter__label">Nguồn ứng viên</label>
      <MsSelect
        v-model="filters.source"
        id="filter_source"
        name="filter_source"
        keyChosen="nguồn ứng viên"
        :data="sourceOptions"
      />
    </div>
    <div class="ms-filter__field">
      <label for="filter_level" class="ms-filter__label">Trình độ đào tạo</label>
      <MsSelect
        v-model="filters.level"
        id="filter_level"
        name="filter_level"
        keyChosen="trình độ"
        :data="levelOptions"
      />
    </div>
    <div class="ms-filter__field">
      <label for="filter_recruitment_round" class="ms-filter__label">Vòng tuyển dụng</label>
      <MsSelect
        v-model="filters.recruitment_round"
        id="filter_recruitment_round"
        name="filter_recruitment_round"
        keyChosen="vòng tuyển dụng"
        :data="recruitmentRoundOptions"
      />
    </div>
    <div class="ms-filter__actions">
      <MsButton type="primary" @click="handleFilter">Tìm kiếm</MsButton>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";
import MsButton from "../../components/base/MsButton.vue";
import MsInput from "../../components/base/MsInput.vue";
import MsSelect from "../../components/base/MsSelect.vue";

const filters = ref({
  startDate: "",
  endDate: "",
  source: "",
  level: "",
  recruitment_round: ""
});

const sourceOptions = [
  { value: "linkedln", label: "Linkedln" },
  { value: "topcv", label: "TopCV" },
  { value: "vietnamworks", label: "VietnamWorks" },
  { value: "gioithieu", label: "Gioi thieu" },
  { value: "facebook", label: "Facebook" },
  { value: "behance", label: "Behance" },
  { value: "itviec", label: "ITviec" },
  { value: "headhunter", label: "Headhunter" },
];

const levelOptions = [
  { value: "dai hoc", label: "Đại học" },
  { value: "cao dang", label: "Cao đẳng" },
  { value: "trung cap", label: "Trung cấp" },
  { value: "thac si", label: "Thạc sĩ" },
];

const recruitmentRoundOptions = [
  { value: "kiem tra nang luc", label: "Kiểm tra năng lực" },
  { value: "phong van", label: "Phỏng vấn" },
  { value: "thao luan", label: "Thảo luận" },
  { value: "da tuyen", label: "Đã tuyển" },
  { value: "loai", label: "Loại" },
  { value: "chap nhan offer", label: "Chấp nhận offer" },
  { value: "phong van vong 2", label: "Phỏng vấn vòng 2" },
  { value: "tu choi offer", label: "Từ chối offer" },
  { value: "tiep nhan", label: "Tiếp nhận" },
];

const emit = defineEmits(["filter"]);

const handleFilter = () => {
  emit("filter", { ...filters.value });
};
</script>
<style scoped>
.ms-filter {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 260px;
  background: #fff;
  border: 1px solid #dfe1e6;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 10px 24px rgba(17, 24, 39, 0.12);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ms-filter__header {
  font-size: 16px;
  font-weight: 600;
  color: #1f2a37;
  letter-spacing: 0.2px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}
.ms-filter__actions {
  display: flex;
  justify-content: flex-end;
}

.ms-filter :deep(.ms-select select) {
  width: 100%;
  padding: 8px 10px;
  height: 36px;
}
</style>
