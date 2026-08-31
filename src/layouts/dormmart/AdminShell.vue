<template>
  <div class="dm-admin">
    <button
      v-if="IsSidebarOpen"
      type="button"
      class="dm-admin__sidebar-backdrop"
      :aria-label="Text.CloseMenu"
      @click="closeSidebar"
    ></button>
    <AdminSidebar :is-open="IsSidebarOpen" @close="closeSidebar" />
    <div class="dm-admin__body">
      <AdminTopbar @toggle-sidebar="toggleSidebar" />
      <main class="dm-admin__content"><slot /></main>
    </div>
  </div>
</template>

<script setup>
import { inject, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import AdminSidebar from "@/layouts/dormmart/components/AdminSidebar.vue";
import AdminTopbar from "@/layouts/dormmart/components/AdminTopbar.vue";

const Route = useRoute();
const Text = inject("i18nCommon").AdminNavigation;
const IsSidebarOpen = ref(false);
const closeSidebar = () => { IsSidebarOpen.value = false; };
const toggleSidebar = () => { IsSidebarOpen.value = !IsSidebarOpen.value; };
const handleEscape = (Event) => {
  if (Event.key === "Escape") closeSidebar();
};

watch(() => Route.fullPath, closeSidebar);
watch(IsSidebarOpen, (IsOpen) => document.body.classList.toggle("dm-sidebar-open", IsOpen));
onMounted(() => document.addEventListener("keydown", handleEscape));
onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleEscape);
  document.body.classList.remove("dm-sidebar-open");
});
</script>
