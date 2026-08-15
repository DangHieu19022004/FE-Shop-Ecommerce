<template>
  <DormMartPublicShell :search-value="searchValue">
    <router-view />
  </DormMartPublicShell>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import DormMartPublicShell from "@/views/dormmart/components/DormMartPublicShell.vue";

const route = useRoute();

const searchValue = computed(() => {
  if (route.path.startsWith("/products")) return "appliances";
  if (route.path === "/cart") return "cart essentials";
  return "dorm essentials";
});
</script>
