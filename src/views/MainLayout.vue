<template lang="">
  <div class="layout">
    <!-- Thanh điều hướng trên cùng -->
    <MsNavBar/>

    <main class="container">
      <!-- Thanh sidebar bên trái -->
      <MsSideBar v-model:isCollapse="isCollapse" />

       <!-- Khu vực nội dung chính, nơi các component con sẽ được hiển thị. VD: Thành phần lương, Thành phần lương hệ thống -->
      <router-view v-slot="{ Component }">
        <component
          :is="Component"
          :dataProp="data"
          :currentData="currentSalaryComposition"
          v-model:fieldsVisible="visibleColumns"
          @openFormAdd="handleOpenFormAdd"
          @openFormEdit="handleOpenFormEdit"
          @deleteItem="handleDeleteItem"
          @openAlert="openAlert"
        />
      </router-view>

      <!-- Overlay dùng chung cho toàn layout -->
      <MsOverlay v-if="isShowForm" @click="handleCloseForm" />
      <MsOverlay
        v-if="alertState.isShow"
        class="overlay--alert"
        @click="closeAlert"
      />

      <!-- Component Alert dùng chung cho toàn layout -->
      <MsAlert
        v-if="alertState.isShow"
        :title="alertState.title"
        :message="alertState.message"
        :showConfirmButton="alertState.showConfirmButton"
        :cancelText="alertState.cancelText"
        :confirmText="alertState.confirmText"
        :cancelType="alertState.cancelType"
        :confirmType="alertState.confirmType"
        :confirmDisabled="!!alertState.options?.length && !alertSelectedOption"
        @close="closeAlert"
        @confirm="handleConfirmAlert"
      >
        <template v-if="alertState.options?.length">
          <div class="alert-options">
            <div
              v-for="option in alertState.options"
              :key="option.value"
              class="alert-option"
              @click="alertSelectedOption = option.value"
            >
              <input
                type="radio"
                name="alert-option"
                :value="option.value"
                :checked="alertSelectedOption === option.value"
                @change="alertSelectedOption = option.value"
              />
              <span>{{ option.label }}</span>
            </div>
          </div>
        </template>
      </MsAlert>

      <!-- Container hiển thị toast -->
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

/**
 * Hàm khởi tạo dữ liệu + trạng thái sidebar khi component được load lên
 * Sử dụng khi: Component được load lên đầu tiên
 * Created by: TDHieu (08/06/2026)
 */
onMounted(() => {
  stateSidebar();
});

// VARIABLE
// Biến trạng thái sidebar (thu gọn/ mở rộng)
const isCollapse = ref(false);
// Biến trạng thái hiển thị form thêm/sửa
const isShowForm = ref(false);
// Biến lưu dữ liệu chính, dữ liệu đang thao tác (thêm/sửa), dữ liệu toast, trạng thái alert, dữ liệu đang chờ cập nhật/xóa/nhập, cột hiển thị
const data = ref([]);
// Biến lưu dữ liệu đang thao tác (thêm/sửa)
const currentSalaryComposition = ref(null);
// Biến lưu dữ liệu toast
const toasts = ref([]);
// Biến trạng thái alert và thông tin alert
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
// Biến lưu thông tin đang chờ cập nhật/xóa/nhập dữ liệu, dùng để phân biệt khi người dùng xác nhận alert là đang thực hiện hành động nào
const pendingUpdate = ref(null);
const pendingDelete = ref(null);
const pendingAction = ref(null);
const alertSelectedOption = ref("");
// Biến lưu thông tin cột hiển thị, dùng để truyền vào component con để điều khiển cột nào được hiển thị
const visibleColumns = ref({

});
// Biến lưu thông tin route hiện tại, dùng để điều hướng route
const route = useRoute();

const closeAlert = () => {
  alertState.value.isShow = false;
  alertSelectedOption.value = "";
  pendingAction.value = null;
};

// FUNCTION:
/**
 * Lấy trạng thái sidebar từ localStorage khi component được load lên, nếu chưa có thì khởi tạo mặc định và lưu vào localStorage
 *
 * Sử dụng khi: Component được load lên đầu tiên
 *
 * CREATED BY: TDHieu (08/06/2026)
 */
const stateSidebar = () => {
  const stored = localStorage.getItem("sidebarCollapse");
  if (stored === null) {
    localStorage.setItem("sidebarCollapse", JSON.stringify(isCollapse.value));
    return;
  }
  isCollapse.value = JSON.parse(stored);
};

/**
 * Hàm điều khiển trạng thái hiển thị form thêm/sửa/reset
 *
 * Sử dụng khi: Người dùng click vào nút thêm mới (handleOpenFormAdd), click vào nút sửa (handleOpenFormEdit)
 *
 * CREATED BY: TDHieu (08/06/2026)
 */
const handleOpenFormAdd = () => {
  currentSalaryComposition.value = null;
  isShowForm.value = true;
};

/**
 * Hàm xác nhận alert
 *
 * Sử dụng khi: alert được bật lên và click vào xác nhận
 *
 * CREATED BY: TDHieu (08/06/2026)
 */
const handleConfirmAlert = () => {
  // Đóng alert
  alertState.value.isShow = false;

  // Nếu có callback onConfirm từ component con (vd: FormSalaryComposition)
  if (pendingAction.value) {
    pendingAction.value(alertSelectedOption.value);
    pendingAction.value = null;
    alertSelectedOption.value = "";
    return;
  }

  // Đóng form
  isShowForm.value = false;

  //Cập nhật dữ liệu
  if (pendingUpdate.value) {
    pendingUpdate.value = null;
    toasts.value.push({
      id: Date.now() + Math.random(),
      message: "Cập nhật thành công",
      type: "success",
      duration: 3000,
    });
  }
  //Xóa dữ liệu
  if (pendingDelete.value) {
    pendingDelete.value = null;
    toasts.value.push({
      id: Date.now() + Math.random(),
      message: "Xóa thành công",
      type: "success",
      duration: 3000,
    });
  }
};

/**
 * Hàm điều khiển mở form edit
 *
 * Sử dụng khi: Người dùng click vào nút sửa, đồng thời truyền dữ liệu cần sửa vào form thông qua biến currentSalaryComposition
 *
 * @param salaryData dữ liệu lương
 *
 * CREATED BY: TDHieu (08/06/2026)
 */
const handleOpenFormEdit = (salaryData) => {
  currentSalaryComposition.value = salaryData;
  isShowForm.value = true;
};

/**
 * Hàm điều khiển đóng form
 *
 * Sử dụng khi: Đóng form thêm/sửa, click vào overlay, hoặc sau khi xác nhận alert xong (handleConfirmAlert)
 *
 * CREATED BY: TDHieu (08/06/2026)
 */
const handleCloseForm = () => {
  isShowForm.value = false;
};

/**
 * Hàm điều khiển xóa dữ liệu
 *
 * Sử dụng khi: Người dùng click vào nút xóa, đồng thời lưu thông tin đang chờ xóa
 * vào biến pendingDelete để phân biệt khi người dùng xác nhận alert là đang thực hiện hành động nào
 *
 * @param salaryData dữ liệu lương
 *
 * CREATED BY: TDHieu (08/06/2026)
 */
const handleDeleteItem = (salaryData) => {
  // Hiển thị alert xác nhận xóa
  alertState.value = {
    isShow: true,
    title: "Xác nhận",
    message: "Bạn có chắc muốn xóa này không?",
    showConfirmButton: true,
    cancelText: "Hủy",
    confirmText: "Xác nhận",
    cancelType: "none",
    confirmType: "green"
  };
  //Lưu lại thông tin đang chờ xóa
  pendingDelete.value = { salaryData };
};

/**
 * Hàm mở alert
 *
 * Sử dụng khi: Component con muốn mở alert với thông tin tiêu đề, nội dung, nút xác nhận/hủy, kiểu nút,...
 * đồng thời có thể truyền callback onConfirm để thực hiện hành động sau khi người dùng xác nhận alert
 * (vd: gọi API xóa dữ liệu trong FormSalaryComposition)
 *
 * @param payload là một object có thể chứa các thuộc tính để mở alert
 *
 * CREATED BY: TDHieu (08/06/2026)
 */
const openAlert = (payload) => {
  // Lưu callback onConfirm nếu component con truyền vào
  pendingAction.value = payload.onConfirm ?? null;
  alertSelectedOption.value = payload.defaultOption ?? "";
  // Mở alert với thông tin từ payload, nếu không có thì sử dụng giá trị mặc định
  alertState.value = {
    isShow: true,
    title: payload.title,
    message: payload.message,
    showConfirmButton: payload.showConfirmButton ?? true,
    cancelText: payload.cancelText ?? "Hủy",
    confirmText: payload.confirmText ?? "Xác nhận",
    cancelType: payload.cancelType ?? "none",
    confirmType: payload.confirmType ?? "green",
    options: payload.options ?? [],
  };
};

/**
 * Hàm xóa toast
 *
 * Sử dụng khi: Người dùng click vào nút đóng của toast
 *
 * @param id ID của toast cần xóa
 * @returns Mô tả kết quả trả về
 *
 * CREATED BY: TDHieu (08/06/2026)
 */
const removeToast = (id) => {
  toasts.value = toasts.value.filter((toast) => toast.id !== id);
};

// NOTICE: watch trạng thái isCollapse để lưu vào localStorage mỗi khi có sự thay đổi,
// giúp duy trì trạng thái sidebar khi người dùng reload trang
watch(isCollapse, () => {
  localStorage.setItem("sidebarCollapse", isCollapse.value);
});
</script>
<style scoped>
.container {
  display: flex;
  height: calc(100vh - 48px);
}

.alert-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}

.alert-option {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
</style>
