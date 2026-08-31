<template>
  <aside class="dm-admin__sidebar">
    <router-link to="/admin" class="dm-brand"><span class="dm-brand-icon dm-brand-icon--app-icon admin-brand__icon" aria-hidden="true"></span><div class="admin-brand__name">{{ Text.BrandName }}</div></router-link>
    <nav class="dm-admin__nav">
      <router-link :class="linkClass('/admin')" to="/admin"><span class="material-symbols-outlined">dashboard</span><span>{{ Text.Overview }}</span></router-link>
      <router-link :class="linkClass('/admin/finance')" to="/admin/finance"><span class="material-symbols-outlined">monitoring</span><span>{{ Text.Finance }}</span></router-link>
      <router-link :class="linkClass('/admin/accounts')" to="/admin/accounts"><span class="material-symbols-outlined">manage_accounts</span><span>{{ Text.Accounts }}</span></router-link>
      <router-link :class="linkClass('/admin/products')" to="/admin/products"><span class="material-symbols-outlined">inventory_2</span><span>{{ Text.Products }}</span></router-link>
      <router-link :class="linkClass('/admin/categories')" to="/admin/categories"><span class="material-symbols-outlined">category</span><span>{{ Text.Categories }}</span></router-link>
      <router-link :class="linkClass('/admin/brands')" to="/admin/brands"><span class="material-symbols-outlined">branding_watermark</span><span>{{ Text.Brands }}</span></router-link>
      <router-link :class="linkClass('/admin/orders')" to="/admin/orders"><span class="material-symbols-outlined">shopping_cart</span><span>{{ Text.Orders }}</span></router-link>
      <router-link :class="linkClass('/admin/support')" to="/admin/support"><span class="material-symbols-outlined">support_agent</span><span>{{ Text.Support }}</span></router-link>
      <router-link :class="linkClass('/admin/reviews')" to="/admin/reviews"><span class="material-symbols-outlined">reviews</span><span>Đánh giá</span></router-link>
      <router-link :class="linkClass('/admin/promotions')" to="/admin/promotions"><span class="material-symbols-outlined">sell</span><span>Khuyến mãi</span></router-link>
      <router-link class="dm-admin__link" to="/"><span class="material-symbols-outlined">storefront</span><span>{{ Text.Storefront }}</span></router-link>
    </nav>
    <button type="button" class="dm-admin__link" style="margin-top: auto; color: var(--dm-danger); width: 100%; background: transparent; border: 0;" @click="handleLogout"><span class="material-symbols-outlined">logout</span><span>{{ Text.Logout }}</span></button>
  </aside>
</template>

<script setup>
import { inject } from "vue";
import { useRoute, useRouter } from "vue-router";
import { logoutUser } from "@/services/authService";

const Route = useRoute();
const Router = useRouter();
const Text = inject("i18nCommon").AdminNavigation;
const linkClass = (Path) => {
  const IsActive = Path === "/admin" ? Route.path === Path : Route.path.startsWith(Path);
  return ["dm-admin__link", IsActive ? "dm-admin__link--active" : ""];
};
const handleLogout = async () => {
  await logoutUser();
  Router.replace({ name: "login" });
};
</script>
