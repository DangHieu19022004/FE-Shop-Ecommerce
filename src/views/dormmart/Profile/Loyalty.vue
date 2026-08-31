<template>
  <section class="profile-page">
    <header class="profile-page__header">
      <div>
        <p class="profile-page__eyebrow">Dorm Mart</p>
        <h1>Điểm thưởng</h1>
        <p>Theo dõi số dư điểm và lịch sử cộng trừ từ backend thật.</p>
      </div>
      <router-link :to="{ name: 'profile' }" class="dm-btn">Quay lại hồ sơ</router-link>
    </header>

    <div v-if="ErrorMessage" class="dm-card" style="padding: 16px; color: var(--dm-danger);">{{ ErrorMessage }}</div>
    <section v-if="IsLoading" class="dm-card" style="padding: 16px;">Đang tải loyalty...</section>

    <div v-else class="profile-page__grid" style="grid-template-columns: 1fr;">
      <article class="profile-summary dm-card">
        <div class="profile-summary__avatar">{{ Balance?.Balance ?? 0 }}</div>
        <div>
          <h2>{{ Balance?.Balance ?? 0 }} điểm</h2>
          <p>UserId: {{ Balance?.UserId || '-' }}</p>
        </div>
      </article>

      <article class="profile-details dm-card">
        <h2>Lịch sử điểm</h2>
        <div v-if="History.length" style="display: grid; gap: 12px; margin-top: 16px;">
          <div v-for="Item in History" :key="Item.LoyaltyPointId" class="dm-card" style="padding: 16px;">
            <strong>{{ Item.PointsChange > 0 ? '+' : '' }}{{ Item.PointsChange }} điểm</strong>
            <div>{{ Item.Reason }}</div>
            <small>Số dư sau giao dịch: {{ Item.BalanceAfter }} · {{ formatDateTime(Item.CreateDate) }}</small>
          </div>
        </div>
        <p v-else style="margin-top: 16px; color: var(--dm-text-soft);">Chưa có giao dịch điểm thưởng.</p>
      </article>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { getLoyaltyBalance, getLoyaltyHistory } from "@/services/expansionService";
import { formatDateTime } from "@/utils/shopFormatters";

const Balance = ref(null);
const History = ref([]);
const ErrorMessage = ref("");
const IsLoading = ref(false);

const loadLoyalty = async () => {
  IsLoading.value = true;
  ErrorMessage.value = "";

  try {
    const [BalanceData, HistoryData] = await Promise.all([
      getLoyaltyBalance(),
      getLoyaltyHistory(),
    ]);
    Balance.value = BalanceData;
    History.value = HistoryData.length ? HistoryData : (BalanceData?.History || []);
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsLoading.value = false;
  }
};

onMounted(loadLoyalty);
</script>

<style scoped lang="scss" src="@/assets/styles/screens/profile.scss"></style>
