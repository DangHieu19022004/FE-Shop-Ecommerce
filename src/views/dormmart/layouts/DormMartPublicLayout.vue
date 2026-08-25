<template>
  <DormMartPublicShell :search-value="searchValue">
    <router-view />
  </DormMartPublicShell>
</template>

<script setup>
import { computed, inject } from "vue";
import { useRoute } from "vue-router";
import DormMartPublicShell from "@/views/dormmart/components/DormMartPublicShell.vue";

const route = useRoute();
const Text = inject("i18nCommon").Common;

const searchValue = computed(() => {
  if (route.path.startsWith("/products")) return Text.SearchProductsValue;
  if (route.path === "/cart") return Text.SearchCartValue;
  return Text.SearchHomeValue;
});
</script>
