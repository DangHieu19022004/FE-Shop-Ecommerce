<template lang="">
  <div class="layout">
    <MsNavBar/>
    <main class="container">
      <MsSideBar v-model:isCollapse="isCollapse" />
      
      <router-view v-slot="{ Component }">
        <component
          :is="Component"
          :dataProp="data"
          :currentData="currentCandidate"
          v-model:fieldsVisible="visibleColumns"
          @openFormAdd="handleOpenFormAdd"
          @openFormEdit="handleOpenFormEdit"
          @deleteItem="handleDeleteItem"
          @error="openAlert"
          @alertImportData="handleAlertImportData"
        />
      </router-view>

      <MsOverlay v-if="isShowForm" @click="handleCloseForm" />
      <MsOverlay
        v-if="alertState.isShow"
        class="overlay--alert"
        @click="alertState.isShow = false"
      />
      <MsFormAdd
        v-if="isShowForm"
        @close="handleCloseForm"
        @submit="handleCandidateSubmit"
        @error="openAlert"
        :currentData="currentCandidate"
      />
      <MsAlert
        v-if="alertState.isShow"
        :title="alertState.title"
        :message="alertState.message"
        :showConfirmButton="alertState.showConfirmButton"
        @close="alertState.isShow = false"
        @confirm="handleConfirmAlert"
      />

      <MsToastContainer :toasts="toasts" @close="removeToast" />
    </main>
  </div>
</template>
<script setup>
import MsOverlay from "@/components/overlay/MsOverlay.vue";
import MsFormAdd from "@/features/employees/MsFormAdd.vue";
import MsAlert from "@/components/overlay/MsAlert.vue";
import MsNavBar from "@/layouts/MsNavBar.vue";
import MsSideBar from "@/layouts/MsSideBar.vue";
import MsToastContainer from "@/components/overlay/MsToastContainer.vue";
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import candidateDataJson from "@/stores/candidate-data.json";

onMounted(() => {
  initCandidateData();
  stateSidebar();
});

// VARIABLE:
const isCollapse = ref(false);
const isShowForm = ref(false);
const data = ref([]);
const currentCandidate = ref(null);
const toasts = ref([]);
const alertState = ref({
  isShow: false,
  title: "",
  message: "",
  showConfirmButton: false,
});
const pendingUpdate = ref(null);
const pendingDelete = ref(null);
const pendingImport = ref(null);
const visibleColumns = ref({
  FullName: true,
  Phone: true,
  Email: true,
  RecruitmentCampaign: true,
  Position: true,
  JobPosting: true,
  RecruitmentStage: true,
  Rating: true,
  ApplicationDate: true,
  CandidateSource: true,
  EducationLevel: true,
  EducationPlace: true,
  Major: true,
  RecentWorkplace: true,
  PersonInCharge: true,
  Department: true,
});
const route = useRoute();

/**
 * FUNCTION:
 */
const handleAlertImportData = (jsonData) => {
  alertState.value = {
    isShow: true,
    title: "Xác nhận",
    message: "Bạn có chắc muốn nhập dữ liệu từ file không?",
    showConfirmButton: true,
  };
  //Lưu lại thông tin dữ liệu đang chờ nhập
  pendingImport.value = { jsonData };
};
const stateSidebar = () => {
  const stored = localStorage.getItem("sidebarCollapse");
  if (stored === null) {
    localStorage.setItem("sidebarCollapse", JSON.stringify(isCollapse.value));
    return;
  }
  isCollapse.value = JSON.parse(stored);
};

const handleOpenFormAdd = () => {
  currentCandidate.value = null;
  isShowForm.value = true;
};

const handleConfirmAlert = () => {
  alertState.value.isShow = false;
  isShowForm.value = false;

  if (pendingUpdate.value) {
    data.value.splice(
      pendingUpdate.value.index,
      1,
      pendingUpdate.value.candidateData
    );
    localStorage.setItem("candicateData", JSON.stringify(data.value));

    pendingUpdate.value = null;
    toasts.value.push({
      id: Date.now() + Math.random(),
      message: "Cập nhật ứng viên thành công",
      type: "success",
      duration: 3000,
    });
  }
  if (pendingDelete.value) {
    data.value = data.value.filter(
      (item) => String(item.Id) !== String(pendingDelete.value.candidateData.Id)
    );
    localStorage.setItem("candicateData", JSON.stringify(data.value));
    pendingDelete.value = null;
    toasts.value.push({
      id: Date.now() + Math.random(),
      message: "Xóa ứng viên thành công",
      type: "success",
      duration: 3000,
    });
  }
  if (pendingImport.value) {
    data.value = [...data.value, ...pendingImport.value.jsonData];
    localStorage.setItem("candicateData", JSON.stringify(data.value));
    pendingImport.value = null;
    toasts.value.push({
      id: Date.now() + Math.random(),
      message: "Nhập dữ liệu thành công",
      type: "success",
      duration: 3000,
    });
  }
};
const handleOpenFormEdit = (candidateData) => {
  currentCandidate.value = candidateData;
  isShowForm.value = true;
};
const handleCloseForm = () => {
  isShowForm.value = false;
};
const handleDeleteItem = (candidateData) => {
  alertState.value = {
    isShow: true,
    title: "Xác nhận",
    message: "Bạn có chắc muốn xóa ứng viên này không?",
    showConfirmButton: true,
  };
  //Lưu lại thông tin ứng viên đang chờ xóa
  pendingDelete.value = { candidateData };
};
const openAlert = (payload) => {
  alertState.value = {
    isShow: true,
    title: payload.title,
    message: payload.message,
    showConfirmButton: payload.showConfirmButton,
  };
};
const initCandidateData = () => {
  const stored = localStorage.getItem("candicateData");
  if (stored) {
    data.value = JSON.parse(stored) || [];
    return;
  }

  const seed = candidateDataJson?.candicates ?? [];
  data.value = seed;
  localStorage.setItem("candicateData", JSON.stringify(seed));
};

const handleCandidateSubmit = (candidateData) => {
  if (candidateData.Id) {
    //edit
    const index = data.value.findIndex(
      (item) => String(item.Id) === String(candidateData.Id)
    );
    if (index == -1) {
      toasts.value.push({
        id: Date.now() + Math.random(),
        message: "Không tìm thấy ứng viên để cập nhật",
        type: "error",
        duration: 3000,
      });
      return;
    }
    alertState.value = {
      isShow: true,
      title: "Xác nhận",
      message: "Bạn có chắc muốn cập nhật thông tin ứng viên này không?",
      showConfirmButton: true,
    };
    //Lưu lại thông tin ứng viên đang chờ cập nhật
    pendingUpdate.value = { index, candidateData };
    return;
  } else {
    //add
    candidateData.Id = Date.now();
    data.value.unshift(candidateData);
    toasts.value.push({
      id: Date.now() + Math.random(),
      message: "Thêm ứng viên thành công",
      type: "success",
      duration: 3000,
    });
  }

  localStorage.setItem("candicateData", JSON.stringify(data.value));

  isShowForm.value = false;
};

const removeToast = (id) => {
  toasts.value = toasts.value.filter((toast) => toast.id !== id);
};

/**
 * NOTICE: watch
 */

watch(
  () => route.name,
  (name) => {
    if (name !== "employeeList") {
      isShowForm.value = false;
    }
  }
);
watch(isCollapse, () => {
  localStorage.setItem("sidebarCollapse", isCollapse.value);
});
</script>
<style lang=""></style>
