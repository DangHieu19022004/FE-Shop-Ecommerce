<template>
  <div class="ms-loader-container">
    <div class="ms-loader"></div>
    <span v-if="text" class="ms-loader-text">{{ text }}</span>
  </div>
</template>

<script setup>

const props = defineProps({
  text: {
    type: String,
    default: 'Đang tải dữ liệu...',
  },
});
</script>

<style scoped>
.ms-loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
}

.ms-loader {
  width: 36px;
  height: 36px;
  border: 4px solid #e5e7eb;
  border-top-color: #0E9A62;
  border-radius: 50%;
  animation: ms-loader-spin 1s linear infinite;
}

.ms-loader-text {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

@keyframes ms-loader-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
