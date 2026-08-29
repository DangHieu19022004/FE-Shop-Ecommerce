<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import FeatureInDevelopmentNotice from "@/components/dormmart/FeatureInDevelopmentNotice.vue";
import i18nCommon from "@/i18n/i18nCommon";

const Route = useRoute();
const Text = i18nCommon.FeatureUnavailable;
const Title = computed(() => String(Route.query.title || Text.DefaultTitle));
const Description = computed(() => String(
  Route.query.description || Text.DefaultDescription,
));
</script>

<template>
  <FeatureInDevelopmentNotice
    :title="Title"
    :description="Description"
    :back-label="Text.BackLabel"
    :home-label="Text.HomeLabel"
  />
</template>
