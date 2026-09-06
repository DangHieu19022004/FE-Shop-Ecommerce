<template>
  <header class="dm-admin__topbar">
    <button
      type="button"
      class="dm-icon-btn dm-admin__menu-toggle"
      :aria-label="isSidebarCollapsed ? Text.ExpandMenu : Text.CollapseMenu"
      :aria-pressed="isSidebarCollapsed"
      @click="Emit('toggle-sidebar')"
    >
      <span class="material-symbols-outlined" aria-hidden="true">menu</span>
    </button>
    <div class="dm-search" style="max-width: 420px;" role="search">
      <span class="material-symbols-outlined" aria-hidden="true">search</span>
      <DMInput v-model="SearchValue" type="search" :placeholder="Text.SearchPlaceholder" :aria-label="Text.SearchPlaceholder" />
    </div>
    <div class="dm-public-actions">
      <DMDropdown
        :Items="NotificationItems" :Label="Text.NotificationLabel" Icon="notifications"
        :BadgeCount="UnreadCount" :Loading="IsLoading" :LoadingText="Text.NotificationsLoading"
        :ErrorText="NotificationError" :RetryText="Text.RetryNotifications" :EmptyText="Text.NotificationsEmpty"
        :CloseOnSelect="false" @open="loadNotifications" @retry="loadNotifications" @select="readNotification"
      >
        <template #footer="{ close }"><router-link to="/profile/notifications" @click="close">{{ Text.AllNotifications }}</router-link></template>
      </DMDropdown>
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="text-align: right;"><div style="font-weight: 600; color: var(--dm-text);">{{ SessionData?.FullName || Text.AdminName }}</div><div style="font-size: 12px; color: var(--dm-text-soft);">{{ SessionData?.Email || Text.AdminRole }}</div></div>
        <div class="dm-icon-btn" :aria-label="Text.ProfileLabel" :title="Text.ProfileLabel"><span class="material-symbols-outlined">person</span></div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, inject, onMounted, ref } from "vue";
import { getCurrentSession } from "@/services/authService";
import DMInput from "@/components/base/DMInput.vue";
import DMDropdown from "@/components/base/DMDropdown.vue";
import { getNotifications, getUnreadNotificationCount, markNotificationRead } from "@/services/expansionService";
import { formatDateTime } from "@/utils/shopFormatters";

const Text = inject("i18nCommon").AdminNavigation;
defineProps({
  isSidebarCollapsed: {
    type: Boolean,
    default: false,
  },
});
const Emit = defineEmits(["toggle-sidebar"]);
const SessionData = computed(() => getCurrentSession());
const Notifications = ref([]);
const UnreadCount = ref(0);
const IsLoading = ref(false);
const NotificationError = ref('');
const PendingId = ref(null);
const SearchValue = ref("");
const NotificationItems = computed(() => Notifications.value.map((Item) => ({
  Id: Item.NotificationId,
  Title: Item.Title,
  Description: Item.Content,
  Meta: Item.CreateDate ? formatDateTime(Item.CreateDate) : '',
  IsUnread: !Item.IsRead,
  Icon: Item.IsRead ? 'drafts' : 'mark_email_unread',
  Disabled: PendingId.value === Item.NotificationId,
})));
const loadNotifications = async () => {
  if (IsLoading.value) return;
  IsLoading.value = true;
  NotificationError.value = '';
  try {
    const [List, Count] = await Promise.all([getNotifications(), getUnreadNotificationCount()]);
    Notifications.value = List;
    UnreadCount.value = Count;
  } catch {
    NotificationError.value = Text.NotificationsError;
  } finally { IsLoading.value = false; }
};
const readNotification = async (Item) => {
  if (!Item.IsUnread || PendingId.value !== null) return;
  PendingId.value = Item.Id;
  try {
    await markNotificationRead(Item.Id);
    const Notification = Notifications.value.find((Entry) => Entry.NotificationId === Item.Id);
    if (Notification) Notification.IsRead = true;
    UnreadCount.value = Math.max(0, UnreadCount.value - 1);
  } catch { NotificationError.value = Text.NotificationsError; }
  finally { PendingId.value = null; }
};
onMounted(loadNotifications);
</script>
