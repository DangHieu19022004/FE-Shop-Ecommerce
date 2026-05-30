<template>
  <div class="popup-setting-column" @click.stop>
    <div class="title">
        <div class="title__header">
            <div class="title__header-left">
                <div class="title-header-left-text">Tùy chỉnh cột</div>
            </div>
            <div class="title__header-right">
                <MsButton
                    iconLeft="mi-update"
                    tooltipMesage="Lấy lại mặc định"    
                />
            </div>
        </div>
    </div>
    <div class="content-body-search">
        <MsButton
            iconLeft="mi-search"
            tooltipMessage="Tìm kiếm"
            unActive
            tooltipPosition="bottom"
        />
        <MsInput placeholder="Tìm kiếm" class="content-body-search-input" />
    </div>
    <!-- danh sách cột -->
    <div class="config-table">
        <div class="config-table-header">
            <MsCheckbox
                v-model="selected"
                label="Tất cả các cột"
                class="fz-14"
            />
        </div>
        <div class="config-table-body">
            chưa có data
        </div>
    </div>
    <div class="action">
        <MsButton
            :isTooltip="false"
            message="Lưu"
            type="green"
        />
    </div>
  </div>
</template>
<script setup>
import MsButton from '@/components/base/MsButton.vue';
import MsInput from '@/components/base/MsInput.vue';
import MsCheckbox from '@/components/base/MsCheckbox.vue';
import { ref, onMounted, onBeforeUnmount } from 'vue';

const emit = defineEmits(['close']);
const selected = ref(false);

const handleClickOutside = () => {
  emit('close');
};

onMounted(() => {
  // next tick để không bắt ngược click hiện tại
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside);
  }, 0);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
<style scoped>
/* ── Popup container ── */
.popup-setting-column {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  z-index: 600;
  width: 340px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(17, 24, 39, 0.14);
  border: 1px solid #e5e7eb;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.title__header{
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.title-header-left-text {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}
.content-body-search {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 8px;
  width: 100%;
  height: 32px;
  border: 1px solid #d9dee7;
}
.content-body-search:hover,
.content-body-search:focus-within {
  border-color: #34B057;
}
.config-table {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}
.config-table-header {
  padding: 8px 12px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}
.config-table-body {
  padding: 8px 12px;
  font-size: 13px;
  color: #9ca3af;
  min-height: 80px;
}
.action {
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
}
:deep(.ms-input-in.content-body-search-input) {
  color: #111;
  background-color: transparent;
  border: none;
}
:deep(.ms-input-in.content-body-search-input:focus),
:deep(.ms-input-in.content-body-search-input:focus-visible) {
  border: none;
  outline: none !important;
  box-shadow: none;
}
</style>