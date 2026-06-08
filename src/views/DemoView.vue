<template>
  <div class="developing-page">
    <div class="developing-card">
      <div class="icon-wrapper">
        <span class="icon">🚧</span>
      </div>

      <h1 class="title">Tính năng đang phát triển</h1>

      <p class="description">
        Chức năng này hiện đang được đội ngũ phát triển hoàn thiện.
        Vui lòng quay lại sau để trải nghiệm phiên bản mới nhất.
      </p>

      <MsButton class="back-btn" @click="goBack" message="Quay lại" iconLeft="fa-solid fa-arrow-left m-r-8" :isTooltip="false" />
    </div>
  </div>
</template>

<script setup>
import MsButton from "@/components/base/MsButton.vue";
const goBack = () => {
  window.history.back()
}
</script>

<style scoped>
.developing-page {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa, #e4ecf5);
  padding: 24px;
  width: 100%;
  flex: 1;
}

.developing-card {
  width: 100%;
  max-width: 500px;
  background: #ffffff;
  border-radius: 20px;
  padding: 48px 32px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.icon-wrapper {
  width: 90px;
  height: 90px;
  margin: 0 auto 24px;
  border-radius: 50%;
  background-color: #fff7e6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  font-size: 42px;
}

.title {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 16px;
}

.description {
  font-size: 16px;
  line-height: 1.7;
  color: #6b7280;
  margin-bottom: 32px;
}

.back-btn {
  border: none;
  outline: none;
  padding: 12px 28px;
  border-radius: 10px;
  background: #2563eb;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}
</style>