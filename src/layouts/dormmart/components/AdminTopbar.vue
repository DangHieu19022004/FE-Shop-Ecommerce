<template>
  <header class="dm-admin__topbar">
    <div class="dm-search" style="max-width: 420px;" role="button" tabindex="0" :aria-label="formatI18nText(Text.SearchDevelopingAria, { placeholder: Text.SearchPlaceholder })" :title="formatI18nText(Text.SearchDevelopingAria, { placeholder: Text.SearchPlaceholder })" @click="openSearchPlaceholder" @keydown.enter.prevent="openSearchPlaceholder" @keydown.space.prevent="openSearchPlaceholder">
      <span class="material-symbols-outlined">search</span><input type="text" :placeholder="formatI18nText(Text.SearchDevelopingPlaceholder, { placeholder: Text.SearchPlaceholder })" readonly />
    </div>
    <div class="dm-public-actions">
      <button type="button" class="dm-icon-btn" :aria-label="Text.NotificationLabel" :title="Text.NotificationLabel"><span class="material-symbols-outlined">notifications</span><span class="dm-badge-dot">1</span></button>
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="text-align: right;"><div style="font-weight: 600; color: var(--dm-text);">{{ SessionData?.FullName || Text.AdminName }}</div><div style="font-size: 12px; color: var(--dm-text-soft);">{{ SessionData?.Email || Text.AdminRole }}</div></div>
        <div class="dm-icon-btn" :aria-label="Text.ProfileLabel" :title="Text.ProfileLabel"><span class="material-symbols-outlined">person</span></div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, inject } from "vue";
import { useRouter } from "vue-router";
import { getCurrentSession } from "@/services/authService";
import { formatI18nText } from "@/utils/i18n";

const Router = useRouter();
const Text = inject("i18nCommon").AdminNavigation;
const SessionData = computed(() => getCurrentSession());
const openSearchPlaceholder = () => Router.push({ name: "featureUnavailable", query: { title: "Tìm kiếm quản trị đang phát triển", description: "Ô tìm kiếm nhanh trong khu vực admin chưa hoàn thiện. Tạm thời vào từng màn quản trị để tra cứu dữ liệu trực tiếp." } });
</script>
