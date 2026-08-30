<template>
  <div class="dm-admin">
    <aside class="dm-admin__sidebar">
      <router-link to="/admin" class="dm-brand">
        <span class="dm-brand-icon dm-brand-icon--app-icon admin-brand__icon" aria-hidden="true"></span>
        <div class="admin-brand__name">{{ Text.BrandName }}</div>
      </router-link>

      <nav class="dm-admin__nav">
        <router-link :class="linkClass('/admin')" to="/admin">
          <span class="material-symbols-outlined">dashboard</span>
          <span>{{ Text.Overview }}</span>
        </router-link>
        <router-link :class="linkClass('/admin/finance')" to="/admin/finance"><span class="material-symbols-outlined">monitoring</span><span>{{ Text.Finance }}</span></router-link>
        <router-link :class="linkClass('/admin/accounts')" to="/admin/accounts"><span class="material-symbols-outlined">manage_accounts</span><span>{{ Text.Accounts }}</span></router-link>
        <router-link :class="linkClass('/admin/products')" to="/admin/products">
          <span class="material-symbols-outlined">inventory_2</span>
          <span>{{ Text.Products }}</span>
        </router-link>
        <router-link :class="linkClass('/admin/categories')" to="/admin/categories">
          <span class="material-symbols-outlined">category</span>
          <span>{{ Text.Categories }}</span>
        </router-link>
        <router-link :class="linkClass('/admin/brands')" to="/admin/brands">
          <span class="material-symbols-outlined">branding_watermark</span>
          <span>{{ Text.Brands }}</span>
        </router-link>
        <router-link :class="linkClass('/admin/orders')" to="/admin/orders">
          <span class="material-symbols-outlined">shopping_cart</span>
          <span>{{ Text.Orders }}</span>
        </router-link>
        <router-link :class="linkClass('/admin/support')" to="/admin/support"><span class="material-symbols-outlined">support_agent</span><span>{{ Text.Support }}</span></router-link>
        <router-link :class="linkClass('/admin/reviews')" to="/admin/reviews"><span class="material-symbols-outlined">reviews</span><span>Đánh giá</span></router-link>
        <router-link :class="linkClass('/admin/promotions')" to="/admin/promotions"><span class="material-symbols-outlined">sell</span><span>Khuyến mãi</span></router-link>
        <router-link class="dm-admin__link" to="/">
          <span class="material-symbols-outlined">storefront</span>
          <span>{{ Text.Storefront }}</span>
        </router-link>
      </nav>

      <button type="button" class="dm-admin__link" style="margin-top: auto; color: var(--dm-danger); width: 100%; background: transparent; border: 0;" @click="handleLogout">
        <span class="material-symbols-outlined">logout</span>
        <span>{{ Text.Logout }}</span>
      </button>
    </aside>

    <div class="dm-admin__body">
      <header class="dm-admin__topbar">
        <div
          class="dm-search"
          style="max-width: 420px;"
          role="button"
          tabindex="0"
          :aria-label="`${Text.SearchPlaceholder} - tính năng đang phát triển`"
          :title="`${Text.SearchPlaceholder} - tính năng đang phát triển`"
          @click="openSearchPlaceholder"
          @keydown.enter.prevent="openSearchPlaceholder"
          @keydown.space.prevent="openSearchPlaceholder"
        >
          <span class="material-symbols-outlined">search</span>
          <input type="text" :placeholder="`${Text.SearchPlaceholder} · Tính năng đang phát triển`" readonly />
        </div>

        <div class="dm-public-actions">
          <button type="button" class="dm-icon-btn" :aria-label="Text.NotificationLabel" :title="Text.NotificationLabel">
            <span class="material-symbols-outlined">notifications</span>
            <span class="dm-badge-dot">1</span>
          </button>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="text-align: right;">
              <div style="font-weight: 600; color: var(--dm-text);">{{ SessionData?.FullName || Text.AdminName }}</div>
              <div style="font-size: 12px; color: var(--dm-text-soft);">{{ SessionData?.Email || Text.AdminRole }}</div>
            </div>
            <div class="dm-icon-btn" :aria-label="Text.ProfileLabel" :title="Text.ProfileLabel">
              <span class="material-symbols-outlined">person</span>
            </div>
          </div>
        </div>
      </header>

      <main class="dm-admin__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getCurrentSession, logoutUser } from "@/services/authService";

const route = useRoute();
const Router = useRouter();
const Text = inject("i18nCommon").AdminNavigation;
const SessionData = computed(() => getCurrentSession());
const openSearchPlaceholder = () => {
  Router.push({
    name: "featureUnavailable",
    query: {
      title: "Tìm kiếm quản trị đang phát triển",
      description: "Ô tìm kiếm nhanh trong khu vực admin chưa hoàn thiện. Tạm thời vào từng màn quản trị để tra cứu dữ liệu trực tiếp.",
    },
  });
};

const linkClass = (path) => {
  const isActive = path === "/admin" ? route.path === path : route.path.startsWith(path);
  return ["dm-admin__link", isActive ? "dm-admin__link--active" : ""];
};

const handleLogout = async () => {
  await logoutUser();
  Router.replace({ name: "login" });
};
</script>
