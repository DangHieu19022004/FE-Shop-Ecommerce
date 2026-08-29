<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import FeatureInDevelopmentNotice from "@/components/dormmart/FeatureInDevelopmentNotice.vue";

const Route = useRoute();
const Title = computed(() => String(Route.query.title || "Tính năng đang phát triển"));
const Description = computed(() => String(
  Route.query.description || "Khu vực này chưa hoàn thiện. Quay lại sau để dùng bản đầy đủ hơn.",
));
</script>

<template>
  <FeatureInDevelopmentNotice
    :title="Title"
    :description="Description"
    back-label="Quay lại"
    home-label="Về trang chủ"
  />
</template>
