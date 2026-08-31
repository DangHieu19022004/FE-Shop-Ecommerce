<template>
  <section class="admin-page">
    <header class="admin-page__header">
      <div>
        <h1>Kiểm duyệt đánh giá</h1>
        <p>Duyệt review thật từ backend Phase 13.</p>
      </div>
      <div style="min-width: 220px;">
        <DMSelect v-model="Status" :data="StatusOptions" option-label="Label" track-by="Value" :allow-empty="false" label-text="Trạng thái" @change="loadReviews" />
      </div>
    </header>

    <div v-if="ErrorMessage" class="dm-card" style="padding: 16px; color: var(--dm-danger);">{{ ErrorMessage }}</div>
    <article class="dm-card admin-panel" style="display: grid; gap: 12px;">
      <div v-for="Item in Reviews" :key="Item.ReviewId" class="admin-order-card" style="display: grid; gap: 8px;">
        <div>
          <strong>{{ Item.Title || 'Không có tiêu đề' }}</strong>
          <div class="admin-order-card__meta"><span>{{ Item.UserName }}</span><span>Rating {{ Item.Rating }}/5</span><span>{{ Item.Status }}</span></div>
        </div>
        <p>{{ Item.Content || 'Không có nội dung.' }}</p>
        <small>ProductId: {{ Item.ProductId }} · {{ formatDateTime(Item.CreateDate) }}</small>
        <DMInput v-model="RejectNotes[Item.ReviewId]" label="Ghi chú reject" />
        <div class="admin-order-card__actions">
          <DMButton type="none" :is-tooltip="false" message="Approve" class="admin-button" @click="handleApprove(Item.ReviewId)" />
          <DMButton type="none" :is-tooltip="false" message="Reject" class="admin-button admin-button--danger" @click="handleReject(Item.ReviewId)" />
        </div>
      </div>
      <p v-if="!Reviews.length" style="margin: 0; color: var(--dm-text-soft);">Chưa có review nào.</p>
    </article>
  </section>
</template>

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
const StatusOptions = [
  { Value: "", Label: "Tất cả" },
  { Value: 0, Label: "Pending" },
  { Value: 1, Label: "Approved" },
  { Value: 2, Label: "Rejected" },
];

const loadReviews = async () => {
  try {
    ErrorMessage.value = "";
    Reviews.value = await getAdminReviews(Status.value);
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

const handleApprove = async (ReviewId) => {
  try {
    await approveReview(ReviewId);
    await loadReviews();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

const handleReject = async (ReviewId) => {
  try {
    await rejectReview(ReviewId, RejectNotes.value[ReviewId] || "");
    await loadReviews();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

onMounted(loadReviews);
</script>

<style scoped lang="scss" src="@/assets/styles/screens/admin-operations.scss"></style>
