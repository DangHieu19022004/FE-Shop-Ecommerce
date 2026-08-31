<template>
  <div class="dm-page">
    <PublicHeader />
    <main class="dm-public-main">
      <div class="dm-container"><slot /></div>
    </main>
    <PublicFooter />
    <SupportChatWidget />
  </div>
</template>

<script setup>
import SupportChatWidget from "@/components/dormmart/SupportChatWidget.vue";
import PublicFooter from "@/layouts/dormmart/components/PublicFooter.vue";
import PublicHeader from "@/layouts/dormmart/components/PublicHeader.vue";

</script>
