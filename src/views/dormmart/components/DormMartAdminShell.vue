<template>
  <div class="dm-admin">
    <aside class="dm-admin__sidebar">
      <router-link to="/admin" class="dm-brand">
        <span class="dm-brand-icon dm-brand-icon--app-icon admin-brand__icon" aria-hidden="true"></span>
        <div class="admin-brand__name">Dorm Mart</div>
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
        <router-link :class="linkClass('/admin/orders')" to="/admin/orders">
          <span class="material-symbols-outlined">shopping_cart</span>
          <span>{{ Text.Orders }}</span>
        </router-link>
        <router-link :class="linkClass('/admin/support')" to="/admin/support"><span class="material-symbols-outlined">support_agent</span><span>{{ Text.Support }}</span></router-link>
        <router-link class="dm-admin__link" to="/">
          <span class="material-symbols-outlined">storefront</span>
          <span>{{ Text.Storefront }}</span>
        </router-link>
      </nav>

      <router-link class="dm-admin__link" to="/login" style="margin-top: auto; color: var(--dm-danger);">
        <span class="material-symbols-outlined">logout</span>
        <span>{{ Text.Logout }}</span>
      </router-link>
    </aside>

    <div class="dm-admin__body">
      <header class="dm-admin__topbar">
        <label class="dm-search" style="max-width: 420px;">
          <span class="material-symbols-outlined">search</span>
          <input type="text" :placeholder="Text.SearchPlaceholder" readonly />
        </label>

        <div class="dm-public-actions">
          <button type="button" class="dm-icon-btn" aria-label="Notifications">
            <span class="material-symbols-outlined">notifications</span>
            <span class="dm-badge-dot">1</span>
          </button>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="text-align: right;">
              <div style="font-weight: 600; color: var(--dm-text);">{{ Text.AdminName }}</div>
              <div style="font-size: 12px; color: var(--dm-text-soft);">{{ Text.AdminRole }}</div>
            </div>
            <div class="dm-icon-btn">
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
import { inject } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const Text = inject("i18nCommon").AdminNavigation;

const linkClass = (path) => {
  const isActive = path === "/admin" ? route.path === path : route.path.startsWith(path);
  return ["dm-admin__link", isActive ? "dm-admin__link--active" : ""];
};
</script>
