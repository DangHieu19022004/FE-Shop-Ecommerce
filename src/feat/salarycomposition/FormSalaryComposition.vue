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
        <div class="content_body">
         
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
.content_body {
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
</style>