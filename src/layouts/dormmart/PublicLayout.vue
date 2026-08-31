<template>
  <PublicShell :search-value="SearchValue">
    <router-view />
  </PublicShell>
</template>

<script setup>
import { computed, inject } from "vue";
import { useRoute } from "vue-router";
import PublicShell from "@/layouts/dormmart/PublicShell.vue";

const Route = useRoute();
const Text = inject("i18nCommon").Common;

const SearchValue = computed(() => {
  if (Route.path.startsWith("/combos")) return Text.SearchComboValue;
  if (Route.path.startsWith("/products")) return Text.SearchProductsValue;
  if (Route.path === "/cart") return Text.SearchCartValue;
  return Text.SearchHomeValue;
});
</script>
