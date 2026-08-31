<template>
  <div class="dm-admin">
    <AdminSidebar />
    <div class="dm-admin__body">
      <AdminTopbar />
      <main class="dm-admin__content"><slot /></main>
    </div>
  </div>
</template>

<script setup>
import AdminSidebar from "@/layouts/dormmart/components/AdminSidebar.vue";
import AdminTopbar from "@/layouts/dormmart/components/AdminTopbar.vue";
</script>
