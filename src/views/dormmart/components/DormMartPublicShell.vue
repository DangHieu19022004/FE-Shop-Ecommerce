<template>
  <div class="dm-page">
    <header class="dm-public-header">
      <div class="dm-public-header__top">
        <div class="dm-public-header__links">
          <router-link v-if="IsAdmin" to="/admin">Admin</router-link>
          <router-link to="/">Trang chủ</router-link>
          <router-link to="/products">Danh sách sản phẩm</router-link>
          <router-link :to="{ name: 'promotionList' }">{{ Text.PromotionLink }}</router-link>
          <router-link :to="{ name: 'comboList' }">{{ Text.ComboLink }}</router-link>
          <router-link to="/about">Về chúng tôi</router-link>
        </div>
        <div class="dm-public-header__links">
          <router-link :to="{ name: 'orderHistory' }">{{ Text.OrderHistoryLink }}</router-link>
          <router-link :to="{ name: 'support' }">{{ Text.SupportLink }}</router-link>
          <router-link v-if="!SessionData" to="/login">Đăng nhập</router-link>
          <router-link v-if="!SessionData" to="/register">Đăng ký</router-link>
          <router-link v-else to="/profile">{{ SessionData.FullName }}</router-link>
        </div>
      </div>

      <div class="dm-public-header__main">
        <router-link to="/" class="dm-brand" :aria-label="Text.HomeAriaLabel">
          <span class="dm-brand__lockup" aria-hidden="true">
            <span class="dm-brand-icon dm-brand-icon--horizontal-logo"></span>
            <span class="dm-brand__tagline">{{ Text.BrandTagline }}</span>
          </span>
        </router-link>

        <form class="dm-search" role="search" @submit.prevent="submitSearch">
          <span class="material-symbols-outlined" aria-hidden="true">search</span>
          <DMInput
            v-model="SearchValue"
            type="search"
            :placeholder="Text.SearchPlaceholder"
            :aria-label="Text.SearchButton"
          />
          <DMButton
            native-type="submit"
            type="none"
            :is-tooltip="false"
            class="dm-icon-btn"
            icon-name="search"
            :aria-label="Text.SearchButton"
          />
        </form>

        <div class="dm-public-actions">
          <DMDropdown
            v-if="SessionData"
            :Items="NotificationItems"
            :Label="Text.NotificationLabel"
            Icon="notifications"
            :BadgeCount="UnreadCount"
            :Loading="IsLoadingNotifications"
            :LoadingText="Text.NotificationsLoading"
            :ErrorText="NotificationError"
            :RetryText="Text.RetryNotifications"
            :EmptyText="Text.NotificationsEmpty"
            :CloseOnSelect="false"
            @open="loadNotifications"
            @retry="loadNotifications"
            @select="readNotification"
          >
            <template #footer="{ close }">
              <router-link to="/profile/notifications" @click="close">{{ Text.AllNotifications }}</router-link>
            </template>
          </DMDropdown>
          <router-link class="dm-icon-btn dm-cart-button" to="/cart" :aria-label="Text.CartLabel">
            <span class="material-symbols-outlined">shopping_cart</span>
            <span v-if="CartTotalQuantity" class="dm-badge-dot">{{ CartTotalQuantity }}</span>
          </router-link>
          <router-link class="dm-icon-btn" to="/profile" :aria-label="Text.AccountLabel">
            <span class="material-symbols-outlined">person</span>
          </router-link>
        </div>
      </div>
    </header>

    <main class="dm-public-main">
      <div class="dm-container">
        <slot />
      </div>
    </main>

    <footer class="dm-footer">
      <div class="dm-footer__inner">
        <div class="dm-footer__grid">
          <div class="dm-footer__column">
            <h4>{{ Text.BrandName }}</h4>
            <p>{{ Text.BrandDescription }}</p>
          </div>
          <div class="dm-footer__column">
            <h4>{{ Text.CustomerServiceTitle }}</h4>
            <a href="#">{{ Text.HelpCenter }}</a>
            <a href="#">{{ Text.Blog }}</a>
            <a href="#">{{ Text.ReturnRefund }}</a>
          </div>
          <div class="dm-footer__column">
            <h4>{{ Text.AboutTitle }}</h4>
            <a href="#">{{ Text.OurStory }}</a>
            <a href="#">{{ Text.StudentSeller }}</a>
            <a href="#">{{ Text.Careers }}</a>
          </div>
          <div class="dm-footer__column">
            <h4>{{ Text.PaymentTitle }}</h4>
            <span>{{ Text.Visa }}</span>
            <span>{{ Text.Mastercard }}</span>
            <span>{{ Text.CashOnDelivery }}</span>
          </div>
        </div>

        <div class="dm-footer__bottom">
          <span>{{ Text.Copyright }}</span>
          <span>{{ Text.Regions }}</span>
        </div>
      </div>
    </footer>
    <SupportChatWidget />
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import DMButton from "@/components/base/DMButton.vue";
import DMDropdown from "@/components/base/DMDropdown.vue";
import DMInput from "@/components/base/DMInput.vue";
import { CartTotalQuantity } from "@/stores/cartStore";
import SupportChatWidget from "@/components/dormmart/SupportChatWidget.vue";
import { getCurrentSession } from "@/services/authService";
import { getNotifications, getUnreadNotificationCount, markNotificationRead } from "@/services/expansionService";
import { formatDateTime } from "@/utils/shopFormatters";

const Route = useRoute();
const Router = useRouter();
const Text = inject("i18nCommon").Common;
const SessionData = computed(() => getCurrentSession());
const IsAdmin = computed(() => SessionData.value?.Roles?.includes("Admin"));
const SearchValue = ref("");
const Notifications = ref([]);
const UnreadCount = ref(0);
const IsLoadingNotifications = ref(false);
const NotificationError = ref("");
const PendingNotificationId = ref(null);

const NotificationItems = computed(() => Notifications.value.map((Item) => ({
  Id: Item.NotificationId,
  Title: Item.Title,
  Description: Item.Content,
  Meta: Item.CreateDate ? formatDateTime(Item.CreateDate) : "",
  IsUnread: !Item.IsRead,
  Icon: Item.IsRead ? "drafts" : "mark_email_unread",
  Disabled: PendingNotificationId.value === Item.NotificationId,
})));

const submitSearch = () => {
  const Query = Route.name === "productList" ? { ...Route.query } : {};
  const Search = SearchValue.value.trim();
  if (Search) Query.Search = Search;
  else delete Query.Search;
  Query.PageIndex = 1;
  return Router.push({ name: "productList", query: Query });
};

const loadNotifications = async () => {
  if (!SessionData.value || IsLoadingNotifications.value) return;
  IsLoadingNotifications.value = true;
  NotificationError.value = "";
  try {
    const [List, Count] = await Promise.all([getNotifications(), getUnreadNotificationCount()]);
    Notifications.value = List;
    UnreadCount.value = Count;
  } catch {
    NotificationError.value = Text.NotificationsError;
  } finally {
    IsLoadingNotifications.value = false;
  }
};

const readNotification = async (Item) => {
  if (!Item.IsUnread || PendingNotificationId.value !== null) return;
  PendingNotificationId.value = Item.Id;
  try {
    await markNotificationRead(Item.Id);
    const Notification = Notifications.value.find((Entry) => Entry.NotificationId === Item.Id);
    if (Notification) Notification.IsRead = true;
    UnreadCount.value = Math.max(0, UnreadCount.value - 1);
  } catch {
    NotificationError.value = Text.NotificationsError;
  } finally {
    PendingNotificationId.value = null;
  }
};

watch(
  () => Route.query.Search,
  (Search) => {
    if (Route.name === "productList") SearchValue.value = typeof Search === "string" ? Search : "";
  },
  { immediate: true }
);

onMounted(loadNotifications);
</script>
