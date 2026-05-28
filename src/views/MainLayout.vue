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
          @openAlert="openAlert"
          @alertImportData="handleAlertImportData"
        />
      </router-view>

      <MsOverlay v-if="isShowForm" @click="handleCloseForm" />
      <MsOverlay
        v-if="alertState.isShow"
        class="overlay--alert"
        @click="alertState.isShow = false"
      />
      <MsAlert
        v-if="alertState.isShow"
        :title="alertState.title"
        :message="alertState.message"
        :showConfirmButton="alertState.showConfirmButton"
        :cancelText="alertState.cancelText"
        :confirmText="alertState.confirmText"
        :cancelType="alertState.cancelType"
        :confirmType="alertState.confirmType"
        @close="alertState.isShow = false"
        @confirm="handleConfirmAlert"
      />

      <MsToastContainer :toasts="toasts" @close="removeToast" />
    </main>
  </div>
</template>
<script setup>
import MsOverlay from "@/components/overlay/MsOverlay.vue";
import MsAlert from "@/components/overlay/MsAlert.vue";
import MsNavBar from "@/layouts/MsNavBar.vue";
import MsSideBar from "@/layouts/MsSideBar.vue";
import MsToastContainer from "@/components/overlay/MsToast/MsToastContainer.vue";
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

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
  cancelText: "Hủy",
  confirmText: "Xác nhận",
  cancelType: "none",
  confirmType: "green"
});
const pendingUpdate = ref(null);
const pendingDelete = ref(null);
const pendingImport = ref(null);
const pendingAction = ref(null);
const visibleColumns = ref({

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
    cancelText: "Hủy",
    confirmText: "Xác nhận",
    cancelType: "none",
    confirmType: "green"
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

  // Nếu có callback onConfirm từ component con (vd: FormSalaryComposition)
  if (pendingAction.value) {
    pendingAction.value();
    pendingAction.value = null;
    return;
  }

  isShowForm.value = false;

  if (pendingUpdate.value) {
    //Cập nhật dữ liệu
    pendingUpdate.value = null;
    toasts.value.push({
      id: Date.now() + Math.random(),
      message: "Cập nhật ứng viên thành công",
      type: "success",
      duration: 3000,
    });
  }
  if (pendingDelete.value) {
    //Xóa dữ liệu
    pendingDelete.value = null;
    toasts.value.push({
      id: Date.now() + Math.random(),
      message: "Xóa ứng viên thành công",
      type: "success",
      duration: 3000,
    });
  }
  if (pendingImport.value) {
    //Nhập dữ liệu xlsx
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
    cancelText: "Hủy",
    confirmText: "Xác nhận",
    cancelType: "none",
    confirmType: "green"
  };
  //Lưu lại thông tin ứng viên đang chờ xóa
  pendingDelete.value = { candidateData };
};
const openAlert = (payload) => {
  // Lưu callback onConfirm nếu component con truyền vào
  pendingAction.value = payload.onConfirm ?? null;
  alertState.value = {
    isShow: true,
    title: payload.title,
    message: payload.message,
    showConfirmButton: payload.showConfirmButton ?? true,
    cancelText: payload.cancelText ?? "Hủy",
    confirmText: payload.confirmText ?? "Xác nhận",
    cancelType: payload.cancelType ?? "none",
    confirmType: payload.confirmType ?? "green"
  };
};
const initCandidateData = () => {
  // check localStorage trước, nếu có thì dùng luôn, không có thì gọi db

};


const removeToast = (id) => {
  toasts.value = toasts.value.filter((toast) => toast.id !== id);
};

/**
 * NOTICE: watch
 */

watch(isCollapse, () => {
  localStorage.setItem("sidebarCollapse", isCollapse.value);
});
</script>
<style scoped>
.container {
  display: flex;
  height: calc(100vh - 48px);
}
</style>
