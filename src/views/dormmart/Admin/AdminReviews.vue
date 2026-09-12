<script setup>
import { onMounted, ref } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import DMSelect from "@/components/base/DMSelect.vue";
import { approveReview, getAdminReviews, rejectReview } from "@/services/expansionService";
import { formatDateTime } from "@/utils/shopFormatters";

const Reviews = ref([]);
const Status = ref("");
const RejectNotes = ref({});
const ErrorMessage = ref("");
const IsLoading = ref(false);
const PendingReviewId = ref("");
const StatusOptions = [
  { Value: "", Label: "Tất cả" },
  { Value: 0, Label: "Chờ duyệt" },
  { Value: 1, Label: "Đã duyệt" },
  { Value: 2, Label: "Đã từ chối" },
];
const StatusLabels = { 0: "Chờ duyệt", 1: "Đã duyệt", 2: "Đã từ chối" };

const loadReviews = async () => {
  try {
    IsLoading.value = true;
    ErrorMessage.value = "";
    Reviews.value = await getAdminReviews(Status.value);
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally { IsLoading.value = false; }
};

const handleApprove = async (ReviewId) => {
  try {
    PendingReviewId.value = ReviewId;
    await approveReview(ReviewId);
    await loadReviews();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally { PendingReviewId.value = ""; }
};

const handleReject = async (ReviewId) => {
  try {
    PendingReviewId.value = ReviewId;
    await rejectReview(ReviewId, RejectNotes.value[ReviewId] || "");
    await loadReviews();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally { PendingReviewId.value = ""; }
};

onMounted(loadReviews);
</script>

<template>
  <section class="admin-page">
    <header class="admin-page__header">
      <div>
        <h1>Kiểm duyệt đánh giá</h1>
        <p>Kiểm tra nội dung, điểm đánh giá và trạng thái trước khi công khai.</p>
      </div>
      <div style="min-width: 220px;">
        <DMSelect v-model="Status" :data="StatusOptions" option-label="Label" track-by="Value" :allow-empty="false" label-text="Trạng thái" @change="loadReviews" />
      </div>
    </header>

    <div v-if="ErrorMessage" role="alert" class="dm-card" style="padding: 16px; color: var(--dm-danger);">{{ ErrorMessage }}</div>
    <div v-if="IsLoading" class="dm-card admin-panel" role="status">Đang tải đánh giá…</div>
    <article class="dm-card admin-panel" style="display: grid; gap: 12px;">
      <div v-for="Item in Reviews" :key="Item.ReviewId" class="admin-order-card" style="display: grid; gap: 8px;">
        <div>
          <strong>{{ Item.Title || 'Không có tiêu đề' }}</strong>
          <div class="admin-order-card__meta"><span>{{ Item.UserName || 'Khách hàng' }}</span><span>{{ Item.Rating ?? '—' }}/5 sao</span><span>{{ StatusLabels[Item.Status] || Item.Status || 'Chưa xác định' }}</span></div>
        </div>
        <p>{{ Item.Content || 'Không có nội dung.' }}</p>
        <small>Mã sản phẩm: {{ Item.ProductId || '—' }} · {{ formatDateTime(Item.CreateDate) }}</small>
        <DMInput v-model="RejectNotes[Item.ReviewId]" label="Lý do từ chối" />
        <div class="admin-order-card__actions">
          <DMButton type="none" :is-tooltip="false" message="Duyệt đánh giá" class="admin-button" :un-active="!!PendingReviewId" @click="handleApprove(Item.ReviewId)" />
          <DMButton type="none" :is-tooltip="false" message="Từ chối" class="admin-button admin-button--danger" :un-active="!!PendingReviewId" @click="handleReject(Item.ReviewId)" />
        </div>
      </div>
      <div v-if="!Reviews.length && !IsLoading" class="admin-reviews-empty"><span class="material-symbols-outlined">reviews</span><h2>Không có đánh giá phù hợp</h2><p>Đánh giá mới hoặc đánh giá thuộc trạng thái đã chọn sẽ xuất hiện tại đây.</p></div>
    </article>
  </section>
</template>

<style scoped lang="scss" src="@/assets/styles/screens/admin-operations.scss"></style>
<style scoped>
.admin-reviews-empty { display: grid; place-items: center; gap: 8px; padding: 44px 20px; color: var(--dm-text-soft); text-align: center; }
.admin-reviews-empty .material-symbols-outlined { font-size: 42px; color: var(--dm-primary); }
.admin-reviews-empty h2, .admin-reviews-empty p { margin: 0; }
.admin-reviews-empty h2 { color: var(--dm-text); font-size: 20px; }
</style>
