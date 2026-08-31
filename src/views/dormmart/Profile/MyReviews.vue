<template>
  <section class="profile-page">
    <header class="profile-page__header">
      <div>
        <p class="profile-page__eyebrow">Dorm Mart</p>
        <h1>Đánh giá của tôi</h1>
        <p>Xem lại review đã gửi từ API thật.</p>
      </div>
      <router-link :to="{ name: 'profile' }" class="dm-btn">Quay lại hồ sơ</router-link>
    </header>

    <div v-if="ErrorMessage" class="dm-card" style="padding: 16px; color: var(--dm-danger);">{{ ErrorMessage }}</div>
    <section v-if="IsLoading" class="dm-card" style="padding: 16px;">Đang tải reviews...</section>

    <article v-else class="profile-details dm-card">
      <h2>Danh sách review</h2>
      <div v-if="Reviews.length" style="display: grid; gap: 12px; margin-top: 16px;">
        <div v-for="Item in Reviews" :key="Item.ReviewId" class="dm-card" style="padding: 16px;">
          <strong>{{ Item.Title || 'Không có tiêu đề' }}</strong>
          <div>Rating: {{ Item.Rating }}/5 · {{ Item.Status }}</div>
          <p style="margin: 8px 0;">{{ Item.Content || 'Không có nội dung.' }}</p>
          <small>ProductId: {{ Item.ProductId }} · {{ formatDateTime(Item.CreateDate) }}</small>
        </div>
      </div>
      <p v-else style="margin-top: 16px; color: var(--dm-text-soft);">Bạn chưa gửi review nào.</p>
    </article>
  </section>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { getMyReviews } from "@/services/expansionService";
import { formatDateTime } from "@/utils/shopFormatters";

const Reviews = ref([]);
const ErrorMessage = ref("");
const IsLoading = ref(false);

const loadReviews = async () => {
  IsLoading.value = true;
  ErrorMessage.value = "";

  try {
    Reviews.value = await getMyReviews();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsLoading.value = false;
  }
};

onMounted(loadReviews);
</script>

<style scoped lang="scss" src="@/assets/styles/screens/profile.scss"></style>
