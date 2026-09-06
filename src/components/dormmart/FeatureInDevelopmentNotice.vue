<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import DMButton from "@/components/base/DMButton.vue";
import i18nCommon from "@/i18n/i18nCommon";

const Text = i18nCommon.FeatureUnavailable;

const Props = defineProps({
  title: {
    type: String,
    default: i18nCommon.FeatureUnavailable.DefaultTitle,
  },
  description: {
    type: String,
    default: i18nCommon.FeatureUnavailable.DefaultDescription,
  },
  backLabel: {
    type: String,
    default: i18nCommon.FeatureUnavailable.BackToPrevious,
  },
  homeLabel: {
    type: String,
    default: i18nCommon.FeatureUnavailable.HomeLabel,
  },
  compact: {
    type: Boolean,
    default: false,
  },
});

const Router = useRouter();
const NoticeClass = computed(() => ["feature-dev-notice", Props.compact ? "feature-dev-notice--compact" : ""]);

const goBack = () => {
  if (window.history.length > 1) {
    Router.back();
    return;
  }

  Router.push({ name: "home" });
};
</script>

<template>
  <section :class="NoticeClass" class="dm-card" role="status" aria-live="polite">
    <div class="feature-dev-notice__icon-wrap">
      <span class="material-symbols-outlined" aria-hidden="true">construction</span>
    </div>
    <div class="feature-dev-notice__content">
      <DMBadge warning class="feature-dev-notice__pill" icon-name="construction">{{ Text.Badge }}</DMBadge>
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
    </div>
    <div class="feature-dev-notice__actions">
      <DMButton type="none" :is-tooltip="false" :message="backLabel" class="admin-button" @click="goBack" />
      <RouterLink to="/" class="dm-btn dm-btn-ghost">{{ homeLabel }}</RouterLink>
    </div>
  </section>
</template>

<style scoped lang="scss">
.feature-dev-notice {
  display: grid;
  gap: 18px;
  padding: 24px;
  border: 1px dashed rgba(0, 97, 242, 0.28);
  background: linear-gradient(180deg, rgba(0, 97, 242, 0.05), transparent 42%), var(--dm-surface);
}

.feature-dev-notice--compact {
  padding: 18px;
}

.feature-dev-notice__icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: var(--dm-primary-soft);
  color: var(--dm-primary);
}

.feature-dev-notice__icon-wrap .material-symbols-outlined {
  font-size: 30px;
}

.feature-dev-notice__content {
  display: grid;
  gap: 10px;
}

.feature-dev-notice__content h2,
.feature-dev-notice__content p {
  margin: 0;
}

.feature-dev-notice__pill {
  width: fit-content;
}

.feature-dev-notice__content p {
  color: var(--dm-text-soft);
  line-height: 1.6;
}

.feature-dev-notice__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
