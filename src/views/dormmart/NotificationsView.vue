<script setup>
import { onMounted, ref } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import { getNotifications, getUnreadNotificationCount, markNotificationRead } from "@/services/expansionService";
import { formatDateTime } from "@/utils/shopFormatters";

const Notifications = ref([]);
const UnreadCount = ref(0);
const ErrorMessage = ref("");
const IsLoading = ref(false);

const loadNotifications = async () => {
  IsLoading.value = true;
  ErrorMessage.value = "";

  try {
    const [NotificationData, CountData] = await Promise.all([
      getNotifications(),
      getUnreadNotificationCount(),
    ]);
    Notifications.value = NotificationData;
    UnreadCount.value = CountData;
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsLoading.value = false;
  }
};

const handleRead = async (NotificationId) => {
  try {
    await markNotificationRead(NotificationId);
    await loadNotifications();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

onMounted(loadNotifications);
</script>

<template>
  <section class="profile-page">
    <header class="profile-page__header">
      <div>
        <p class="profile-page__eyebrow">Dorm Mart</p>
        <h1>Thông báo</h1>
        <p>{{ UnreadCount }} thông báo chưa đọc.</p>
      </div>
      <router-link :to="{ name: 'profile' }" class="dm-btn">Quay lại hồ sơ</router-link>
    </header>

    <div v-if="ErrorMessage" class="dm-card" style="padding: 16px; color: var(--dm-danger);">{{ ErrorMessage }}</div>
    <section v-if="IsLoading" class="dm-card" style="padding: 16px;">Đang tải thông báo...</section>

    <article v-else class="profile-details dm-card">
      <h2>Danh sách thông báo</h2>
      <div v-if="Notifications.length" style="display: grid; gap: 12px; margin-top: 16px;">
        <div v-for="Item in Notifications" :key="Item.NotificationId" class="dm-card" style="padding: 16px; border: 1px solid var(--dm-border);">
          <div style="display: flex; justify-content: space-between; gap: 12px; align-items: start;">
            <div>
              <strong>{{ Item.Title }}</strong>
              <div>{{ Item.Content }}</div>
              <small>{{ Item.Type }} · {{ formatDateTime(Item.CreateDate) }}</small>
            </div>
            <DMButton v-if="!Item.IsRead" type="none" :is-tooltip="false" message="Đánh dấu đã đọc" class="admin-button" @click="handleRead(Item.NotificationId)" />
            <span v-else class="admin-status">Đã đọc</span>
          </div>
        </div>
      </div>
      <p v-else style="margin-top: 16px; color: var(--dm-text-soft);">Chưa có thông báo nào.</p>
    </article>
  </section>
</template>

<style scoped src="@/assets/styles/screens/profile.css"></style>
