<template>
  <div class="dm-admin">
    <AdminSidebar :is-collapsed="IsSidebarCollapsed" />
    <button v-if="!IsSidebarCollapsed" class="dm-admin__mobile-backdrop" aria-label="Đóng menu quản trị" @click="IsSidebarCollapsed = true" />
    <div class="dm-admin__body">
      <AdminTopbar :is-sidebar-collapsed="IsSidebarCollapsed" @toggle-sidebar="toggleSidebar" />
      <main class="dm-admin__content"><slot /></main>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import AdminSidebar from "@/layouts/dormmart/components/AdminSidebar.vue";
import AdminTopbar from "@/layouts/dormmart/components/AdminTopbar.vue";

const MobileQuery = window.matchMedia("(max-width: 720px)");
const IsSidebarCollapsed = ref(MobileQuery.matches);
const Route = useRoute();
const syncSidebar = () => { IsSidebarCollapsed.value = MobileQuery.matches; };
onMounted(() => MobileQuery.addEventListener("change", syncSidebar));
onUnmounted(() => MobileQuery.removeEventListener("change", syncSidebar));
watch(() => Route.fullPath, () => { if (MobileQuery.matches) IsSidebarCollapsed.value = true; });
const toggleSidebar = () => { IsSidebarCollapsed.value = !IsSidebarCollapsed.value; };
</script>
<style>
.dm-admin__mobile-backdrop { display: none; }
@media (max-width: 720px) {
  .dm-admin .dm-admin__sidebar { position: fixed; top: 72px; bottom: 0; left: 0; height: calc(100dvh - 72px); z-index: 30; width: min(280px, 85vw); }
  .dm-admin .dm-admin__sidebar--collapsed { display: none; }
  .dm-admin__mobile-backdrop { display: block; position: fixed; inset: 72px 0 0 min(280px, 85vw); z-index: 25; border: 0; background: rgba(15, 23, 42, .4); }
  .dm-admin__topbar { z-index: 35; height: 72px; padding: 12px; gap: 8px; }
  .dm-admin__topbar > .dm-search { display: none; }
  .dm-admin__topbar .dm-public-actions { min-width: 0; gap: 8px; }
  .dm-admin__topbar .dm-public-actions > div:last-child { min-width: 0; }
  .dm-admin__topbar .dm-public-actions > div:last-child > div:first-child { min-width: 0; max-width: 170px; overflow: hidden; }
  .dm-admin__topbar .dm-public-actions > div:last-child > div:first-child > div { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
}
</style>
