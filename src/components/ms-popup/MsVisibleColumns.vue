<template lang="">
        <aside :class="['sub__sidebar', { sub__sidebar_show: props.isOpen, sub__sidebar_dropdown: props.dropdown }]">
            <div class="sbbg">
                <div class="checkbox__hide hvp">
                    <label for="checkbox__hide-cell">Ẩn/Hiện cột</label>
                </div>
                <div class="fullname__hide hvp">
                    <input type="checkbox" name="fullname__hide" id="fullname__hide"
                    v-model="localColumns.FullName">
                    <label for="fullname__hide">Họ và tên</label>
                </div>
                <div class="phonenumber__hide hvp">
                    <input type="checkbox" name="phonenumber__hide" id="phonenumber__hide" v-model="localColumns.Phone">
                    <label for="phonenumber__hide">Số điện thoại</label>

                </div>
                <div class="email__hide hvp">
                    <input type="checkbox" name="email__hide" id="email__hide" v-model="localColumns.Email">
                    <label for="email__hide">Email</label>
                </div>
                <div class="campaign__hide hvp">
                    <input type="checkbox" name="campaign__hide" id="campaign__hide" v-model="localColumns.RecruitmentCampaign">
                    <label for="campaign__hide">Chiến dịch tuyển dụng</label>

                </div>
                <div class="position__hide hvp">
                    <input type="checkbox" name="position__hide" id="position__hide" v-model="localColumns.Position">
                    <label for="position__hide">Vị trí tuyển dụng</label>
                </div>
                <div class="jobposting__hide hvp">
                    <input type="checkbox" name="jobposting__hide" id="jobposting__hide" v-model="localColumns.JobPosting">
                    <label for="jobposting__hide">Tin tuyển dụng</label>
                </div>
                <div class="stage__hide hvp">
                    <input type="checkbox" name="stage__hide" id="stage__hide" v-model="localColumns.RecruitmentStage">
                    <label for="stage__hide">Vòng tuyển dụng</label>
                </div>
                <div class="rating__hide hvp">
                    <input type="checkbox" name="rating__hide" id="rating__hide" v-model="localColumns.Rating">
                    <label for="rating__hide">Đánh giá</label>
                </div>
                <div class="application-date__hide hvp">
                    <input type="checkbox" name="application-date__hide" id="application-date__hide" v-model="localColumns.ApplicationDate">
                    <label for="application-date__hide">Ngày ứng tuyển</label>
                </div>
                <div class="candidate-source__hide hvp">
                    <input type="checkbox" name="candidate-source__hide" id="candidate-source__hide" v-model="localColumns.CandidateSource">
                    <label for="candidate-source__hide">Nguồn ứng viên</label>
                </div>
                <div class="education-level__hide hvp">
                    <input type="checkbox" name="education-level__hide" id="education-level__hide" v-model="localColumns.EducationLevel">
                    <label for="education-level__hide">Trình độ đào tạo</label>
                </div>
                <div class="education-place__hide hvp">
                    <input type="checkbox" name="education-place__hide" id="education-place__hide" v-model="localColumns.EducationPlace">
                    <label for="education-place__hide">Nơi đào tạo</label>
                </div>
                <div class="major__hide hvp">
                    <input type="checkbox" name="major__hide" id="major__hide" v-model="localColumns.Major">
                    <label for="major__hide">Chuyên ngành</label>
                </div>
                <div class="recent-workplace__hide hvp">
                    <input type="checkbox" name="recent-workplace__hide" id="recent-workplace__hide" v-model="localColumns.RecentWorkplace">
                    <label for="recent-workplace__hide">Nơi làm việc gần đây</label>
                </div>
                <div class="person-in-charge__hide hvp">
                    <input type="checkbox" name="person-in-charge__hide" id="person-in-charge__hide" v-model="localColumns.PersonInCharge">
                    <label for="person-in-charge__hide">Nhân sự khai thác</label>
                </div>
                <div class="department__hide hvp">
                    <input type="checkbox" name="department__hide" id="department__hide" v-model="localColumns.Department">
                    <label for="department__hide">Đơn vị sử dụng</label>
                </div>
            </div>
        </aside>
</template>
<script setup>
import { defineProps, defineEmits, computed } from "vue";

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false,
    },
    dropdown: {
        type: Boolean,
        default: false,
    },
    columns: {
        type: Object,
        default: () => ({}),
    },
});

const emit = defineEmits(['update:columns']);

const localColumns = computed({
    get: () => props.columns,
    set: (val) =>  emit('update:columns', val),
});

</script>
<style lang="">
    
</style>