<template>
  <div class="dm-admin">
    <AdminSidebar :is-collapsed="IsSidebarCollapsed" />
    <div class="dm-admin__body">
      <AdminTopbar :is-sidebar-collapsed="IsSidebarCollapsed" @toggle-sidebar="toggleSidebar" />
      <main class="dm-admin__content"><slot /></main>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import AdminSidebar from "@/layouts/dormmart/components/AdminSidebar.vue";
import AdminTopbar from "@/layouts/dormmart/components/AdminTopbar.vue";

const IsSidebarCollapsed = ref(false);
const toggleSidebar = () => { IsSidebarCollapsed.value = !IsSidebarCollapsed.value; };
</script>
